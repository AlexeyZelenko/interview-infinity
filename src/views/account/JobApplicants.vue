<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useJobsStore } from '../../stores/jobs';

const route = useRoute();
const router = useRouter();
const jobsStore = useJobsStore();
const jobId = route.params.id as string;

const loading = ref(true);
const error = ref('');

const job = ref<any>(null);
const applicants = ref([
  {
    id: '1',
    name: 'John Doe',
    title: 'Senior Frontend Developer',
    location: 'New York, NY',
    experience: '5 years',
    appliedAt: '2024-02-15',
    status: 'new',
    matchScore: 85,
    skills: ['Vue.js', 'TypeScript', 'Node.js'],
    testScores: [
      { name: 'Frontend Development', score: 92 },
      { name: 'JavaScript Fundamentals', score: 88 }
    ]
  },
  {
    id: '2',
    name: 'Jane Smith',
    title: 'Full Stack Developer',
    location: 'Remote',
    experience: '4 years',
    appliedAt: '2024-02-14',
    status: 'interviewing',
    matchScore: 78,
    skills: ['React', 'Node.js', 'MongoDB'],
    testScores: [
      { name: 'Frontend Development', score: 85 },
      { name: 'JavaScript Fundamentals', score: 90 }
    ]
  }
]);

const filters = ref({
  status: '',
  minMatchScore: 0
});

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new': return 'bg-blue-500/10 text-blue-400';
    case 'reviewing': return 'bg-yellow-500/10 text-yellow-400';
    case 'interviewing': return 'bg-green-500/10 text-green-400';
    case 'rejected': return 'bg-red-500/10 text-red-400';
    case 'hired': return 'bg-primary-500/10 text-primary-400';
    default: return 'bg-gray-500/10 text-gray-400';
  }
};

const updateApplicantStatus = async (applicantId: string, newStatus: string) => {
  try {
    // Update applicant status in the database
    const applicant = applicants.value.find(a => a.id === applicantId);
    if (applicant) {
      applicant.status = newStatus;
    }
  } catch (err: any) {
    error.value = err.message;
  }
};

onMounted(async () => {
  try {
    const jobData = await jobsStore.getJobById(jobId);
    if (jobData) {
      job.value = jobData;
    } else {
      router.push('/company/jobs');
    }
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});

const filteredApplicants = computed(() => {
  return applicants.value.filter(applicant => {
    if (filters.value.status && applicant.status !== filters.value.status) {
      return false;
    }
    if (filters.value.minMatchScore && applicant.matchScore < filters.value.minMatchScore) {
      return false;
    }
    return true;
  });
});
</script>

<template>
  <div class="max-w-4xl">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold">Job Applicants</h2>
        <p v-if="job" class="text-gray-400">{{ job.title }}</p>
      </div>
      <button
          @click="router.push(`/company/jobs/${jobId}/edit`)"
          class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
      >
        Edit Job
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p>Loading applicants...</p>
    </div>

    <template v-else>
      <!-- Filters -->
      <div class="bg-gray-800 rounded-lg p-4 mb-6">
        <div class="flex gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Status</label>
            <select
                v-model="filters.status"
                class="px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All</option>
              <option value="new">New</option>
              <option value="reviewing">Reviewing</option>
              <option value="interviewing">Interviewing</option>
              <option value="rejected">Rejected</option>
              <option value="hired">Hired</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Min Match Score</label>
            <input
                v-model.number="filters.minMatchScore"
                type="number"
                min="0"
                max="100"
                class="px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      <!-- Applicants List -->
      <div class="space-y-4">
        <div
            v-for="applicant in filteredApplicants"
            :key="applicant.id"
            class="bg-gray-800 rounded-lg p-6"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-xl font-semibold mb-2">{{ applicant.name }}</h3>
              <p class="text-gray-300">{{ applicant.title }}</p>
              <p class="text-gray-400 text-sm">
                {{ applicant.location }} • {{ applicant.experience }} experience
              </p>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <p class="text-sm text-gray-400 mb-1">Match Score</p>
                <p
                    class="text-lg font-bold"
                    :class="[
                    applicant.matchScore >= 80 ? 'text-green-400' :
                    applicant.matchScore >= 60 ? 'text-yellow-400' :
                    'text-red-400'
                  ]"
                >
                  {{ applicant.matchScore }}%
                </p>
              </div>
              <div>
                <select
                    v-model="applicant.status"
                    @change="updateApplicantStatus(applicant.id, $event.target.value)"
                    :class="[getStatusColor(applicant.status), 'px-3 py-1 rounded-full text-sm bg-opacity-10']"
                >
                  <option value="new">New</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="rejected">Rejected</option>
                  <option value="hired">Hired</option>
                </select>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <div class="flex flex-wrap gap-2">
              <span
                  v-for="skill in applicant.skills"
                  :key="skill"
                  class="bg-gray-700 px-3 py-1 rounded-full text-sm"
              >
                {{ skill }}
              </span>
            </div>
          </div>

          <div class="border-t border-gray-700 pt-4">
            <h4 class="text-sm font-medium mb-2">Test Results</h4>
            <div class="grid grid-cols-2 gap-4">
              <div
                  v-for="test in applicant.testScores"
                  :key="test.name"
                  class="flex justify-between items-center"
              >
                <span class="text-gray-400">{{ test.name }}</span>
                <span
                    :class="[
                    test.score >= 90 ? 'text-green-400' :
                    test.score >= 70 ? 'text-yellow-400' :
                    'text-red-400'
                  ]"
                >
                  {{ test.score }}%
                </span>
              </div>
            </div>
          </div>

          <div class="flex justify-between items-center mt-4 text-sm">
            <span class="text-gray-400">
              Applied {{ new Date(applicant.appliedAt).toLocaleDateString() }}
            </span>
            <div class="flex gap-2">
              <button
                  class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
                  @click="router.push(`/developers/${applicant.id}`)"
              >
                View Profile
              </button>
              <button
                  class="px-3 py-1 bg-primary-600 rounded hover:bg-primary-700"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>