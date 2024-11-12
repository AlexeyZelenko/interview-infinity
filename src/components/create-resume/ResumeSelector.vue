<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  resumes: {
    id: string;
    title: string;
    isActive: boolean;
  }[];
  currentResumeId: string;
}>();

const emit = defineEmits<{
  (e: 'update:currentResumeId', id: string): void;
  (e: 'create'): void;
  (e: 'delete', id: string): void;
  (e: 'toggle-status', id: string): void;
}>();
</script>

<template>
  <div class="flex flex-col justify-between items-start">
    <div class="flex items-center mb-6 gap-6">
      <h2 class="text-2xl font-bold">Resumes</h2>
      <select
          :value="currentResumeId"
          @input="emit('update:currentResumeId', ($event.target as HTMLSelectElement).value)"
          class="bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
      >
        <option
            v-for="resume in resumes"
            :key="resume.id"
            :value="resume.id"
        >
          {{ resume.title }}
          {{ resume.isActive ? '(Active)' : '(Inactive)' }}
        </option>
      </select>
    </div>
    <div class="flex gap-2">
      <button
          @click.prevent="emit('create')"
          class="text-primary-400 hover:text-primary-300"
      >
        Create New
      </button>
      <button
          @click.prevent="emit('toggle-status', currentResumeId)"
          class="px-3 py-1 rounded"
          :class="resumes.find(r => r.id === currentResumeId)?.isActive
          ? 'bg-green-600 hover:bg-green-700'
          : 'bg-gray-600 hover:bg-gray-700'"
      >
        {{ resumes.find(r => r.id === currentResumeId)?.isActive ? 'Active' : 'Inactive' }}
      </button>
      <button
          @click.prevent="emit('delete', currentResumeId)"
          class="px-3 py-1 bg-red-600 rounded hover:bg-red-700"
      >
        Delete
      </button>
    </div>
  </div>
</template>