<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTestStore } from '../stores/tests';
import { useAuthStore } from '../stores/auth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

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
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'duration', label: 'Duration' },
  { value: 'difficulty', label: 'Difficulty Level' }
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

    return matchesSearch && matchesDifficulty && matchesDuration && matchesCategory;
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
    router.push('/login');
    return;
  }

  try {
    const canStart = await testStore.startTest(testId);
    if (canStart) {
      router.push(`/test/${testId}`);
    } else {
      const daysLeft = testStore.getDaysUntilAvailable(testId);
      error.value = `You can take this test again in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}.`;
    }
  } catch (err: any) {
    error.value = 'Failed to start test. Please try again.';
    console.error('Error starting test:', err);
  }
}

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
  <div class="max-w-6xl mx-auto">
    <div class="flex flex-wrap justify-between items-center mb-8">
      <h1 class="text-3xl font-bold mb-4">Skill Tests</h1>
      <div class="flex gap-2">
        <input
            v-model="searchQuery"
            type="text"
            placeholder="Search tests..."
            class="px-2 py-2 bg-gray-700 rounded-lg focus:ring-primary-500 focus:border-primary-500"
        />
        <select
            v-model="sortBy"
            class="py-2 bg-gray-700 rounded-lg focus:ring-primary-500 focus:border-primary-500"
        >
          <option
              v-for="option in sortOptions"
              :key="option.value"
              :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <div class="grid lg:grid-cols-[280px,1fr] gap-6">
      <!-- Filters Sidebar -->
      <div class="space-y-6">
        <div class="bg-gray-800 rounded-lg p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">Filters</h2>
            <button
                @click="clearFilters"
                class="text-sm text-primary-400 hover:text-primary-300"
            >
              Clear all
            </button>
          </div>

          <!-- Difficulty -->
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Difficulty</label>
            <select
                v-model="selectedDifficulty"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <!-- Duration -->
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Duration</label>
            <select
                v-model="selectedDuration"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option
                  v-for="range in durationRanges"
                  :key="range.value"
                  :value="range.value"
              >
                {{ range.label }}
              </option>
            </select>
          </div>

          <!-- Category -->
          <select
              v-model="selectedCategory"
              class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>

          <!-- Filter Stats -->
          <div class="mt-6 pt-6 border-t border-gray-700">
            <p class="text-sm text-gray-400">
              Showing {{ paginatedTests.length }} of {{ filteredTests.length }} tests
            </p>
          </div>
        </div>
      </div>

      <!-- Tests Grid -->
      <div class="space-y-6">
        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p>Loading tests...</p>
        </div>

        <div v-else-if="error" class="bg-red-500/10 text-red-400 p-4 rounded-lg">
          {{ error }}
        </div>

        <div v-else-if="filteredTests.length === 0" class="bg-gray-800 rounded-lg p-6 text-center">
          <p class="text-gray-300 mb-4">No tests found matching your criteria.</p>
          <button
              @click="clearFilters"
              class="text-primary-400 hover:text-primary-300"
          >
            Clear all filters
          </button>
        </div>

        <div v-else>
          <!-- Tests Grid -->
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            <div
                v-for="test in paginatedTests"
                :key="test.id"
                class="flex flex-col justify-between bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors"
            >
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h2 class="text-xl font-semibold mb-2">{{ test.title }}</h2>
                  <p class="text-gray-300 mb-2">{{ test.description }}</p>
                </div>
                <span
                    :class="[getDifficultyColor(test.difficulty), 'px-3 py-1 rounded-full text-sm']"
                >
                  {{ test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1) }}
                </span>
              </div>

              <div class="text-gray-300 space-y-2 mb-4">
                <p class="flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ test.duration }} minutes
                </p>
                <p class="flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ test.questions?.length || 0 }} questions
                </p>
                <p v-if="test.attempts" class="flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {{ test.attempts }} attempts
                </p>
              </div>

              <div v-if="getTestHistory(test.id).length > 0" class="mb-4">
                <div class="border-t border-gray-700 pt-4">
                  <h3 class="font-medium mb-2">Your History</h3>
                  <div class="space-y-1">
                    <p>
                      Best Score:
                      <span :class="[
                        getBestScore(test.id)! >= 90 ? 'text-green-400' :
                        getBestScore(test.id)! >= 70 ? 'text-yellow-400' :
                        'text-red-400'
                      ]">
                        {{ getBestScore(test.id) }}%
                      </span>
                    </p>
                    <p class="text-sm text-gray-400">
                      Last attempt: {{ getLastAttemptDate(test.id)?.toLocaleDateString() }}
                    </p>
                  </div>
                </div>
              </div>

              <button
                  @click="startTest(test.id)"
                  :disabled="!testStore.canTakeTest(test.id)"
                  class="w-full mt-4 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="!authStore.user">Login to Start</span>
                <span v-else-if="!testStore.canTakeTest(test.id)">
                  Available in {{ testStore.getDaysUntilAvailable(test.id) }} days
                </span>
                <span v-else>Start Test</span>
              </button>
            </div>
          </div>

          <!-- Pagination -->
          <div class="mt-8 flex justify-center">
            <nav class="flex items-center space-x-2">
              <button
                  @click="currentPage--"
                  :disabled="currentPage === 1"
                  class="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
              >
                Previous
              </button>

              <div v-for="page in pageNumbers" :key="page" class="flex items-center">
                <button
                    v-if="typeof page === 'number'"
                    @click="currentPage = page"
                    :class="[
                    'px-3 py-1 rounded-md',
                    currentPage === page
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600'
                  ]"
                >
                  {{ page }}
                </button>
                <span v-else class="px-2">{{ page }}</span>
              </div>

              <button
                  @click="currentPage++"
                  :disabled="currentPage === totalPages"
                  class="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>