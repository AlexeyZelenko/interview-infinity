<script setup lang="ts">
import { ref } from 'vue';
import { useTestStore } from '../../stores/tests';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const testStore = useTestStore();
const loading = ref(false);
const error = ref('');
const success = ref(false);

const formData = ref({
  title: '',
  description: '',
  category: '',
  difficulty: 'intermediate',
  duration: 30,
  questions: null as File | null
});

const categories = [
  'JavaScript',
  'TypeScript',
  'Vue.js',
  'React',
  'Node.js',
  'Python',
  'Java',
  'Database',
  'DevOps',
  'Other'
];

const difficulties = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    formData.value.questions = input.files[0];
  }
};

const downloadTemplate = () => {
  // Implementation for downloading template
};

const submitTest = async () => {
  if (!formData.value.questions) {
    error.value = 'Please upload questions file';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    await testStore.submitTest({
      ...formData.value,
      adminEmail: 'infinitydevelopinfinity@gmail.com'
    });
    success.value = true;
    setTimeout(() => {
      emit('close');
    }, 2000);
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-light-card dark:bg-dark-card rounded-lg p-6 max-w-2xl w-full mx-4">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Submit New Test</h2>
        <button @click="emit('close')" class="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="submitTest" class="space-y-6">
        <div>
          <label class="block text-sm font-medium mb-2">Test Title</label>
          <input
              v-model="formData.title"
              type="text"
              required
              class="w-full px-3 py-2 bg-light-hover dark:bg-dark-hover rounded-md"
              placeholder="e.g., Advanced Vue.js Concepts"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Description</label>
          <textarea
              v-model="formData.description"
              required
              rows="3"
              class="w-full px-3 py-2 bg-light-hover dark:bg-dark-hover rounded-md"
              placeholder="Describe what the test covers..."
          ></textarea>
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Category</label>
            <select
                v-model="formData.category"
                required
                class="w-full px-3 py-2 bg-light-hover dark:bg-dark-hover rounded-md"
            >
              <option value="">Select category</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Difficulty</label>
            <select
                v-model="formData.difficulty"
                required
                class="w-full px-3 py-2 bg-light-hover dark:bg-dark-hover rounded-md"
            >
              <option v-for="diff in difficulties" :key="diff.value" :value="diff.value">
                {{ diff.label }}
              </option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Duration (minutes)</label>
          <input
              v-model.number="formData.duration"
              type="number"
              required
              min="5"
              max="120"
              class="w-full px-3 py-2 bg-light-hover dark:bg-dark-hover rounded-md"
          />
        </div>

        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="block text-sm font-medium">Questions File</label>
            <button
                type="button"
                @click="downloadTemplate"
                class="text-primary-400 hover:text-primary-300 text-sm"
            >
              Download Template
            </button>
          </div>
          <input
              type="file"
              accept=".xlsx,.xls,.csv"
              @change="handleFileUpload"
              required
              class="w-full text-sm text-light-text-secondary dark:text-dark-text-secondary
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-primary-600 file:text-white
              hover:file:bg-primary-700"
          />
          <p class="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Upload questions in Excel (.xlsx, .xls) or CSV format
          </p>
        </div>

        <div v-if="error" class="text-red-500 text-sm">
          {{ error }}
        </div>

        <div v-if="success" class="text-green-500 text-sm">
          Test submitted successfully! Redirecting...
        </div>

        <div class="flex justify-end gap-4">
          <button
              type="button"
              @click="emit('close')"
              class="px-4 py-2 bg-light-hover dark:bg-dark-hover rounded"
          >
            Cancel
          </button>
          <button
              type="submit"
              :disabled="loading"
              class="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
          >
            {{ loading ? 'Submitting...' : 'Submit Test' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>