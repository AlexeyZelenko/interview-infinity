<script setup lang="ts">
  import { ref } from 'vue';

  const props = defineProps<{
    submission: any;
    questions: any[];
  }>();

  const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'approve', submission: any): void;
    (e: 'reject', submission: any): void;
  }>();

  const currentQuestionIndex = ref(0);
  const selectedAnswer = ref<number | null>(null);

  const handleAnswer = (index: number) => {
    selectedAnswer.value = index;
  };

  const nextQuestion = () => {
    if (currentQuestionIndex.value < props.questions.length - 1) {
      currentQuestionIndex.value++;
      selectedAnswer.value = null;
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex.value > 0) {
      currentQuestionIndex.value--;
      selectedAnswer.value = null;
    }
  };
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-light-card dark:bg-dark-card rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-start mb-6">
        <div>
          <h2 class="text-2xl font-bold">Test Preview</h2>
          <p class="text-light-text-secondary dark:text-dark-text-secondary mt-1">
            {{ submission.title }}
          </p>
        </div>
        <button
            @click="emit('close')"
            class="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Question Preview -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">
            Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}
          </h3>
        </div>

        <div class="bg-light-hover dark:bg-dark-hover rounded-lg p-6 mb-4">
          <p class="text-lg mb-6">{{ questions[currentQuestionIndex].text }}</p>

          <div class="space-y-3">
            <button
                v-for="(option, index) in questions[currentQuestionIndex].options"
                :key="index"
                @click="handleAnswer(index)"
                class="w-full text-left px-4 py-3 rounded-lg transition-colors"
                :class="[
                selectedAnswer === index
                  ? 'bg-primary-600 text-white'
                  : 'bg-light-card dark:bg-dark-card hover:bg-light-hover dark:hover:bg-dark-hover'
              ]"
            >
              {{ option }}
            </button>
          </div>

          <div
              v-if="selectedAnswer !== null"
              class="mt-6 p-4 rounded-lg"
              :class="selectedAnswer === questions[currentQuestionIndex].correctAnswer
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400'"
          >
            <p class="font-medium mb-2">
              {{ selectedAnswer === questions[currentQuestionIndex].correctAnswer
                ? 'Correct!'
                : 'Incorrect.' }}
              The correct answer is:
              {{ questions[currentQuestionIndex].options[questions[currentQuestionIndex].correctAnswer] }}
            </p>
            <p class="text-light-text dark:text-dark-text">
              {{ questions[currentQuestionIndex].explanation }}
            </p>
          </div>
        </div>

        <div class="flex justify-between">
          <button
              @click="previousQuestion"
              :disabled="currentQuestionIndex === 0"
              class="px-4 py-2 bg-light-hover dark:bg-dark-hover rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
              @click="nextQuestion"
              :disabled="currentQuestionIndex === questions.length - 1"
              class="px-4 py-2 bg-light-hover dark:bg-dark-hover rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-4 border-t border-light-border dark:border-dark-border pt-4">
        <button
            @click="emit('reject', submission)"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reject
        </button>
        <button
            @click="emit('approve', submission)"
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Approve & Add to Tests
        </button>
      </div>
    </div>
  </div>
</template>