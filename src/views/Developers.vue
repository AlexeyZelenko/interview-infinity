<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config'; // Подключаем ваш конфиг Firebase

// Импортируем иконки из Heroicons
import { MagnifyingGlassIcon, PauseCircleIcon, NoSymbolIcon, UserCircleIcon, CheckCircleIcon } from '@heroicons/vue/24/outline';

// Типы данных
interface Developer {
  id: string;
  name: string;
  technologies: string[];
  status: 'searching' | 'paused' | 'not_searching';
  testsCompleted: number;
  avatar?: string;
}

const router = useRouter();

const developers = ref<Developer[]>([]); // Заменяем статические данные на реактивные
const allTechnologies = ref([
  'Vue', 'React', 'Angular', 'TypeScript', 'JavaScript',
  'Python', 'Node.js', 'Java', 'Go', 'Ruby'
]);

const selectedTechnologies = ref<string[]>([]);
const selectedStatus = ref<string[]>([]);

// Фильтрация разработчиков по выбранным технологиям и статусу
const filteredDevelopers = computed(() => {
  return developers.value.filter(dev => {
    const matchesTech = selectedTechnologies.value.length === 0 ||
        dev.technologies.some(tech => selectedTechnologies.value.includes(tech));

    const matchesStatus = selectedStatus.value.length === 0 ||
        selectedStatus.value.includes(dev.status);

    return matchesTech && matchesStatus;
  });
});

// Статусы разработчиков
const statusOptions = [
  { value: 'searching', label: 'Searching', icon: MagnifyingGlassIcon },
  { value: 'paused', label: 'On Pause', icon: PauseCircleIcon },
  { value: 'not_searching', label: 'Not Searching', icon: NoSymbolIcon }
];

// Функция получения количества пройденных тестов для конкретного пользователя из Firebase
const fetchTestsCompleted = async (userId: string) => {
  try {
    const testAttemptsRef = collection(db, 'testAttempts');
    const testsQuery = query(testAttemptsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(testsQuery);
    return querySnapshot.size; // Возвращаем количество пройденных тестов
  } catch (error) {
    console.error('Error fetching test attempts:', error);
    return 0; // Возвращаем 0 в случае ошибки
  }
};

// Функция получения разработчиков из Firebase
const fetchDevelopers = async () => {
  try {
    const developersRef = collection(db, 'users');
    const developersQuery = query(developersRef, where('userType', '==', 'developer'));
    const querySnapshot = await getDocs(developersQuery);

    // Сначала собираем основные данные разработчиков
    developers.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      technologies: doc.data().technologies || [],
      status: doc.data().status,
      testsCompleted: 0, // Изначально устанавливаем 0, чтобы обновить позже
      avatar: doc.data().avatar
    }));

    // Теперь обновляем количество пройденных тестов для каждого разработчика
    for (const dev of developers.value) {
      dev.testsCompleted = await fetchTestsCompleted(dev.id);
    }

    // Объединение технологий разработчиков с существующими в `allTechnologies`
    const technologySet = new Set(allTechnologies.value);
    developers.value.forEach(dev => {
      dev.technologies.forEach(tech => technologySet.add(tech));
    });
    allTechnologies.value = Array.from(technologySet).sort(); // Сортировка технологий

    console.log('Developers fetched:', developers.value);
    console.log('All Technologies:', allTechnologies.value);
  } catch (error) {
    console.error('Error fetching developers:', error);
  }
};

// Выполнение функций получения разработчиков при монтировании компонента
onMounted(() => {
  fetchDevelopers();
});

function toggleTechnology(tech: string) {
  const index = selectedTechnologies.value.indexOf(tech);
  if (index === -1) {
    selectedTechnologies.value.push(tech);
  } else {
    selectedTechnologies.value.splice(index, 1);
  }
}

function toggleStatus(status: string) {
  const index = selectedStatus.value.indexOf(status);
  if (index === -1) {
    selectedStatus.value.push(status);
  } else {
    selectedStatus.value.splice(index, 1);
  }
}

function viewDeveloper(id: string) {
  router.push(`/developers/${id}`);
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'searching': return 'bg-green-500';
    case 'paused': return 'bg-yellow-500';
    case 'not_searching': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold mb-8 flex items-center gap-2">
      <UserCircleIcon class="h-8 w-8 text-primary-600" />
      Developers
    </h1>

    <div class="grid md:grid-cols-[300px,1fr] gap-8">
      <!-- Filters -->
      <div class="bg-gray-800 p-6 rounded-lg h-fit">
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-4">Technologies</h2>
          <div class="space-y-2">
            <label
                v-for="tech in allTechnologies"
                :key="tech"
                class="flex items-center space-x-2 cursor-pointer"
            >
              <input
                  type="checkbox"
                  :checked="selectedTechnologies.includes(tech)"
                  @change="toggleTechnology(tech)"
                  class="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
              >
              <span>{{ tech }}</span>
            </label>
          </div>
        </div>

        <div>
          <h2 class="text-xl font-semibold mb-4">Status</h2>
          <div class="space-y-2">
            <label
                v-for="status in statusOptions"
                :key="status.value"
                class="flex items-center space-x-2 cursor-pointer"
            >
              <input
                  type="checkbox"
                  :checked="selectedStatus.includes(status.value)"
                  @change="toggleStatus(status.value)"
                  class="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
              >
              <span class="flex items-center gap-1">
                <component :is="status.icon" class="h-4 w-4" />
                {{ status.label }}
              </span>
            </label>
          </div>
        </div>
      </div>

      <!-- Developer List -->
      <div class="grid gap-4">
        <div
            v-for="dev in filteredDevelopers"
            :key="dev.id"
            @click="viewDeveloper(dev.id)"
            class="bg-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
        >
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-xl font-semibold">{{ dev.name }}</h3>
              <div class="flex items-center mt-1">
                <span
                    :class="[getStatusColor(dev.status), 'w-2 h-2 rounded-full mr-2']"
                ></span>
                <span class="text-gray-300">
                  {{ statusOptions.find(s => s.value === dev.status)?.label }}
                </span>
              </div>
            </div>
            <div class="text-gray-300 flex items-center gap-2">
              <CheckCircleIcon class="h-5 w-5 text-green-400" />
              {{ dev.testsCompleted }} tests completed
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <span
                v-for="tech in dev.technologies"
                :key="tech"
                class="bg-gray-700 px-3 py-1 rounded-full text-sm"
            >
              {{ tech }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
