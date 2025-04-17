<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTestStore } from '../stores/tests';
import { useAuthStore } from '../stores/auth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import Swal  from "sweetalert2";

// Replace the existing categories constant with a ref
const categories = ref<string[]>([]);

// Add this function to load categories from Firestore
const loadCategories = async () => {
  try {
    const testsSnapshot = await getDocs(collection(db, 'tests'));
    const uniqueCategories = new Set<string>();

    testsSnapshot.forEach(doc => {
      const testData = doc.data();
      if (testData.category) {
        uniqueCategories.add(testData.category);
      }
    });

    categories.value = Array.from(uniqueCategories).sort();
  } catch (err) {
    console.error('Error loading categories:', err);
  }
};

const router = useRouter();
const testStore = useTestStore();
const authStore = useAuthStore();
const error = ref('');
const loading = ref(true);

// Filters
const selectedDifficulty = ref('');
const searchQuery = ref('');
const selectedDuration = ref('');
const selectedCategory = ref('');
const sortBy = ref('recent');
const selectedLanguage = ref('');
const languages = ['EN', 'UA', 'RU'];
// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(6);

const durationRanges = [
  { value: '', label: 'All Durations' },
  { value: '0-15', label: 'Under 15 minutes' },
  { value: '15-30', label: '15-30 minutes' },
  { value: '30-60', label: '30-60 minutes' },
  { value: '60+', label: 'Over 60 minutes' }
];

const sortOptions = [
  { value: 'recent', label: 'tests.sortOptions.recent' },
  { value: 'popular', label: 'tests.sortOptions.popular' },
  { value: 'duration', label: 'tests.sortOptions.duration' },
  { value: 'difficulty', label: 'tests.sortOptions.difficulty' }
];

const filteredTests = computed(() => {
  return testStore.tests.filter(test => {
    // Search filter
    const matchesSearch = !searchQuery.value ||
        test.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        test.description.toLowerCase().includes(searchQuery.value.toLowerCase());

    // Difficulty filter
    const matchesDifficulty = !selectedDifficulty.value ||
        test.difficulty === selectedDifficulty.value;

    // Duration filter
    const matchesDuration = !selectedDuration.value || (() => {
      const duration = test.duration;
      switch (selectedDuration.value) {
        case '0-15': return duration <= 15;
        case '15-30': return duration > 15 && duration <= 30;
        case '30-60': return duration > 30 && duration <= 60;
        case '60+': return duration > 60;
        default: return true;
      }
    })();

    // Category filter
    const matchesCategory = !selectedCategory.value ||
        test.category === selectedCategory.value;

    // Language filter
    const matchesLanguage = !selectedLanguage.value ||
        test.language === selectedLanguage.value;

    return matchesSearch && matchesDifficulty && matchesDuration && matchesCategory && matchesLanguage;
  }).sort((a, b) => {
    switch (sortBy.value) {
      case 'popular':
        return (b.attempts || 0) - (a.attempts || 0);
      case 'duration':
        return a.duration - b.duration;
      case 'difficulty':
        const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      default: // recent
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
});

// Paginated tests
const paginatedTests = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredTests.value.slice(start, end);
});

const totalPages = computed(() =>
    Math.ceil(filteredTests.value.length / itemsPerPage.value)
);

const pageNumbers = computed(() => {
  const pages = [];
  const maxVisiblePages = 5;

  if (totalPages.value <= maxVisiblePages) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage.value <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages.value);
    } else if (currentPage.value >= totalPages.value - 2) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages.value - 3; i <= totalPages.value; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = currentPage.value - 1; i <= currentPage.value + 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages.value);
    }
  }

  return pages;
});

const clearFilters = () => {
  selectedDifficulty.value = '';
  searchQuery.value = '';
  selectedDuration.value = '';
  selectedCategory.value = '';
  sortBy.value = 'recent';
  currentPage.value = 1;
  selectedLanguage.value = '';
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'beginner': return 'bg-green-500/10 text-green-400';
    case 'intermediate': return 'bg-yellow-500/10 text-yellow-400';
    case 'advanced': return 'bg-red-500/10 text-red-400';
    default: return 'bg-gray-500/10 text-gray-400';
  }
};

const getBestScore = (testId: string) => {
  const attempts = getTestHistory(testId);
  if (attempts.length === 0) return null;

  return Math.max(...attempts.map(attempt =>
      Math.round((attempt.score / attempt.totalQuestions) * 100)
  ));
};

const getLastAttemptDate = (testId: string) => {
  const attempts = getTestHistory(testId);
  if (attempts.length === 0) return null;

  return new Date(Math.max(...attempts.map(attempt =>
      new Date(attempt.completedAt).getTime()
  )));
};

const getTestHistory = (testId: string) => {
  return testStore.testHistory.filter(attempt => attempt.testId === testId);
};

async function startTest(testId: string) {
  if (!authStore.user) {
    await Swal.fire({
      title: 'Login Required',
      text: 'If you want your test results to be saved, you need to register.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Continue as Guest',
      cancelButtonText: 'Login'
    }).then((result) => {
      if (!result.isConfirmed) {
        router.push('/login');
      }
    });
  }

  try {
    const canStart = await testStore.startTest(testId);
    if (canStart) {
      await router.push(`/test/${testId}`);
    } else {
      const daysLeft = testStore.getDaysUntilAvailable(testId) || 0;
      error.value = `You can take this test again in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}.`;
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to start test. Please try again.';
    console.error('Error starting test:', err);
  }
}

const showMobileFilters = ref(false);

const filters = ref({
  language: selectedLanguage,
  difficulty: selectedDifficulty,
  duration: selectedDuration,
  category: selectedCategory
});

onMounted(async () => {
  try {
    await Promise.all([
      testStore.fetchTests(),
      testStore.loadTestHistory(),
      loadCategories() // Add this line
    ]);
  } catch (err: any) {
    error.value = 'Failed to load tests. Please try again later.';
    console.error('Error loading tests:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    <h1 class="text-3xl font-bold mb-6">{{ $t('tests.skillTests') }}</h1>

    <!-- Search and Sort - Stack on mobile -->
    <div class="flex flex-col gap-4 mb-6">
      <!-- Mobile Filters Button -->
      <div class="lg:hidden">
        <button 
          @click="showMobileFilters = !showMobileFilters" 
          class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 rounded-lg text-sm"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {{ $t('tests.filters') }}
        </button>
      </div>

      <input
        v-model="searchQuery"
        type="text"
        :placeholder="$t('tests.searchPlaceholder')"
        class="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-primary-500 focus:border-primary-500"
      />
      
      <select
        v-model="sortBy"
        class="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-primary-500 focus:border-primary-500"
      >
        <option v-for="option in sortOptions" :key="option.value" :value="option.value">
          {{ $t(option.label) }}
        </option>
      </select>
    </div>

    <div class="flex gap-6">
      <!-- Filters Sidebar - Fixed -->
      <div class="hidden lg:block w-[280px] flex-shrink-0">
        <div class="sticky top-4 space-y-6">
          <div class="bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-semibold">{{ $t('tests.filters') }}</h2>
              <button
                  @click="clearFilters"
                  class="text-sm text-primary-400 hover:text-primary-300"
              >
                {{ $t('tests.clearFilters') }}
              </button>
            </div>

            <!-- Difficulty Filter -->
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">{{ $t('tests.difficulty') }}</label>
              <select
                  v-model="selectedDifficulty"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">{{ $t('tests.allDifficulties') }}</option>
                <option value="beginner">{{ $t('tests.beginner') }}</option>
                <option value="intermediate">{{ $t('tests.intermediate') }}</option>
                <option value="advanced">{{ $t('tests.advanced') }}</option>
              </select>
            </div>

            <!-- Duration Filter -->
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">{{ $t('tests.duration') }}</label>
              <select
                  v-model="selectedDuration"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option v-for="range in durationRanges" :key="range.value" :value="range.value">
                  {{ range.label }}
                </option>
              </select>
            </div>

            <!-- Category Filter -->
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">{{ $t('tests.category') }}</label>
              <select
                  v-model="selectedCategory"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">{{ $t('tests.allCategories') }}</option>
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>

            <!-- Language Filter -->
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">{{ $t('tests.language') }}</label>
              <select
                  v-model="selectedLanguage"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">{{ $t('tests.allLanguages') }}</option>
                <option v-for="lang in languages" :key="lang" :value="lang">
                  {{ lang }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Tests List - Scrollable -->
      <div class="flex-1 min-w-0">
        <div class="space-y-6">
          <!-- Results Count -->
          <div class="bg-gray-800 rounded-lg p-4">
            <p class="text-gray-300">
              {{ filteredTests.length }} {{ $t('tests.results') }}
            </p>
          </div>

          <!-- Loading and Error States -->
          <div v-if="loading" class="text-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p>{{ $t('tests.loading') }}</p>
          </div>

          <div v-else-if="error" class="bg-red-500/10 text-red-400 p-4 rounded-lg">
            {{ error }}
          </div>

          <div v-else-if="filteredTests.length === 0" class="bg-gray-800 rounded-lg p-6 text-center">
            <p class="text-gray-300 mb-4">{{ $t('tests.noTestsFound') }}</p>
            <button
                @click="clearFilters"
                class="text-primary-400 hover:text-primary-300"
            >
              {{ $t('tests.clearFilters') }}
            </button>
          </div>

          <!-- Tests Grid -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <div
                v-for="test in paginatedTests"
                :key="test.id"
                class="bg-gray-800 rounded-lg p-6 cursor-pointer transition-colors hover:bg-gray-700"
                @click="startTest(test.id)"
            >
              <div class="flex justify-between items-start">
                <div class="mr-4">
                  <h3 class="text-xl font-semibold mb-2">{{ test.title }}</h3>
                  <p class="text-gray-300 mb-4">{{ test.description }}</p>
                  <div class="flex flex-wrap gap-2">
                    <span :class="getDifficultyColor(test.difficulty)" class="px-3 py-1 rounded-full text-sm">
                      {{ test.difficulty }}
                    </span>
                    <span class="bg-gray-700 px-3 py-1 rounded-full text-sm text-gray-300">
                      {{ test.duration }} min
                    </span>
                    <span v-if="test.category" class="bg-gray-700 px-3 py-1 rounded-full text-sm text-gray-300">
                      {{ test.category }}
                    </span>
                    <span class="bg-gray-700 px-3 py-1 rounded-full text-sm text-gray-300">
                      {{ test.language }}
                    </span>
                  </div>
                </div>
                <div class="flex flex-col items-end gap-2">
                  <span class="text-sm text-gray-400">
                    {{ test.attempts || 0 }} {{ $t('tests.attempts') }}
                  </span>
                  <span v-if="getBestScore(test.id)" class="text-sm text-green-400">
                    Best: {{ getBestScore(test.id) }}%
                  </span>
                  <span v-if="getLastAttemptDate(test.id)" class="text-sm text-gray-400">
                    Last: {{ getLastAttemptDate(test.id)?.toLocaleDateString() }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-8">
            <button
                v-for="page in pageNumbers"
                :key="page"
                @click="currentPage = page"
                class="px-4 py-2 rounded-lg"
                :class="{
                  'bg-primary-600 text-white': currentPage === page,
                  'bg-gray-700 text-gray-300 hover:bg-gray-600': currentPage !== page && page !== '...',
                  'bg-transparent text-gray-400 cursor-default': page === '...'
                }"
                :disabled="page === '...'"
            >
              {{ page }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add mobile filters modal -->
    <div v-if="showMobileFilters" class="fixed inset-0 z-50 lg:hidden">
      <div class="absolute inset-0 bg-black bg-opacity-50" @click="showMobileFilters = false"></div>
      <div class="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-gray-900 shadow-xl overflow-y-auto">
        <div class="p-4">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">{{ $t('tests.filters') }}</h2>
            <button @click="showMobileFilters = false" class="text-gray-400 hover:text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <!-- Add filter content -->
          <div class="space-y-4">
            <!-- Language filter -->
            <div>
              <label class="block text-sm font-medium mb-2">{{ $t('tests.language') }}</label>
              <select v-model="selectedLanguage" class="w-full px-3 py-2 bg-gray-700 rounded-md">
                <option value="">{{ $t('tests.allLanguages') }}</option>
                <option v-for="lang in languages" :key="lang" :value="lang">{{ lang }}</option>
              </select>
            </div>
            <!-- Difficulty filter -->
            <div>
              <label class="block text-sm font-medium mb-2">{{ $t('tests.difficulty') }}</label>
              <select v-model="selectedDifficulty" class="w-full px-3 py-2 bg-gray-700 rounded-md">
                <option value="">{{ $t('tests.allDifficulties') }}</option>
                <option value="beginner">{{ $t('tests.beginner') }}</option>
                <option value="intermediate">{{ $t('tests.intermediate') }}</option>
                <option value="advanced">{{ $t('tests.advanced') }}</option>
              </select>
            </div>
            <!-- Duration filter -->
            <div>
              <label class="block text-sm font-medium mb-2">{{ $t('tests.duration') }}</label>
              <select v-model="selectedDuration" class="w-full px-3 py-2 bg-gray-700 rounded-md">
                <option value="">{{ $t('tests.allDurations') }}</option>
                <option v-for="range in durationRanges" :key="range.value" :value="range.value">
                  {{ range.label }}
                </option>
              </select>
            </div>
            <!-- Category filter -->
            <div>
              <label class="block text-sm font-medium mb-2">{{ $t('tests.category') }}</label>
              <select v-model="selectedCategory" class="w-full px-3 py-2 bg-gray-700 rounded-md">
                <option value="">{{ $t('tests.allCategories') }}</option>
                <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
              </select>
            </div>
            <!-- Clear filters button -->
            <div class="pt-4">
              <button @click="clearFilters" class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                {{ $t('tests.clearFilters') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>