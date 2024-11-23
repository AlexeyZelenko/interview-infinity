<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Desktop Layout -->
    <div class="lg:grid lg:grid-cols-[280px,1fr]">
      <!-- Sidebar -->
      <aside class="hidden lg:block bg-gray-800 h-screen sticky top-0">
        <div class="p-6">
          <div class="mb-6">
            <h2 class="text-xl font-bold text-white">Admin Panel</h2>
            <p class="text-sm text-primary-400">Test Management</p>
          </div>
          <nav class="space-y-1">
            <router-link
                v-for="item in menuItems"
                :key="item.path"
                :to="item.path"
                class="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors"
                :class="isActive(item.path)
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'"
            >
              <span class="mr-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                      v-if="item.icon === 'dashboard'"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                  <path
                      v-else-if="item.icon === 'upload'"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                  <path
                      v-else-if="item.icon === 'form'"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                  <path
                      v-else-if="item.icon === 'review'"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
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

<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();

const menuItems = [
  { name: 'Dashboard', path: '/admin', icon: 'dashboard' },
  { name: 'Upload Tests', path: '/admin/upload-tests', icon: 'upload' },
  { name: 'Create Test', path: '/admin/create-manual-test', icon: 'form' },
  { name: 'Review Submissions', path: '/admin/review', icon: 'review' },
  { name: 'Tests', path: '/admin/tests', icon: 'form' },
  { name: 'Chats', path: '/admin/chats', icon: 'form' },
  // { name: 'Edit Test', path: '/admin/edit-test', icon: 'form' },
];

// Функция для проверки активного пункта меню
const isActive = (path: string) => {
  if (path === '/admin') {
    return route.path === path;
  }
  return route.path.startsWith(path);
};
</script>
