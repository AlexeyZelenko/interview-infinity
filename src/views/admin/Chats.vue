<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  getDatabase,
  ref as dbRef,
  onValue,
  push,
  serverTimestamp,
  update,
} from "firebase/database";

// Firebase references
const db = getDatabase();

// State
const userChats = ref<Record<string, any>>({});
const activeChatId = ref<string | null>(null);
const activeMessages = ref<any[]>([]);
const newMessage = ref("");
const chatListOpened = ref(false);
const unreadMessages = ref<Record<string, number>>({});

// Functions
const toggleChatList = () => {
  chatListOpened.value = !chatListOpened.value;
};

const formatDate = (timestamp: number | undefined) => {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleString();
};

const loadUserChats = () => {
  const adminChatsRef = dbRef(db, "admin_chats");
  onValue(adminChatsRef, (snapshot) => {
    const data = snapshot.val() || {};
    userChats.value = data;

    // Подсчитываем количество непрочитанных сообщений для каждого чата
    unreadMessages.value = Object.keys(data).reduce((acc, userId) => {
      const messages = data[userId].messages || {};
      const unreadCount = Object.values(messages).filter(
          (msg: any) => !msg.read && msg.sender !== "admin"
      ).length;
      acc[userId] = unreadCount;
      return acc;
    }, {} as Record<string, number>);
    console.log(unreadMessages.value);
  });
};

const selectChat = (userId: string) => {
  activeChatId.value = userId;
  const chatMessagesRef = dbRef(db, `admin_chats/${userId}/messages`);

  onValue(chatMessagesRef, (snapshot) => {
    const data = snapshot.val();
    activeMessages.value = data
        ? Object.entries(data).map(([id, msg]) => ({ id, ...msg }))
        : [];

    // Отмечаем сообщения как прочитанные
    activeMessages.value.forEach((msg) => {
      if (!msg.read && msg.sender !== "admin") {
        const msgRef = dbRef(
            db,
            `admin_chats/${userId}/messages/${msg.id}`
        );
        update(msgRef, { read: true });
      }
    });

    // Сбрасываем счетчик непрочитанных сообщений для выбранного чата
    unreadMessages.value[userId] = 0;
  });
};

const sendMessage = async () => {
  if (activeChatId.value && newMessage.value.trim()) {
    const chatMessagesRef = dbRef(
        db,
        `admin_chats/${activeChatId.value}/messages`
    );
    await push(chatMessagesRef, {
      sender: "admin",
      text: newMessage.value.trim(),
      timestamp: serverTimestamp(),
      read: false,
    });
    newMessage.value = "";
  }
};

// Lifecycle hooks
onMounted(() => {
  loadUserChats();
});
</script>

<template>
  <div class="admin-chat bg-blue-300 w-96 shadow-lg">
    <!-- Chat List -->
    <div
        class="bg-gray-800 text-white px-4 py-2 rounded-t-lg flex justify-between items-center cursor-pointer"
        @click="toggleChatList"
    >
      <h4 class="font-semibold">Admin Panel - Chats</h4>
      <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 transform transition-transform duration-200"
          :class="chatListOpened ? 'rotate-180' : 'rotate-0'"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
      >
        <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>

    <transition name="fade">
      <div v-if="chatListOpened" class="chat-list bg-gray-100 text-gray-900 p-4">
        <h5 class="font-bold mb-2">User Chats</h5>
        <ul class="space-y-2">
          <li
              v-for="(chat, userId) in userChats"
              :key="userId"
              class="flex justify-between items-center px-4 py-2 rounded-md cursor-pointer"
              :class="{
              'bg-blue-400 text-white': activeChatId === userId,
              'bg-gray-200 hover:bg-gray-300': activeChatId !== userId,
            }"
              @click="selectChat(userId)"
          >
            <span>User: {{ userId }}</span>
            <span
                v-if="unreadMessages[userId] > 0"
                class="bg-red-400 text-white text-xs px-2 py-1 rounded-full"
            >
              {{ unreadMessages[userId] }}
            </span>
          </li>
        </ul>
      </div>
    </transition>

    <!-- Active Chat -->
    <transition name="fade">
      <div
          v-if="activeChatId"
          class="active-chat bg-gray-100 text-gray-900 p-4 shadow-lg"
      >
        <h5 class="font-bold mb-2">Chat with {{ activeChatId }}</h5>

        <!-- Messages -->
        <div class="messages space-y-4 max-h-64 overflow-y-auto">
          <div
              v-for="msg in activeMessages"
              :key="msg.id"
              class="flex items-start space-x-4"
          >
            <div
                class="flex-1"
                :class="{ 'text-right': msg.sender === 'admin' }"
            >
              <div
                  :class="{
                  'text-black bg-gray-200': msg.sender === 'admin',
                  'text-white bg-blue-400': msg.sender !== 'admin',
                }"
                  class="inline-block px-4 py-2 rounded-lg"
              >
                <p class="text-sm">{{ msg.text }}</p>
              </div>
              <span class="block text-xs text-gray-400 mt-1">
                {{ formatDate(msg.timestamp) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Message Input -->
        <div class="flex items-center space-x-2 mt-4">
          <textarea
              v-model="newMessage"
              rows="2"
              placeholder="Type a message"
              class="flex-1 px-3 py-1 text-gray-600 rounded-lg"
          ></textarea>
          <button
              @click="sendMessage"
              class="px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>
