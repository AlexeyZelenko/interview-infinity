<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { db } from '@/firebase/config';
import { useToast } from 'vue-toastification';
import axios from 'axios';
import Codewars from './Codewars.vue'; // Вынесенный компонент Codewars

// Типы данных
interface User {
  name: string;
  status: string;
  experience: number;
  location: string;
  employmentStatus: string;
  about: string;
  contacts: {
    email?: string;
    linkedin?: string;
    github?: string;
    phone?: string;
  };
  codewarsUsername: string;
  technologies: string[];
  show?: string;
}

interface TestResult {
  title: string;
  completionDate: string;
  score: number;
}

const router = useRouter();
const authStore = useAuthStore();
const currentUser = computed(() => authStore.user);
const toast = useToast();

const user = ref<User>({
  name: '',
  status: 'open',
  experience: 0,
  location: '',
  employmentStatus: 'Work',
  about: '',
  contacts: {},
  codewarsUsername: '',
  technologies: [],
  show: 'yes'
});

const codewarsData = ref<any>(null); // Хранение данных Codewars
const technologyInput = ref<string>('');
const test = ref<TestResult>({
  title: '',
  completionDate: '',
  score: 0
});
const isLoading = ref<boolean>(false);
const isCheckingCodewars = ref<boolean>(false); // Переменная для проверки Codewars
const errors = ref<{ [key: string]: string }>({}); // Объект для хранения ошибок

// Функция для получения данных пользователя из Firebase
const fetchUserData = async () => {
  if (!currentUser.value) {
    await router.push('/login');
    return;
  }

  try {
    const uid = currentUser.value.uid;
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data() as User;
      user.value = { ...user.value, ...userData };
      console.log('User data:', user.value);

      // Автоматическая загрузка данных Codewars, если username уже указан
      if (user.value.codewarsUsername) {
        await checkCodewarsConnection(user.value.codewarsUsername);
      }
    }
  } catch (e) {
    toast.error("Error fetching user data");
  }
};

// Получение данных при монтировании компонента
onMounted(async () => {
  await fetchUserData();
});

// Наблюдение за изменением текущего пользователя
watch(currentUser, async (newUser) => {
  if (newUser) {
    await fetchUserData();
  }
});

const addTechnology = () => {
  if (technologyInput.value.trim()) {
    user.value.technologies.push(technologyInput.value.trim());
    technologyInput.value = '';
  }
};

const removeTechnology = (index: number) => {
  user.value.technologies.splice(index, 1);
};

// Функция для отправки формы
const validateForm = (): boolean => {
  errors.value = {}; // Сброс ошибок перед валидацией
  let isValid = true;

  if (!user.value.name) {
    errors.value.name = 'Name is required';
    isValid = false;
  }

  if (user.value.experience < 0) {
    errors.value.experience = 'Experience must be at least 0 years';
    isValid = false;
  }

  if (!user.value.location) {
    errors.value.location = 'Location is required';
    isValid = false;
  }

  if (user.value.contacts.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.value.contacts.email)) {
    errors.value.email = 'Must be a valid email address';
    isValid = false;
  }

  if (user.value.contacts.linkedin && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(user.value.contacts.linkedin)) {
    errors.value.linkedin = 'Must be a valid URL';
    isValid = false;
  }

  if (user.value.contacts.github && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(user.value.contacts.github)) {
    errors.value.github = 'Must be a valid URL';
    isValid = false;
  }

  return isValid;
};

const onSubmit = async () => {
  if (!validateForm()) {
    return; // Прекратить, если форма не прошла проверку
  }

  isLoading.value = true;

  try {
    if (!currentUser.value) {
      toast.error("No authenticated user found");
      return;
    }

    const uid = currentUser.value.uid;
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, {
      ...user.value,
      testResults: {
        title: test.value.title,
        completionDate: test.value.completionDate,
        score: test.value.score
      },
      updatedAt: new Date().toISOString()
    }, { merge: true });

    toast.success("User data successfully saved/updated");

    // Повторное получение данных после успешного обновления
    await fetchUserData();
  } catch (e) {
    toast.error("Error saving/updating document");
  } finally {
    isLoading.value = false;
    if (currentUser.value) {
      await authStore.loadUser(currentUser.value.uid);
    }
  }
};

// Проверка пользователя Codewars
const checkCodewarsConnection = async (username: string) => {
  if (!username.trim()) {
    toast.error("Please enter a Codewars username.");
    return;
  }

  isCheckingCodewars.value = true;

  try {
    const response = await axios.get(`https://www.codewars.com/api/v1/users/${username}`);
    codewarsData.value = response.data;
  } catch (error) {
    toast.error("Failed to connect to Codewars. Please check the username.");
  } finally {
    isCheckingCodewars.value = false;
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 bg-gray-800 rounded-md text-white">
    <h1 class="text-2xl font-bold mb-6 text-center">Create or Update User Profile</h1>
    <form @submit.prevent="onSubmit">
      <div class="mb-6">
        <label for="name" class="block mb-2">Name</label>
        <input
            v-model="user.name"
            type="text"
            id="name"
            class="w-full p-2 mb-4 bg-gray-700 rounded"
            placeholder="Enter full name"
        />
        <p v-if="errors.name" class="text-red-500 mb-4">{{ errors.name }}</p>

        <label for="status" class="block mb-2">Status</label>
        <select v-model="user.status" id="status" class="w-full p-2 mb-4 bg-gray-700 rounded">
          <option value="searching">Searching</option>
          <option value="paused">On Pause</option>
          <option value="not_searching">Not Searching</option>
        </select>

        <label for="show" class="block mb-2">Show in developer list</label>
        <select v-model="user.show" id="show" class="w-full p-2 mb-4 bg-gray-700 rounded">
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>

        <label from="about" class="block mb-2">About</label>
        <textarea
            v-model="user.about"
            id="about"
            class="w-full p-2 mb-4 bg-gray-700 rounded"
            placeholder="Tell us about yourself"
        ></textarea>

        <label for="experience" class="block mb-2">Experience (years)</label>
        <input
            v-model="user.experience"
            type="number"
            id="experience"
            class="w-full p-2 mb-4 bg-gray-700 rounded"
            placeholder="Enter years of experience"
        />
        <p v-if="errors.experience" class="text-red-500 mb-4">{{ errors.experience }}</p>

        <label for="location" class="block mb-2">Location</label>
        <input
            v-model="user.location"
            type="text"
            id="location"
            class="w-full p-2 mb-4 bg-gray-700 rounded"
            placeholder="Enter location (e.g., New York, USA)"
        />
        <p v-if="errors.location" class="text-red-500 mb-4">{{ errors.location }}</p>

        <!-- Technologies Section -->
        <label for="technologies" class="block mb-2">Technologies</label>
        <div class="flex flex-wrap items-center">
          <input
              type="text"
              v-model="technologyInput"
              @keydown.enter.prevent="addTechnology"
              class="p-2 mb-4 bg-gray-700 rounded w-full"
              placeholder="Enter technology and press Enter"
          />
          <div class="flex flex-wrap">
            <span
                v-for="(tech, index) in user.technologies"
                :key="index"
                class="bg-blue-600 text-white py-1 px-3 rounded-full mr-2 mb-2 flex items-center"
            >
              {{ tech }}
              <button @click="removeTechnology(index)" type="button" class="ml-2">&times;</button>
            </span>
          </div>
        </div>

        <!-- Contacts Section -->
        <label for="contacts" class="block mb-2">Contacts</label>
        <div class="mb-4">
          <input
              v-model="user.contacts.email"
              type="email"
              id="contacts-email"
              class="w-full p-2 mb-2 bg-gray-700 rounded"
              placeholder="Email"
          />
          <p v-if="errors.email" class="text-red-500 mb-4">{{ errors.email }}</p>

          <input
              v-model="user.contacts.linkedin"
              type="text"
              id="contacts-linkedin"
              class="w-full p-2 mb-2 bg-gray-700 rounded"
              placeholder="LinkedIn URL"
          />
          <p v-if="errors.linkedin" class="text-red-500 mb-4">{{ errors.linkedin }}</p>

          <input
              v-model="user.contacts.github"
              type="text"
              id="contacts-github"
              class="w-full p-2 mb-2 bg-gray-700 rounded"
              placeholder="GitHub URL"
          />
          <p v-if="errors.github" class="text-red-500 mb-4">{{ errors.github }}</p>

          <input
              v-model="user.contacts.phone"
              type="text"
              id="contacts-phone"
              class="w-full p-2 bg-gray-700 rounded"
              placeholder="Phone Number"
          />
        </div>

        <!-- Codewars Username Section -->
        <Codewars v-model:username="user.codewarsUsername" :codewars-data="codewarsData" />

        <!-- Displaying Codewars Data -->
        <div v-if="codewarsData" class="bg-gray-700 p-4 rounded mb-6">
          <h2 class="text-lg font-bold mb-2">Codewars Information</h2>
          <p><strong>Username:</strong> {{ codewarsData.username }}</p>
          <p><strong>Honor:</strong> {{ codewarsData.honor }}</p>
          <p><strong>Clan:</strong> {{ codewarsData.clan }}</p>
          <p><strong>Leaderboard Position:</strong> {{ codewarsData.leaderboardPosition }}</p>
        </div>
      </div>

      <button :disabled="isLoading" type="submit" class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded text-white">
        <span v-if="isLoading">Saving...</span>
        <span v-else>Save Profile</span>
      </button>
    </form>
  </div>
</template>
