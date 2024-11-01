<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useJobsStore } from '../../stores/jobs';

const router = useRouter();
const jobsStore = useJobsStore();
const showDeleteModal = ref(false);
const jobToDelete = ref<string | null>(null);
const loading = ref(false);
const error = ref('');

onMounted(async () => {
  await jobsStore.fetchCompanyJobs();
});

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-500/10 text-green-400';
    case 'draft': return 'bg-yellow-500/10 text-yellow-400';
    case 'closed': return 'bg-red-500/10 text-red-400';
    default: return 'bg-gray-500/10 text-gray-400';
  }
};

const closeJob = async (jobId: string) => {
  try {
    await jobsStore.updateJobStatus(jobId, 'closed');
  } catch (error) {
    console.error('Failed to close job:', error);
  }
};

const reopenJob = async (jobId: string) => {
  try {
    await jobsStore.updateJobStatus(jobId, 'active');
  } catch (error) {
    console.error('Failed to reopen job:', error);
  }
};

const confirmDelete = (jobId: string) => {
  jobToDelete.value = jobId;
  showDeleteModal.value = true;
};

const deleteJob = async () => {
  if (!jobToDelete.value) return;

  try {
    loading.value = true;
    await jobsStore.deleteJob(jobToDelete.value);
    showDeleteModal.value = false;
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
    jobToDelete.value = null;
  }
};

const refreshJobDate = async (jobId: string) => {
  try {
    await jobsStore.updateJob(jobId, {
      postedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to refresh job date:', error);
  }
};
</script>

<template>
  <div class="max-w-4xl">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Job Listings</h2>
      <router-link
          to="/company/jobs/create"
          class="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
      >
        Post New Job
      </router-link>
    </div>

    <div v-if="jobsStore.loading" class="text-center py-8">
      <p>Loading jobs...</p>
    </div>

    <div v-else-if="jobsStore.error" class="bg-red-500/10 text-red-400 p-4 rounded-lg mb-6">
      {{ jobsStore.error }}
    </div>

    <div v-else-if="jobsStore.companyJobs.length === 0" class="bg-gray-800 rounded-lg p-6 text-center">
      <p class="text-gray-300 mb-4">You haven't posted any jobs yet.</p>
      <router-link
          to="/company/jobs/create"
          class="inline-block bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
      >
        Post Your First Job
      </router-link>
    </div>

    <div v-else class="space-y-4">
      <div
          v-for="job in jobsStore.companyJobs"
          :key="job.id"
          class="bg-gray-800 rounded-lg p-6"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-semibold mb-2">{{ job.title }}</h3>
            <p class="text-gray-300">{{ job.location }} • {{ job.type }}</p>
          </div>
          <span
              :class="[getStatusColor(job.status), 'px-3 py-1 rounded-full text-sm']"
          >
            {{ job.status.charAt(0).toUpperCase() + job.status.slice(1) }}
          </span>
        </div>

        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-400">
            <p>Posted: {{ new Date(job.postedAt).toLocaleDateString() }}</p>
            <p>{{ job.applicants }} applicant{{ job.applicants !== 1 ? 's' : '' }}</p>
          </div>

          <div class="flex space-x-2">
            <router-link
                :to="`/company/jobs/${job.id}/edit`"
                class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              Edit
            </router-link>
            <router-link
                :to="`/company/jobs/${job.id}/applicants`"
                class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              View Applicants
            </router-link>

            <!-- Status management buttons -->
            <button
                v-if="job.status === 'active'"
                @click="closeJob(job.id)"
                class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              Close
            </button>
            <button
                v-if="job.status === 'closed'"
                @click="reopenJob(job.id)"
                class="px-3 py-1 bg-green-600 rounded hover:bg-green-700"
            >
              Reopen
            </button>
            <button
                v-if="job.status === 'closed'"
                @click="refreshJobDate(job.id)"
                class="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
                title="Update posting date to current date"
            >
              Refresh Date
            </button>
            <button
                v-if="job.status === 'closed'"
                @click="confirmDelete(job.id)"
                class="px-3 py-1 bg-red-600 rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 bg-gray-800 rounded-lg p-6">
      <h3 class="text-xl font-semibold mb-4">Overview</h3>
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-gray-700 rounded-lg p-4">
          <p class="text-sm text-gray-400 mb-1">Active Jobs</p>
          <p class="text-2xl font-bold">
            {{ jobsStore.companyJobs.filter(job => job.status === 'active').length }}
          </p>
        </div>
        <div class="bg-gray-700 rounded-lg p-4">
          <p class="text-sm text-gray-400 mb-1">Total Applicants</p>
          <p class="text-2xl font-bold">
            {{ jobsStore.totalApplicants }}
          </p>
        </div>
        <div class="bg-gray-700 rounded-lg p-4">
          <p class="text-sm text-gray-400 mb-1">Closed Jobs</p>
          <p class="text-2xl font-bold">
            {{ jobsStore.companyJobs.filter(job => job.status === 'closed').length }}
          </p>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-xl font-bold mb-4">Delete Job</h3>
        <p class="text-gray-300 mb-6">
          Are you sure you want to delete this job? This action cannot be undone.
        </p>
        <div class="flex justify-end space-x-4">
          <button
              @click="showDeleteModal = false"
              class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
              @click="deleteJob"
              :disabled="loading"
              class="px-4 py-2 bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {{ loading ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>