<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Upload Tests</h1>

    <div class="bg-gray-800 rounded-lg p-6">
      <div class="mb-6">
        <h2 class="text-xl font-semibold mb-4">Upload Test File</h2>
        <div class="space-y-4">
          <!-- Test Title -->
          <div>
            <label class="block text-sm font-medium mb-2">Test Title</label>
            <input
                v-model="testTitle"
                type="text"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter test title"
            />
          </div>

          <!-- Test Description -->
          <div>
            <label class="block text-sm font-medium mb-2">Description</label>
            <textarea
                v-model="testDescription"
                rows="3"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter test description"
            ></textarea>
          </div>

          <!-- Test Category -->
          <div>
            <label class="block text-sm font-medium mb-2">Test Category</label>
            <select
                v-model="category"
                required
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select category</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <!-- Difficulty and Duration -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Difficulty</label>
              <select
                  v-model="difficulty"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Duration (minutes)</label>
              <input
                  v-model.number="duration"
                  type="number"
                  min="1"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <!-- File Upload -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="block text-sm font-medium">Test File (Excel/CSV)</label>
              <button
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

          <button
              @click="uploadFile"
              :disabled="!selectedFile || !category || uploading"
              class="w-full px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
          >
            {{ uploading ? 'Uploading...' : 'Upload Test' }}
          </button>

          <div v-if="error" class="text-red-400 text-sm">
            {{ error }}
          </div>

          <div v-if="success" class="text-green-400 text-sm">
            File uploaded successfully!
          </div>
        </div>
      </div>

      <!-- Upload History -->
      <div class="mt-8">
        <h2 class="text-xl font-semibold mb-4">Upload History</h2>
        <div class="space-y-4">
          <div v-for="upload in uploadHistory" :key="upload.id" class="bg-gray-700 p-4 rounded-lg">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-medium">{{ upload.filename }}</p>
                <p class="text-sm text-gray-400">Category: {{ upload.category }}</p>
                <p class="text-sm text-gray-400">
                  Uploaded on {{ new Date(upload.timestamp).toLocaleString() }}
                </p>
              </div>
              <span
                  :class="[
                  'px-2 py-1 rounded-full text-sm',
                  upload.status === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                ]"
              >
                {{ upload.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { read, utils, write } from 'xlsx';
import { db, storage } from '../../firebase/config';
import { collection, doc, setDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

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

// Form fields
const category = ref('');
const testTitle = ref('');
const testDescription = ref('');
const difficulty = ref('intermediate');
const duration = ref(30);
const selectedFile = ref<File | null>(null);
const uploading = ref(false);
const error = ref('');
const success = ref(false);
const uploadHistory = ref<any[]>([]);

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    selectedFile.value = input.files[0];
    error.value = '';
    success.value = false;
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


const uploadFile = async () => {
  if (!selectedFile.value || !category.value) return;

  uploading.value = true;
  error.value = '';
  success.value = false;

  try {
    const data = await selectedFile.value.arrayBuffer();
    const workbook = read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = utils.sheet_to_json(worksheet);

    // Validate data format
    if (!validateQuestions(jsonData)) {
      throw new Error('Invalid file format. Please use the provided template.');
    }

    // Get metadata from first row if available
    const firstRow: any = jsonData[0];
    const title = testTitle.value || firstRow.Title || `${category.value} Test`;
    const description = testDescription.value || firstRow.Description || `Test questions for ${category.value}`;
    const testDifficulty = difficulty.value || firstRow.Difficulty || 'intermediate';
    const testDuration = duration.value || firstRow.Duration || 30;

    // Create document reference first to get the ID
    const testsRef = collection(db, 'tests');
    const newTestRef = doc(testsRef);
    const testId = newTestRef.id;

    // Upload file to Firebase Storage using the document ID
    const fileRef = storageRef(storage, `test-files/${category.value}/${testId}_${selectedFile.value.name}`);
    await uploadBytes(fileRef, selectedFile.value);
    const fileUrl = await getDownloadURL(fileRef);

    // Format questions for Firestore
    const questions = jsonData.map((row: any) => ({
      text: row.Question,
      options: [row.Option1, row.Option2, row.Option3, row.Option4],
      correctAnswer: parseInt(row.CorrectAnswer) - 1,
      explanation: row.Explanation || ''
    }));

    // Save test to Firestore with all fields
    const testData = {
      id: testId,
      title,
      description,
      category: category.value,
      difficulty: testDifficulty,
      duration: testDuration,
      questions,
      fileUrl,
      uploadedAt: new Date().toISOString(),
      status: 'active',
      submissions: 0,
      successRate: 0
    };

    await setDoc(newTestRef, testData);

    // Add to upload history
    const historyEntry = {
      id: testId,
      filename: selectedFile.value.name,
      category: category.value,
      timestamp: new Date().toISOString(),
      status: 'success'
    };

    uploadHistory.value.unshift(historyEntry);
    success.value = true;

    // Reset form
    selectedFile.value = null;
    category.value = '';
    testTitle.value = '';
    testDescription.value = '';
    difficulty.value = 'intermediate';
    duration.value = 30;

  } catch (err: any) {
    error.value = err.message;
    uploadHistory.value.unshift({
      id: Date.now(),
      filename: selectedFile.value.name,
      category: category.value,
      timestamp: new Date().toISOString(),
      status: 'error'
    });
  } finally {
    uploading.value = false;
  }
};

const validateQuestions = (data: any[]) => {
  return data.every(row =>
      row.Question &&
      row.Option1 &&
      row.Option2 &&
      row.Option3 &&
      row.Option4 &&
      row.CorrectAnswer &&
      parseInt(row.CorrectAnswer) >= 1 &&
      parseInt(row.CorrectAnswer) <= 4
  );
};

const loadUploadHistory = async () => {
  try {
    const testsQuery = query(
        collection(db, 'tests'),
        orderBy('uploadedAt', 'desc'),
        limit(10)
    );

    const querySnapshot = await getDocs(testsQuery);
    uploadHistory.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      status: 'success'
    }));
  } catch (err) {
    console.error('Error loading upload history:', err);
  }
};

onMounted(() => {
  loadUploadHistory();
});
</script>
