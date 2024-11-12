<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';

// Импорт Heroicons для иконок
import { PlusCircleIcon, TrashIcon } from '@heroicons/vue/24/outline';

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

const props = defineProps<{
  experiences: Experience[];
  isEditing: boolean;
  employmentTypes: string[];
}>();

const emit = defineEmits<{
  (e: 'add'): void;
  (e: 'remove', id: string): void;
  (e: 'update', experience: Experience): void;
}>();

const newAchievement = ref('');

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
  emit('add'); // Эмитирование события добавления
  props.experiences.push(newExperience); // Добавление нового опыта в массив
};

const addAchievement = (experience: Experience) => {
  if (!newAchievement.value.trim()) return;
  if (!experience.achievements) experience.achievements = [];
  experience.achievements.push(newAchievement.value.trim());
  newAchievement.value = '';
  emit('update', { ...experience });
};

const removeAchievement = (experience: Experience, index: number) => {
  experience.achievements?.splice(index, 1);
  emit('update', { ...experience });
};

const toggleCurrentJob = (experience: Experience) => {
  experience.current = !experience.current;
  if (experience.current) {
    experience.endDate = null;
  }
  emit('update', { ...experience });
};
</script>

<template>
  <div class="bg-gray-800 rounded-lg p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold text-white">Experience</h3>
      <button
          v-if="isEditing"
          @click.prevent="addNewExperience"
          class="text-primary-400 hover:text-primary-300 flex items-center gap-1"
      >
        <PlusCircleIcon class="w-5 h-5"/>
        Add Experience
      </button>
    </div>

    <div v-if="experiences.length === 0" class="text-center text-gray-400">
      <p>No experiences added. Click "Add Experience" to create one.</p>
    </div>

    <div class="space-y-6">
      <div
          v-for="exp in experiences"
          :key="exp.id"
          class="border-l-2 border-gray-700 pl-4"
      >
        <!-- Форма редактирования опыта работы -->
        <div v-if="isEditing" class="space-y-4">
          <!-- Поля формы для опыта работы -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2 text-white">Job Title</label>
              <input
                  v-model="exp.title"
                  type="text"
                  required
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white"
                  @input.prevent="emit('update', { ...exp })"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2 text-white">Company</label>
              <input
                  v-model="exp.company"
                  type="text"
                  required
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white"
                  @input.prevent="emit('update', { ...exp })"
              />
            </div>
          </div>

          <!-- Дополнительные поля -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2 text-white">Location</label>
              <input
                  v-model="exp.location"
                  type="text"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white"
                  placeholder="e.g., San Francisco, CA"
                  @input.prevent="emit('update', { ...exp })"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2 text-white">Employment Type</label>
              <select
                  v-model="exp.employmentType"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white"
                  @change.prevent="emit('update', { ...exp })"
              >
                <option v-for="type in employmentTypes" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>
          </div>

          <!-- Даты -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2 text-white">Start Date</label>
              <input
                  v-model="exp.startDate"
                  type="month"
                  required
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white"
                  @input.prevent="emit('update', { ...exp })"
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
                    @input.prevent="emit('update', { ...exp })"
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

          <!-- Описание -->
          <div>
            <label class="block text-sm font-medium mb-2 text-white">Description</label>
            <textarea
                v-model="exp.description"
                rows="3"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white"
                @input.prevent="emit('update', { ...exp })"
            ></textarea>
          </div>

          <!-- Достижения -->
          <div>
            <label class="block text-sm font-medium mb-2 text-white">Key Achievements</label>
            <div class="space-y-2">
              <div v-for="(achievement, index) in exp.achievements" :key="index" class="flex gap-2">
                <input
                    v-model="exp.achievements[index]"
                    type="text"
                    class="flex-1 px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white"
                />
                <button
                    @click.prevent="removeAchievement(exp, index)"
                    class="text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <TrashIcon class="w-5 h-5"/>
                  Remove
                </button>
              </div>
              <div class="flex gap-2">
                <input
                    v-model="newAchievement"
                    type="text"
                    class="flex-1 px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white"
                    placeholder="Add an achievement"
                    @keyup.enter="addAchievement(exp)"
                />
                <button
                    @click.prevent="addAchievement(exp)"
                    class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                >
                  <PlusCircleIcon class="w-5 h-5"/>
                  Add
                </button>
              </div>
            </div>
          </div>

          <button
              @click.prevent="emit('remove', exp.id)"
              class="text-red-400 hover:text-red-300 mt-4 flex items-center gap-1"
          >
            <TrashIcon class="w-5 h-5"/>
            Remove Experience
          </button>
        </div>

        <!-- Режим отображения -->
        <div v-else class="space-y-4">
          <!-- Поля отображения опыта работы -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2 text-white">Job Title</label>
              <p class="px-3 py-2 bg-gray-700 rounded-md text-white">{{ exp.title }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2 text-white">Company</label>
              <p class="px-3 py-2 bg-gray-700 rounded-md text-white">{{ exp.company }}</p>
            </div>
          </div>

          <!-- Дополнительные поля -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2 text-white">Location</label>
              <p class="px-3 py-2 bg-gray-700 rounded-md text-white">{{ exp.location || 'N/A' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2 text-white">Employment Type</label>
              <p class="px-3 py-2 bg-gray-700 rounded-md text-white">{{ exp.employmentType || 'N/A' }}</p>
            </div>
          </div>

          <!-- Даты -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2 text-white">Start Date</label>
              <p class="px-3 py-2 bg-gray-700 rounded-md text-white">{{ exp.startDate || 'N/A' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2 text-white">End Date</label>
              <p class="px-3 py-2 bg-gray-700 rounded-md text-white">
                {{ exp.current ? 'Current Position' : exp.endDate || 'N/A' }}
              </p>
            </div>
          </div>

          <!-- Описание -->
          <div>
            <label class="block text-sm font-medium mb-2 text-white">Description</label>
            <p class="px-3 py-2 bg-gray-700 rounded-md text-white">{{ exp.description || 'N/A' }}</p>
          </div>

          <!-- Достижения -->
          <div>
            <label class="block text-sm font-medium mb-2 text-white">Key Achievements</label>
            <ul class="space-y-2">
              <li v-for="(achievement, index) in exp.achievements" :key="index" class="px-3 py-2 bg-gray-700 rounded-md text-white">
                {{ achievement }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
