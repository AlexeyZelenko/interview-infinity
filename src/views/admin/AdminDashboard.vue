<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '../../stores/auth';
  import TestSubmissionReview from '../../components/admin/TestSubmissionReview.vue';

  const router = useRouter();
  const authStore = useAuthStore();

  // Check if user is admin
  onMounted(() => {
    if (!authStore.user || authStore.user.email !== 'infinitydevelopinfinity@gmail.com') {
      router.push('/');
    }
  });
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold">Admin Dashboard</h1>
        <p class="text-light-text-secondary dark:text-dark-text-secondary mt-2">
          Manage test submissions and platform content
        </p>
      </div>
    </div>

    <TestSubmissionReview />
  </div>
</template>