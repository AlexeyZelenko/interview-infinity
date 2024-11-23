<template>
  <aside class="hidden lg:block bg-gray-800 h-screen sticky top-0">
    <div class="p-6">
      <div class="mb-6">
        <h2 class="text-xl font-bold text-white">Account</h2>
        <p class="text-sm text-primary-400">
          <span>Developer Account</span>
          <span
              v-if="chatStore.allUnreadCount > 0"
              class="bg-red-400 text-amber-50 py-1 px-2 rounded-2xl text-xs ml-2"
          >
            {{chatStore.allUnreadCount}}
          </span>
        </p>
      </div>
      <nav class="space-y-2">
        <router-link
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center px-6 py-2 text-sm font-medium rounded-md transition-colors"
            :class="{
            'bg-gray-900 text-white': isActive(item.path),
            'text-gray-300 hover:bg-gray-700 hover:text-white': !isActive(item.path)
          }"
        >
          <MenuIcon :icon="item.icon" class="mr-3"/>
          {{ item.name }}
        </router-link>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import MenuIcon from './MenuIcon.vue';
import { useChatStore } from '@/stores/chats';
import {computed, onMounted} from "vue";
import {useAuthStore} from "@/stores/auth.ts";

const useAuth = useAuthStore();
const currentUserId = computed(() => useAuth.user?.uid ?? '');

const route = useRoute();

const menuItems = [
  { name: 'Saved Jobs', path: '/developer/saved-jobs', icon: 'bookmark' },
  { name: 'My Applications', path: '/developer/applications', icon: 'application' },
  { name: 'Resumes', path: '/developer/resumes', icon: 'document' },
  { name: 'Test Results', path: '/developer/test-results', icon: 'academic-cap' },
  { name: 'Subscription', path: '/developer/subscription', icon: 'credit-card' },
  { name: 'Settings', path: '/developer/settings', icon: 'document' },
  // { name: 'Test Coding', path: '/developer/challenges', icon: 'code' },
];

const isActive = (path: string) => route.path === path;

const chatStore = useChatStore();

onMounted( () => {
  if (currentUserId.value) {
    chatStore.loadUnreadMessages(currentUserId.value);
  }
});
</script>

