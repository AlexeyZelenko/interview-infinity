<script setup lang="ts">
import { ref } from 'vue';
import Swal from 'sweetalert2';
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

    Swal.fire({
      icon: 'success',
      title: 'Login Successful',
      text: 'Welcome back!',
    });

    router.push(authStore.isDeveloper ? '/developer' : '/company');
  } catch (err: any) {
    let errorMessage = 'An unknown error occurred.';

    switch (err.code) {
      case 'auth/invalid-credential':
        errorMessage = 'Invalid credentials. Please check your email and password.';
        break;
      case 'auth/user-not-found':
        errorMessage = 'No user found with this email.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password. Please try again.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'The email address is badly formatted.';
        break;
      default:
        errorMessage = err.message || errorMessage;
    }

    Swal.fire({
      icon: 'error',
      title: 'Login Failed',
      text: errorMessage,
    });
    console.error('Login error:', err);
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
