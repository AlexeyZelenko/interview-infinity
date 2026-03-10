<script setup lang="ts">
import { ref } from 'vue';
import Swal from 'sweetalert2';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const googleLoading = ref(false);
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

const handleGoogleLogin = async () => {
  try {
    googleLoading.value = true;
    await authStore.loginWithGoogle();

    Swal.fire({
      icon: 'success',
      title: 'Login Successful',
      text: 'Welcome back!',
    });

    router.push(authStore.isDeveloper ? '/developer' : '/company');
  } catch (err: any) {
    if (err.code === 'auth/popup-closed-by-user') return;

    Swal.fire({
      icon: 'error',
      title: 'Google Login Failed',
      text: err.message || 'An error occurred during Google sign-in.',
    });
    console.error('Google login error:', err);
  } finally {
    googleLoading.value = false;
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

        <!-- Google Sign-In (hidden for now) -->
        <template v-if="false">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-600"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-gray-800 text-gray-400">or</span>
          </div>
        </div>

        <button
          type="button"
          @click="handleGoogleLogin"
          :disabled="googleLoading"
          class="w-full flex items-center justify-center gap-3 bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span v-if="!googleLoading">Sign in with Google</span>
          <span v-else>Signing in...</span>
        </button>
        </template>
      </div>
    </form>

    <p class="mt-4 text-center text-gray-300">
      Don't have an account?
      <router-link to="/register" class="text-primary-500 hover:text-primary-400">Sign up</router-link>
    </p>
  </div>
</template>
