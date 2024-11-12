<template>
  <div class="border-t border-gray-700">
    <nav class="px-2 py-3">
      <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
          :class="{ 'bg-gray-700 text-white': $route.path === item.path }"
          @click="$emit('close-menu')"
      >
        {{ item.name }}
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  isMobileMenuOpen: Boolean,
});

const menuItems = [
  { name: 'Saved Jobs', path: '/developer/saved-jobs' },
  { name: 'My Applications', path: '/developer/applications', icon: 'briefcase' },
  { name: 'Resumes', path: '/developer/resumes' },
  { name: 'Test Results', path: '/developer/test-results' },
  { name: 'Subscription', path: '/developer/subscription' },
  // { name: 'Test Coding', path: '/developer/challenges' },
];
</script>
