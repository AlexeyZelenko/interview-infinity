<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

// Импорт иконок Heroicons
import { PlusCircleIcon, TrashIcon, CheckCircleIcon } from '@heroicons/vue/24/outline';

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

const props = defineProps<{
  education: Education[];
  isEditing: boolean;
}>();

const emit = defineEmits<{
  (e: 'add'): void;
  (e: 'remove', id: string): void;
  (e: 'update', education: Education): void;
  (e: 'save', education: Education): void;
}>();

// Function to add a new, empty education entry
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
  emit('add'); // Emit add event
  props.education.push(newEducation); // Add new entry to the array
};

const saveEducation = (education: Education) => {
  emit('save', education); // Emit save event with the education object
};
</script>

<template>
  <div class="bg-gray-800 rounded-lg p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold">Education</h3>
      <button
          v-if="isEditing"
          @click.prevent="addNewEducation"
          class="text-primary-400 hover:text-primary-300 flex items-center gap-2"
      >
        <PlusCircleIcon class="w-5 h-5"/>
        Add Education
      </button>
    </div>

    <div v-if="education.length === 0" class="text-center text-gray-400">
      <p>No education entries added. Click "Add Education" to create one.</p>
    </div>

    <div class="space-y-6">
      <div
          v-for="edu in education"
          :key="edu.id"
      >
        <div v-if="isEditing" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Degree</label>
              <input
                  v-model="edu.degree"
                  type="text"
                  required
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  @input.prevent="emit('update', { ...edu })"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Field of Study</label>
              <input
                  v-model="edu.field"
                  type="text"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  @input.prevent="emit('update', { ...edu })"
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
                  @input.prevent="emit('update', { ...edu })"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Location</label>
              <input
                  v-model="edu.location"
                  type="text"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  @input.prevent="emit('update', { ...edu })"
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
                  @input.prevent="emit('update', { ...edu })"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">GPA</label>
              <input
                  v-model="edu.gpa"
                  type="text"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  @input.prevent="emit('update', { ...edu })"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Relevant Courses</label>
            <input
                v-model="edu.courses"
                type="text"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                @input.prevent="emit('update', { ...edu })"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Activities & Societies</label>
            <input
                v-model="edu.activities"
                type="text"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                @input.prevent="emit('update', { ...edu })"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Awards & Honors</label>
            <input
                v-model="edu.awards"
                type="text"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                @input.prevent="emit('update', { ...edu })"
            />
          </div>

          <div class="flex items-center gap-4">
            <button
                @click.prevent="emit('remove', edu.id)"
                class="text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <TrashIcon class="w-5 h-5"/>
              Remove
            </button>
            <button
                @click.prevent="saveEducation(edu)"
                class="text-green-400 hover:text-green-300 flex items-center gap-1"
            >
              <CheckCircleIcon class="w-5 h-5"/>
              Save
            </button>
          </div>
        </div>
        <div v-else>
          <h4 class="font-semibold">
            {{ edu.degree }}{{ edu.field ? ` in ${edu.field}` : '' }}
          </h4>
          <p class="text-gray-300">{{ edu.school }}</p>
          <p class="text-sm text-gray-400">
            {{ edu.location }} • {{ edu.year }}
            {{ edu.gpa ? `• GPA: ${edu.gpa}` : '' }}
          </p>

          <div v-if="edu.courses?.length" class="mt-2">
            <p class="text-sm font-medium text-gray-400">Relevant Courses:</p>
            <p class="text-sm text-gray-300">{{ edu.courses }}</p>
          </div>

          <div v-if="edu.activities?.length" class="mt-2">
            <p class="text-sm font-medium text-gray-400">Activities & Societies:</p>
            <p class="text-sm text-gray-300">{{ edu.activities }}</p>
          </div>

          <div v-if="edu.awards?.length" class="mt-2">
            <p class="text-sm font-medium text-gray-400">Awards & Honors:</p>
            <p class="text-sm text-gray-300">{{ edu.awards }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
