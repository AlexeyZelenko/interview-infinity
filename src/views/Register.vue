<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter, useRoute } from 'vue-router';

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const userType = ref(route.query.type?.toString() || 'developer');

const handleSubmit = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }

  try {
    await authStore.register(email.value, password.value, userType.value as 'developer' | 'company');
    // Redirect based on user type
    router.push(userType.value === 'developer' ? '/developer' : '/company');
  } catch (err: any) {
    error.value = err.message;
  }
};
</script>

<template>
  <div class="max-w-md mx-auto">
    <h1 class="text-3xl font-bold mb-8 text-center">Create Account</h1>

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

        <div>
          <label for="confirmPassword" class="block text-sm font-medium mb-2">Confirm Password</label>
          <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Account Type</label>
          <div class="flex gap-4">
            <label class="flex items-center">
              <input
                  type="radio"
                  v-model="userType"
                  value="developer"
                  class="text-primary-600 focus:ring-primary-500"
              />
              <span class="ml-2">Developer</span>
            </label>
            <label class="flex items-center">
              <input
                  type="radio"
                  v-model="userType"
                  value="company"
                  class="text-primary-600 focus:ring-primary-500"
              />
              <span class="ml-2">Company</span>
            </label>
          </div>
        </div>

        <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>

        <button type="submit" class="w-full bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">
          Create Account
        </button>
      </div>
    </form>

    <p class="mt-4 text-center text-gray-300">
      Already have an account?
      <router-link to="/login" class="text-primary-500 hover:text-primary-400">Login</router-link>
    </p>
  </div>
</template>