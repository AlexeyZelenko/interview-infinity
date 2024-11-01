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

const testTitle = ref('');
const testDescription = ref('');
const testDuration = ref(60);
const testDifficulty = ref<'beginner' | 'intermediate' | 'advanced'>('intermediate');
const templateFile = ref<File | null>(null);

interface TestQuestion {
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const validateQuestions = (questions: any[]): TestQuestion[] => {
  return questions.map((q, index) => {
    if (!q.text || !q.options || !Array.isArray(q.options) || q.options.length !== 4 || 
        typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
      throw new Error(`Invalid question format at row ${index + 1}`);
    }
    return {
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || ''
    };
  });
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

const parseCSV = async (file: File) => {
  const text = await file.text();
  const rows = text.split('\n').map(row => row.split(','));
  const headers = rows[0];

  return rows.slice(1).map(row => ({
    text: row[0],
    options: [row[1], row[2], row[3], row[4]],
    correctAnswer: parseInt(row[5]) - 1,
    explanation: row[6] || ''
  }));
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

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    templateFile.value = input.files[0];
  }
};

const handleSubmit = async () => {
  if (!templateFile.value) {
    error.value = 'Please select a file';
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = false;

  try {
    let questions;
    if (templateFile.value.name.endsWith('.xlsx') || templateFile.value.name.endsWith('.xls')) {
      questions = await parseExcel(templateFile.value);
    } else if (templateFile.value.name.endsWith('.csv')) {
      questions = await parseCSV(templateFile.value);
    } else {
      throw new Error('Unsupported file format');
    }

    const validatedQuestions = validateQuestions(questions);

    // Upload file to Storage
    const fileRef = storageRef(storage, `tests/${authStore.user?.uid}/${Date.now()}_${templateFile.value.name}`);
    await uploadBytes(fileRef, templateFile.value);
    const fileUrl = await getDownloadURL(fileRef);

    // Save test to Firestore
    await addDoc(collection(db, 'tests'), {
      title: testTitle.value,
      description: testDescription.value,
      duration: testDuration.value,
      difficulty: testDifficulty.value,
      questions: validatedQuestions,
      createdBy: authStore.user?.uid,
      createdAt: new Date().toISOString(),
      fileUrl
    });

    success.value = true;
    testTitle.value = '';
    testDescription.value = '';
    testDuration.value = 60;
    testDifficulty.value = 'intermediate';
    templateFile.value = null;

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
            v-model="testTitle"
            type="text"
            required
            class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Description</label>
          <textarea
            v-model="testDescription"
            required
            rows="3"
            class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
          ></textarea>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium mb-2">Duration (minutes)</label>
            <input
              v-model="testDuration"
              type="number"
              min="1"
              required
              class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Difficulty</label>
            <select
              v-model="testDifficulty"
              class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Upload Questions</label>
          <div class="flex items-center space-x-4">
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
            <button
              type="button"
              @click="downloadTemplate"
              class="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600"
            >
              Download Template
            </button>
          </div>
          <p class="mt-2 text-sm text-gray-400">
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