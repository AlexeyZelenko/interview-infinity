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

          <!-- Test Language -->
          <div>
            <label class="block text-sm font-medium mb-2">Language</label>
            <select
                v-model="language"
                required
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select category</option>
              <option v-for="language in languages" :key="language" :value="language">
                {{ language }}
              </option>
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
import { db, storage } from '@/firebase/config';
import { collection, doc, setDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';

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
  'Frontend',
  'Backend',
  'Fullstack',
    'HTML',
    'CSS',
    'HR'
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
const languages = ['EN', 'UA', 'RU'];
const language = ref('');

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
  // Проверяем обязательные поля
  if (!selectedFile.value) {
    error.value = 'Please select a file to upload.';
    return;
  }

  if (!category.value) {
    error.value = 'Please select a category.';
    return;
  }

  uploading.value = true;
  error.value = '';
  success.value = false;

  try {
    // Чтение файла в ArrayBuffer
    const data = await selectedFile.value.arrayBuffer();
    const workbook = read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    let jsonData = utils.sheet_to_json(worksheet);

    // Исправляем кодировку UTF-8 (если данные некорректны)
    jsonData = jsonData.map((row: any) =>
        Object.fromEntries(
            Object.entries(row).map(([key, value]) => [
              key,
              typeof value === 'string' ? decodeURIComponent(escape(value)) : value,
            ])
        )
    );

    // Логируем данные для проверки
    console.log('Parsed data:', jsonData);

    // Проверяем формат данных
    if (!validateQuestions(jsonData)) {
      throw new Error('Invalid file format. Please ensure all required columns are present and filled.');
    }

    // Получение метаданных из первой строки (если доступно)
    const firstRow: any = jsonData[0];
    const title = testTitle.value || firstRow.Title || `${category.value} Test`;
    const description = testDescription.value || firstRow.Description || `Test questions for ${category.value}`;
    const testDifficulty = difficulty.value || firstRow.Difficulty || 'intermediate';
    const testDuration = duration.value || firstRow.Duration || 30;

    // Создаём новый документ Firestore
    const testsRef = collection(db, 'tests');
    const newTestRef = doc(testsRef);
    const testId = newTestRef.id;

    // Загружаем файл в Firebase Storage
    const sanitizedCategory = category.value.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileRef = storageRef(storage, `test-files/${sanitizedCategory}/${testId}_${selectedFile.value.name}`);
    const uploadTask = uploadBytesResumable(fileRef, selectedFile.value);

    // Обработка прогресса загрузки
    uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.error('Upload failed:', error);
          throw new Error('Failed to upload file. Please try again.');
        }
    );

    // Дожидаемся завершения загрузки
    await uploadBytes(fileRef, selectedFile.value);
    const fileUrl = await getDownloadURL(fileRef);

    // Форматируем вопросы для Firestore
    const questions = jsonData.map((row: any) => ({
      text: row.Question,
      options: [row.Option1, row.Option2, row.Option3, row.Option4],
      correctAnswer: parseInt(row.CorrectAnswer) - 1,
      explanation: row.Explanation || '',
    }));

    // Сохраняем тест в Firestore
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
      successRate: 0,
      language: language.value,
    };

    await setDoc(newTestRef, testData);

    // Добавляем запись в историю загрузок
    uploadHistory.value.unshift({
      id: testId,
      filename: selectedFile.value.name,
      category: category.value,
      timestamp: new Date().toISOString(),
      status: 'success',
      language: language.value,
    });

    success.value = true;

    // Сбрасываем форму
    resetForm();
  } catch (err: any) {
    console.error('Upload failed:', err.message);
    error.value = 'An error occurred while uploading the test. Please try again or contact support.';

    // Добавляем запись об ошибке в историю
    uploadHistory.value.unshift({
      id: Date.now(),
      filename: selectedFile.value?.name || 'unknown',
      category: category.value || 'unknown',
      timestamp: new Date().toISOString(),
      status: 'error',
      errorMessage: err.message || 'Unknown error',
    });
  } finally {
    uploading.value = false;
  }
};

const cleanData = (data) => {
  return data.map((row, index) => {
    // Удаление полей с "__EMPTY"
    const cleanedRow = Object.fromEntries(
        Object.entries(row).filter(([key]) => !key.startsWith('__EMPTY'))
    );

    // Преобразуем все опции в строки
    ['Option1', 'Option2', 'Option3', 'Option4'].forEach((key) => {
      if (cleanedRow[key] !== undefined) {
        cleanedRow[key] = cleanedRow[key].toString();
      } else {
        console.warn(`Missing ${key} in row ${index + 1}`);
        cleanedRow[key] = ''; // Заменяем на пустую строку, если опция отсутствует
      }
    });

    // Исправление CorrectAnswer: если текст, преобразуем в индекс
    if (typeof cleanedRow.CorrectAnswer === 'string') {
      const correctIndex = ['Option1', 'Option2', 'Option3', 'Option4'].indexOf(
          cleanedRow.CorrectAnswer
      );
      if (correctIndex !== -1) {
        cleanedRow.CorrectAnswer = correctIndex + 1;
      } else {
        console.error(
            `Invalid CorrectAnswer value "${cleanedRow.CorrectAnswer}" in row ${
                index + 1
            }.`
        );
        cleanedRow.CorrectAnswer = null; // Устанавливаем в null, если ответ некорректен
      }
    }

    // Проверяем, что все обязательные поля присутствуют
    const requiredFields = [
      'Question',
      'Option1',
      'Option2',
      'Option3',
      'Option4',
      'CorrectAnswer',
    ];
    requiredFields.forEach((field) => {
      if (!cleanedRow[field]) {
        console.error(`Missing required field "${field}" in row ${index + 1}`);
      }
    });

    return cleanedRow;
  });
};

// Функция для валидации данных
const validateQuestions = (data: any[]) => {
  let isValid = true;

  data = cleanData(data)

  data.forEach((row, index) => {
    // Проверяем основные поля
    const rowIsValid =
        typeof row.Question === 'string' &&
        typeof row.Option1 === 'string' &&
        typeof row.Option2 === 'string' &&
        typeof row.Option3 === 'string' &&
        typeof row.Option4 === 'string' &&
        row.CorrectAnswer &&
        !isNaN(parseInt(row.CorrectAnswer)) &&
        parseInt(row.CorrectAnswer) >= 1 &&
        parseInt(row.CorrectAnswer) <= 4;

    // Если строка не валидна, логируем ошибку и отмечаем её
    if (!rowIsValid) {
      isValid = false;
      console.error(`Validation failed for row ${index + 1}:`, row);
      console.error(
          `Issues detected: ${
              typeof row.Question !== 'string' ? 'Question is invalid. ' : ''
          }${
              typeof row.Option1 !== 'string' ? 'Option1 is invalid. ' : ''
          }${
              typeof row.Option2 !== 'string' ? 'Option2 is invalid. ' : ''
          }${
              typeof row.Option3 !== 'string' ? 'Option3 is invalid. ' : ''
          }${
              typeof row.Option4 !== 'string' ? 'Option4 is invalid. ' : ''
          }${
              !row.CorrectAnswer || isNaN(parseInt(row.CorrectAnswer))
                  ? 'CorrectAnswer must be a number. '
                  : ''
          }${
              parseInt(row.CorrectAnswer) < 1 || parseInt(row.CorrectAnswer) > 4
                  ? 'CorrectAnswer must be between 1 and 4. '
                  : ''
          }`
      );
    }
  });

  return isValid;
};

// Функция для сброса формы
const resetForm = () => {
  selectedFile.value = null;
  category.value = '';
  testTitle.value = '';
  testDescription.value = '';
  difficulty.value = 'intermediate';
  duration.value = 30;
  language.value = 'EN';
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
