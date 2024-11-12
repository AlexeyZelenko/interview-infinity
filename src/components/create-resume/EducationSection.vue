<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { PlusCircleIcon, TrashIcon } from '@heroicons/vue/24/outline';

// Интерфейс для описания структуры Education
interface Education {
  id: string;
  degree: string;
  school: string;
  year: string;
  field?: string;
  gpa?: string;
  courses?: string[];
  activities?: string[];
  awards?: string[];
  location?: string;
}

// Пропсы и события
const props = defineProps<{
  education: Education[];
}>();

const emit = defineEmits<{
  (e: 'add', education: Education): void;
  (e: 'remove', id: string): void;
  (e: 'update', education: Education): void;
}>();

// Функция для добавления новой записи об образовании
const addNewEducation = () => {
  const newEducation: Education = {
    id: Date.now().toString(),
    degree: '',
    school: '',
    year: '',
    field: '',
    gpa: '',
    courses: [],
    activities: [],
    awards: [],
    location: ''
  };
  emit('add', newEducation); // Эмитим событие добавления новой записи
};

// Функция для обновления записи об образовании
const updateEducation = (education: Education) => {
  emit('update', education); // Эмитим событие обновления
};

// Функция для удаления записи об образовании
const removeEducation = (id: string) => {
  emit('remove', id); // Эмитим событие удаления
};
</script>

<template>
  <div class="bg-gray-800 rounded-lg p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold">Education</h3>
      <button
          @click.prevent="addNewEducation"
          class="text-primary-400 hover:text-primary-300 flex items-center gap-2"
      >
        <PlusCircleIcon class="w-5 h-5" />
        Add Education
      </button>
    </div>

    <div v-if="!education || education.length === 0" class="text-center text-gray-400">
      <p>No education entries added. Click "Add Education" to create one.</p>
    </div>

    <div v-else class="space-y-6">
      <div
          v-for="edu in education"
          :key="edu.id"
      >
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Degree</label>
              <input
                  v-model="edu.degree"
                  type="text"
                  required
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  @input="updateEducation(edu)"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Field of Study</label>
              <input
                  v-model="edu.field"
                  type="text"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  @input="updateEducation(edu)"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">School</label>
              <input
                  v-model="edu.school"
                  type="text"
                  required
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  @input="updateEducation(edu)"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Location</label>
              <input
                  v-model="edu.location"
                  type="text"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  @input="updateEducation(edu)"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Graduation Year</label>
              <input
                  v-model="edu.year"
                  type="text"
                  required
                  pattern="\d{4}"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  @input="updateEducation(edu)"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">GPA</label>
              <input
                  v-model="edu.gpa"
                  type="text"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  @input="updateEducation(edu)"
              />
            </div>
          </div>

          <!-- Courses, Activities, and Awards -->
          <div>
            <label class="block text-sm font-medium mb-2">Relevant Courses</label>
            <input
                v-model="edu.courses"
                type="text"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                @input="updateEducation(edu)"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Activities & Societies</label>
            <input
                v-model="edu.activities"
                type="text"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                @input="updateEducation(edu)"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Awards & Honors</label>
            <input
                v-model="edu.awards"
                type="text"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                @input="updateEducation(edu)"
            />
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-4">
            <button
                @click.prevent="removeEducation(edu.id)"
                class="text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <TrashIcon class="w-5 h-5" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
