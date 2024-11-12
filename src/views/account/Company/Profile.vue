<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../../../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuthStore } from '../../../stores/auth';

// Импорт иконок Heroicons
import { BuildingOfficeIcon, InformationCircleIcon, PhoneIcon, ShareIcon } from '@heroicons/vue/24/outline';

// Инициализация состояния компании
const company = ref({
  name: '',
  description: '',
  industry: '',
  size: '',
  location: '',
  website: '',
  founded: '',
  socialLinks: {
    linkedin: '',
    twitter: '',
    github: ''
  }
});

const authStore = useAuthStore();
const isEditing = ref(false);
const loading = ref(false);
const error = ref('');
const companyId = ref<string | null>(authStore.user?.uid || null); // companyId назначается userId

// Функция для получения данных компании из Firestore
const fetchCompanyData = async () => {
  try {
    loading.value = true;

    if (companyId.value) {
      const docRef = doc(db, 'companies', companyId.value);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        company.value = docSnap.data();
      } else {
        console.log("Компания не найдена. Профиль будет создан при первом сохранении.");
      }
    }
  } catch (e) {
    error.value = 'Не удалось загрузить данные компании';
    console.error("Ошибка при получении данных компании:", e);
  } finally {
    loading.value = false;
  }
};

// Функция для сохранения или создания данных компании в Firestore
const saveCompanyData = async () => {
  try {
    loading.value = true;
    const docRef = doc(db, 'companies', companyId.value!);
    await setDoc(docRef, company.value, { merge: true });
    isEditing.value = false;
  } catch (e) {
    error.value = 'Не удалось сохранить данные';
    console.error("Ошибка при сохранении данных компании:", e);
  } finally {
    loading.value = false;
  }
};

// Функция для отмены редактирования
const cancelSaveCompanyData = () => {
  if (isEditing.value) {
    if (companyId.value) {
      isEditing.value = false;
      fetchCompanyData();
    } else {
      company.value = {
        name: '',
        description: '',
        industry: '',
        size: '',
        location: '',
        website: '',
        founded: '',
        socialLinks: {
          linkedin: '',
          twitter: '',
          github: ''
        }
      };
    }
  }
};

// Загрузка данных при монтировании компонента
onMounted(() => {
  fetchCompanyData();
});
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-3xl font-bold text-primary-400 flex items-center gap-2">
        <BuildingOfficeIcon class="h-8 w-8 text-primary-600" />
        Company Profile
      </h2>
      <div class="flex items-center">
        <button
            v-if="isEditing"
            @click="cancelSaveCompanyData"
            class="bg-red-600 text-white px-4 py-2 mr-2 rounded-lg transition duration-300 ease-in-out hover:bg-red-500 flex items-center gap-2"
            :disabled="loading"
        >
          <i class="fas fa-times"></i> Cancel
        </button>
        <button
            @click="isEditing ? saveCompanyData() : isEditing = true"
            class="bg-green-600 text-white px-4 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-green-500 flex items-center gap-2"
            :disabled="loading"
        >
          <i :class="isEditing ? 'fas fa-save' : 'fas fa-edit'"></i>
          {{ isEditing ? (loading ? 'Saving...' : 'Save') : 'Edit Profile' }}
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="text-red-500 bg-red-200 p-3 rounded-lg mb-4">
      <i class="fas fa-exclamation-circle"></i> {{ error }}
    </div>

    <!-- Profile Sections -->
    <div class="space-y-8">
      <!-- Basic Information -->
      <div class="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 class="text-xl font-semibold mb-4 text-primary-400 flex items-center gap-2">
          <InformationCircleIcon class="h-6 w-6 text-primary-600" />
          Basic Information
        </h3>
        <div class="grid gap-4">
          <div>
            <label class="block text-sm font-medium text-primary-200 mb-1">Company Name</label>
            <input
                v-if="isEditing"
                v-model="company.name"
                type="text"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 transition duration-200"
            >
            <p v-else class="text-gray-300">{{ company.name }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-primary-200 mb-1">Description</label>
            <textarea
                v-if="isEditing"
                v-model="company.description"
                rows="4"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 transition duration-200"
            ></textarea>
            <p v-else class="text-gray-300">{{ company.description }}</p>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-primary-200 mb-1">Industry</label>
              <input
                  v-if="isEditing"
                  v-model="company.industry"
                  type="text"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 transition duration-200"
              >
              <p v-else class="text-gray-300">{{ company.industry }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-primary-200 mb-1">Company Size</label>
              <input
                  v-if="isEditing"
                  v-model="company.size"
                  type="text"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 transition duration-200"
              >
              <p v-else class="text-gray-300">{{ company.size }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Information -->
      <div class="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 class="text-xl font-semibold mb-4 text-primary-400 flex items-center gap-2">
          <PhoneIcon class="h-6 w-6 text-primary-600" />
          Contact Information
        </h3>
        <div class="grid gap-4">
          <div>
            <label class="block text-sm font-medium text-primary-200 mb-1">Location</label>
            <input
                v-if="isEditing"
                v-model="company.location"
                type="text"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 transition duration-200"
            >
            <p v-else class="text-gray-300">{{ company.location }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-primary-200 mb-1">Website</label>
            <input
                v-if="isEditing"
                v-model="company.website"
                type="url"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 transition duration-200"
            >
            <a
                v-else
                :href="company.website"
                target="_blank"
                class="text-primary-400 hover:text-primary-300 underline"
            >
              {{ company.website }}
            </a>
          </div>
        </div>
      </div>

      <!-- Social Links -->
      <div class="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 class="text-xl font-semibold mb-4 text-primary-400 flex items-center gap-2">
          <ShareIcon class="h-6 w-6 text-primary-600" />
          Social Links
        </h3>
        <div class="grid gap-4">
          <div>
            <label class="block text-sm font-medium text-primary-200 mb-1">LinkedIn</label>
            <input
                v-if="isEditing"
                v-model="company.socialLinks.linkedin"
                type="url"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 transition duration-200"
            >
            <a
                v-else
                :href="company.socialLinks.linkedin"
                target="_blank"
                class="text-primary-400 hover:text-primary-300 underline"
            >
              {{ company.socialLinks.linkedin }}
            </a>
          </div>

          <div>
            <label class="block text-sm font-medium text-primary-200 mb-1">Twitter</label>
            <input
                v-if="isEditing"
                v-model="company.socialLinks.twitter"
                type="url"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 transition duration-200"
            >
            <a
                v-else
                :href="company.socialLinks.twitter"
                target="_blank"
                class="text-primary-400 hover:text-primary-300 underline"
            >
              {{ company.socialLinks.twitter }}
            </a>
          </div>

          <div>
            <label class="block text-sm font-medium text-primary-200 mb-1">GitHub</label>
            <input
                v-if="isEditing"
                v-model="company.socialLinks.github"
                type="url"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 transition duration-200"
            >
            <a
                v-else
                :href="company.socialLinks.github"
                target="_blank"
                class="text-primary-400 hover:text-primary-300 underline"
            >
              {{ company.socialLinks.github }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.job-item:hover {
  background-color: #374151;
}
.input {
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  background: #2d3748;
  border: 1px solid #4a5568;
}
</style>
