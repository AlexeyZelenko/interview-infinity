<script setup lang="ts">
import { defineProps, onMounted, ref, computed } from 'vue';
import { useTestStore } from '../../../stores/tests';

const testStore = useTestStore();

const props = defineProps({
  result: {
    type: Object as () => {
      testId: string;
      completedAt: string;
      score: number;
      answers: Array<{ isCorrect: boolean }>;
      videoUrl?: string;
    },
    required: false,
  },
});

const currentTest = ref(null);

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-400';
  if (score >= 70) return 'text-yellow-400';
  return 'text-red-400';
};

// Safely access answers array
const correctAnswers = computed(() => {
  if (!props.result || !props.result.answers) return 0;
  return props.result.answers.filter(answer => answer.isCorrect).length;
});

const totalQuestions = computed(() => {
  if (!props.result || !props.result.answers) return 0;
  return props.result.answers.length;
});

// Calculate score only if there are questions to avoid division by zero
const score = computed(() => {
  return totalQuestions.value > 0
      ? Math.round((correctAnswers.value / totalQuestions.value) * 100)
      : 0;
});

onMounted(async () => {
  if (props.result?.testId) {
    await testStore.fetchTestById(props.result.testId);
    currentTest.value = testStore.currentTest;
  }
});
</script>

<template>
  <div v-if="props.result" class="flex justify-between items-start mb-4">
    <div>
      <h3 v-if="currentTest" class="text-xl font-semibold">{{ currentTest.title }}</h3>
      <p class="text-gray-400">{{ formatDate(props.result.completedAt) }}</p>
<!--      <p class="text-gray-400">{{ props.result.userId }}</p>-->
    </div>
    <div class="text-right">
      <p :class="[getScoreColor(score), 'text-2xl font-bold']">
        {{ score }}%
      </p>
      <p class="text-sm text-gray-400">
        {{ Math.round((score * totalQuestions) / 100) }}/{{ totalQuestions }} correct
      </p>
    </div>
  </div>
  <div v-else class="text-gray-400 text-center">
    No result data available.
  </div>
</template>
