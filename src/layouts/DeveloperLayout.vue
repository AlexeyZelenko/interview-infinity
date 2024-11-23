<template>
  <div class="min-h-screen bg-gray-900">
    <MobileMenu
        v-if="isMobileMenuOpen"
        :isMobileMenuOpen="isMobileMenuOpen"
        @close-menu="closeMobileMenu"
    />

    <div class="lg:grid lg:grid-cols-[280px,1fr]">
      <Sidebar />
      <main class="p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MobileMenu from './Developer/MobileMenu.vue';
import Sidebar from './Developer/Sidebar.vue';

const isMobileMenuOpen = ref(false);

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};
</script>
