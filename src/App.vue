<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useAuthStore } from './stores/auth';
import Navbar from './components/Navbar.vue';

const authStore = useAuthStore();
</script>

<template>
  <div class="min-h-screen bg-dark-bg text-dark-text">
    <template v-if="!authStore.loading">
      <Navbar />
      <main class="container mx-auto px-4 py-8">
        <RouterView />
      </main>
    </template>
    <div v-else class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p class="text-dark-text-secondary">Loading...</p>
      </div>
    </div>
  </div>
</template>
