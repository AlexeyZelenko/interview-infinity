<template>
  <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Submit New Test</h2>
        <button @click="emit('close')" class="text-gray-400 hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="submitTest" class="space-y-6">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium mb-2">Test Title</label>
          <input
              v-model="formData.title"
              type="text"
              required
              class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Advanced Vue.js Concepts"
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium mb-2">Description</label>
          <textarea
              v-model="formData.description"
              required
              rows="3"
              class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="Describe what the test covers..."
          ></textarea>
        </div>

        <div class="grid md:grid-cols-3 gap-4">
          <!-- Category -->
          <div>
            <label class="block text-sm font-medium mb-2">Category</label>
            <select
                v-model="formData.category"
                required
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select category</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>

          <!-- Difficulty -->
          <div>
            <label class="block text-sm font-medium mb-2">Difficulty</label>
            <select
                v-model="formData.difficulty"
                required
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option v-for="diff in difficulties" :key="diff.value" :value="diff.value">
                {{ diff.label }}
              </option>
            </select>
          </div>

          <!-- Duration -->
          <div>
            <label class="block text-sm font-medium mb-2">Duration (minutes)</label>
            <input
                v-model.number="formData.duration"
                type="number"
                required
                min="5"
                max="120"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <!-- Questions File -->
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
              class="block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-primary-600 file:text-white
              hover:file:bg-primary-700"
          />
          <p class="mt-1 text-sm text-gray-400">
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
              class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
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

<script setup lang="ts">
import { ref } from 'vue';
import { useTestStore } from '../../stores/tests';
import { utils, write } from 'xlsx';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();


const emit = defineEmits<{
  (e: 'close'): void;
}>();

const testStore = useTestStore();
const loading = ref(false);
const error = ref('');
const success = ref(false);

interface FormData {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  questions: File | null;
}

const formData = ref<FormData>({
  title: '',
  description: '',
  category: '',
  difficulty: 'intermediate',
  duration: 30,
  questions: null
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
  'DevOps'
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
  const workbook = utils.book_new();
  const data = [
    ['Question', 'Option1', 'Option2', 'Option3', 'Option4', 'CorrectAnswer', 'Explanation', 'Title', 'Description', 'Difficulty', 'Duration'],
    [
      'What is Vue.js?',
      'A framework',
      'A library',
      'A database',
      'A server',
      '1',
      'Vue.js is a progressive JavaScript framework',
      'Vue.js Basics',
      'Test your knowledge of Vue.js fundamentals',
      'intermediate',
      '30'
    ]
  ];

  const worksheet = utils.aoa_to_sheet(data);
  utils.book_append_sheet(workbook, worksheet, 'Test Template');

  const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'test_template.xlsx';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const submitTest = async () => {
  if (!formData.value.questions) {
    error.value = 'Please upload questions file';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    // Создаем объект с данными для отправки
    const submissionData = {
      title: formData.value.title,
      description: formData.value.description,
      category: formData.value.category,
      difficulty: formData.value.difficulty,
      duration: formData.value.duration,
      questionsFile: formData.value.questions, // Передаем сам файл
      submittedBy: authStore.user?.uid || 'anonymous',
      submittedAt: new Date().toISOString(),
      adminEmail: 'infinitydevelopinfinity@gmail.com'
    };

    await testStore.submitTest(submissionData);
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
