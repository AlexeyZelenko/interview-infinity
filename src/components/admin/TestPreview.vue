<script setup lang="ts">
import {onMounted, ref} from 'vue';

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
  console.log(`Selected answer for question ${currentQuestionIndex.value + 1}: Option ${index + 1}`);
};

const nextQuestion = () => {
  if (currentQuestionIndex.value < props.questions.length - 1) {
    currentQuestionIndex.value++;
    selectedAnswer.value = null;
    console.log(`Moved to next question: ${currentQuestionIndex.value + 1}`);
  }
};

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
    selectedAnswer.value = null;
    console.log(`Moved to previous question: ${currentQuestionIndex.value + 1}`);
  }
};

const handleApprove = () => {
  console.log('Submission approved:', props.submission);
  emit('approve', props.submission);
};

const handleReject = () => {
  console.log('Submission rejected:', props.submission);
  emit('reject', props.submission);
};

const handleClose = () => {
  console.log('Preview closed');
  emit('close');
};

onMounted(() => {
  console.log('Test preview mounted', props.submission, props.questions);
});
</script>

<template>
  <div class="fixed inset-0 bg-gray-800/80 flex items-center justify-center z-50">
    <div class="bg-gray-700 rounded-lg shadow-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto text-gray-100">
      <div class="flex justify-between items-start mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-200">Test Preview</h2>
          <p class="text-gray-400 mt-1">{{ submission.title }}</p>
        </div>
        <button
            @click="handleClose"
            class="text-gray-400 hover:text-gray-200"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Question Preview -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4 text-gray-300">
          Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}
        </h3>
        <div class="bg-gray-600 rounded-lg p-6 mb-4">
          <p class="text-lg mb-6 text-gray-200">{{ questions[currentQuestionIndex].text }}</p>
          <div class="space-y-3">
            <button
                v-for="(option, index) in questions[currentQuestionIndex].options"
                :key="index"
                @click="handleAnswer(index)"
                class="w-full text-left px-4 py-3 rounded-lg transition-colors"
                :class="{
                'bg-gray-500 text-gray-100': selectedAnswer === index,
                'bg-gray-700 hover:bg-gray-600': selectedAnswer !== index
              }"
            >
              {{ option }}
            </button>
          </div>
          <div
              v-if="selectedAnswer !== null"
              class="mt-6 p-4 rounded-lg"
              :class="{
              'bg-green-700/20 text-green-500': selectedAnswer === questions[currentQuestionIndex].correctAnswer,
              'bg-red-700/20 text-red-500': selectedAnswer !== questions[currentQuestionIndex].correctAnswer
            }"
          >
            <p class="font-medium mb-2">
              {{ selectedAnswer === questions[currentQuestionIndex].correctAnswer
                ? 'Correct!'
                : 'Incorrect.' }}
              The correct answer is:
              {{ questions[currentQuestionIndex].options[questions[currentQuestionIndex].correctAnswer] }}
            </p>
            <p class="text-gray-300">
              {{ questions[currentQuestionIndex].explanation }}
            </p>
          </div>
        </div>

        <div class="flex justify-between">
          <button
              @click="previousQuestion"
              :disabled="currentQuestionIndex === 0"
              class="px-4 py-2 bg-gray-600 rounded disabled:opacity-50 text-gray-300 hover:bg-gray-500"
          >
            Previous
          </button>
          <button
              @click="nextQuestion"
              :disabled="currentQuestionIndex === questions.length - 1"
              class="px-4 py-2 bg-gray-600 rounded disabled:opacity-50 text-gray-300 hover:bg-gray-500"
          >
            Next
          </button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-4 border-t border-gray-500 pt-4">
        <button
            @click="handleReject"
            class="px-4 py-2 bg-red-600 text-gray-100 rounded hover:bg-red-500"
        >
          Reject
        </button>
        <button
            @click="handleApprove"
            class="px-4 py-2 bg-green-600 text-gray-100 rounded hover:bg-green-500"
        >
          Approve & Add to Tests
        </button>
      </div>
    </div>
  </div>
</template>
