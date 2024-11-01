<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const error = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleSubmit = async () => {
  try {
    await authStore.login(email.value, password.value);
    // Redirect based on user type
    router.push(authStore.isDeveloper ? '/developer' : '/company');
  } catch (err: any) {
    error.value = err.message;
  }
};
</script>

<template>
  <div class="max-w-md mx-auto">
    <h1 class="text-3xl font-bold mb-8 text-center">Login</h1>

    <form @submit.prevent="handleSubmit" class="bg-gray-800 rounded-lg p-6">
      <div class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium mb-2">Email</label>
          <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium mb-2">Password</label>
          <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>

        <button type="submit" class="w-full bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">
          Login
        </button>
      </div>
    </form>

    <p class="mt-4 text-center text-gray-300">
      Don't have an account?
      <router-link to="/register" class="text-primary-500 hover:text-primary-400">Sign up</router-link>
    </p>
  </div>
</template>