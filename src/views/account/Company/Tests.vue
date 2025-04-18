<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '@/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';
import { useTestStore } from '@/stores/tests.ts';

const testStore = useTestStore();
const toast = useToast();
const authStore = useAuthStore();
const loading = ref(true);
const error = ref('');

interface TestResult {
  id: string;
  userId: string;
  userName: string;
  testId: string;
  jobId?: string;
  score: number;
  completedAt: string;
  passed: boolean;
}

interface Test {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  jobId?: string;
  jobTitle?: string;
  results: TestResult[];
  totalAttempts: number;
  passRate: number;
}

const tests = ref<Test[]>([]);

const loadTests = async () => {
  try {
    loading.value = true;

    // Fetch tests
    const testsQuery = query(
        collection(db, 'tests'),
        where('companyId', '==', authStore.user?.uid)
    );

    const testsSnapshot = await getDocs(testsQuery);

    if (testsSnapshot.empty) {
      console.log('No tests found');
      return;
    }

    const testsData = testsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Fetch test results
    const chunkArray = (array, size) => {
      const result = [];
      for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
      }
      return result;
    };

    const testIdChunks = chunkArray(testsData.map(t => t.id), 10);
    const resultsData = [];

    for (const chunk of testIdChunks) {
      const chunkQuery = query(
          collection(db, 'testAttempts'),
          where('testId', 'in', chunk)
      );
      const chunkSnapshot = await getDocs(chunkQuery);
      resultsData.push(...chunkSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    }
    // Combine tests with their results
    tests.value = testsData.map(test => {
      const testResults = resultsData.filter(r => r.testId === test.id);
      return {
        ...test,
        results: testResults,
        totalAttempts: testResults.length,
        passRate: testResults.length > 0
            ? Math.round((testResults.filter(r => r.passed).length / testResults.length) * 100)
            : 0
      };
    });

  } catch (err) {
    console.error(err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Функция для удаления теста
const deleteTest = async (testId: string, jobId: string) => {
  if (!confirm("Are you sure you want to delete this test?")) {
    return;
  }

  try {
    // Удаление документа из Firestore
    // await deleteDoc(doc(db, 'tests', testId));
    await testStore.deleteTestFromCompany(testId, jobId);

    // Обновление локального списка тестов
    tests.value = tests.value.filter(test => test.id !== testId);

    toast.success("Test deleted successfully!");
  } catch (err: any) {
    console.error('Error deleting test:', err);
    toast.error(`Failed to delete test: ${err.message}`);
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'beginner': return 'bg-green-500/10 text-green-400';
    case 'intermediate': return 'bg-yellow-500/10 text-yellow-400';
    case 'advanced': return 'bg-red-500/10 text-red-400';
    default: return 'bg-gray-500/10 text-gray-400';
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

onMounted(loadTests);
</script>

<template>
  <div class="max-w-4xl">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">{{ $t('companyTests.title') }}</h2>
      <div class="flex justify-end">
        <router-link
            to="/company/create-test-manual"
            class="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 mx-2"
        >
          {{ $t('companyTests.createNewTest') }}
        </router-link>
        <router-link
            to="/company/add-test"
            class="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        >
          {{ $t('companyTests.addTest') }}
        </router-link>
      </div>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
      <p>{{ $t('companyTests.loading') }}</p>
    </div>

    <div v-else-if="error" class="bg-red-500/10 text-red-400 p-4 rounded-lg">
      {{ error }}
    </div>

    <div v-else-if="tests.length === 0" class="bg-gray-800 rounded-lg p-6 text-center">
      <p class="text-gray-300 mb-4">{{ $t('companyTests.noTestsCreated') }}</p>
      <router-link
          to="/company/create-test-manual"
          class="inline-block bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
      >
        {{ $t('companyTests.createYourFirstTest') }}
      </router-link>
    </div>

    <div v-else class="space-y-6">
      <div
          v-for="test in tests"
          :key="test.id"
          class="bg-gray-800 rounded-lg p-6"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-semibold mb-2">{{ test.title }}</h3>
            <div class="flex items-center gap-2">
              <span :class="[getDifficultyColor(test.difficulty), 'px-2 py-1 rounded-full text-sm']">
                {{ test.difficulty }}
              </span>
              <span class="text-gray-400">{{ test.category }}</span>
            </div>
            <p v-if="test.jobTitle" class="text-gray-400 mt-1">
              Linked to job: {{ test.jobTitle }}
            </p>
          </div>
        </div>

        <!-- Test Results -->
        <div v-if="test.results.length > 0" class="mt-4">
          <h4 class="font-medium mb-2">{{ $t('companyTests.recentResults') }}</h4>
          <div class="space-y-2">
            <div
                v-for="result in test.results"
                :key="result.id"
                class="bg-gray-700 p-3 rounded-lg flex justify-between items-center"
            >
              <div>
                <p class="font-medium">{{ result.userName }}</p>
                <p class="text-sm text-gray-400">{{ formatDate(result.completedAt) }}</p>
              </div>
              <div class="text-right">
                <p :class="result.passed ? 'text-green-400' : 'text-red-400'">
                  {{ result.score }}%
                </p>
                <p class="text-sm text-gray-400">
                  {{ result.passed ? 'Passed' : 'Failed' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Delete Test -->
        <div class="mt-4 flex justify-between items-center text-sm text-gray-400">
          <p>{{ $t('companyTests.totalAttempts') }}: {{ test.totalAttempts }}</p>
          <div class="flex items-center gap-4">
            <button
                @click="deleteTest(test.id, test.jobId)"
                class="text-red-400 hover:text-red-300"
            >
              {{ $t('companyTests.deleteTest') }}
            </button>
            <router-link
                :to="`/company/tests/${test.id}/edit`"
                class="text-primary-400 hover:text-primary-300"
            >
              {{ $t('companyTests.editTest') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

