<template>
  <div class="fixed bottom-4 left-4 z-50">
    <!-- Chat Icon Button (collapsed state) -->
    <button
        v-if="!chatOpened"
        @click="toggleChat"
        class="relative bg-gray-700 hover:bg-gray-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors duration-200"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <div class="w-3 h-3 rounded-full absolute top-0 right-0" :class="adminOnline ? 'bg-green-400' : 'bg-gray-500'"></div>
      <div
          v-if="unreadCount > 0"
          class="absolute -top-1 -left-1 bg-primary-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full"
      >
        {{ unreadCount }}
      </div>
    </button>

    <!-- Chat Window (expanded state) -->
    <div v-if="chatOpened" class="bg-gray-800 rounded-lg shadow-xl w-[350px] overflow-hidden">
      <!-- Chat Header -->
      <div
          class="bg-gray-700 px-4 py-3 flex justify-between items-center cursor-pointer select-none"
          @click="toggleChat"
      >
        <div class="flex items-center space-x-3">
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-white">{{ $t('chats.support') }}</h4>
            <div class="flex items-center gap-1.5">
              <div class="w-2 h-2 rounded-full" :class="adminOnline ? 'bg-green-400' : 'bg-gray-500'"></div>
              <p class="text-xs" :class="adminOnline ? 'text-green-400' : 'text-gray-400'">
                {{ adminOnline ? $t('chats.statusOnline') : $t('chats.statusOffline') }}
              </p>
            </div>
          </div>
          <div
              v-if="unreadCount > 0"
              class="bg-primary-500 text-white text-xs px-2 py-1 rounded-full"
          >
            {{ unreadCount }}
          </div>
        </div>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>

      <!-- Chat Content -->
        <div class="bg-gray-900">
          <!-- Error Message -->
          <div v-if="error" class="bg-red-500/10 text-red-400 p-2 text-sm text-center">
            {{ error }}
          </div>

          <!-- Messages Container -->
          <div class="h-[350px] overflow-y-auto p-4 space-y-4" ref="messagesContainer">
            <div v-if="!userId" class="text-center text-gray-400 py-4">
              Пожалуйста, войдите в систему для использования чата
            </div>
            
            <div v-else-if="messages.length === 0" class="text-center text-gray-400 py-4">
              Нет сообщений. Начните диалог!
            </div>

            <div
                v-else
                v-for="msg in messages"
                :key="msg.id"
                class="flex items-start space-x-2 animate-fade-in group"
                :class="{ 'justify-end': msg.sender === userId && msg.role !== 'system', 'justify-center': msg.role === 'system' }"
            >
              <!-- Message Bubble -->
              <div
                  class="max-w-[70%] break-words"
                  :class="{ 'order-2': msg.sender === userId }"
              >
                <div
                    class="px-4 py-2 rounded-lg text-sm"
                    :class="{
                      'bg-primary-600 text-white': msg.sender === userId,
                      'bg-gray-600/50 text-gray-300 italic border border-gray-600': msg.role === 'system',
                      'bg-gray-700 text-gray-100': msg.sender !== userId && msg.role !== 'system'
                    }"
                >
                  {{ msg.text }}
                </div>
                <div 
                    class="text-xs mt-1 text-gray-400"
                    :class="{ 'text-right': msg.sender === userId }"
                >
                  {{ formatDate(msg.timestamp) }}
                </div>
              </div>

              <!-- Delete Button -->
              <div
                  v-if="msg.sender === userId"
                  class="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <button
                    @click="deleteMessage(msg.id)"
                    class="p-1 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 text-red-400 hover:text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                  >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Input Area -->
          <div class="p-4 bg-gray-800 border-t border-gray-700">
            <div class="flex items-end space-x-2">
              <textarea
                  v-model="newMessage"
                  rows="1"
                  :placeholder="$t('chats.typeMessage')"
                  class="flex-1 bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  :disabled="!userId || isLoading"
                  @keydown.enter.prevent="sendMessage"
              ></textarea>
              <button
                  @click="sendMessage"
                  :disabled="!userId || isLoading"
                  class="flex-shrink-0 bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <svg v-else class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from "vue";
import {
  getDatabase,
  ref as dbRef,
  onValue,
  push,
  remove,
  get,
  set,
  serverTimestamp,
  update,
} from "firebase/database";
import { useAuthStore } from "@/stores/auth";
import { useTelegramStore } from "@/stores/telegram.ts";
import { useChatWidgetStore } from "@/stores/chatWidget";
import { useI18n } from 'vue-i18n';
import moment from 'moment-timezone';
import { storeToRefs } from 'pinia';
import { sendChatNotificationEmail } from '@/services/emailNotification';

const { t } = useI18n();

// Инициализация stores
const authStore = useAuthStore();
const telegramStore = useTelegramStore();
const chatWidgetStore = useChatWidgetStore();
const { user } = storeToRefs(authStore);

// Вычисляемое свойство для ID пользователя
const userId = computed(() => user.value?.uid);

// Состояние
const messages = ref<any[]>([]);
const newMessage = ref("");
const chatOpened = computed(() => chatWidgetStore.isOpen);
const unreadCount = ref(0);
const messagesContainer = ref<HTMLElement | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);
const isScrolling = ref(false);
const db = getDatabase();

// Admin presence
const adminOnline = ref(false);
let unsubscribePresence: (() => void) | null = null;

const listenAdminPresence = () => {
  const presenceRef = dbRef(db, 'admin/presence');
  unsubscribePresence = onValue(presenceRef, (snapshot) => {
    const data = snapshot.val();
    adminOnline.value = data?.online === true;
  });
};

// Хранение слушателя
let unsubscribeMessages: (() => void) | null = null;

// Прокрутка к последнему сообщению
const scrollToBottom = async () => {
  if (isScrolling.value) return;
  isScrolling.value = true;
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
  isScrolling.value = false;
};

// Форматирование даты
const formatDate = (timestamp: number | undefined) => {
  if (!timestamp) return "";
  return moment(timestamp).format('HH:mm');
};

const getUkraineTimestamp = () => {
  return moment().tz('Europe/Kiev').format('YYYY-MM-DD HH:mm:ss');
};

// Отправка автоматического ответа (один раз на пользователя)
const sendAutoReply = async () => {
  if (!userId.value) return;

  const autoReplyFlagRef = dbRef(db, `admin_chats/${userId.value}/autoReplySent`);
  const snapshot = await get(autoReplyFlagRef);

  if (snapshot.exists()) return;

  const messagesRef = dbRef(db, `admin_chats/${userId.value}/messages`);
  await push(messagesRef, {
    sender: 'system',
    text: t('chats.autoReply'),
    timestamp: serverTimestamp(),
    read: true,
    role: 'system',
  });

  await set(autoReplyFlagRef, true);
};

// Отправка сообщения
const sendMessage = async () => {
  if (!userId.value) {
    error.value = "Пожалуйста, войдите в систему для отправки сообщений";
    return;
  }

  if (!newMessage.value.trim()) {
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;

    const messagesRef = dbRef(db, `admin_chats/${userId.value}/messages`);
    const message = {
      sender: userId.value,
      text: newMessage.value.trim(),
      timestamp: serverTimestamp(),
      read: false,
      role: "user",
    };

    // Сохраняем сообщение в базе данных
    await push(messagesRef, message);

    const messageTelegram = {
      sender: userId.value,
      text: newMessage.value.trim(),
      timestamp: getUkraineTimestamp(),
      role: "user",
      targetUserId: 876117897, // ID администратора
    };

    // Уведомление бота
    await telegramStore.notifyNewMessageToTelegramBot(messagesRef, messageTelegram);

    // Email notification to admin
    const siteUrl = window.location.origin;
    sendChatNotificationEmail({
      userName: user.value?.displayName || user.value?.email || userId.value || 'Unknown',
      userEmail: user.value?.email || 'No email',
      messageText: message.text,
      chatLink: `${siteUrl}/admin/chats`,
    });

    // Очищаем поле ввода (scrollToBottom will be triggered by onValue listener)
    newMessage.value = "";

    // Отправляем auto-reply при первом сообщении
    await sendAutoReply();
  } catch (err) {
    console.error('Error sending message:', err);
    error.value = "Ошибка при отправке сообщения. Пожалуйста, попробуйте снова.";
  } finally {
    isLoading.value = false;
  }
};

// Загрузка сообщений
const loadMessages = () => {
  if (!userId.value) {
    console.warn("User not logged in, cannot load messages");
    return;
  }

  try {
    // Удаление предыдущего слушателя, если он существует
    if (unsubscribeMessages) unsubscribeMessages();

    const messagesRef = dbRef(db, `admin_chats/${userId.value}/messages`);

    // Установка нового слушателя
    unsubscribeMessages = onValue(messagesRef, async (snapshot) => {
      try {
        const data = snapshot.val();
        messages.value = data
          ? Object.entries(data).map(([id, msg]) => ({ id, ...msg }))
          : [];
        
        // Сортировка сообщений по времени
        messages.value.sort((a, b) => {
          return (a.timestamp || 0) - (b.timestamp || 0);
        });

        // Фильтр непрочитанных сообщений
        unreadCount.value = messages.value.filter(
          (msg) => !msg.read && msg.sender !== userId.value
        ).length;

        // Прокрутка к последнему сообщению только если чат открыт
        if (chatOpened.value) {
          await scrollToBottom();
        }
      } catch (err) {
        console.error('Error processing messages:', err);
        error.value = "Ошибка при загрузке сообщений";
      }
    });
  } catch (err) {
    console.error('Error setting up message listener:', err);
    error.value = "Ошибка при подключении к чату";
  }
};

// Удаление сообщения
const deleteMessage = async (messageId: string) => {
  if (!userId.value) return;

  try {
    const messageRef = dbRef(
      db,
      `admin_chats/${userId.value}/messages/${messageId}`
    );
    await remove(messageRef);
  } catch (err) {
    console.error('Error deleting message:', err);
    error.value = "Ошибка при удалении сообщения";
  }
};

// Переключение состояния чата
const toggleChat = () => {
  chatWidgetStore.toggle();
  if (chatWidgetStore.isOpen) {
    markMessagesAsRead();
    scrollToBottom();
  }
};

// Отметка сообщений как прочитанных
const markMessagesAsRead = async () => {
  if (!userId.value) return;

  try {
    const updates: { [key: string]: any } = {};
    messages.value.forEach((msg) => {
      if (!msg.read && msg.sender !== userId.value) {
        updates[`admin_chats/${userId.value}/messages/${msg.id}/read`] = true;
      }
    });

    if (Object.keys(updates).length > 0) {
      await update(dbRef(db), updates);
    }
  } catch (err) {
    console.error('Error marking messages as read:', err);
  }
};

// Watch for external chat open (e.g., from FAQ Contact Support button)
watch(() => chatWidgetStore.isOpen, (isOpen) => {
  if (isOpen) {
    markMessagesAsRead();
    scrollToBottom();
  }
});

// Watch for auth state changes -- loadMessages when user logs in
watch(userId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    loadMessages();
  } else if (!newId && unsubscribeMessages) {
    // User logged out -- cleanup listener and clear messages
    unsubscribeMessages();
    unsubscribeMessages = null;
    messages.value = [];
    unreadCount.value = 0;
  }
});

// Жизненный цикл компонента
onMounted(() => {
  listenAdminPresence();
  if (userId.value) {
    loadMessages();
  }
});

onUnmounted(() => {
  if (unsubscribeMessages) {
    unsubscribeMessages();
  }
  if (unsubscribePresence) {
    unsubscribePresence();
  }
});
</script>

<style>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
