<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import { useRouter } from 'vue-router';
import { useTestStore } from "@/stores/tests.ts";
import TestOverview from '@/components/test-review/TestOverview.vue';
import TimeDistribution from '@/components/test-review/TimeDistribution.vue';
import QuestionReview from '@/components/test-review/QuestionReview.vue';
import {doc, getDoc} from "firebase/firestore";
import {db} from "@/firebase/config.ts";

const router = useRouter();
const loading = ref(true);
const error = ref('');
const testStore = useTestStore();
const attemptData = computed(() => {
  return testStore.testResults[0] || null
})
interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface TestAttempt {
  id: string;
  testId: string;
  title: string;
  description: string;
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
  questions: Question[];
  answerTimes: number[];
  videoUrl?: string;
}

const testAttempt = ref<TestAttempt | null>(null);

const loadTestData = async () => {
  try {
    const testDoc = await getDoc(doc(db, 'tests', attemptData.value.testId));

    if (!testDoc.exists()) {
      console.warn('Test not found');
      return; // Exit if the document doesn't exist
    }

    const testData = testDoc.data();

    // Safeguard to ensure attemptData.value is properly defined
    if (!attemptData?.value) {
      console.error('Attempt data is not properly initialized.');
      return;
    }

    const timeCompletedTest = new Date(attemptData.value.completedAt).getTime();
    const updatedTimestamp = timeCompletedTest + timeTaken.value * 1000;
    // Combine attempt data with test details and questions
    testAttempt.value = {
      testId: attemptData.value.testId,
      title: attemptData.value.title || '',
      description: attemptData.value.description || '',
      score: attemptData.value.score || 0,
      totalQuestions: attemptData.value.totalQuestions || 0,
      answers: attemptData.value.answers || [],
      totalTimeSpent: attemptData.value.totalTimeSpent || 0,
      questions: testData.questions || [], // Ensure `questions` exists in `testData`
      answerTimes: attemptData.value.answerTimes || [],
      startedAt: attemptData.value.startedAt,
      completedAt: updatedTimestamp,
    };
  } catch (error) {
    console.error('Error retrieving test document:', error);
  }
};

const navigateToResults = () => {
  router.push('/tests');
};

const timeTaken = computed(() => {
  return attemptData.value?.answers?.reduce((acc, answer) => acc + answer.timeTaken, 0) || 0;
});

onMounted(async () => {
  if (attemptData.value) {
    await loadTestData();
  } else {
    error.value = 'Test data not found.';
  }

  loading.value = false;
});
</script>

<template>
  <div class="max-w-4xl mx-auto my-16">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Test Review</h2>
      <button
          @click="navigateToResults"
          class="text-primary-400 hover:text-primary-300"
      >
        Back to Tests
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
      <p>Loading test details...</p>
    </div>

    <div v-else-if="error" class="bg-red-500/10 text-red-400 p-4 rounded-lg">
      {{ error }}
    </div>

    <template v-else-if="testAttempt">
      <!-- Test Overview -->
      <TestOverview
          :test="{
            title: testAttempt.title,
            description: testAttempt.description
        }"
          :attempt="{
            startedAt: testAttempt.startedAt,
            completedAt: testAttempt.completedAt,
            score: testAttempt.score,
            totalQuestions: testAttempt.totalQuestions,
            totalTimeSpent: testAttempt.totalTimeSpent,
            answers: testAttempt.answers,
            videoUrl: testAttempt.videoUrl
        }"
          class="mb-6"
      />

      <!-- Time Distribution -->
      <TimeDistribution
          :answers="testAttempt?.answers"
          class="mb-6"
      />

      <!-- Questions Review -->
      <div class="space-y-6">
        <QuestionReview
            v-for="(answer, index) in testAttempt.answers"
            :key="index"
            :question="testAttempt.questions[index]"
            :answer="answer"
            :index="index"
        />
      </div>

      <!-- Action Buttons -->
      <div class="mt-8 flex justify-center gap-4">
        <button
            @click="navigateToResults"
            class="px-6 py-2 bg-gray-700 rounded hover:bg-gray-600"
        >
          Back to Tests
        </button>
      </div>
    </template>
  </div>
</template>
