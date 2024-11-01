<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSavedJobsStore } from '../../stores/savedJobs';

const router = useRouter();
const savedJobsStore = useSavedJobsStore();

onMounted(async () => {
  await savedJobsStore.fetchSavedJobs();
});

const removeSavedJob = async (jobId: string) => {
  try {
    await savedJobsStore.unsaveJob(jobId);
  } catch (error) {
    console.error('Error removing saved job:', error);
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new': return 'bg-blue-500/10 text-blue-400';
    case 'applied': return 'bg-yellow-500/10 text-yellow-400';
    case 'interviewing': return 'bg-green-500/10 text-green-400';
    default: return 'bg-gray-500/10 text-gray-400';
  }
};
</script>

<template>
  <div class="max-w-3xl">
    <h2 class="text-2xl font-bold mb-6">Saved Jobs</h2>

    <div v-if="savedJobsStore.loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
      <p>Loading saved jobs...</p>
    </div>

    <div v-else-if="savedJobsStore.error" class="bg-red-500/10 text-red-400 p-4 rounded-lg mb-6">
      {{ savedJobsStore.error }}
    </div>

    <div v-else-if="savedJobsStore.savedJobs.length === 0" class="bg-gray-800 rounded-lg p-6 text-center">
      <p class="text-gray-300">You haven't saved any jobs yet.</p>
      <router-link
          to="/jobs"
          class="inline-block mt-4 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
      >
        Browse Jobs
      </router-link>
    </div>

    <div v-else class="space-y-4">
      <div
          v-for="job in savedJobsStore.savedJobs"
          :key="job.id"
          class="bg-gray-800 rounded-lg p-6"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-semibold mb-2">{{ job.title }}</h3>
            <p class="text-gray-300">{{ job.company }}</p>
            <p class="text-gray-400 text-sm">{{ job.location }} • {{ job.type }}</p>
          </div>
          <div class="flex items-center space-x-4">
            <span
                v-if="job.status"
                :class="[getStatusColor(job.status), 'px-3 py-1 rounded-full text-sm']"
            >
              {{ job.status.charAt(0).toUpperCase() + job.status.slice(1) }}
            </span>
            <button
                @click="removeSavedJob(job.jobId)"
                class="text-gray-400 hover:text-red-400"
                title="Remove from saved"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex justify-between items-center text-sm text-gray-400">
          <span>Saved on {{ new Date(job.savedAt).toLocaleDateString() }}</span>
          <router-link
              :to="`/jobs/${job.jobId}`"
              class="text-primary-400 hover:text-primary-300"
          >
            View Details
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>