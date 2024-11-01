<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTestStore } from '../../stores/tests';

const testStore = useTestStore();
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    await testStore.loadTestHistory();
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-400';
  if (score >= 70) return 'text-yellow-400';
  return 'text-red-400';
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
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

    <div v-else-if="testStore.testHistory.length === 0" class="bg-gray-800 rounded-lg p-6 text-center">
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
          <p class="text-sm text-gray-400 mb-1">Average Score</p>
          <p class="text-2xl font-bold" :class="getScoreColor(testStore.averageScore)">
            {{ testStore.averageScore }}%
          </p>
        </div>
        <div class="bg-gray-800 rounded-lg p-4">
          <p class="text-sm text-gray-400 mb-1">Tests Completed</p>
          <p class="text-2xl font-bold">{{ testStore.testHistory.length }}</p>
        </div>
      </div>

      <!-- Test Results List -->
      <div class="space-y-6">
        <div
            v-for="result in testStore.testHistory"
            :key="result.id"
            class="bg-gray-800 rounded-lg p-6"
        >
          <!-- Test Info -->
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-xl font-semibold">{{ result.testName }}</h3>
              <p class="text-gray-400">{{ new Date(result.completedAt).toLocaleDateString() }}</p>
            </div>
            <div class="text-right">
              <p :class="[getScoreColor(result.score), 'text-2xl font-bold']">
                {{ result.score }}%
              </p>
              <p class="text-sm text-gray-400">
                {{ Math.round(result.score * result.totalQuestions / 100) }}/{{ result.totalQuestions }} correct
              </p>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mt-4">
            <div class="w-full bg-gray-700 rounded-full h-2">
              <div
                  class="h-2 rounded-full transition-all duration-300"
                  :class="[
                  result.score >= 90 ? 'bg-green-500' :
                  result.score >= 70 ? 'bg-yellow-500' :
                  'bg-red-500'
                ]"
                  :style="{ width: `${result.score}%` }"
              ></div>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-4 flex justify-end">
            <router-link
                :to="`/test/${result.id}/review`"
                class="text-primary-400 hover:text-primary-300"
            >
              Review Test
            </router-link>
          </div>
        </div>
      </div>

      <!-- Take More Tests Button -->
      <div class="mt-8 text-center">
        <router-link
            to="/tests"
            class="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
        >
          Take More Tests
        </router-link>
      </div>
    </div>
  </div>
</template>