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
  answers: {Answer}[];
}>();

// Calculate the total time spent
const totalTimeSpent = computed(() =>
    props.answers.reduce((acc, answer) => acc + answer.timeTaken, 0)
);

// Format time utility
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
</script>

<template>
  <div class="bg-gray-800 rounded-lg p-6">
    <h3 class="text-xl font-semibold mb-4">Time Distribution</h3>
    <div class="space-y-4">
      <div
          v-for="(answer, index) in answers"
          :key="index"
          class="relative"
      >
        <div class="flex justify-between text-sm text-gray-400 mb-1">
          <span>Question {{ index + 1 }}</span>
          <span>{{ answer.timeTaken }} seconds</span>
        </div>

        <div class="w-full bg-gray-700 rounded-full h-2">
          <div
              class="h-2 rounded-full transition-all duration-300"
              :class="answer.isCorrect ? 'bg-green-500' : 'bg-red-500'"
              :style="{ width: `${(answer.timeTaken / totalTimeSpent) * 100}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>
