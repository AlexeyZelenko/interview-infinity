<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useJobsStore } from '../stores/jobs';
import { useApplicationsStore } from '../stores/applications';

const applicationsStore = useApplicationsStore();
const router = useRouter();
const jobsStore = useJobsStore();
const loading = ref(true);
const error = ref('');

// Filter states
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

// Job types for filter
const jobTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Internship'
];

// Experience levels for filter
const experienceLevels = [
  'Entry Level',
  '1-3 years',
  '3-5 years',
  '5-7 years',
  '7+ years'
];

// Salary ranges for filter
const salaryRanges = [
  'Under $50k',
  '$50k - $100k',
  '$100k - $150k',
  '$150k - $200k',
  '$200k+'
];

// Popular skills for quick selection
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

// Demo jobs for display
const demoJobs = [
  {
    id: 'demo-1',
    title: 'Senior Frontend Developer',
    company: 'Tech Corp',
    location: 'Remote',
    type: 'Full-time',
    experience: '5-7 years',
    description: 'We are looking for an experienced Frontend Developer to join our team.',
    skills: ['Vue.js', 'TypeScript', 'Tailwind CSS'],
    salary: {
      min: 120000,
      max: 150000,
      currency: 'USD',
      period: 'year'
    },
    postedAt: '2024-02-01',
    remote: true
  },
  {
    id: 'demo-2',
    title: 'Backend Developer',
    company: 'StartupX',
    location: 'New York',
    type: 'Full-time',
    experience: '3-5 years',
    description: 'Join our backend team and help build scalable solutions.',
    skills: ['Node.js', 'PostgreSQL', 'Docker'],
    salary: {
      min: 100000,
      max: 130000,
      currency: 'USD',
      period: 'year'
    },
    postedAt: '2024-02-02',
    remote: false
  }
];

// Combine real and demo jobs
const allJobs = computed(() => {
  const realJobs = jobsStore.activeJobs.map(job => ({
    ...job,
    isReal: true
  }));

  const demoJobsWithFlag = demoJobs.map(job => ({
    ...job,
    isReal: false
  }));

  return [...realJobs, ...demoJobsWithFlag];
});

// Filtered jobs based on all criteria
const filteredJobs = computed(() => {
  return allJobs.value.filter(job => {
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
    if (filters.value.skills.length > 0) {
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

// Helper function to get salary range from filter value
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

// Helper function to calculate relevance score
const getRelevanceScore = (job: any): number => {
  let score = 0;

  // Match skills
  if (filters.value.skills.length > 0) {
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

onMounted(async () => {
  try {
    await jobsStore.fetchAllJobs();
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});

onMounted(async () => {
  try {
    await Promise.all([
      jobsStore.fetchAllJobs(),
      applicationsStore.fetchApplications()
    ]);
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});

const viewJobDetails = (jobId: string) => {
  router.push(`/jobs/${jobId}`);
};

const addSkill = (skill: string) => {
  if (!filters.value.skills.includes(skill)) {
    filters.value.skills.push(skill);
  }
  newSkill.value = '';
};

const removeSkill = (skill: string) => {
  filters.value.skills = filters.value.skills.filter(s => s !== skill);
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
};

const formatSalary = (salary: { min: number; max: number; currency: string; period: string }) => {
  if (!salary) return 'Competitive';
  return `${salary.currency}${salary.min.toLocaleString()} - ${salary.currency}${salary.max.toLocaleString()} per ${salary.period}`;
};
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Jobs</h1>
      <router-link
          to="/company/jobs/create"
          class="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
      >
        Post a Job
      </router-link>
    </div>

    <div class="grid lg:grid-cols-[300px,1fr] gap-6">
      <!-- Filters Sidebar -->
      <div class="space-y-6">
        <!-- Search -->
        <div class="bg-gray-800 rounded-lg p-4">
          <input
              v-model="filters.search"
              type="text"
              placeholder="Search jobs..."
              class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <!-- Filters -->
        <div class="bg-gray-800 rounded-lg p-4 space-y-4">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold">Filters</h2>
            <button
                @click="clearFilters"
                class="text-sm text-primary-400 hover:text-primary-300"
            >
              Clear all
            </button>
          </div>

          <!-- Location -->
          <div>
            <label class="block text-sm font-medium mb-2">Location</label>
            <input
                v-model="filters.location"
                type="text"
                placeholder="City or Remote"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <!-- Remote Only -->
          <div class="flex items-center">
            <input
                v-model="filters.remote"
                type="checkbox"
                class="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
            />
            <label class="ml-2">Remote Only</label>
          </div>

          <!-- Job Type -->
          <div>
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
          <div>
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
          <div>
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
                    @keyup.enter="addSkill(newSkill)"
                />
                <button
                    @click="addSkill(newSkill)"
                    class="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600"
                >
                  Add
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
                      @click="removeSkill(skill)"
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
                      @click="addSkill(skill)"
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
          <div class="flex items-center gap-2">
            <label class="text-sm">Sort by:</label>
            <select
                v-model="filters.sortBy"
                class="px-3 py-1 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="recent">Most Recent</option>
              <option value="salary">Highest Salary</option>
              <option value="relevance">Most Relevant</option>
            </select>
          </div>
        </div>

        <div v-if="loading" class="text-center py-8">
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
              v-for="job in filteredJobs"
              :key="job.id"
              class="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-700 transition-colors"
              @click="viewJobDetails(job.id)"
          >
            <div class="flex justify-between items-start mb-4">
              <div>
                <h2 class="text-xl font-semibold mb-2">{{ job.title }}</h2>
                <p class="text-gray-300 mb-2">{{ job.company }}</p>
                <div class="flex flex-wrap gap-4 text-gray-400">
                  <span class="flex items-center">
                    <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {{ job.location }}
                  </span>
                  <span class="flex items-center">
                    <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {{ job.type }}
                  </span>
                  <span v-if="job.experience" class="flex items-center">
                    <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {{ job.experience }}
                  </span>
                </div>
              </div>
              <div class="text-right">
                <p class="text-lg font-semibold text-primary-400">
                  {{ formatSalary(job.salary) }}
                </p>
                <p class="text-sm text-gray-400 mt-1">
                  Posted {{ new Date(job.postedAt).toLocaleDateString() }}
                </p>
                <span
                    v-if="!job.isReal"
                    class="inline-block mt-2 text-xs bg-gray-700 px-2 py-1 rounded-full"
                >
                  Demo
                </span>
              </div>
            </div>

            <p class="text-gray-300 mb-4">{{ job.description }}</p>

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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>