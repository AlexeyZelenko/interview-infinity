<template>
  <div class="w-full mt-6">
    <!-- Заголовок чата -->
    <div
        class="bg-secondary-800 text-white px-4 py-2 rounded-t-lg flex justify-start items-center cursor-pointer"
        @click="toggleChat"
    >
      <div
          v-if="unreadCount > 0"
          class="bg-red-400 text-white text-xs px-2 py-1 rounded-full mr-2"
      >
        {{ unreadCount }}
      </div>
      <div class="flex items-center space-x-2">
        <h4 class="font-semibold">{{ $t('chats.chat') }}</h4>
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
    </div>

    <!-- Контейнер чата -->
    <transition name="fade">
      <div
          v-if="chatOpened"
          class="bg-gray-700 text-gray-300 rounded-b-lg p-4 shadow-lg"
      >
        <!-- Список сообщений -->
        <div class="space-y-6">
          <div
              v-for="(msg, index) in messages"
              :key="index"
              class="flex items-start space-x-4"
          >
            <div
                v-if="editingMessageId === msg.id"
                class="flex flex-col w-full"
            >
              <!-- Поле редактирования -->
              <input
                  v-model="editingMessageText"
                  type="text"
                  class="w-full px-4 py-2 bg-gray-800 text-gray-200 rounded-md focus:ring-primary focus:border-primary"
              />
              <div class="flex justify-end mt-2 space-x-2">
                <button
                    @click="saveEditedMessage"
                    class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  {{ $t('chats.save') }}
                </button>
                <button
                    @click="cancelEditing"
                    class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  {{ $t('chats.cancel') }}
                </button>
              </div>
            </div>

            <div
                v-else
                class="flex-1 relative"
                :class="{
                'text-right': msg.sender === props.currentUserId,
              }"
            >
              <!-- Сообщение -->
              <div
                  :class="{
                  'bg-primary-800 text-white': msg.sender === props.currentUserId,
                  'bg-gray-800 text-sky-500': msg.sender !== props.currentUserId,
                }"
                  class="inline-block px-4 py-2 rounded-lg"
              >
                <p class="text-sm">{{ msg.text }}</p>
              </div>
              <!-- Метка времени -->
              <span
                  class="block text-xs text-gray-400 mt-1"
                  :class="{ 'text-right': msg.sender === props.currentUserId }"
              >
                {{ formatDate(msg.timestamp) }}
              </span>
            </div>

            <!-- Действия (редактировать, удалить) -->
            <div v-if="msg.sender === props.currentUserId" class="flex items-center space-x-2">
              <svg
                  @click="startEditingMessage(msg.id, msg.text)"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1"
                  stroke="currentColor"
                  class="size-4 h-5 w-5 text-blue-500 hover:text-blue-600 cursor-pointer"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>

              <svg
                  @click="deleteMessage(msg.id)"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1"
                  stroke="currentColor"
                  class="size-4 h-5 w-5 text-red-500 hover:text-red-600 cursor-pointer"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Поле для ввода нового сообщения -->
        <div class="flex items-center space-x-2 mt-4">
          <input
              v-model="newMessage"
              type="text"
              :placeholder="$t('chats.typeMessage')"
              class="flex-1 px-3 py-2 bg-gray-800 text-gray-200 rounded-lg focus:ring-primary focus:border-primary"
          />
          <button
              @click="sendMessage"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            {{ $t('chats.sendMessage') }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  getDatabase,
  ref as dbRef,
  onValue,
  set,
  push,
  update,
  remove,
  serverTimestamp,
} from "firebase/database";

// Пропсы
const props = defineProps<{
  chatId: string;
  currentUserId: string;
}>();

const db = getDatabase();
const messages = ref<any[]>([]);
const newMessage = ref("");
const chatOpened = ref(false);
const unreadCount = ref(0);
const editingMessageId = ref<string | null>(null);
const editingMessageText = ref("");

// Проверка существования чата
const ensureChatExists = async () => {
  const chatRef = dbRef(db, `chats/${props.chatId}`);
  const userChatsRef = dbRef(db, `users/${props.currentUserId}/chats`);

  // Проверяем, существует ли чат
  onValue(chatRef, async (snapshot) => {
    if (!snapshot.exists()) {
      // Создаем новый чат, если он не существует
      await set(chatRef, {
        createdAt: serverTimestamp(),
        createdBy: props.currentUserId,
        messages: {},
      });
      console.log(`[Chat] Chat ${props.chatId} created.`);
    } else {
      console.log(`[Chat] Chat ${props.chatId} already exists.`);
    }
  }, { onlyOnce: true });

  // Проверяем, привязан ли чат к пользователю
  onValue(userChatsRef, async (snapshot) => {
    const userChats = snapshot.val() || {};
    if (!userChats[props.chatId]) {
      // Добавляем ID чата в массив чатов пользователя
      await update(userChatsRef, {
        [props.chatId]: true,
      });
      console.log(`[Chat] Chat ${props.chatId} added to user ${props.currentUserId}.`);
    } else {
      console.log(`[Chat] Chat ${props.chatId} already exists in user ${props.currentUserId}'s chats.`);
    }
  }, { onlyOnce: true });
};

// Загрузка сообщений
const loadMessages = () => {
  const messagesRef = dbRef(db, `chats/${props.chatId}/messages`);
  onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    messages.value = data
        ? Object.entries(data).map(([id, msg]) => ({
          id,
          ...msg,
        }))
        : [];
    calculateUnreadMessages(); // Обновляем счётчик непрочитанных сообщений
  });
};

// Подсчёт непрочитанных сообщений
const calculateUnreadMessages = () => {
  if (!messages.value) return;
  unreadCount.value = messages.value.filter(
      (msg) => !msg.read && msg.sender !== props.currentUserId
  ).length;
};

// Форматирование даты
const formatDate = (timestamp: number | undefined) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleString();
};

// Отправка нового сообщения
const sendMessage = async () => {
  if (newMessage.value.trim()) {
    const messagesRef = dbRef(db, `chats/${props.chatId}/messages`);
    await push(messagesRef, {
      sender: props.currentUserId,
      text: newMessage.value.trim(),
      timestamp: serverTimestamp(),
      read: false, // Устанавливаем как непрочитанное
    });
    newMessage.value = ""; // Очистка поля ввода
  }
};

// Начать редактирование сообщения
const startEditingMessage = (id: string, text: string) => {
  editingMessageId.value = id;
  editingMessageText.value = text;
};

// Сохранение отредактированного сообщения
const saveEditedMessage = async () => {
  if (editingMessageId.value && editingMessageText.value.trim()) {
    const messageRef = dbRef(
        db,
        `chats/${props.chatId}/messages/${editingMessageId.value}`
    );
    await update(messageRef, { text: editingMessageText.value.trim() });
    editingMessageId.value = null;
    editingMessageText.value = "";
  }
};

// Отмена редактирования
const cancelEditing = () => {
  editingMessageId.value = null;
  editingMessageText.value = "";
};

// Удаление сообщения
const deleteMessage = async (id: string) => {
  const messageRef = dbRef(db, `chats/${props.chatId}/messages/${id}`);
  await remove(messageRef);
};

// Отметка всех сообщений как прочитанных
const markMessagesAsRead = async () => {
  const updates: Record<string, any> = {};
  messages.value.forEach((msg) => {
    if (!msg.read && msg.sender !== props.currentUserId) {
      updates[`/chats/${props.chatId}/messages/${msg.id}/read`] = true;
    }
  });

  if (Object.keys(updates).length > 0) {
    await update(dbRef(db), updates);
    unreadCount.value = 0; // Сброс счётчика
  }
};

// Переключение состояния чата
const toggleChat = async () => {
  chatOpened.value = !chatOpened.value;
  if (chatOpened.value) {
    await markMessagesAsRead(); // Пометить все сообщения как прочитанные
  }
};

// Загрузка сообщений при монтировании
onMounted(async() => {
  await ensureChatExists();
  loadMessages();
});
</script>
