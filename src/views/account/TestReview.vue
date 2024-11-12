<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from '../../firebase/config';
import TestOverview from '../../components/test-review/TestOverview.vue';
import TimeDistribution from '../../components/test-review/TimeDistribution.vue';
import QuestionReview from '../../components/test-review/QuestionReview.vue';
import VideoReview from '../../components/test-review/VideoReview.vue';

const auth = getAuth();

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const error = ref('');

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

async function getAllDocumentIds() {
  const collectionRef = collection(db, "tests");
  const querySnapshot = await getDocs(collectionRef);

  return querySnapshot.docs.map(doc => doc.id);
}

const loadTestData = async () => {
  try {
    const attemptId = route.params.id as string;
    if (!attemptId) {
      throw new Error('Test attempt ID not found');
    }

    // Load test attempt
    const attemptDoc = await getDoc(doc(db, 'testAttempts', attemptId));
    if (!attemptDoc.exists()) {
      throw new Error('Test attempt not found');
    }

    const attemptData = attemptDoc.data();

    getAllDocumentIds();
    // Load test details and questions
    try {
      const testDoc = await getDoc(doc(db, 'tests', attemptData.testId));

      if (!testDoc.exists()) {
        console.warn('Test not found');
      } else {
        const testData = testDoc.data();

        // Combine attempt data with test details and questions
        testAttempt.value = {
          id: attemptDoc.id,
          testId: attemptData.testId,
          title: testData.title,
          description: testData.description,
          startedAt: attemptData.startedAt,
          completedAt: attemptData.completedAt,
          score: attemptData.score,
          totalQuestions: attemptData.totalQuestions,
          answers: attemptData.answers,
          totalTimeSpent: attemptData.totalTimeSpent,
          questions: testData.questions,
          answerTimes: attemptData.answerTimes,
          videoUrl: attemptData.videoUrl,
        };
      }
    } catch (error) {
      console.error('Error retrieving test document:', error);
    }
  } catch (err: any) {
    error.value = err.message;
    console.error('Error loading test data:', err);
  } finally {
    loading.value = false;
  }
};

const navigateToResults = () => {
  router.push('/developer/test-results');
};

onMounted(() => {
  loadTestData();
});
</script>

<template>
  <div class="max-w-4xl mx-auto">
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
          :answers="testAttempt.answers"
          class="mb-6"
      />

      <VideoReview
          v-if="testAttempt.videoUrl"
          :videoUrl="testAttempt.videoUrl"
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
