<script setup lang="ts">
import {ref, onMounted, computed} from 'vue';
import { useRouter } from 'vue-router';
import { useApplicationsStore } from '@/stores/applications';
import { useJobsStore } from '@/stores/jobs';
import { JobApplication } from '@/types/application';

const router = useRouter();
const applicationsStore = useApplicationsStore();
const loading = ref(true);
const error = ref('');
const applications = computed(() => applicationsStore.applications as JobApplication[]);

const useJobs = useJobsStore();
const jobs = computed(() => useJobs.jobs);
const getJob = (jobId: string) => {
  return jobs.value.find(job => job.id === jobId);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-500/10 text-yellow-400';
    case 'reviewing': return 'bg-blue-500/10 text-blue-400';
    case 'interviewing': return 'bg-green-500/10 text-green-400';
    case 'rejected': return 'bg-red-500/10 text-red-400';
    case 'accepted': return 'bg-primary-500/10 text-primary-400';
    default: return 'bg-gray-500/10 text-gray-400';
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

onMounted(async () => {
  try {
    await applicationsStore.fetchApplications();
    console.log("applications", applications.value);
    await useJobs.fetchAllJobs();
    console.log("jobs", useJobs.jobs);
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});

</script>

<template>
  <div class="max-w-4xl">
    <h2 class="text-2xl font-bold mb-6">My Applications</h2>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
      <p>Loading applications...</p>
    </div>

    <div v-else-if="error" class="bg-red-500/10 text-red-400 p-4 rounded-lg">
      {{ error }}
    </div>

    <div v-else-if="applicationsStore.applications.length === 0" class="bg-gray-800 rounded-lg p-6 text-center">
      <p class="text-gray-300 mb-4">You haven't applied to any jobs yet.</p>
      <router-link
          to="/jobs"
          class="inline-block bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
      >
        Browse Jobs
      </router-link>
    </div>

    <div v-else class="space-y-4">
      <div
          v-for="application in applicationsStore.applications"
          :key="application.id"
          class="bg-gray-800 rounded-lg p-6"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-semibold mb-2">{{ getJob(application.jobId).title }}</h3>
            <p class="text-gray-300">{{ getJob(application.jobId).company }}</p>
            <p class="text-gray-400 text-sm">{{ getJob(application.jobId).location }}</p>
          </div>
          <span
              :class="[getStatusColor(application.status), 'px-3 py-1 rounded-full text-sm']"
          >
            {{ application.status.charAt(0).toUpperCase() + application.status.slice(1) }}
          </span>
        </div>

        <div class="flex justify-between items-center text-sm text-gray-400">
          <p>Applied on {{ formatDate(application.appliedAt) }}</p>
          <div class="flex gap-2">
            <button
                @click="router.push(`/jobs/${application.jobId}`)"
                class="text-primary-400 hover:text-primary-300"
            >
              View Job
            </button>
            <button
                v-if="application.status === 'pending'"
                class="text-red-400 hover:text-red-300"
            >
              Withdraw
            </button>
          </div>
        </div>

        <!-- Test Results (if job has required tests) -->
        <div
            v-if="application.testResults?.length"
            class="mt-4 border-t border-gray-700 pt-4"
        >
          <h4 class="font-medium mb-2">Test Results</h4>
          <div class="space-y-2">
            <div
                v-for="result in application.testResults"
                :key="result.testId"
                class="flex justify-between items-center bg-gray-700 px-3 py-2 rounded"
            >
              <span>{{ result.testName }}</span>
              <span :class="result.passed ? 'text-green-400' : 'text-red-400'">
                {{ result.score }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>