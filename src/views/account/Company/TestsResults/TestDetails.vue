<script setup lang="ts">
import {ref, onMounted} from 'vue';
import { useTestStore } from '@/stores/tests';
import { useRoute } from 'vue-router';
import Info from './Info.vue';
import ProgressBar from './ProgressBar.vue';

const testStore = useTestStore();
const loading = ref(true);
const error = ref('');
const testsResults = ref(null);

// Retrieve route parameters
const route = useRoute();
const testId = route.params.testId as string;
const userId = route.query.userId as string;
const jobId = route.query.jobId as string;

onMounted(async () => {
  try {
    console.log('Test ID:', testId, 'User ID:', userId, 'Job ID:', jobId);

    await testStore.loadTestHistory();
    testsResults.value = testStore.testHistoryCompany.filter((test) => test.userId === userId && test.jobId === jobId && test.testId === testId);
    console.log("testsResults", testsResults.value);
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="max-w-4xl">
    <h2 class="text-2xl font-bold mb-6">Test Results</h2>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
      <p>Loading test results...</p>
    </div>

    <div v-else-if="error" class="bg-red-500/10 text-red-400 p-4 rounded-lg mb-6">
      {{ error }}
    </div>

    <div v-else-if="testsResults.length === 0" class="bg-gray-800 rounded-lg p-6 text-center">
      <p class="text-gray-300">You haven't taken any tests yet.</p>
      <router-link
          to="/tests"
          class="inline-block mt-4 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
      >
        Browse Tests
      </router-link>
    </div>

    <div v-else>
      <!-- Results Overview -->
      <div class="grid grid-cols-2 gap-4 mb-8">
        <div class="bg-gray-800 rounded-lg p-4">
          <p class="text-2xl font-bold">
            {{ testsResults.length }}
          </p>
          <p class="text-sm text-gray-400">Users</p>
        </div>
        <div class="bg-gray-800 rounded-lg p-4">
          <p class="text-2xl font-bold">{{ testsResults.length }}</p>
          <p class="text-sm text-gray-400">Tests Completed</p>
        </div>
      </div>

      <!-- Test Results List -->
      <div v-if="testsResults.length > 0" class="space-y-6">
        <div
            v-for="result in testsResults"
            :key="result.id"
            class="bg-gray-800 rounded-lg p-6"
        >
          <!-- Test Info -->
          <Info :result='result' />

          <!-- Progress Bar -->
          <div class="mt-4">
            <ProgressBar :result="result"/>
          </div>

          <!-- Actions -->
          <div class="mt-4 flex justify-between">
            <router-link
                :to="`/test/${result.id}/user-review?${result.userId}`"
                class="text-primary-400 hover:text-primary-300"
            >
              Review Test
            </router-link>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
