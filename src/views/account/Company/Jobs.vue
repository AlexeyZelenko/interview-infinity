<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useJobsStore } from '@/stores/jobs';
import { useTestStore } from '@/stores/tests.ts';
import { useApplicationsStore } from '@/stores/applications';
import { useToast } from 'vue-toastification';
import Swal from 'sweetalert2';
import { useChatStore } from '@/stores/chats';

const chatStore = useChatStore();
const jobsStore = useJobsStore();
const testStore = useTestStore();
const applicationsStore = useApplicationsStore();
const loading = ref(true);
const error = ref('');
const applications = ref<any>([]);
const toast = useToast();

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-500/10 text-green-400';
    case 'draft': return 'bg-yellow-500/10 text-yellow-400';
    case 'closed': return 'bg-red-500/10 text-red-400';
    default: return 'bg-gray-500/10 text-gray-400';
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const removeTest = async (testId: string, jobId: string) => {
  // Подтверждение через SweetAlert2
  const { isConfirmed } = await Swal.fire({
    title: 'Are you sure?',
    text: 'Do you really want to remove this test? This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, remove it',
  });

  if (!isConfirmed) {
    return; // Пользователь отменил действие
  }

  try {
    // Удаление теста
    await testStore.deleteTestFromCompany(testId, jobId);

    await jobsStore.fetchCompanyJobs();
    await applicationsStore.fetchApplications();
    applications.value = applicationsStore.applications;
    // Успешное уведомление
    toast.success("Test removed successfully!");
  } catch (err: any) {
    // Логирование ошибки
    console.error("Error removing test:", err);

    // Показываем пользователю понятное сообщение
    toast.error("Failed to remove the test. Please try again later.");
  }
};

const unreadMessagesMap = ref<Record<string, number>>({});


onMounted(async () => {
  try {
    console.log("Fetching company jobs...");
    await jobsStore.fetchCompanyJobs();
    console.log("Company jobs fetched:", jobsStore.companyJobs);

    console.log("Fetching applications...");
    await applicationsStore.fetchApplications();
    console.log("Applications fetched:", applicationsStore.applications);

    applications.value = applicationsStore.applications;

    for (const job of jobsStore.companyJobs) {
      const unreadMessages = await chatStore.getCountMessagesFromJob(job.id);
      unreadMessagesMap.value[job.id] = unreadMessages;

      console.log(`Unread messages for job ${job.id}:`, unreadMessages);
    }
  } catch (err: any) {
    console.error("Error:", err.message);
    error.value = err.message;
  } finally {
    loading.value = false;
    console.log("Finished loading data.");
  }
});

</script>

<template>
  <div class="max-w-4xl">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">{{ $t('jobListings.title') }}</h2>
      <router-link
          to="/company/jobs/create"
          class="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
      >
        {{ $t('jobListings.postNewJob') }}
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
      <p>{{ $t('jobListings.loading') }}</p>
    </div>

    <div v-else-if="error" class="bg-red-500/10 text-red-400 p-4 rounded-lg mb-6">
      {{ error }}
    </div>

    <div v-else-if="jobsStore.companyJobs.length === 0" class="bg-gray-800 rounded-lg p-6 text-center">
      <p class="text-gray-300 mb-4">{{ $t('jobListings.noJobsPosted') }}</p>
      <router-link
          to="/company/jobs/create"
          class="inline-block bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
      >
        {{ $t('jobListings.postFirstJob') }}
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
            <p class="text-sm text-gray-400">
              Posted {{ formatDate(job.postedAt) }}
            </p>
          </div>
          <span
              :class="[getStatusColor(job.status), 'px-3 py-1 rounded-full text-sm']"
          >
            {{ job.status.charAt(0).toUpperCase() + job.status.slice(1) }}
          </span>
        </div>

        <!-- Attached Tests Section -->
        <div v-if="job.tests?.length" class="mt-4 border-t border-gray-700 pt-4">
          <h4 class="font-medium mb-2">{{ $t('jobListings.requiredTests') }}</h4>
          <div class="space-y-2">
            <div
                v-for="test in job.tests"
                :key="test.id"
                class="bg-gray-700 p-3 rounded-lg flex justify-between items-center"
            >
              <div>
                <p class="font-medium">{{ test.title }}</p>
                <p class="text-sm text-gray-400">
                  {{ test.duration }} minutes •
                  {{ test.isRequired ? $t('jobListings.required') : $t('jobListings.optional') }}
                </p>
              </div>
              <div class="flex gap-2">
                <router-link
                    :to="{ path: `/company/tests/${test.testId}/results`, query: { jobId: job.id }}"
                    class="px-3 py-1 bg-gray-600 rounded hover:bg-gray-500"
                >
                  {{ $t('jobListings.viewResults') }}
                </router-link>

                <button
                    @click="removeTest(test.testId, job.id)"
                    class="px-3 py-1 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30"
                >
                  {{ $t('jobListings.remove') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 flex justify-between items-center">
          <div class="flex items-center gap-4">
            <span class="text-gray-400">
              {{ applicationsStore.getJobApplications(job.id).length || 0 }} {{$t('jobListings.applicant')}}{{ applicationsStore.getJobApplications(job.id).length !== 1 ? 's' : '' }}
            </span>
            <router-link
                :to="`/company/jobs/${job.id}/applicants`"
                class="text-primary-400 hover:text-primary-300"
            >
              {{ $t('jobListings.viewApplicants') }}
            </router-link>
          </div>

          <div v-if="unreadMessagesMap[job.id] > 0">
            <span class="text-sm">{{ $t('jobListings.unreadMessages') }}</span>
            <span class="bg-red-400 text-amber-50 py-1 px-2 rounded-2xl text-xs ml-2">{{ unreadMessagesMap[job.id] }}</span>
          </div>

          <div class="flex gap-2">
            <router-link
                :to="`/company/jobs/${job.id}/edit`"
                class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              {{ $t('jobListings.edit') }}
            </router-link>
            <button
                v-if="job.status === 'active'"
                @click="jobsStore.updateJobStatus(job.id, 'closed')"
                class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              {{ $t('jobListings.close') }}
            </button>
            <button
                v-if="job.status === 'closed'"
                @click="jobsStore.updateJobStatus(job.id, 'active')"
                class="px-3 py-1 bg-green-600 rounded hover:bg-green-700"
            >
              {{ $t('jobListings.reopen') }}
            </button>
            <button
                v-if="job.status === 'closed'"
                @click="jobsStore.deleteJob(job.id)"
                class="px-3 py-1 bg-red-600 rounded hover:bg-red-700"
            >
              {{ $t('jobListings.delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
