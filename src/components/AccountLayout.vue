<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRoute } from 'vue-router';

const authStore = useAuthStore();
const route = useRoute();
const isMobileMenuOpen = ref(false);

const developerMenuItems = [
  { name: 'Saved Jobs', path: '/account/saved-jobs', icon: 'bookmark' },
  { name: 'Resume', path: '/account/resume', icon: 'document' },
  { name: 'Test Results', path: '/account/test-results', icon: 'academic-cap' },
  { name: 'Subscription', path: '/account/subscription', icon: 'credit-card' }
];

const companyMenuItems = [
  { name: 'Job Listings', path: '/account/jobs', icon: 'briefcase' },
  { name: 'Saved Developers', path: '/account/saved-developers', icon: 'users' },
  { name: 'Company Tests', path: '/account/tests', icon: 'academic-cap' },
  { name: 'Create Test', path: '/account/create-test', icon: 'plus-circle' },
  { name: 'Company Profile', path: '/account/company', icon: 'building' },
  { name: 'Subscription', path: '/account/subscription', icon: 'credit-card' }
];

const menuItems = computed(() => {
  return authStore.isCompany ? companyMenuItems : developerMenuItems;
});

const accountType = computed(() => {
  return authStore.isCompany ? 'Company Account' : 'Developer Account';
});

const currentMenuItem = computed(() => {
  return menuItems.value.find(item => route.path === item.path)?.name || 'Account';
});
</script>

<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Mobile Header -->
    <div class="lg:hidden bg-gray-800 border-b border-gray-700">
      <div class="px-4 py-3">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-semibold">{{ currentMenuItem }}</h1>
            <p class="text-sm text-primary-400">{{ accountType }}</p>
          </div>
          <button
              @click="isMobileMenuOpen = !isMobileMenuOpen"
              class="text-gray-400 hover:text-white"
          >
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

      <!-- Mobile Menu -->
      <div
          v-show="isMobileMenuOpen"
          class="border-t border-gray-700"
      >
        <nav class="px-2 py-3">
          <router-link
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
              :class="{ 'bg-gray-700 text-white': route.path === item.path }"
              @click="isMobileMenuOpen = false"
          >
            {{ item.name }}
          </router-link>
        </nav>
      </div>
    </div>

    <!-- Desktop Layout -->
    <div class="lg:grid lg:grid-cols-[280px,1fr]">
      <!-- Sidebar -->
      <aside class="hidden lg:block bg-gray-800 h-screen sticky top-0">
        <div class="p-6">
          <div class="mb-6">
            <h2 class="text-xl font-bold text-white">Account</h2>
            <p class="text-sm text-primary-400">{{ accountType }}</p>
          </div>
          <nav class="space-y-1">
            <router-link
                v-for="item in menuItems"
                :key="item.path"
                :to="item.path"
                class="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors"
                :class="route.path === item.path
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'"
            >
              <span class="mr-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                      v-if="item.icon === 'credit-card'"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                  <path
                      v-else-if="item.icon === 'bookmark'"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                  <path
                      v-else-if="item.icon === 'document'"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                  <path
                      v-else-if="item.icon === 'academic-cap'"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                  />
                  <path
                      v-else-if="item.icon === 'briefcase'"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                  <path
                      v-else-if="item.icon === 'building'"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                  <path
                      v-else-if="item.icon === 'users'"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                  <path
                      v-else-if="item.icon === 'plus-circle'"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
              {{ item.name }}
            </router-link>
          </nav>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>