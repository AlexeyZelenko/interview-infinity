<template>
  <div class="lg:hidden bg-gray-800 border-b border-gray-700">
    <div class="px-4 py-3">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold">{{ currentMenuItem }}</h1>
          <p class="text-sm text-primary-400">Developer Account</p>
        </div>
        <button @click="$emit('toggle-menu')" class="text-gray-400 hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                v-if="!isMobileMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
            />
            <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { defineProps } from 'vue';

const props = defineProps({
  isMobileMenuOpen: Boolean,
});

const route = useRoute();
const menuItems = [
  { name: 'Saved Jobs', path: '/developer/saved-jobs' },
  { name: 'Resume', path: '/developer/resume' },
  { name: 'Test Results', path: '/developer/test-results' },
  { name: 'Subscription', path: '/developer/subscription' }
  // { name: 'Test Coding', path: '/developer/challenges' }
];

const currentMenuItem = computed(() => {
  return menuItems.find(item => route.path === item.path)?.name || 'Account';
});
</script>
