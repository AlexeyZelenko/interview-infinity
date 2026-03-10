<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { useThemeStore } from './stores/theme';
import Navbar from './components/Navbar.vue';
import Chat from "./components/ChatWithAdmin.vue";
import Footer from "./components/Footer.vue";

const authStore = useAuthStore();
const themeStore = useThemeStore();
themeStore.init();
</script>

<template>
  <div class="min-h-screen bg-dark-bg text-dark-text flex flex-col">
    <template v-if="!authStore.loading">
      <Navbar />
      <main class="container mx-auto px-4 flex-grow">
        <RouterView />
      </main>
      <Chat />
      <Footer />
    </template>
    <div v-else class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p class="text-dark-text-secondary">Loading...</p>
      </div>
    </div>
  </div>
</template>
