<script setup lang="ts">
import { computed } from 'vue';

interface Answer {
  testId: number | string | null;
  selectedAnswer: number | null;
  isCorrect: boolean | null;
  timeTaken: number;
  correctAnswer: number;
}

const props = defineProps<{
  test: {
    title: string;
    description: string;
  };
  attempt: {
    startedAt: string;
    completedAt: string;
    totalTimeSpent: number;
    score: number;
    totalQuestions: number;
    answers: Answer[];
  };
}>();

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-400';
  if (score >= 70) return 'text-yellow-400';
  return 'text-red-400';
};

// Используем либо `props.attempt.totalTimeSpent`, либо суммируем `timeTaken` для каждого ответа
const totalTime = computed(() =>
    props.attempt.totalTimeSpent || props.attempt.answers.reduce((acc, answer) => acc + answer.timeTaken, 0)
);

const correctAnswers = computed(() =>
    props.attempt.answers.filter((answer) => answer.isCorrect).length
);

const score = computed(() => Math.round((correctAnswers.value / props.attempt.totalQuestions) * 100));
</script>

<template>
  <div class="bg-gray-800 rounded-lg p-6">
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <h3 class="text-xl font-semibold mb-4">{{ test.title }}</h3>
        <p class="text-gray-300 mb-4">{{ test.description }}</p>
        <div class="space-y-2 text-gray-300">
          <p>Started: {{ new Date(attempt.startedAt).toLocaleString() }}</p>
          <p>Completed: {{ new Date(attempt.completedAt).toLocaleString() }}</p>
          <p>Total Time: {{ formatTime(totalTime) }}</p>
        </div>
      </div>

      <div class="flex flex-col items-center justify-center">
        <div class="text-center">
          <p class="text-4xl font-bold mb-2" :class="getScoreColor(score)">
            {{ score }}%
          </p>
          <p class="text-gray-400">
            {{ correctAnswers }}/{{ attempt.totalQuestions }} correct
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
