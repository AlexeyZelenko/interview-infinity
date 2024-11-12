<script setup lang="ts">
import { ref } from 'vue';
import { read, utils } from 'xlsx';
import { db, storage } from '../../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
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
    ['Question', 'Option1', 'Option2', 'Option3', 'Option4', 'CorrectAnswer', 'Explanation'],
    ['What is Vue.js?', 'A framework', 'A library', 'A database', 'A server', '1', 'Vue.js is a progressive JavaScript framework']
  ];

  const worksheet = utils.aoa_to_sheet(data);
  utils.book_append_sheet(workbook, worksheet, 'Test Template');

  utils.writeFile(workbook, 'test_template.xlsx');
};

const validateQuestions = (questions: any[]): boolean => {
  return questions.every(q =>
      q.text &&
      q.options?.length === 4 &&
      q.options.every((opt: string) => opt?.trim()) &&
      typeof q.correctAnswer === 'number' &&
      q.correctAnswer >= 0 &&
      q.correctAnswer < 4
  );
};

const parseExcel = async (file: File) => {
  const data = await file.arrayBuffer();
  const workbook = read(data);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = utils.sheet_to_json(worksheet);

  return jsonData.map((row: any) => ({
    text: row.Question,
    options: [row.Option1, row.Option2, row.Option3, row.Option4],
    correctAnswer: parseInt(row.CorrectAnswer) - 1,
    explanation: row.Explanation || ''
  }));
};

const handleSubmit = async () => {
  if (!formData.value.questions) {
    error.value = 'Please upload questions file';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    // Parse and validate questions
    const questions = await parseExcel(formData.value.questions);
    if (!validateQuestions(questions)) {
      throw new Error('Invalid questions format. Please check the template and try again.');
    }

    // Upload file to Storage
    const fileRef = storageRef(storage, `company-tests/${authStore.user?.uid}/${Date.now()}_${formData.value.questions.name}`);
    await uploadBytes(fileRef, formData.value.questions);
    const fileUrl = await getDownloadURL(fileRef);

    // Save test to Firestore
    await addDoc(collection(db, 'tests'), {
      title: formData.value.title,
      description: formData.value.description,
      category: formData.value.category,
      difficulty: formData.value.difficulty,
      duration: formData.value.duration,
      questions,
      createdBy: authStore.user?.uid,
      companyId: authStore.user?.uid,
      createdAt: new Date().toISOString(),
      status: 'active',
      fileUrl
    });

    success.value = true;
    formData.value = {
      title: '',
      description: '',
      category: '',
      difficulty: 'intermediate',
      duration: 30,
      questions: null
    };

  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-3xl">
    <div class="bg-gray-800 rounded-lg p-6">
      <h2 class="text-2xl font-bold mb-6">Create Custom Test</h2>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="block text-sm font-medium mb-2">Test Title</label>
          <input
              v-model="formData.title"
              type="text"
              required
              class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Description</label>
          <textarea
              v-model="formData.description"
              required
              rows="3"
              class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
          ></textarea>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
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

          <div>
            <label class="block text-sm font-medium mb-2">Difficulty</label>
            <select
                v-model="formData.difficulty"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
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
              min="1"
              required
              class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="block text-sm font-medium">Questions File</label>
            <button
                type="button"
                @click="downloadTemplate"
                class="text-primary-400 hover:text-primary-300"
            >
              Download Template
            </button>
          </div>
          <input
              type="file"
              accept=".xlsx,.xls,.csv"
              @change="handleFileUpload"
              class="block w-full text-sm text-gray-300
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
          Test created successfully!
        </div>

        <button
            type="submit"
            :disabled="loading"
            class="w-full bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:opacity-50"
        >
          {{ loading ? 'Creating Test...' : 'Create Test' }}
        </button>
      </form>
    </div>

    <div class="mt-8 bg-gray-800 rounded-lg p-6">
      <h3 class="text-xl font-bold mb-4">File Format Instructions</h3>

      <div class="space-y-4">
        <div>
          <h4 class="font-medium mb-2">Required Columns:</h4>
          <ul class="list-disc list-inside text-gray-300">
            <li>Question: The question text</li>
            <li>Option1: First answer option</li>
            <li>Option2: Second answer option</li>
            <li>Option3: Third answer option</li>
            <li>Option4: Fourth answer option</li>
            <li>CorrectAnswer: Number (1-4) indicating the correct option</li>
            <li>Explanation: (Optional) Explanation for the correct answer</li>
          </ul>
        </div>

        <div>
          <h4 class="font-medium mb-2">Tips:</h4>
          <ul class="list-disc list-inside text-gray-300">
            <li>Download and use our template for the correct format</li>
            <li>Ensure all questions have exactly 4 options</li>
            <li>Mark the correct answer with a number from 1 to 4</li>
            <li>Keep questions clear and concise</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>