<template>
  <div class="fixed bottom-4 left-4 bg-gray-800 rounded-lg shadow-lg p-4">
    <!-- Заголовок чата -->
    <div
        class="text-white px-4 py-2 rounded-t-lg flex justify-between items-center cursor-pointer"
        @click="toggleChat"
    >
      <div class="flex items-center space-x-2">
        <div
            v-if="unreadCount > 0"
            class="bg-red-400 text-white text-xs px-2 py-1 rounded-full"
        >
          {{ unreadCount }}
        </div>
        <h4 class="font-semibold">{{ $t('chats.chat') }}</h4>
      </div>
      <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 transform transition-transform duration-200"
          :class="chatOpened ? 'rotate-180' : 'rotate-0'"
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

    <!-- Контейнер чата -->
    <transition name="fade">
      <div v-if="chatOpened" class="bg-gray-100 text-gray-300 p-4 shadow-lg">
        <!-- Список сообщений -->
        <div class="space-y-6 max-h-64 overflow-y-auto">
          <div
              v-for="msg in messages"
              :key="msg.id"
              class="flex items-start space-x-4"
          >
            <div
                class="flex-1 relative"
                :class="{ 'text-right': msg.sender === userId }"
            >
              <div
                  :class="{
                  'text-black': msg.sender === userId,
                  'text-sky-500': msg.sender !== userId,
                }"
                  class="inline-block px-4 py-2 rounded-lg"
              >
                <p class="text-sm">{{ msg.text }}</p>
              </div>
              <span
                  class="block text-xs text-gray-400 mt-1"
                  :class="{ 'text-right': msg.sender === userId }"
              >
                {{ formatDate(msg.timestamp) }}
              </span>
            </div>
            <div
                v-if="msg.sender === userId"
                class="flex items-center mt-2"
            >
              <svg
                  @click="deleteMessage(msg.id)"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1"
                  stroke="currentColor"
                  class="h-5 w-5 text-red-500 hover:text-red-600 cursor-pointer"
              >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9.5 21h6a2.5 2.5 0 002.5-2.5V5.5h-11v13a2.5 2.5 0 002.5 2.5ZM15 7.5V18a1 1 0 01-1 1h-4a1 1 0 01-1-1V7.5"
                />
              </svg>
            </div>
          </div>
        </div>
        <!-- Поле ввода -->
        <div class="flex items-center space-x-2 mt-4">
          <textarea
              v-model="newMessage"
              type="text"
              rows="2"
              :placeholder="$t('chats.typeMessage')"
              class="flex-1 px-3 py-1 text-gray-600 rounded-lg focus:ring-primary focus:border-primary"
          ></textarea>
          <button
              @click.prevent.stop="sendMessage"
              class="px-2 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-600"
          >
            {{ $t('chats.send') }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import {
  getDatabase,
  ref as dbRef,
  onValue,
  push,
  remove,
  serverTimestamp,
  update,
} from "firebase/database";
import { useAuthStore } from "@/stores/auth";
import { useTelegramStore } from "@/stores/telegram.ts";
import moment from 'moment-timezone';

// Инициализация пользователя
const authStore = useAuthStore();
const userId = authStore.user?.uid;

// Проверка, что пользователь залогинен
if (!userId) {
  console.error("User is not logged in!");
  throw new Error("User is not logged in!");
}

const telegramStore = useTelegramStore();

const db = getDatabase();

// Состояние
const messages = ref<any[]>([]);
const newMessage = ref("");
const chatOpened = ref(false);
const unreadCount = ref(0);

// Хранение слушателя
let unsubscribeMessages: (() => void) | null = null;

// Форматирование даты
const formatDate = (timestamp: number | undefined) => {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleString();
};

const getUkraineTimestamp = () => {
  return moment().tz('Europe/Kiev').format('YYYY-MM-DD HH:mm:ss');
};

// Отправка сообщения
const sendMessage = async () => {
  if (newMessage.value.trim()) {
    const messagesRef = dbRef(db, `admin_chats/${userId}/messages`);
    const message = {
      sender: userId,
      text: newMessage.value.trim(),
      timestamp: serverTimestamp(), // Серверный временной штамп
      read: false,
      role: "user",
    };

    // Сохраняем сообщение в базе данных
    await push(messagesRef, message);

    const messageTelegram = {
      sender: userId,
      text: newMessage.value.trim(),
      timestamp: getUkraineTimestamp(), // Временная метка Украины
      role: "user",
      targetUserId: 876117897, // ID администратора
    };

    // Уведомление бота
    await telegramStore.notifyNewMessageToTelegramBot(messagesRef, messageTelegram);

    // Очищаем поле ввода
    newMessage.value = "";
  }
};

// Загрузка сообщений
const loadMessages = () => {
  // Удаление предыдущего слушателя, если он существует
  if (unsubscribeMessages) unsubscribeMessages();

  const messagesRef = dbRef(db, `admin_chats/${userId}/messages`);

  // Установка нового слушателя
  unsubscribeMessages = onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    messages.value = data
        ? Object.entries(data).map(([id, msg]) => ({ id, ...msg }))
        : [];
    // Фильтр непрочитанных сообщений
    unreadCount.value = messages.value.filter(
        (msg) => msg.read === false && msg.sender !== userId
    ).length;
  });
};

// Удаление сообщения
const deleteMessage = async (id: string) => {
  const messageRef = dbRef(db, `admin_chats/${userId}/messages/${id}`);
  await remove(messageRef);
};

// Переключение чата
const toggleChat = async () => {
  chatOpened.value = !chatOpened.value;

  if (!chatOpened.value) {
    const updates: Record<string, boolean> = {};
    messages.value.forEach((msg) => {
      if (!msg.read && msg.sender !== userId) {
        updates[`/admin_chats/${userId}/messages/${msg.id}/read`] = true;
      }
    });
    if (Object.keys(updates).length > 0) {
      const messagesRef = dbRef(db);
      await update(messagesRef, updates);
    }
    unreadCount.value = 0;
  }
};

// Хуки жизненного цикла
onMounted(() => {
  loadMessages();
});

onUnmounted(() => {
  if (unsubscribeMessages) unsubscribeMessages();
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
