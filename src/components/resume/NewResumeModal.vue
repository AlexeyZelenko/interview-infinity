<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'create', title: string): void;
}>();

const title = ref('');
const error = ref('');

const handleSubmit = () => {
  if (!title.value.trim()) {
    error.value = 'Please enter a resume title';
    return;
  }

  emit('create', title.value);
  title.value = '';
  error.value = '';
};
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full">
      <h3 class="text-xl font-bold mb-4">Create New Resume</h3>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">Resume Title</label>
        <input
            v-model="title"
            type="text"
            class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., Full Stack Developer Resume"
        />
        <p v-if="error" class="mt-1 text-sm text-red-400">{{ error }}</p>
      </div>
      <div class="flex justify-end gap-2">
        <button
            @click="emit('close')"
            class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
            @click="handleSubmit"
            class="px-4 py-2 bg-primary-600 rounded hover:bg-primary-700"
        >
          Create
        </button>
      </div>
    </div>
  </div>
</template>