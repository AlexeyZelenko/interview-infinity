<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTestStore } from '../../stores/tests';
import TestOverview from '../../components/test-review/TestOverview.vue';
import TimeDistribution from '../../components/test-review/TimeDistribution.vue';
import QuestionReview from '../../components/test-review/QuestionReview.vue';

const route = useRoute();
const router = useRouter();
const testStore = useTestStore();
const loading = ref(true);
const error = ref('');

interface TestAttemptDetails {
  id: string;
  testId: string;
  startedAt: string;
  completedAt: string;
  score: number;
  totalQuestions: number;
  answers: {
    questionId: number;
    selectedAnswer: number;
    isCorrect: boolean;
    timeSpent: number;
  }[];
  totalTimeSpent: number;
}

const testAttempt = ref<TestAttemptDetails>({
  id: '1',
  testId: 'vue-test',
  startedAt: '2024-02-20T10:00:00Z',
  completedAt: '2024-02-20T10:25:30Z',
  score: 85,
  totalQuestions: 10,
  answers: [
    { questionId: 1, selectedAnswer: 0, isCorrect: true, timeSpent: 45 },
    { questionId: 2, selectedAnswer: 1, isCorrect: false, timeSpent: 65 },
    { questionId: 3, selectedAnswer: 0, isCorrect: true, timeSpent: 30 },
    { questionId: 4, selectedAnswer: 2, isCorrect: false, timeSpent: 55 },
    { questionId: 5, selectedAnswer: 0, isCorrect: true, timeSpent: 40 }
  ],
  totalTimeSpent: 235
});

const test = ref(testStore.tests.find(t => t.id === testAttempt.value.testId));

const getQuestionById = (id: number) => {
  return test.value?.questions.find(q => q.id === id);
};

const navigateToResults = () => {
  router.push({ name: 'DeveloperTestResults' });
};

onMounted(async () => {
  try {
    // In a real app, we would fetch the test attempt details here
    loading.value = false;
  } catch (err: any) {
    error.value = err.message;
    loading.value = false;
  }
});
</script>

<template>
  <div class="max-w-4xl">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Test Review</h2>
      <button
          @click="navigateToResults"
          class="text-primary-400 hover:text-primary-300"
      >
        Back to Results
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
      <p>Loading test details...</p>
    </div>

    <div v-else-if="error" class="bg-red-500/10 text-red-400 p-4 rounded-lg">
      {{ error }}
    </div>

    <template v-else>
      <!-- Test Overview -->
      <TestOverview
          v-if="test"
          :test="test"
          :attempt="testAttempt"
          class="mb-6"
      />

      <!-- Time Distribution -->
      <TimeDistribution
          :answers="testAttempt.answers"
          :total-time-spent="testAttempt.totalTimeSpent"
          class="mb-6"
      />

      <!-- Questions Review -->
      <div class="space-y-6">
        <QuestionReview
            v-for="(answer, index) in testAttempt.answers"
            :key="index"
            :question="getQuestionById(answer.questionId)!"
            :answer="answer"
            :index="index"
        />
      </div>

      <!-- Action Buttons -->
      <div class="mt-8 flex justify-center gap-4">
        <router-link
            to="/tests"
            class="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
        >
          Take Another Test
        </router-link>
        <button
            @click="navigateToResults"
            class="px-6 py-2 bg-gray-700 rounded hover:bg-gray-600"
        >
          Back to Results
        </button>
      </div>
    </template>
  </div>
</template>