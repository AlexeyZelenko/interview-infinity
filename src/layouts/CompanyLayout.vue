<script setup lang="ts">
import {ref, computed} from 'vue';
import { useRoute } from 'vue-router';


const route = useRoute();
const isMobileMenuOpen = ref(false);

const menuItems = [
  { name: 'Company Profile', path: '/company/profile', icon: 'building' },
  { name: 'Job Listings', path: '/company/jobs', icon: 'briefcase' },
  { name: 'Company Tests', path: '/company/tests', icon: 'academic-cap' },
  { name: 'Create Test Manually', path: '/company/create-test-manual', icon: 'pencil' },
  { name: 'Create Test with AI', path: '/company/create-test-ai', icon: 'sparkles' },
  { name: 'Subscription', path: '/company/subscription', icon: 'credit-card' },
  { name: 'Saved Developers', path: '/company/saved-developers', icon: 'users' },
  // { name: 'Create Test', path: '/company/create-test', icon: 'plus-circle' },
];

const currentMenuItem = computed(() => {
  return menuItems.find(item => route.path === item.path)?.name || 'Account';
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
            <p class="text-sm text-primary-400">
              <span>Company Account</span>
            </p>
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
            <p class="text-sm text-primary-400">
              <span>Company Account</span>
            </p>
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
                      v-else-if="item.icon === 'briefcase'"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                  <path
                      v-else-if="item.icon === 'users'"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                  <path
                      v-else-if="item.icon === 'academic-cap'"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                  />
                  <path
                      v-else-if="item.icon === 'sparkles'"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                  <path
                      v-else-if="item.icon === 'pencil'"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                  <path
                      v-else-if="item.icon === 'plus-circle'"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                      v-else-if="item.icon === 'building'"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
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