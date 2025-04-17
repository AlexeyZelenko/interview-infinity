<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from "vue";
import {
  getDatabase,
  ref as dbRef,
  onValue,
  push,
  serverTimestamp,
  update,
  off,
  get,
  set,
} from "firebase/database";
import { getAuth } from "firebase/auth";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// Firebase references
const db = getDatabase();
const auth = getAuth();

interface UserInfo {
  email: string;
  displayName: string | null;
  photoURL: string | null;
  lastSeen: number;
  isOnline: boolean;
  role?: string;
  createdAt?: number;
}

interface NotificationSettings {
  email: boolean;
  emailAddress: string;
  desktop: boolean;
  sound: boolean;
  telegram: boolean;
  telegramUsername: string;
}

// State
const userChats = ref<Record<string, any>>({});
const usersInfo = ref<Record<string, UserInfo>>({});
const activeChatId = ref<string | null>(null);
const activeMessages = ref<any[]>([]);
const newMessage = ref("");
const chatListOpened = ref(true);
const unreadMessages = ref<Record<string, number>>({});
const loading = ref(false);
const error = ref("");
const searchQuery = ref("");
const isTyping = ref(false);
const typingTimeout = ref<NodeJS.Timeout | null>(null);
const messagesContainerRef = ref<HTMLElement | null>(null);
const notificationSettings = ref<NotificationSettings>({
  email: false,
  emailAddress: '',
  desktop: false,
  sound: true,
  telegram: false,
  telegramUsername: ''
});
const showSettings = ref(false);
const notificationSound = ref<HTMLAudioElement | null>(null);

// Computed
const filteredChats = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return Object.entries(userChats.value).filter(([userId, chat]) => {
    const userInfo = usersInfo.value[userId];
    const lastMessage = chat.messages ? 
      Object.values(chat.messages).slice(-1)[0] : null;
    return userId.toLowerCase().includes(query) || 
      (lastMessage && lastMessage.text.toLowerCase().includes(query)) ||
      (userInfo?.email && userInfo.email.toLowerCase().includes(query)) ||
      (userInfo?.displayName && userInfo.displayName.toLowerCase().includes(query));
  }).sort((a, b) => {
    const aLastMessage = getLastMessage(a[0]);
    const bLastMessage = getLastMessage(b[0]);
    return (bLastMessage?.timestamp || 0) - (aLastMessage?.timestamp || 0);
  });
});

const totalUnreadMessages = computed(() => {
  return Object.values(unreadMessages.value).reduce((sum, count) => sum + count, 0);
});

// Functions
const loadUserInfo = async (userId: string) => {
  try {
    const userRef = dbRef(db, `users/${userId}`);
    const snapshot = await get(userRef);
    const userData = snapshot.val();
    
    if (userData) {
      usersInfo.value[userId] = {
        email: userData.email || '',
        displayName: userData.displayName || null,
        photoURL: userData.photoURL || null,
        lastSeen: userData.lastSeen || 0,
        isOnline: userData.isOnline || false,
        role: userData.role || 'user',
        createdAt: userData.createdAt || 0
      };
    }
  } catch (err) {
    console.error(`Error loading user info for ${userId}:`, err);
  }
};

const getLastMessage = (userId: string) => {
  const messages = userChats.value[userId]?.messages || {};
  const messageArray = Object.values(messages);
  return messageArray.length ? messageArray[messageArray.length - 1] : null;
};

const formatDate = (timestamp: number | undefined) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return "Yesterday";
  } else if (days < 7) {
    return date.toLocaleDateString([], { weekday: 'long' });
  } else {
    return date.toLocaleDateString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

const formatLastSeen = (timestamp: number) => {
  if (!timestamp) return "Never online";
  const now = new Date();
  const lastSeen = new Date(timestamp);
  const diff = now.getTime() - lastSeen.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return lastSeen.toLocaleDateString();
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainerRef.value) {
    messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight;
  }
};

const loadUserChats = () => {
  loading.value = true;
  error.value = "";
  
  try {
    const adminChatsRef = dbRef(db, "admin_chats");
    onValue(adminChatsRef, (snapshot) => {
      const data = snapshot.val() || {};
      userChats.value = data;

      unreadMessages.value = Object.keys(data).reduce((acc, userId) => {
        const messages = data[userId].messages || {};
        const unreadCount = Object.values(messages).filter(
          (msg: any) => !msg.read && msg.sender !== "admin"
        ).length;
        acc[userId] = unreadCount;
        return acc;
      }, {} as Record<string, number>);
      
      loading.value = false;
    }, (error) => {
      console.error("Error loading chats:", error);
      error.value = "Failed to load chats. Please try again.";
      loading.value = false;
    });
  } catch (err) {
    console.error("Error in loadUserChats:", err);
    error.value = "An unexpected error occurred.";
    loading.value = false;
  }
};

const selectChat = (userId: string) => {
  if (activeChatId.value === userId) return;
  
  // Cleanup previous chat listeners
  if (activeChatId.value) {
    const prevChatRef = dbRef(db, `admin_chats/${activeChatId.value}/messages`);
    off(prevChatRef);
  }

  activeChatId.value = userId;
  const chatMessagesRef = dbRef(db, `admin_chats/${userId}/messages`);

  onValue(chatMessagesRef, (snapshot) => {
    const data = snapshot.val();
    const oldMessages = activeMessages.value;
    activeMessages.value = data
      ? Object.entries(data).map(([id, msg]) => ({ id, ...msg }))
      : [];

    // Check for new messages
    if (oldMessages.length > 0) {
      const newMessages = activeMessages.value.slice(oldMessages.length);
      newMessages.forEach(msg => handleNewMessage(msg, userId));
    }

    // Mark messages as read
    activeMessages.value.forEach((msg) => {
      if (!msg.read && msg.sender !== "admin") {
        const msgRef = dbRef(db, `admin_chats/${userId}/messages/${msg.id}`);
        update(msgRef, { read: true });
      }
    });

    unreadMessages.value[userId] = 0;
    scrollToBottom();
  });

  // On mobile, close the chat list when selecting a chat
  if (window.innerWidth < 768) {
    chatListOpened.value = false;
  }
};

const handleTyping = () => {
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }
  
  isTyping.value = true;
  typingTimeout.value = setTimeout(() => {
    isTyping.value = false;
  }, 1000);
};

const sendMessage = async () => {
  if (!activeChatId.value || !newMessage.value.trim()) return;

  try {
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
    await scrollToBottom();
  } catch (err) {
    console.error("Error sending message:", err);
    error.value = "Failed to send message. Please try again.";
  }
};

// Load notification settings
const loadNotificationSettings = async () => {
  try {
    const settingsRef = dbRef(db, `adminSettings/notifications`);
    const snapshot = await get(settingsRef);
    const settings = snapshot.val();
    
    if (settings) {
      notificationSettings.value = {
        ...notificationSettings.value,
        ...settings
      };
    }
  } catch (err) {
    console.error("Error loading notification settings:", err);
  }
};

// Save notification settings
const saveNotificationSettings = async () => {
  try {
    const settingsRef = dbRef(db, `adminSettings/notifications`);
    await set(settingsRef, notificationSettings.value);
    
    // Request desktop notification permission if enabled
    if (notificationSettings.value.desktop) {
      await requestNotificationPermission();
    }
  } catch (err) {
    console.error("Error saving notification settings:", err);
    error.value = "Failed to save notification settings";
  }
};

// Request desktop notification permission
const requestNotificationPermission = async () => {
  try {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notifications");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      notificationSettings.value.desktop = false;
    }
  } catch (err) {
    console.error("Error requesting notification permission:", err);
    notificationSettings.value.desktop = false;
  }
};

// Send desktop notification
const sendDesktopNotification = (message: any) => {
  if (!notificationSettings.value.desktop || !("Notification" in window)) return;

  const userInfo = usersInfo.value[message.sender];
  const title = userInfo?.displayName || `User ${message.sender}`;
  
  new Notification(title, {
    body: message.text,
    icon: userInfo?.photoURL || '/default-avatar.png'
  });
};

// Play notification sound
const playNotificationSound = () => {
  if (!notificationSettings.value.sound) return;
  
  try {
    if (!notificationSound.value) {
      notificationSound.value = new Audio('/notification.mp3');
    }
    notificationSound.value.play();
  } catch (err) {
    console.error("Error playing notification sound:", err);
  }
};

// Handle new message notifications
const handleNewMessage = async (message: any, userId: string) => {
  console.log("message", message);
  if (message.sender === 'admin') return;

  // Play sound for new messages
  playNotificationSound();

  // Send desktop notification
  sendDesktopNotification(message);

  // Send email notification
  console.log("notificationSettings.value.email", notificationSettings.value.email);
  console.log("notificationSettings.value.emailAddress", notificationSettings.value.emailAddress);
  if (notificationSettings.value.email && notificationSettings.value.emailAddress) {
    try {
      const response = await fetch('/api/sendEmailNotification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: notificationSettings.value.emailAddress,
          userId,
          message: message.text,
          userName: usersInfo.value[userId]?.displayName || `User ${userId}`,
          userEmail: usersInfo.value[userId]?.email
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email notification');
      }
    } catch (err) {
      console.error("Error sending email notification:", err);
    }
  }

  // Send Telegram notification
  if (notificationSettings.value.telegram && notificationSettings.value.telegramUsername) {
    try {
      const response = await fetch('/api/sendTelegramNotification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: notificationSettings.value.telegramUsername,
          userId,
          message: message.text,
          userName: usersInfo.value[userId]?.displayName || `User ${userId}`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send Telegram notification');
      }
    } catch (err) {
      console.error("Error sending Telegram notification:", err);
    }
  }
};

// Watchers
watch(activeMessages, () => {
  scrollToBottom();
});

// Lifecycle hooks
onMounted(async () => {
  await loadNotificationSettings();
  loadUserChats();
  
  // Initialize notification sound
  notificationSound.value = new Audio('/notification.mp3');
  
  // Request notification permission if enabled
  if (notificationSettings.value.desktop) {
    await requestNotificationPermission();
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
      chatListOpened.value = true;
    }
  });
});
</script>

<template>
  <div class="admin-chat-container h-screen p-4">
    <div class="max-w-6xl mx-auto h-full bg-white rounded-lg shadow-xl overflow-hidden flex">
      <!-- Chat List Section -->
      <div 
        :class="[
          'chat-list-section border-r border-gray-200',
          'transition-all duration-300 ease-in-out',
          chatListOpened ? 'w-80' : 'w-0 md:w-80'
        ]"
      >
        <!-- Header -->
        <div class="p-4 bg-gray-800 text-white">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold">Admin Chat</h2>
            <div class="flex items-center space-x-2">
              <span 
                v-if="totalUnreadMessages > 0"
                class="bg-red-500 text-white text-xs px-2 py-1 rounded-full"
              >
                {{ totalUnreadMessages }}
              </span>
              <button
                @click="showSettings = true"
                class="p-2 hover:bg-gray-700 rounded-full"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Search -->
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search chats..."
              class="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              class="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <!-- Chat List -->
        <div class="overflow-y-auto h-[calc(100%-88px)]">
          <div v-if="loading" class="flex items-center justify-center h-32">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
          
          <div v-else-if="error" class="p-4 text-red-500 text-center">
            {{ error }}
          </div>
          
          <div v-else-if="filteredChats.length === 0" class="p-4 text-center text-gray-500">
            No chats found
          </div>
          
          <div v-else class="divide-y divide-gray-200">
            <div
              v-for="[userId, chat] in filteredChats"
              :key="userId"
              @click="selectChat(userId)"
              class="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
              :class="{ 'bg-blue-200': activeChatId === userId }"
            >
              <div class="flex flex-col justify-between items-start">
                <div class="flex-1">
                <div class="flex flex-col items-end">
                  <span class="text-xs text-gray-400">
                    {{ formatDate(getLastMessage(userId)?.timestamp) }}
                  </span>
                  <span
                    v-if="unreadMessages[userId]"
                    class="mt-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full"
                  >
                    {{ unreadMessages[userId] }}
                  </span>
                </div>
                  <h3 class="font-medium text-gray-900">User Id {{ userId }}</h3>
                  <p class="text-sm text-gray-500 truncate">
                    {{ getLastMessage(userId)?.text || 'No messages' }}
                  </p>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Section -->
      <div class="flex-1 flex flex-col">
        <!-- Mobile Toggle -->
        <button
          @click="chatListOpened = !chatListOpened"
          class="md:hidden p-4 text-gray-600 hover:text-gray-900"
        >
          <svg
            class="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div v-if="!activeChatId" class="flex-1 flex items-center justify-center text-gray-500">
          Select a chat to start messaging
        </div>

        <div v-else class="flex-1 flex flex-col">
          <!-- Chat Header -->
          <div class="p-4 bg-white border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">
                Chat with User {{ activeChatId }}
              </h3>
            </div>
          </div>

          <!-- Messages -->
          <div
            ref="messagesContainerRef"
            class="flex-1 overflow-y-auto p-4 space-y-4"
          >
            <div
              v-for="msg in activeMessages"
              :key="msg.id"
              class="flex"
              :class="{ 'justify-end': msg.sender === 'admin' }"
            >
              <div
                class="max-w-[70%] break-words rounded-lg px-4 py-2 shadow"
                :class="{
                  'bg-blue-500 text-white': msg.sender === 'admin',
                  'bg-gray-200 text-gray-900': msg.sender !== 'admin'
                }"
              >
                <p class="text-sm">{{ msg.text }}</p>
                <span 
                  class="text-xs opacity-75 mt-1 block"
                  :class="{ 
                    'text-blue-100': msg.sender === 'admin',
                    'text-gray-500': msg.sender !== 'admin'
                  }"
                >
                  {{ formatDate(msg.timestamp) }}
                  <span v-if="msg.read" class="ml-1">✓</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="p-4 bg-white border-t border-gray-200">
            <div class="flex items-end space-x-2">
              <div class="flex-1">
                <textarea
                  v-model="newMessage"
                  rows="1"
                  placeholder="Type a message..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  @keydown.enter.prevent="sendMessage"
                  @input="handleTyping"
                ></textarea>
              </div>
              <button
                @click="sendMessage"
                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-150 flex items-center"
                :disabled="!newMessage.trim()"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Modal -->
    <div
      v-if="showSettings"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Notification Settings</h3>
          <button
            @click="showSettings = false"
            class="text-gray-500 hover:text-gray-700"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <!-- Email Notifications -->
          <div class="flex items-center justify-between">
            <div>
              <label class="font-medium text-gray-700">Email Notifications</label>
              <p class="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="notificationSettings.email"
                class="sr-only peer"
              >
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <!-- Email Address -->
          <div v-if="notificationSettings.email">
            <label class="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              v-model="notificationSettings.emailAddress"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email address"
            >
          </div>

          <!-- Desktop Notifications -->
          <div class="flex items-center justify-between">
            <div>
              <label class="font-medium text-gray-700">Desktop Notifications</label>
              <p class="text-sm text-gray-500">Show notifications on your desktop</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="notificationSettings.desktop"
                class="sr-only peer"
              >
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <!-- Sound Notifications -->
          <div class="flex items-center justify-between">
            <div>
              <label class="font-medium text-gray-700">Sound Notifications</label>
              <p class="text-sm text-gray-500">Play sound for new messages</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="notificationSettings.sound"
                class="sr-only peer"
              >
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <!-- Telegram Notifications -->
          <div class="flex items-center justify-between">
            <div>
              <label class="font-medium text-gray-700">Telegram Notifications</label>
              <p class="text-sm text-gray-500">Receive notifications via Telegram</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="notificationSettings.telegram"
                class="sr-only peer"
              >
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <!-- Telegram Username -->
          <div v-if="notificationSettings.telegram">
            <label class="block text-sm font-medium text-gray-700">Telegram Username</label>
            <input
              type="text"
              v-model="notificationSettings.telegramUsername"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your Telegram username"
            >
          </div>

          <!-- Save Button -->
          <div class="mt-6">
            <button
              @click="saveNotificationSettings"
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-list-section {
  min-width: 0;
}

@media (max-width: 768px) {
  .chat-list-section {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    background: white;
    z-index: 10;
  }
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
