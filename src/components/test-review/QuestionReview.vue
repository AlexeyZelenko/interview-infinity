<script setup lang="ts">
const props = defineProps<{
  question: {
    id: number;
    text: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  };
  answer: {
    testId: number | string | null;
    selectedAnswer: number | null;
    isCorrect: boolean | null;
    timeTaken: number;
    correctAnswer: number;
  };
  index: number;
}>();

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
</script>

<template>
  <div
      class="bg-gray-800 rounded-lg p-6"
      :class="answer.isCorrect ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'"
  >
    <div class="flex justify-between items-start mb-4">
      <h4 class="text-lg font-semibold">Question {{ index + 1 }}</h4>
      <div class="flex items-center gap-4">
        <span
            class="px-3 py-1 rounded-full text-sm"
            :class="answer.isCorrect ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'"
        >
          {{ answer.isCorrect ? 'Correct' : 'Incorrect' }}
        </span>
        <span class="text-gray-400">
          {{ formatTime(answer.timeTaken) }}
        </span>
      </div>
    </div>

    <div class="space-y-4">
      <p class="text-gray-300 whitespace-pre-line">{{ question.text }}</p>

      <div class="space-y-2">
        <div
            v-for="(option, optionIndex) in question.options"
            :key="optionIndex"
            class="p-3 rounded-lg"
            :class="[
            optionIndex === question.correctAnswer
              ? 'bg-green-500/10 text-green-400'
              : optionIndex === answer.selectedAnswer && !answer.isCorrect
                ? 'bg-red-500/10 text-red-400'
                : 'bg-gray-700'
          ]"
        >
          {{ option }}
          <template v-if="optionIndex === question.correctAnswer">
            <span class="ml-2">(Correct Answer)</span>
          </template>
          <template v-else-if="optionIndex === answer.selectedAnswer && !answer.isCorrect">
            <span class="ml-2">(Your Answer)</span>
          </template>
        </div>
      </div>

      <div v-if="!answer.isCorrect && question.explanation" class="mt-4 p-4 bg-gray-700 rounded-lg">
        <h5 class="font-medium mb-2">Explanation:</h5>
        <p class="text-gray-300">{{ question.explanation }}</p>
      </div>
    </div>
  </div>
</template>