import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getDatabase, ref as dbRef, onValue } from 'firebase/database';
import {useApplicationsStore} from "@/stores/applications.ts";
import { get } from 'firebase/database';

export const useChatStore = defineStore('chatStore', () => {
    const db = getDatabase();
    const unreadMessages = ref<Record<string, number>>({});
    const unreadMessagesFromJob = ref<Record<string, number>>({});
    const allUnreadCount = computed(() =>
        Object.values(unreadMessages.value).reduce((acc, count) => acc + count, 0)
    );
    const activeSubscriptions: (() => void)[] = [];

    const loadUnreadMessages = (userId: string) => {
        const userChatsRef = dbRef(db, `users/${userId}/chats`);
        const unsubscribe = onValue(userChatsRef, (snapshot) => {
            const chatIds = snapshot.val();
            if (chatIds) {
                Object.keys(chatIds).forEach((chatId) => {
                    const chatMessagesRef = dbRef(db, `chats/${chatId}/messages`);
                    const unsubscribeMessages = onValue(chatMessagesRef, (messageSnapshot) => {
                        const messages = messageSnapshot.val();
                        if (messages) {
                            unreadMessages.value[chatId] = Object.values(messages).filter(
                                (msg: any) => !msg.read && msg.sender !== userId
                            ).length;
                        } else {
                            unreadMessages.value[chatId] = 0;
                        }
                    });
                    activeSubscriptions.push(unsubscribeMessages);
                });
            }
        });
        activeSubscriptions.push(unsubscribe);
    };

    const clearSubscriptions = () => {
        activeSubscriptions.forEach((unsubscribe) => unsubscribe());
        activeSubscriptions.length = 0;
    };

    const getCountMessagesFromJob = async (jobId: string): Promise<number> => {
        const applicationsStore = useApplicationsStore();
        await applicationsStore.fetchApplications();
        const applications = applicationsStore.applications;
        const application = applications.find(app => app.jobId === jobId);

        if (!application) return 0;

        const chatId = `chat_${application.userId}_${application.id}_${application.companyId}`;
        const chatMessagesRef = dbRef(db, `chats/${chatId}/messages`);

        try {
            const messageSnapshot = await get(chatMessagesRef);
            const messages = messageSnapshot.val();
            const unreadCount = messages
                ? Object.values(messages).filter((msg: any) => !msg.read).length
                : 0;

            unreadMessagesFromJob.value[jobId] = unreadCount;
            return unreadCount;
        } catch {
            return 0;
        }
    };

    const clearUnreadMessages = () => {
        unreadMessages.value = {};
    };

    return {
        unreadMessages,
        allUnreadCount,
        loadUnreadMessages,
        getCountMessagesFromJob,
        clearSubscriptions,
        clearUnreadMessages,
    };
});
