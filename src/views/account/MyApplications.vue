<script setup lang="ts">
import {ref, onMounted, computed} from 'vue';
import { useRouter } from 'vue-router';
import { useApplicationsStore } from '@/stores/applications';
import { useJobsStore } from '@/stores/jobs';
import { useAuthStore } from '@/stores/auth.ts';
import { JobApplication } from '@/types/application';
import Chat from '@/components/Chat.vue';

const router = useRouter();
const applicationsStore = useApplicationsStore();
const loading = ref(true);
const error = ref('');
const applications = computed(() => applicationsStore.applications as JobApplication[]);

const UseAuth = useAuthStore();
const currentUserId = computed(() => UseAuth.user?.uid ?? '');

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

const Reload = () => {
  loading.value = true;
  error.value = '';
  applicationsStore.fetchApplications()
    .then(() => {
      loading.value = false;
    })
    .catch((err: any) => {
      error.value = err.message;
      loading.value = false;
    });
};

onMounted(async () => {
  try {
    await applicationsStore.fetchApplications();
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
    <div class="flex justify-start mb-4 items-center">
      <h2 class="text-2xl font-bold mr-2">My Applications</h2>
      <svg
          @click="Reload"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6 text-gray-400 hover:text-gray-300 cursor-pointer"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    </div>


    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
      <p>Loading applications...</p>
    </div>

    <div v-else-if="error" class="bg-red-500/10 text-red-400 p-4 rounded-lg">
      {{ error }}
    </div>

    <div v-else-if="applications.length === 0" class="bg-gray-800 rounded-lg p-6 text-center">
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
          v-for="application in applications"
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

        <Chat
            :chatId="`chat_${currentUserId}_${application.id}_${application.companyId}`"
            :currentUserId="currentUserId"
        />

      </div>
    </div>
  </div>
</template>