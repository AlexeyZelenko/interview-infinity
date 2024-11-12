<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useTestStore } from '@/stores/tests';
import { useRouter } from 'vue-router';
import Info from './Info.vue';
import ProgressBar from './ProgressBar.vue';
import Swal from 'sweetalert2';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const testStore = useTestStore();
const loading = ref(true);
const error = ref('');
const testsResults = ref([]);

// Проверка, что пользователь авторизован
const idUser = computed(() => authStore.user?.uid);
if (!idUser.value) {
  router.push('/login');
}

// Форматирование результатов теста для отображения
const userTestsResults = computed(() => {
  return testStore.testHistory.filter(test => test.userId === idUser.value);
});

// Получение данных истории тестов
const loadTestResults = async () => {
  loading.value = true;
  try {
    await testStore.loadTestHistory();
    testsResults.value = userTestsResults.value;
  } catch (err) {
    console.error('Error loading test history:', err);
    error.value = 'An error occurred while loading test results. Please try again later.';
  } finally {
    loading.value = false;
  }
};

// Удаление теста с подтверждением
const deleteTest = async (testId: string) => {
  try {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (confirm.isConfirmed) {
      await testStore.deleteTest(testId);

      // Обновляем результаты после удаления
      await loadTestResults();
    }
  } catch (err) {
    console.error('Error deleting test:', err);
    Swal.fire('Error!', 'Could not delete the test. Please try again later.', 'error');
  }
};

// Запуск при монтировании компонента
onMounted(() => {
  loadTestResults();
});

// Цвет для отображения результата теста
const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-400';
  if (score >= 70) return 'text-yellow-400';
  return 'text-red-400';
};

</script>

<template>
  <div class="max-w-4xl">
    <h2 class="text-2xl font-bold mb-6">Test Results</h2>

    <!-- Загрузка данных -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
      <p>Loading test results...</p>
    </div>

    <!-- Ошибка при загрузке данных -->
    <div v-else-if="error" class="bg-red-500/10 text-red-400 p-4 rounded-lg mb-6">
      {{ error }}
    </div>

    <!-- Нет результатов тестов -->
    <div v-else-if="testsResults.length === 0" class="bg-gray-800 rounded-lg p-6 text-center">
      <p class="text-gray-300">You haven't taken any tests yet.</p>
      <router-link
          to="/tests"
          class="inline-block mt-4 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
      >
        Browse Tests
      </router-link>
    </div>

    <!-- Отображение результатов тестов -->
    <div v-else>
      <!-- Overview -->
      <div class="grid grid-cols-2 gap-4 mb-8">
        <div class="bg-gray-800 rounded-lg p-4">
          <p class="text-2xl font-bold" :class="getScoreColor(testStore.averageScore)">
            {{ testStore.averageScore }}%
          </p>
          <p class="text-sm text-gray-400">Average Score</p>
        </div>
        <div class="bg-gray-800 rounded-lg p-4">
          <p class="text-2xl font-bold">{{ userTestsResults.length }}</p>
          <p class="text-sm text-gray-400">Tests Completed</p>
        </div>
      </div>

      <!-- Список результатов тестов -->
      <div v-if="testsResults.length > 0" class="space-y-6">
        <div
            v-for="result in testsResults"
            :key="result.id"
            class="bg-gray-800 rounded-lg p-6"
        >
          <!-- Информация о тесте -->
          <Info :result='result' />

          <!-- Прогресс Бар -->
          <div class="mt-4">
            <ProgressBar :result="result"/>
          </div>

          <!-- Действия -->
          <div class="mt-4 flex justify-between">
            <router-link
                :to="`/test/${result.id}/review`"
                class="text-primary-400 hover:text-primary-300"
            >
              Review Test
            </router-link>
            <button @click="deleteTest(result.id)" class="text-red-500 hover:text-red-400">
              Delete Test
            </button>
          </div>
        </div>
      </div>

      <!-- Кнопка для продолжения тестов -->
      <div class="mt-8 text-center">
        <router-link
            to="/tests"
            class="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
        >
          Take More Tests
        </router-link>
      </div>
    </div>
  </div>
</template>
