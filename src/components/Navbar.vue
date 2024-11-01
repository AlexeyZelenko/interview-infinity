<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const props = defineProps<{
  isDark: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle-theme'): void;
}>();

const authStore = useAuthStore();
const router = useRouter();
const isMenuOpen = ref(false);

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
</script>

<template>
  <nav class="bg-light-card dark:bg-dark-card border-b border-light-border dark:border-dark-border">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center">
          <router-link to="/" class="text-light-text dark:text-dark-text font-bold text-xl">DevHire</router-link>
        </div>

        <div class="hidden md:block">
          <div class="flex items-center space-x-4">
            <router-link
                to="/jobs"
                class="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text px-3 py-2 rounded-md"
            >
              Jobs
            </router-link>
            <router-link
                to="/developers"
                class="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text px-3 py-2 rounded-md"
            >
              Developers
            </router-link>
            <router-link
                to="/tests"
                class="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text px-3 py-2 rounded-md"
            >
              Tests
            </router-link>
            <router-link
                to="/community"
                class="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text px-3 py-2 rounded-md"
            >
              Community
            </router-link>
            <router-link
                to="/pricing"
                class="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text px-3 py-2 rounded-md"
            >
              Pricing
            </router-link>

            <button
                @click="emit('toggle-theme')"
                class="p-2 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text"
                :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              <svg
                  v-if="isDark"
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
              >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <svg
                  v-else
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
              >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </button>

            <template v-if="authStore.user">
              <router-link
                  :to="authStore.isAdmin ? '/admin' : '/profile'"
                  class="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text px-3 py-2 rounded-md"
              >
                {{ authStore.isAdmin ? 'Admin Dashboard' : 'Profile' }}
              </router-link>
              <button
                  @click="handleLogout"
                  class="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text px-3 py-2 rounded-md"
              >
                Logout
              </button>
            </template>
            <template v-else>
              <router-link
                  to="/login"
                  class="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text px-3 py-2 rounded-md"
              >
                Login
              </router-link>
              <router-link
                  to="/register"
                  class="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
              >
                Sign Up
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>