<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useJobsStore } from '@/stores/jobs.ts';
import { useApplicationsStore } from '@/stores/applications.ts';
import CompanyInfoModal from '../../components/CompanyInfoModal.vue';
import Swal from 'sweetalert2';

const router = useRouter();
const jobsStore = useJobsStore();
const applicationsStore = useApplicationsStore();
const loading = ref(true);
const error = ref('');
const showCompanyInfo = ref(null);
const showMobileFilters = ref(false);

const filters = ref({
  search: '',
  location: '',
  type: '',
  experience: '',
  salary: '',
  skills: [] as string[],
  remote: false,
  sortBy: 'recent' // 'recent' | 'salary' | 'relevance'
});

const newSkill = ref('');

const jobTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Internship'
];

const experienceLevels = [
  'Entry Level',
  '1-3 years',
  '3-5 years',
  '5-7 years',
  '7+ years'
];

const salaryRanges = [
  'Under $50k',
  '$50k - $100k',
  '$100k - $150k',
  '$150k - $200k',
  '$200k+'
];

const popularSkills = [
  'JavaScript',
  'TypeScript',
  'React',
  'Vue.js',
  'Node.js',
  'Python',
  'Java',
  'AWS',
  'Docker',
  'SQL'
];

const filteredJobs = computed(() => {
  if (!jobsStore.jobs) return [];

  return jobsStore.jobs.filter(job => {
    // Search filter
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase();
      const matchesSearch =
          job.title.toLowerCase().includes(searchTerm) ||
          job.company.toLowerCase().includes(searchTerm) ||
          job.description.toLowerCase().includes(searchTerm);
      if (!matchesSearch) return false;
    }

    // Location filter
    if (filters.value.location && !job.location.toLowerCase().includes(filters.value.location.toLowerCase())) {
      return false;
    }

    // Job type filter
    if (filters.value.type && job.type !== filters.value.type) {
      return false;
    }

    // Experience filter
    if (filters.value.experience && job.experience !== filters.value.experience) {
      return false;
    }

    // Remote filter
    if (filters.value.remote && !job.remote) {
      return false;
    }

    // Salary filter
    if (filters.value.salary) {
      const [min, max] = getSalaryRange(filters.value.salary);
      if (job.salary.max < min || job.salary.min > max) {
        return false;
      }
    }

    // Skills filter
    if (filters.value.skills.length > 0 && Array.isArray(job.skills)) {
      const hasAllSkills = filters.value.skills.every(skill =>
          job.skills.some(jobSkill => jobSkill.toLowerCase() === skill.toLowerCase())
      );
      if (!hasAllSkills) return false;
    }

    return true;
  }).sort((a, b) => {
    switch (filters.value.sortBy) {
      case 'salary':
        return b.salary.max - a.salary.max;
      case 'relevance':
        return getRelevanceScore(b) - getRelevanceScore(a);
      default: // recent
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    }
  });
});

const itemsPerPage = ref(6);
const currentPage = ref(1);
const totalJobs = ref(0);
const loadingMore = ref(false);
const observer = ref<IntersectionObserver | null>(null);
const loadMoreTrigger = ref<HTMLElement | null>(null);

const paginatedJobs = computed(() => {
  return jobsStore.jobs;
});

const totalPages = computed(() =>
    Math.ceil(totalJobs.value / itemsPerPage.value)
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

const getSalaryRange = (range: string): [number, number] => {
  switch (range) {
    case 'Under $50k': return [0, 50000];
    case '$50k - $100k': return [50000, 100000];
    case '$100k - $150k': return [100000, 150000];
    case '$150k - $200k': return [150000, 200000];
    case '$200k+': return [200000, Infinity];
    default: return [0, Infinity];
  }
};

const getRelevanceScore = (job: any): number => {
  let score = 0;

  // Match skills
  if (filters.value.skills.length > 0 && Array.isArray(job.skills)) {
    const matchedSkills = filters.value.skills.filter(skill =>
        job.skills.some(jobSkill => jobSkill.toLowerCase() === skill.toLowerCase())
    );
    score += (matchedSkills.length / filters.value.skills.length) * 50;
  }

  // Recent jobs get higher score
  const daysAgo = (new Date().getTime() - new Date(job.postedAt).getTime()) / (1000 * 60 * 60 * 24);
  score += Math.max(0, 50 - daysAgo);

  return score;
};

const formatSalary = (salary: { min: number; max: number; currency: string; period: string }) => {
  if (!salary) return 'Competitive';
  return `${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} ${salary.currency}`;
};

const toggleSkill = (skill: string) => {
  const index = filters.value.skills.indexOf(skill);
  if (index === -1) {
    filters.value.skills.push(skill);
  } else {
    filters.value.skills.splice(index, 1);
  }
};

const clearFilters = () => {
  filters.value = {
    search: '',
    location: '',
    type: '',
    experience: '',
    salary: '',
    skills: [],
    remote: false,
    sortBy: 'recent'
  };
  currentPage.value = 1;
};

const goToJobDetails = (job: Object) => {
  if(job.status === 'closed') {
    Swal.fire({
      icon: 'info',
      title: 'Job closed'
    });
  } else {
    router.push(`/jobs/${job.id}`);
  }
};

// Setup intersection observer for infinite scroll
onMounted(async () => {
  try {
    await Promise.all([
      jobsStore.fetchAllJobs(),
      applicationsStore.fetchApplications()
    ]);
    totalJobs.value = jobsStore.jobs.length;

    // Setup intersection observer
    observer.value = new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting && !loadingMore.value && jobsStore.hasMore) {
        loadingMore.value = true;
        try {
          await jobsStore.fetchAllJobs(true);
        } finally {
          loadingMore.value = false;
        }
      }
    }, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    });

    if (loadMoreTrigger.value) {
      observer.value.observe(loadMoreTrigger.value);
    }
  } catch (err: any) {
    error.value = err.message;
    console.error('Error loading jobs:', err);
  } finally {
    loading.value = false;
  }
});

// Cleanup observer
onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect();
  }
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6">
    <!-- Mobile Filters Button -->
    <div class="lg:hidden flex justify-between items-center mb-4">
      <button
          @click="showMobileFilters = !showMobileFilters"
          class="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        {{ $t('jobList.filters.title') }}
      </button>
    </div>

    <div class="flex flex-wrap justify-between items-center mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold my-4">{{ $t('jobList.title') }}</h1>
      <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <input
            v-model="filters.search"
            type="text"
            :placeholder="$t('jobList.searchPlaceholder')"
            class="w-full sm:w-auto px-4 py-2 bg-gray-700 rounded-lg focus:ring-primary-500 focus:border-primary-500"
        />
        <select
            v-model="filters.sortBy"
            class="w-full sm:w-auto px-4 py-2 bg-gray-700 rounded-lg focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="recent">{{ $t('jobList.sortBy.recent') }}</option>
          <option value="salary">{{ $t('jobList.sortBy.salary') }}</option>
          <option value="relevance">{{ $t('jobList.sortBy.relevance') }}</option>
        </select>
      </div>
    </div>

    <div class="flex gap-6">
      <!-- Filters Sidebar - Fixed -->
      <div class="hidden lg:block w-[280px] flex-shrink-0">
        <div class="sticky top-4 space-y-6">
          <div class="bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-semibold">{{ $t('jobList.filters.title') }}</h2>
              <button
                  @click="clearFilters"
                  class="text-sm text-primary-400 hover:text-primary-300"
              >
                {{ $t('jobList.clearFilters') }}
              </button>
            </div>

            <!-- Location -->
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">{{ $t('jobList.filters.location') }}</label>
              <input
                  v-model="filters.location"
                  type="text"
                  :placeholder="$t('jobList.filters.location')"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <!-- Remote Only -->
            <div class="flex items-center mb-4">
              <input
                  v-model="filters.remote"
                  type="checkbox"
                  class="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
              />
              <label class="ml-2">{{ $t('jobList.filters.remote') }}</label>
            </div>

            <!-- Job Type -->
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">{{ $t('jobList.filters.jobType') }}</label>
              <select
                  v-model="filters.type"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">{{ $t('jobList.filters.jobType') }}</option>
                <option v-for="type in jobTypes" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>

            <!-- Experience -->
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">{{ $t('jobList.filters.experience') }}</label>
              <select
                  v-model="filters.experience"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">{{ $t('jobList.filters.experience') }}</option>
                <option v-for="level in experienceLevels" :key="level" :value="level">
                  {{ level }}
                </option>
              </select>
            </div>

            <!-- Salary Range -->
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">{{ $t('jobList.filters.salary') }}</label>
              <select
                  v-model="filters.salary"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">{{ $t('jobList.filters.salary') }}</option>
                <option v-for="range in salaryRanges" :key="range" :value="range">
                  {{ range }}
                </option>
              </select>
            </div>

            <!-- Skills -->
            <div>
              <label class="block text-sm font-medium mb-2">{{ $t('jobList.filters.skills') }}</label>
              <div class="space-y-2">
                <div class="flex gap-2">
                  <input
                      v-model="newSkill"
                      type="text"
                      :placeholder="$t('jobList.filters.skills')"
                      class="flex-1 px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      @keyup.enter="toggleSkill(newSkill)"
                  />
                  <button
                      @click="toggleSkill(newSkill)"
                      class="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600"
                  >
                    +
                  </button>
                </div>

                <div class="flex flex-wrap gap-2">
                  <span
                      v-for="skill in filters.skills"
                      :key="skill"
                      class="group bg-primary-600/10 text-primary-400 px-2 py-1 rounded-full text-sm"
                  >
                    {{ skill }}
                    <button
                        @click="toggleSkill(skill)"
                        class="ml-1 hover:text-primary-300"
                    >
                      ×
                    </button>
                  </span>
                </div>

                <div class="mt-2">
                  <p class="text-sm text-gray-400 mb-1">{{ $t('jobList.popularSkills') }}</p>
                  <div class="flex flex-wrap gap-1">
                    <button
                        v-for="skill in popularSkills"
                        :key="skill"
                        @click="toggleSkill(skill)"
                        class="text-xs px-2 py-1 bg-gray-700 rounded-full hover:bg-gray-600"
                        :class="{ 'opacity-50 cursor-not-allowed': filters.skills.includes(skill) }"
                        :disabled="filters.skills.includes(skill)"
                    >
                      {{ skill }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Filters Modal -->
      <div
          v-if="showMobileFilters"
          class="fixed inset-0 z-50 lg:hidden"
      >
        <div class="absolute inset-0 bg-black bg-opacity-50" @click="showMobileFilters = false"></div>
        <div class="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-gray-900 shadow-xl overflow-y-auto">
          <div class="p-4">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-semibold">{{ $t('jobList.filters.title') }}</h2>
              <button
                  @click="showMobileFilters = false"
                  class="text-gray-400 hover:text-white"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <!-- Mobile Filters Content -->
            <div class="space-y-6">
              <div class="bg-gray-800 rounded-lg p-4">
                <div class="flex justify-between items-center mb-4">
                  <h2 class="text-lg font-semibold">{{ $t('jobList.filters.title') }}</h2>
                  <button
                      @click="clearFilters"
                      class="text-sm text-primary-400 hover:text-primary-300"
                  >
                    {{ $t('jobList.clearFilters') }}
                  </button>
                </div>

                <!-- Location -->
                <div class="mb-4">
                  <label class="block text-sm font-medium mb-2">{{ $t('jobList.filters.location') }}</label>
                  <input
                      v-model="filters.location"
                      type="text"
                      :placeholder="$t('jobList.filters.location')"
                      class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <!-- Remote Only -->
                <div class="flex items-center mb-4">
                  <input
                      v-model="filters.remote"
                      type="checkbox"
                      class="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
                  />
                  <label class="ml-2">{{ $t('jobList.filters.remote') }}</label>
                </div>

                <!-- Job Type -->
                <div class="mb-4">
                  <label class="block text-sm font-medium mb-2">{{ $t('jobList.filters.jobType') }}</label>
                  <select
                      v-model="filters.type"
                      class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">{{ $t('jobList.filters.jobType') }}</option>
                    <option v-for="type in jobTypes" :key="type" :value="type">
                      {{ type }}
                    </option>
                  </select>
                </div>

                <!-- Experience -->
                <div class="mb-4">
                  <label class="block text-sm font-medium mb-2">{{ $t('jobList.filters.experience') }}</label>
                  <select
                      v-model="filters.experience"
                      class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">{{ $t('jobList.filters.experience') }}</option>
                    <option v-for="level in experienceLevels" :key="level" :value="level">
                      {{ level }}
                    </option>
                  </select>
                </div>

                <!-- Salary Range -->
                <div class="mb-4">
                  <label class="block text-sm font-medium mb-2">{{ $t('jobList.filters.salary') }}</label>
                  <select
                      v-model="filters.salary"
                      class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">{{ $t('jobList.filters.salary') }}</option>
                    <option v-for="range in salaryRanges" :key="range" :value="range">
                      {{ range }}
                    </option>
                  </select>
                </div>

                <!-- Skills -->
                <div>
                  <label class="block text-sm font-medium mb-2">{{ $t('jobList.filters.skills') }}</label>
                  <div class="space-y-2">
                    <div class="flex gap-2">
                      <input
                          v-model="newSkill"
                          type="text"
                          :placeholder="$t('jobList.filters.skills')"
                          class="flex-1 px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                          @keyup.enter="toggleSkill(newSkill)"
                      />
                      <button
                          @click="toggleSkill(newSkill)"
                          class="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600"
                      >
                        +
                      </button>
                    </div>

                    <div class="flex flex-wrap gap-2">
                      <span
                          v-for="skill in filters.skills"
                          :key="skill"
                          class="group bg-primary-600/10 text-primary-400 px-2 py-1 rounded-full text-sm"
                      >
                        {{ skill }}
                        <button
                            @click="toggleSkill(skill)"
                            class="ml-1 hover:text-primary-300"
                        >
                          ×
                        </button>
                      </span>
                    </div>

                    <div class="mt-2">
                      <p class="text-sm text-gray-400 mb-1">{{ $t('jobList.popularSkills') }}</p>
                      <div class="flex flex-wrap gap-1">
                        <button
                            v-for="skill in popularSkills"
                            :key="skill"
                            @click="toggleSkill(skill)"
                            class="text-xs px-2 py-1 bg-gray-700 rounded-full hover:bg-gray-600"
                            :class="{ 'opacity-50 cursor-not-allowed': filters.skills.includes(skill) }"
                            :disabled="filters.skills.includes(skill)"
                        >
                          {{ skill }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Jobs List - Scrollable -->
      <div class="flex-1 min-w-0">
        <div class="space-y-6">
          <!-- Sort and Results Count -->
          <div class="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
            <p class="text-gray-300">
              {{ filteredJobs.length }} {{ $t('jobList.results') }}
            </p>
          </div>

          <!-- Loading, Error, and No Jobs Found -->
          <div v-if="loading" class="text-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p>{{ $t('jobList.loading') }}</p>
          </div>

          <div v-else-if="error" class="bg-red-500/10 text-red-400 p-4 rounded-lg">
            {{ error }}
          </div>

          <div v-else-if="jobsStore.jobs.length === 0" class="bg-gray-800 rounded-lg p-6 text-center">
            <p class="text-gray-300 mb-4">{{ $t('jobList.noJobsFound') }}</p>
            <button
                @click="clearFilters"
                class="text-primary-400 hover:text-primary-300"
            >
              {{ $t('jobList.clearFilters') }}
            </button>
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <div
                v-for="job in filteredJobs"
                :key="job.id"
                class="bg-gray-800 rounded-lg p-4 sm:p-6 cursor-pointer transition-colors"
                @click="goToJobDetails(job)"
            >
              <div class="flex flex-col justify-between items-start">
                <div>
                  <h2 class="text-xl sm:text-2xl font-semibold mb-2">
                    {{ job.title }}
                    <span
                        v-if="job.status === 'closed'"
                        class="text-xs sm:text-sm ml-1 text-red-400 px-2 py-0.5 rounded-full bg-red-500/10"
                    >{{ job.status }}</span>
                    <span
                        v-else
                        class="text-xs sm:text-sm ml-1 text-green-400 px-2 py-0.5 rounded-full bg-green-500/10"
                    >{{ job.status }}</span>
                  </h2>
                  <div class="flex items-center gap-2">
                    <button
                        @click.stop="showCompanyInfo = job.companyInfo"
                        class="text-lg sm:text-xl text-gray-300 hover:text-white"
                    >
                      {{ job.company }}
                      <span class="text-xs sm:text-sm ml-1 text-blue-400">{{ $t('jobList.viewDetails') }}</span>
                    </button>
                  </div>
                </div>
                <div class="flex flex-col items-start gap-2 mt-4">
                  <p class="text-base sm:text-lg font-semibold text-primary-400">
                    {{ formatSalary(job.salary) }}
                  </p>
                  <p class="text-xs sm:text-sm text-gray-400">
                    Posted {{ new Date(job.postedAt).toLocaleDateString() }}
                  </p>
                </div>
              </div>

              <div class="flex flex-wrap gap-2 text-gray-400 mt-4">
                <span class="flex items-center text-xs sm:text-sm">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ job.location }}
                  <span v-if="job.remote" class="ml-1">{{ $t('jobList.remote') }}</span>
                </span>
                <span class="flex items-center text-xs sm:text-sm">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {{ job.type }}
                </span>
              </div>

              <div class="flex flex-wrap gap-2 mt-4">
                <span
                    v-for="skill in job.skills"
                    :key="skill"
                    class="bg-gray-700 text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full"
                    :class="{ 'bg-primary-600/20 text-primary-400': filters.skills.includes(skill) }"
                >
                  {{ skill }}
                </span>
              </div>

              <!-- Required Tests Section -->
              <div v-if="job.tests?.length" class="mt-4 border-t border-gray-700 pt-4">
                <h3 class="text-xs sm:text-sm font-medium mb-2">{{ $t('jobList.tests') }}:</h3>
                <div class="flex flex-col flex-wrap gap-2">
                  <span
                      v-for="test in job.tests"
                      :key="test.id"
                      class="bg-cyan-950 text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full"
                      :class="{ 'text-red-400': test.isRequired }"
                  >
                    {{ test.title }}
                    <span v-if="test.isRequired" class="ml-1">{{ $t('jobList.required') }}</span>
                  </span>
                </div>
              </div>

              <div class="flex justify-between items-center mt-4">
                <span class="text-xs sm:text-sm text-gray-400">
                  {{ applicationsStore.getApplicationCount(job.id) }} applicant{{ applicationsStore.getApplicationCount(job.id) !== 1 ? 's' : '' }}
                </span>
                <span
                    v-if="applicationsStore.hasApplied(job.id)"
                    class="bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full text-xs sm:text-sm"
                >
                  {{ $t('jobList.applied') }}
                </span>
              </div>
            </div>
          </div>

          <!-- Loading more indicator -->
          <div
              v-if="loadingMore"
              class="text-center py-4"
          >
            <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          </div>

          <!-- Load more trigger -->
          <div
              ref="loadMoreTrigger"
              class="h-10"
              v-if="jobsStore.hasMore"
          ></div>

          <!-- No more jobs indicator -->
          <div
              v-if="!jobsStore.hasMore && jobsStore.jobs.length > 0"
              class="text-center py-4 text-gray-400"
          >
            {{ $t('jobList.noMoreJobs', 'No more jobs available') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Company Info Modal -->
    <CompanyInfoModal
        v-if="showCompanyInfo"
        :company="showCompanyInfo"
        @close="showCompanyInfo = null"
    />
  </div>
</template>
