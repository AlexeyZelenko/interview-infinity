<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter, useRoute } from 'vue-router';
import { useChatStore } from '@/stores/chats';
import LanguageSwitcher from './LanguageSwitcher.vue';

const useAuth = useAuthStore();
const currentUserId = computed(() => useAuth.user?.uid ?? '');
const chatStore = useChatStore();

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const isMenuOpen = ref(false);
const showAboutDropdown = ref(false);

const menuItems = [
  { path: '/', label: 'menu.Home' },
  { path: '/jobs', label: 'menu.Jobs' },
  { path: '/all-resumes', label: 'menu.Resumes' },
  { path: '/tests', label: 'menu.Tests' },
  // { path: '/community', label: 'menu.Community' },
  // { path: '/faq', label: 'menu.Faq' },
  // { path: '/pricing', label: 'menu.Pricing' },
  { path: '/developers', label: 'menu.Developers' },
];

const aboutDropdownItems = [
  { path: '/faq', label: 'menu.AboutMenu.FAQ' },
  { path: '/community', label: 'menu.AboutMenu.Community' },
  { path: '/our-products', label: 'menu.AboutMenu.OurProducts' },
];

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === path;
  }
  return route.path.startsWith(path);
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const toggleAboutDropdown = () => {
  showAboutDropdown.value = !showAboutDropdown.value;
};

const closeAboutDropdown = () => {
  showAboutDropdown.value = false;
};

onMounted( () => {
  console.log("currentUserId", currentUserId.value)
  if (currentUserId.value) {
    chatStore.loadUnreadMessages(currentUserId.value);
  }
});
</script>

<template>
  <nav class="bg-dark-card border-b border-dark-border">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo Section -->
        <div class="flex items-center">
          <router-link to="/" class="text-dark-text font-bold text-xl">
            <img class="logo" src="@/assets/image/logo2.png" alt="logo"/>
<!--            IT-ARENA-->
          </router-link>
        </div>

        <!-- Desktop Menu -->
        <div class="hidden md:block">
          <div class="flex items-center justify-center space-x-4">
            <router-link
                v-for="item in menuItems"
                :key="item.path"
                :to="item.path"
                class="px-3 py-2 rounded-md transition-colors"
                :class="isActive(item.path)
              ? 'bg-primary-600/10 text-primary-400'
              : 'text-dark-text-secondary hover:text-dark-text'"
            >
              {{ $t(item.label) }}
            </router-link>

            <!-- About Us Dropdown -->
            <div class="relative group" @mouseleave="closeAboutDropdown">
              <button
                  @mouseenter="toggleAboutDropdown"
                  class="px-3 py-2 rounded-md transition-colors flex items-center space-x-1 group"
                  :class="isActive('/faq') || isActive('/community')
                    ? 'bg-primary-600/10 text-primary-400'
                    : 'text-dark-text-secondary hover:text-dark-text'"
              >
                <span>{{ $t('menu.AboutMenu.title') }}</span>
                <svg
                    class="w-4 h-4 transition-transform"
                    :class="{ 'rotate-180': showAboutDropdown }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <div
                  class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-dark-card ring-1 ring-black ring-opacity-5 z-50 transition-all duration-150 opacity-0 invisible group-hover:opacity-100 group-hover:visible"
                  @mouseenter="showAboutDropdown = true"
                  @mouseleave="showAboutDropdown = false"
              >
                <div class="py-1">
                  <router-link
                      v-for="item in aboutDropdownItems"
                      :key="item.path"
                      :to="item.path"
                      class="block px-4 py-2 text-sm transition-colors"
                      :class="isActive(item.path)
                        ? 'bg-primary-600/10 text-primary-400'
                        : 'text-dark-text-secondary hover:text-dark-text hover:bg-gray-800'"
                      @click="closeAboutDropdown"
                  >
                    {{ $t(item.label) }}
                  </router-link>
                </div>
              </div>
            </div>

            <template v-if="authStore.user">
              <router-link
                  :to="authStore.isAdmin ? '/admin' : '/profile'"
                  class="px-3 py-2 rounded-md transition-colors"
                  :class="isActive(authStore.isAdmin ? '/admin' : '/profile')
                ? 'bg-primary-600/10 text-primary-400'
                : 'text-dark-text-secondary hover:text-dark-text'"
              >
                <span>{{ $t(authStore.isAdmin ? 'menu.AdminDashboard' : 'menu.Profile') }}</span>
                <span
                    v-if="chatStore.allUnreadCount > 0"
                    class="bg-red-400 text-amber-50 py-1 px-3 rounded-2xl text-xs ml-2"
                    :title="`You have unread messages.
                     Go to *Job Listings* and view jobs that have messages`"
                ></span>
              </router-link>
              <button
                  @click="handleLogout"
                  class="text-dark-text-secondary hover:text-dark-text px-3 py-2 rounded-md"
              >
                {{ $t('menu.Logout') }}
              </button>
            </template>
            <template v-else>
              <router-link
                  to="/login"
                  class="px-3 py-2 rounded-md transition-colors"
                  :class="isActive('/login')
                ? 'bg-primary-600/10 text-primary-400'
                : 'text-dark-text-secondary hover:text-dark-text'"
              >
                {{ $t('menu.Login') }}
              </router-link>
              <router-link
                  to="/register"
                  class="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
              >
                {{ $t('menu.SignUp') }}
              </router-link>
            </template>
            <LanguageSwitcher />
          </div>
        </div>

        <!-- Mobile Menu Button -->
        <div class="md:hidden">
          <button
              @click="toggleMenu"
              class="text-dark-text-secondary hover:text-dark-text focus:outline-none"
          >
            <svg
                v-if="!isMenuOpen"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                class="w-6 h-6"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                class="w-6 h-6"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div
          v-if="isMenuOpen"
          class="md:hidden bg-dark-card border-t border-dark-border mt-2 py-4"
      >
        <div class="space-y-4 px-4">
          <router-link
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              class="block px-3 py-2 rounded-md transition-colors"
              :class="isActive(item.path)
            ? 'bg-primary-600/10 text-primary-400'
            : 'text-dark-text-secondary hover:text-dark-text'"
              @click="isMenuOpen = false"
          >
            {{ $t(item.label) }}
          </router-link>

          <!-- Mobile About Menu -->
          <div class="space-y-2">
            <div class="px-3 py-2 text-dark-text-secondary">
              {{ $t('menu.AboutMenu.title') }}
            </div>
            <router-link
                v-for="item in aboutDropdownItems"
                :key="item.path"
                :to="item.path"
                class="block px-6 py-2 rounded-md transition-colors"
                :class="isActive(item.path)
              ? 'bg-primary-600/10 text-primary-400'
              : 'text-dark-text-secondary hover:text-dark-text'"
                @click="isMenuOpen = false"
            >
              {{ $t(item.label) }}
            </router-link>
          </div>

          <template v-if="authStore.user">
            <router-link
                :to="authStore.isAdmin ? '/admin' : '/profile'"
                class="block px-3 py-2 rounded-md transition-colors"
                :class="isActive(authStore.isAdmin ? '/admin' : '/profile')
              ? 'bg-primary-600/10 text-primary-400'
              : 'text-dark-text-secondary hover:text-dark-text'"
                @click="isMenuOpen = false"
            >
              {{ $t(authStore.isAdmin ? 'menu.AdminDashboard' : 'menu.Profile') }}
            </router-link>
            <button
                @click="() => { handleLogout(); isMenuOpen = false; }"
                class="block w-full text-left text-dark-text-secondary hover:text-dark-text px-3 py-2 rounded-md"
            >
              {{ $t('menu.Logout') }}
            </button>
          </template>
          <template v-else>
            <router-link
                to="/login"
                class="block px-3 py-2 rounded-md transition-colors"
                :class="isActive('/login')
              ? 'bg-primary-600/10 text-primary-400'
              : 'text-dark-text-secondary hover:text-dark-text'"
                @click="isMenuOpen = false"
            >
              {{ $t('menu.Login') }}
            </router-link>
            <router-link
                to="/register"
                class="block bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                @click="isMenuOpen = false"
            >
              {{ $t('menu.SignUp') }}
            </router-link>
          </template>
          <div class="px-3">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.logo {
  width: 65px;
  margin-right: 10px;
}
</style>
