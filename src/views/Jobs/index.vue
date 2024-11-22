<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
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

const paginatedJobs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredJobs.value.slice(start, end);
});

const totalPages = computed(() =>
    Math.ceil(filteredJobs.value.length / itemsPerPage.value)
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

onMounted(async () => {
  try {
    await Promise.all([
      jobsStore.fetchAllJobs(),
      applicationsStore.fetchApplications()
    ]);
  } catch (err: any) {
    error.value = err.message;
    console.error('Error loading jobs:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <div class="flex flex-wrap justify-between items-center mb-8">
      <h1 class="text-3xl font-bold my-4">Jobs</h1>
      <div class="flex gap-4">
        <input
            v-model="filters.search"
            type="text"
            placeholder="Search jobs..."
            class="px-4 py-2 bg-gray-700 rounded-lg focus:ring-primary-500 focus:border-primary-500"
        />
        <select
            v-model="filters.sortBy"
            class="px-4 py-2 bg-gray-700 rounded-lg focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="recent">Most Recent</option>
          <option value="salary">Highest Salary</option>
          <option value="relevance">Most Relevant</option>
        </select>
      </div>
    </div>

    <div class="grid lg:grid-cols-[280px,1fr] gap-6">
      <!-- Filters Sidebar -->
      <div class="space-y-6">
        <div class="bg-gray-800 rounded-lg p-4">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">Filters</h2>
            <button
                @click="clearFilters"
                class="text-sm text-primary-400 hover:text-primary-300"
            >
              Clear all
            </button>
          </div>

          <!-- Location -->
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Location</label>
            <input
                v-model="filters.location"
                type="text"
                placeholder="City or Remote"
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
            <label class="ml-2">Remote Only</label>
          </div>

          <!-- Job Type -->
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Job Type</label>
            <select
                v-model="filters.type"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Types</option>
              <option v-for="type in jobTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>

          <!-- Experience -->
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Experience</label>
            <select
                v-model="filters.experience"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Levels</option>
              <option v-for="level in experienceLevels" :key="level" :value="level">
                {{ level }}
              </option>
            </select>
          </div>

          <!-- Salary Range -->
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Salary Range</label>
            <select
                v-model="filters.salary"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Ranges</option>
              <option v-for="range in salaryRanges" :key="range" :value="range">
                {{ range }}
              </option>
            </select>
          </div>

          <!-- Skills -->
          <div>
            <label class="block text-sm font-medium mb-2">Skills</label>
            <div class="space-y-2">
              <div class="flex gap-2">
                <input
                    v-model="newSkill"
                    type="text"
                    placeholder="Add a skill"
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
                <p class="text-sm text-gray-400 mb-1">Popular skills:</p>
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

      <!-- Jobs List -->
      <div class="space-y-6">
        <!-- Sort and Results Count -->
        <div class="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
          <p class="text-gray-300">
            {{ filteredJobs.length }} jobs found
          </p>
        </div>

        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p>Loading jobs...</p>
        </div>

        <div v-else-if="error" class="bg-red-500/10 text-red-400 p-4 rounded-lg">
          {{ error }}
        </div>

        <div v-else-if="filteredJobs.length === 0" class="bg-gray-800 rounded-lg p-6 text-center">
          <p class="text-gray-300 mb-4">No jobs found matching your criteria.</p>
          <button
              @click="clearFilters"
              class="text-primary-400 hover:text-primary-300"
          >
            Clear all filters
          </button>
        </div>

        <div v-else class="space-y-4">
          <div
              v-for="job in paginatedJobs"
              :key="job.id"
              class="bg-gray-800 rounded-lg p-6 cursor-pointer transition-colors"
              @click="goToJobDetails(job)"
          >
            <div class="flex flex-col justify-between items-start my-6">
              <div>
                <h2 class="text-2xl font-semibold mb-2">
                  {{ job.title }}
                  <span
                      v-if="job.status === 'closed'"
                      class="text-sm ml-1 text-red-400 px-3 py-1 rounded-full bg-red-500/10"
                  >{{job.status}}</span>
                  <span
                      v-else
                      class="text-sm ml-1 text-green-400 px-3 py-1 rounded-full bg-green-500/10"
                  >{{job.status}}</span>
                </h2>
                <div class="flex items-center gap-2">
                  <button
                      @click.stop="showCompanyInfo = job.companyInfo"
                      class="text-xl text-gray-300 hover:text-white"
                  >
                    {{ job.company }}
                    <span class="text-sm ml-1 text-blue-400">View details</span>
                  </button>
                </div>
                <!-- Company preview -->
                <div v-if="job.companyInfo" class="my-2 text-sm text-gray-400">
                  <p>industry: {{ job.companyInfo.industry }} • size: {{ job.companyInfo.size }}</p>
                  <p class="line-clamp-2 my-4">{{ job.companyInfo.description }}</p>
                </div>
              </div>
              <div class="flex flex-col items-start gap-2 my-4">
                <p class="text-lg font-semibold text-primary-400">
                  {{ formatSalary(job.salary) }}
                </p>
                <p class="text-sm text-gray-400">
                  Posted {{ new Date(job.postedAt).toLocaleDateString() }}
                </p>
              </div>
            </div>

            <div class="flex flex-wrap gap-4 text-gray-400 mb-4">
              <span class="flex items-center">
                <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ job.location }}
                <span v-if="job.remote" class="ml-1">(Remote)</span>
              </span>
              <span class="flex items-center">
                <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {{ job.type }}
              </span>
            </div>

            <div class="flex flex-wrap gap-2">
              <span
                  v-for="skill in job.skills"
                  :key="skill"
                  class="bg-gray-700 text-sm px-3 py-1 rounded-full"
                  :class="{ 'bg-primary-600/20 text-primary-400': filters.skills.includes(skill) }"
              >
                {{ skill }}
              </span>
            </div>

            <!-- Required Tests Section -->
            <div v-if="job.tests?.length" class="mt-4 border-t border-gray-700 pt-4">
              <h3 class="text-sm font-medium mb-2">Tests:</h3>
              <div class="flex flex-col flex-wrap gap-2">
                <span
                    v-for="test in job.tests"
                    :key="test.id"
                    class="bg-cyan-950 text-sm px-3 py-1 rounded-full"
                    :class="{ 'text-red-400': test.isRequired }"
                >
                  {{ test.title }}
                  <span v-if="test.isRequired" class="ml-1">* Required</span>
                </span>
              </div>
            </div>

            <div class="flex justify-between items-center mt-4">
              <span class="text-gray-400">
                {{ applicationsStore.getApplicationCount(job.id) }} applicant{{ applicationsStore.getApplicationCount(job.id) !== 1 ? 's' : '' }}
              </span>
              <span
                  v-if="applicationsStore.hasApplied(job.id)"
                  class="bg-green-500/10 text-green-400 px-2 py-1 rounded-full text-sm"
              >
                Applied
              </span>
            </div>
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

    <!-- Company Info Modal -->
    <CompanyInfoModal
        v-if="showCompanyInfo"
        :company="showCompanyInfo"
        @close="showCompanyInfo = null"
    />
  </div>
</template>