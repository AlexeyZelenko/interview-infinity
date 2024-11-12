<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { db } from '../../../../firebase/config';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useAuthStore } from '../../../../stores/auth';
import { useTestStore } from '../../../../stores/tests';

const testStore = useTestStore();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true); // Loading state
const error = ref(''); // Error message

// Retrieve route parameters
const testId = route.params.testId as string;
const jobId = route.query.jobId as string;

// Type interfaces for test results, user, and test
interface TestResult {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  testId: string;
  jobId: string;
  score: number;
  answers: Array<{
    questionId: number;
    selectedAnswer: number;
    isCorrect: boolean;
    timeSpent: number;
  }>;
  startedAt: string;
  completedAt: string;
  totalTimeSpent: number;
  passed: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  title?: string;
  location?: string;
  experience?: string;
  avatar?: string;
}

interface Test {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  questions: Array<{
    id: number;
    text: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }>;
}

// Reactive references for test, results, and users
const test = ref<Test | null>(null);
const results = ref<TestResult[]>([]);
const users = ref<Map<string, User>>(new Map());

const loadTestResults = async () => {
  console.log('test ID:', testId);
  if (!testId) {
    error.value = 'Invalid test ID';
    return;
  }

  if (!jobId) {
    error.value = 'Invalid job ID';
    return;
  }

  try {
    loading.value = true;
    error.value = '';

    // Fetch test results
    const testAttemptsQuery = query(
        collection(db, 'testAttempts'),
        where('testId', '==', testId),
        where('jobId', '==', jobId)
    );
    const testAttemptsSnapshot = await getDocs(testAttemptsQuery);

    if (testAttemptsSnapshot.empty) {
      error.value = 'No test results found';
      return;
    }

    results.value = testAttemptsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestResult));

    // Fetch test details
    const testDoc = await getDoc(doc(db, 'tests', testId));
    if (!testDoc.exists()) {
      throw new Error('Test not found');
    }
    test.value = { id: testDoc.id, ...testDoc.data() } as Test;

    // Fetch user data for each unique user in results
    const uniqueUserIds = Array.from(new Set(results.value.map(result => result.userId)));
    await Promise.all(uniqueUserIds.map(fetchUserData));

  } catch (err: any) {
    error.value = err.message;
    console.error('Error loading test results:', err);
  } finally {
    loading.value = false;
  }
};

const fetchUserData = async (userId: string) => {
  if (users.value.has(userId)) return; // Avoid re-fetching if already in map
  const userDoc = await getDoc(doc(db, 'users', userId));
  console.log('userDoc:', userDoc.data());
  if (userDoc.exists()) {
    users.value.set(userId, { id: userDoc.id, ...userDoc.data() } as User);
  } else {
    console.warn(`User with ID ${userId} not found.`);
  }
};

const getUser = (userId: string): User | undefined => users.value.get(userId);

const formatDate = (date: string) => new Date(date).toLocaleString();

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case 'beginner': return 'bg-green-500/10 text-green-400';
    case 'intermediate': return 'bg-yellow-500/10 text-yellow-400';
    case 'advanced': return 'bg-red-500/10 text-red-400';
    default: return 'bg-gray-500/10 text-gray-400';
  }
};

// Load results only if IDs are valid
onMounted(loadTestResults);
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <div class="mb-6">
      <button
          @click="router.push('/company/jobs')"
          class="text-primary-400 hover:text-primary-300 mb-4"
      >
        ← Back to Vacancies
      </button>

      <div v-if="test" class="bg-gray-800 rounded-lg p-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h1 class="text-2xl font-bold mb-2">{{ test.title }}</h1>
            <p class="text-gray-300">{{ test.description }}</p>
            <div class="flex items-center gap-4 mt-2">
              <span :class="[getDifficultyColor(test.difficulty), 'px-3 py-1 rounded-full text-sm']">
                {{ test.difficulty }}
              </span>
              <span class="text-gray-400">{{ test.category }}</span>
              <span class="text-gray-400">{{ test.duration }} minutes</span>
            </div>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold">
              {{ results.filter(r => r.passed).length }}/{{ results.length }}
            </p>
            <p class="text-sm text-gray-400">Passed</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
      <p>Loading test results...</p>
    </div>

    <div v-else-if="error" class="bg-red-500/10 text-red-400 p-4 rounded-lg">
      {{ error }}
    </div>

    <div v-else-if="results.length === 0" class="bg-gray-800 rounded-lg p-6 text-center">
      <p class="text-gray-300">No test results available yet.</p>
    </div>

    <div v-else class="space-y-6">
      <div
          v-for="result in results"
          :key="result.id"
          class="bg-gray-800 rounded-lg p-6"
      >
        <div class="flex justify-between items-start mb-6">
          <div class="flex items-start gap-4">
            <div>
              <h3 class="text-xl font-semibold">
                {{ getUser(result.userId)?.email || 'Unknown User' }}
              </h3>
            </div>
          </div>
          <div class="text-right">
            <p
                class="text-2xl font-bold"
                :class="result.passed ? 'text-green-400' : 'text-red-400'"
            >
              {{ result.score }}%
            </p>
            <p class="text-sm text-gray-400">
              {{ result.passed ? 'Passed' : 'Failed' }}
            </p>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <router-link
              :to="`/tests/${testId}/user-details?userId=${result.userId}&jobId=${jobId}`"
              class="text-primary-400 hover:text-primary-300"
          >
            View Test Details
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
