<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useJobsStore } from '@/stores/jobs.ts';
import { useApplicationsStore } from '@/stores/applications.ts';
import Applicant from "./Applicant.vue";
import { JobApplication } from '@/types/application';

// Получение текущего маршрута и роутера
const route = useRoute();
const router = useRouter();

// Получение доступа к хранилищам
const jobsStore = useJobsStore();
const applicationsStore = useApplicationsStore();

// Параметры маршрута
const jobId = route.params.id as string;

// Рефы для отслеживания состояния
const loading = ref(true);
const error = ref('');
const job = ref<any>(null);
const applicantsUsers = ref<JobApplication[]>([]);

// Реф для фильтров
const filters = ref({
  status: '',
  minMatchScore: 0,
});

// Объединение onMounted в одну функцию
onMounted(async () => {
  loading.value = true;
  try {
    // Параллельная загрузка данных о вакансии и заявках
    const [jobData, applicantsData] = await Promise.all([
      jobsStore.getJobById(jobId),
      applicationsStore.getJobApplications(jobId),
    ]);

    // Обработка данных о вакансии
    if (jobData) {
      job.value = jobData;
    } else {
      await router.push('/company/jobs');
      return; // Завершаем выполнение функции, если перенаправили
    }

    // Обработка данных о заявках
    if (applicantsData) {
      applicantsUsers.value = applicantsData;
    }

  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});

// Вычисляемый список отфильтрованных заявок
const filteredApplicants = computed(() => {
  return applicantsUsers.value.filter((applicant) => {
    // Фильтр по статусу
    if (filters.value.status && filters.value.status !== 'all' && applicant.status !== filters.value.status) {
      return false;
    }
    // Фильтр по минимальному баллу
    if (filters.value.minMatchScore != null && applicant.matchScore < filters.value.minMatchScore) {
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

    <!-- Показать индикатор загрузки, если данные еще загружаются -->
    <div v-if="loading" class="text-center py-8">
      <p>Loading applicants...</p>
    </div>

    <!-- Если загрузка завершена, показываем основной контент -->
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
      <div class="space-y-4 mt-8">
        <div
            v-for="applicant in filteredApplicants"
            :key="applicant.id"
            class="bg-gray-800 rounded-lg p-6"
        >
          <Applicant :applicant="applicant" />
        </div>
      </div>
    </template>
  </div>
</template>
