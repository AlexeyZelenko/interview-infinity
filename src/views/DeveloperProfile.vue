<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { doc, getDoc, collection, getDocs, query, where, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

// Маршрут и параметр `id` для идентификации разработчика
const route = useRoute();
const router = useRouter();
const developerId = route.params.id;
const authStore = useAuthStore(); // Хранилище пользователя
const currentUser = computed(() => authStore.user);

// Реактивная переменная для управления доступностью функции "Save Developer"
const canSaveDeveloper = computed(() => currentUser.value?.userType === "company");

// Реактивная переменная для хранения данных разработчика
const developer = ref({
  id: '',
  name: '',
  technologies: [],
  status: 'searching',
  testsCompleted: 0,
  bio: '',
  location: '',
  experience: '',
  github: '',
  linkedin: '',
  contacts: {
    email: '',
    github: '',
    linkedin: '',
    phone: ''
  },
  codewarsUsername: 'AlexeyZelenko',
  testResults: [],
  resumes: [] // Добавляем для хранения резюме
});

// Реактивная переменная для хранения данных Codewars
const codewarsData = ref<any>(null);

// Реактивная переменная для управления видимостью модального окна контактов
const showContactModal = ref(false);

// Функция получения данных разработчика из Firestore
const fetchDeveloper = async () => {
  if (!developerId) {
    console.error('Developer ID is not available');
    return;
  }

  try {
    const developerRef = doc(db, 'users', developerId);
    const developerSnap = await getDoc(developerRef);

    if (developerSnap.exists()) {
      developer.value = {
        id: developerSnap.id,
        ...developerSnap.data()
      };
      console.log('Developer fetched:', developer.value);

      // После успешного получения данных разработчика, получаем результаты тестов, резюме и данные из Codewars
      await fetchTestResults(developerId);
      await fetchResumes(developerId);
      await fetchCodewarsData(developer.value.codewarsUsername);
    } else {
      console.error('No such developer found');
    }
  } catch (error) {
    console.error('Error fetching developer:', error);
  }
};

// Функция получения данных пользователя Codewars
const fetchCodewarsData = async (username: string) => {
  try {
    const response = await axios.get(`https://www.codewars.com/api/v1/users/${username}`);
    codewarsData.value = response.data;
    console.log('Codewars data fetched:', codewarsData.value);
  } catch (error) {
    console.error('Error fetching Codewars data:', error);
  }
};

// Функция получения результатов тестов из Firestore
const fetchTestResults = async (userId: string) => {
  try {
    const testAttemptsRef = collection(db, 'testAttempts');
    const testsQuery = query(testAttemptsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(testsQuery);

    // Получаем базовые результаты тестов
    const basicTestResults = querySnapshot.docs.map(doc => ({
      id: doc.id,
      testId: doc.data().testId,
      score: doc.data().score,
      date: doc.data().completionDate
    }));

    // Теперь получаем полную информацию о каждом тесте из коллекции TESTS
    const detailedTestResults = await Promise.all(basicTestResults.map(async (test) => {
      const testRef = doc(db, 'tests', test.testId);
      const testSnap = await getDoc(testRef);
      if (testSnap.exists()) {
        return {
          ...test,
          testName: testSnap.data().name,
          description: testSnap.data().description,
          difficulty: testSnap.data().difficulty,
        };
      }
      return test;
    }));

    developer.value.testResults = detailedTestResults;

    console.log('Test results fetched with details:', developer.value.testResults);
  } catch (error) {
    console.error('Error fetching test attempts:', error);
  }
};

// Функция получения списка резюме из Firestore
const fetchResumes = async (userId: string) => {
  try {
    const resumesRef = collection(db, 'resumes');
    const resumesQuery = query(resumesRef, where('userId', '==', userId), where('isActive', '==', true));
    const querySnapshot = await getDocs(resumesQuery);

    developer.value.resumes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      date: doc.data().date,
      isActive: doc.data().isActive
    }));

    console.log('Resumes fetched:', developer.value.resumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
  }
};

// Выполнение функции получения данных при монтировании компонента
onMounted(() => {
  fetchDeveloper();
});

// Функция для получения цвета статуса
const getStatusColor = (status: string) => {
  switch (status) {
    case 'searching': return 'bg-green-500';
    case 'paused': return 'bg-yellow-500';
    case 'not_searching': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

// Функция открытия модального окна контактов
const openContactModal = () => {
  showContactModal.value = true;
};

// Функция закрытия модального окна контактов
const closeContactModal = () => {
  showContactModal.value = false;
};

const viewResume = async (resumeId: string) => {
  await router.push (`/all-resumes/resume/${resumeId}`);
};

// Функция сохранения разработчика в список компании
const saveDeveloper = async () => {
  if (!currentUser.value || !developer.value.id) {
    console.error('No authenticated user or developer ID not available');
    return;
  }

  try {
    const companyRef = doc(db, 'users', currentUser.value.uid);
    await updateDoc(companyRef, {
      savedUsers: arrayUnion({
        id: developer.value.id,
        name: developer.value.name,
        status: developer.value.status,
        technologies: developer.value.technologies
      })
    });
    console.log('Developer saved:', developer.value.id);
    alert('Developer successfully saved to your list.');
  } catch (error) {
    console.error('Error saving developer:', error);
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="bg-gray-800 rounded-lg p-8">
      <div class="flex items-start justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold mb-2">{{ developer.name }}</h1>
          <div class="flex items-center">
            <span
                :class="[getStatusColor(developer.status), 'w-2 h-2 rounded-full mr-2']"
            ></span>
            <span class="text-gray-300">
              {{ developer.status === 'searching' ? 'Open to work' :
                developer.status === 'paused' ? 'On pause' : 'Not searching' }}
            </span>
          </div>
        </div>
        <!-- Кнопка сохранения разработчика доступна только для пользователей компании -->
        <button v-if="canSaveDeveloper" @click="saveDeveloper" class="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
          Save Developer
        </button>
        <button @click="openContactModal" class="bg-primary-600 px-4 py-2 rounded hover:bg-primary-700">
          Contact
        </button>
      </div>

      <div class="grid md:grid-cols-2 gap-8">
        <div>
          <h2 class="text-xl font-semibold mb-4">About</h2>
          <p class="text-gray-300 mb-4">{{ developer.bio }}</p>

          <div class="space-y-2 text-gray-300">
            <p>📍 {{ developer.location }}</p>
            <p>💼 {{ developer.experience }} of experience</p>
          </div>

          <h2 class="text-xl font-semibold mt-6 mb-4">Technologies</h2>
          <div class="flex flex-wrap gap-2">
            <span
                v-for="tech in developer.technologies"
                :key="tech"
                class="bg-gray-700 px-3 py-1 rounded-full"
            >
              {{ tech }}
            </span>
          </div>

          <h2 class="text-xl font-semibold mt-6 mb-4">About User</h2>
          <div>{{developer.about}}</div>


          <!-- Codewars Section -->
          <div v-if="codewarsData" class="bg-gray-800 mt-8 rounded-lg">
            <h2 class="text-xl font-semibold mb-4">Codewars Profile</h2>
            <div class="flex flex-col space-y-4 text-gray-300">
              <p><strong>Username:</strong> {{ codewarsData.username }}</p>
              <p><strong>Honor:</strong> {{ codewarsData.honor }}</p>
              <p><strong>Clan:</strong> {{ codewarsData.clan }}</p>
              <p><strong>Leaderboard Position:</strong> {{ codewarsData.leaderboardPosition }}</p>
              <p><strong>Completed Challenges:</strong> {{ codewarsData.codeChallenges.totalCompleted }}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 class="text-xl font-semibold mb-4">Test Results</h2>
          <div class="space-y-4">
            <div
                v-for="test in developer.testResults"
                :key="test.id"
                class="bg-gray-700 p-4 rounded-lg"
            >
              <div class="flex justify-between items-center mb-2">
                <h3 class="font-medium">{{ test.testName }}</h3>
                <span class="text-green-400">{{ test.score }}%</span>
              </div>
              <p class="text-gray-400">{{ test.description }}</p>
              <p class="text-sm text-gray-500">Difficulty: {{ test.difficulty }}</p>
            </div>
          </div>

          <h2 class="text-xl font-semibold mt-6 mb-4">Resumes</h2>
          <div class="space-y-4">
            <div
                v-for="resume in developer.resumes"
                :key="resume.id"
                class="bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600"
                @click="viewResume(resume.id)"
            >
              <div class="flex justify-between items-center mb-2">
                <h3 class="font-medium">{{ resume.title }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contact Modal -->
    <div v-if="showContactModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div class="bg-gray-800 p-6 rounded-lg max-w-md w-full">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Contact Information</h2>
          <button @click="closeContactModal" class="text-white hover:text-gray-400">&times;</button>
        </div>
        <div class="space-y-4 text-gray-300">
          <p><strong>Email:</strong> {{ developer.contacts.email }}</p>
          <p><strong>Phone:</strong> {{ developer.contacts.phone }}</p>
          <p><strong>LinkedIn:</strong> <a :href="developer.contacts.linkedin" class="text-blue-400 hover:underline" target="_blank">{{ developer.contacts.linkedin }}</a></p>
          <p><strong>GitHub:</strong> <a :href="developer.contacts.github" class="text-blue-400 hover:underline" target="_blank">{{ developer.contacts.github }}</a></p>
        </div>
      </div>
    </div>
  </div>
</template>
