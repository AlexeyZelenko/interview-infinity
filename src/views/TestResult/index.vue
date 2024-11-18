<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useTestStore } from '@/stores/tests';

const testStore = useTestStore();

const currentTest = ref(null);
const isLoading = ref(true);

const formatDate = (date: string) => new Date(date).toLocaleDateString();

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-400';
  if (score >= 70) return 'text-yellow-400';
  return 'text-red-400';
};

const timeTaken = computed(() => {
  const time = currentTest.value?.answers?.reduce((acc, answer) => acc + answer.timeTaken, 0) || 0;
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes}m ${seconds}s`;
});

const correctAnswers = computed(() => currentTest.value?.answers?.filter(answer => answer.isCorrect).length || 0);

const totalQuestions = computed(() => currentTest.value?.answers?.length || 0);

const score = computed(() => (totalQuestions.value > 0
    ? Math.round((correctAnswers.value / totalQuestions.value) * 100)
    : 0)
);

onMounted(async () => {
  try {
    if (testStore.testResults.length > 0) {
      currentTest.value = testStore.testResults[0];
    }
  } catch (error) {
    console.error("Error loading test results:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div v-if="isLoading" class="text-center text-gray-400">Loading...</div>
  <div v-else-if="currentTest" class="flex flex-col">
    <div class="flex justify-between items-start mb-4">
      <div>
        <h3 class="text-xl font-semibold">{{ currentTest.title }}</h3>
        <p class="text-gray-400">{{ formatDate(currentTest.completedAt) }}</p>
      </div>
      <div class="text-right">
        <p class="text-green-800">{{timeTaken}}</p>
        <p :class="[getScoreColor(score), 'text-2xl font-bold']">{{ score }}%</p>
        <p class="text-sm text-gray-400">{{ correctAnswers }}/{{ totalQuestions }} correct</p>
      </div>
    </div>
    <div>
      <div class="w-full bg-gray-700 rounded-full h-2">
        <div
            class="h-2 rounded-full transition-all duration-300"
            :class="[
            score >= 90 ? 'bg-green-500' :
            score >= 70 ? 'bg-yellow-500' :
            'bg-red-500'
          ]"
            :style="{ width: `${score}%` }"
        ></div>
      </div>
    </div>
    <div class="mt-4">To see detailed results for each question, please register.</div>
  </div>
  <div v-else class="text-gray-400 text-center">No result data available.</div>
</template>
