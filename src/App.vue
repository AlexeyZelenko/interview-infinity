<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { ref, onMounted } from 'vue';
import Navbar from './components/Navbar.vue';

const authStore = useAuthStore();
const isDark = ref(false);

const toggleTheme = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    localStorage.theme = 'dark';
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.theme = 'light';
  }
};

onMounted(() => {
  // Check for saved theme preference or system preference
  if (localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true;
    document.documentElement.classList.add('dark');
  } else {
    isDark.value = false;
    document.documentElement.classList.remove('dark');
  }

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', e => {
        if (!localStorage.theme) {
          isDark.value = e.matches;
          if (isDark.value) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      });
});
</script>

<template>
  <div class="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
    <template v-if="!authStore.loading">
      <Navbar @toggle-theme="toggleTheme" :is-dark="isDark" />
      <main class="container mx-auto px-4 py-8">
        <RouterView />
      </main>
    </template>
    <div v-else class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p class="text-light-text-secondary dark:text-dark-text-secondary">Loading...</p>
      </div>
    </div>
  </div>
</template>