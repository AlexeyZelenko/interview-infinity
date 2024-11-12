<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

// Импорт Heroicons для иконок
import { PlusCircleIcon, TrashIcon } from '@heroicons/vue/24/outline';

// Интерфейс для описания структуры Experience
interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
  location?: string;
  employmentType?: string;
  achievements?: string[];
  technologies?: string[];
  teamSize?: string;
  responsibilities?: string[];
}

// Пропсы и события
const props = defineProps<{
  experiences: Experience[];
  employmentTypes: string[];
}>();

const emit = defineEmits<{
  (e: 'add', experience: Experience): void;
  (e: 'remove', id: string): void;
  (e: 'update', experience: Experience): void;
}>();

// Функция добавления нового опыта работы
const addNewExperience = () => {
  const newExperience: Experience = {
    id: Date.now().toString(),
    title: '',
    company: '',
    startDate: '',
    endDate: null,
    current: false,
    description: '',
    location: '',
    employmentType: '',
    achievements: [],
    technologies: [],
    teamSize: '',
    responsibilities: [],
  };
  emit('add', newExperience);
};

// Функция обновления опыта работы
const updateExperience = (experience: Experience) => {
  emit('update', experience);
};

// Функция удаления опыта работы
const removeExperience = (experienceId: string) => {
  emit('remove', experienceId);
};

// Функция переключения текущей работы
const toggleCurrentJob = (experience: Experience) => {
  experience.current = !experience.current;
  if (experience.current) {
    experience.endDate = null;
  }
  updateExperience(experience);
};
</script>

<template>
  <div class="bg-gray-800 rounded-lg p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold text-white">Experience</h3>
      <button
          @click.prevent="addNewExperience"
          class="text-primary-400 hover:text-primary-300 flex items-center gap-1"
      >
        <PlusCircleIcon class="w-5 h-5" />
        Add Experience
      </button>
    </div>

    <div v-if="!experiences || experiences.length === 0" class="text-center text-gray-400">
      <p>No experiences added. Click "Add Experience" to create one.</p>
    </div>

    <div v-else class="space-y-6">
      <div
          v-for="exp in experiences"
          :key="exp.id"
          class="border-l-2 border-gray-700 pl-4"
      >
        <!-- Форма редактирования опыта работы -->
        <div class="space-y-4">
          <!-- Поля формы для опыта работы -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2 text-white">Job Title</label>
              <input
                  v-model="exp.title"
                  type="text"
                  required
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white"
                  @input="updateExperience(exp)"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2 text-white">Company</label>
              <input
                  v-model="exp.company"
                  type="text"
                  required
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white"
                  @input="updateExperience(exp)"
              />
            </div>
          </div>

          <!-- Даты и текущая позиция -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2 text-white">Start Date</label>
              <input
                  v-model="exp.startDate"
                  type="month"
                  required
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white"
                  @input="updateExperience(exp)"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2 text-white">End Date</label>
              <div class="space-y-2">
                <input
                    v-if="!exp.current"
                    v-model="exp.endDate"
                    type="month"
                    required
                    class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white"
                    @input="updateExperience(exp)"
                />
                <label class="flex items-center text-white">
                  <input
                      type="checkbox"
                      :checked="exp.current"
                      @change.prevent="toggleCurrentJob(exp)"
                      class="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
                  />
                  <span class="ml-2">Current Position</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Кнопка удаления опыта -->
          <button
              @click.prevent="removeExperience(exp.id)"
              class="text-red-400 hover:text-red-300 mt-4 flex items-center gap-1"
          >
            <TrashIcon class="w-5 h-5" />
            Remove Experience
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
