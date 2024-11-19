<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Create Test</h1>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Basic Information -->
      <div class="bg-gray-800 rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Test Information</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Test Title</label>
            <input
                v-model="testData.title"
                type="text"
                required
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Advanced Vue.js Concepts"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Description</label>
            <textarea
                v-model="testData.description"
                rows="3"
                required
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe what the test covers..."
            ></textarea>
          </div>

          <div class="grid md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Category</label>
              <select
                  v-model="testData.category"
                  required
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select category</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Language</label>
              <select
                  v-model="testData.language"
                  required
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select category</option>
                <option v-for="language in languages" :key="language" :value="language">{{ language }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Difficulty</label>
              <select
                  v-model="testData.difficulty"
                  required
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option v-for="diff in difficulties" :key="diff.value" :value="diff.value">
                  {{ diff.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Duration (minutes)</label>
              <input
                  v-model.number="testData.duration"
                  type="number"
                  required
                  min="5"
                  max="120"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Questions -->
      <div class="bg-gray-800 rounded-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Questions</h2>
          <button
              type="button"
              @click="addQuestion"
              class="text-primary-400 hover:text-primary-300"
          >
            Add Question
          </button>
        </div>

        <div class="space-y-6">
          <div
              v-for="(question, index) in testData.questions"
              :key="index"
              class="border border-gray-700 rounded-lg p-4"
          >
            <div class="flex justify-between items-start mb-4">
              <h3 class="font-medium">Question {{ index + 1 }}</h3>
              <button
                  type="button"
                  @click="removeQuestion(index)"
                  class="text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">Question Text</label>
                <textarea
                    v-model="question.text"
                    rows="2"
                    required
                    class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                ></textarea>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium mb-2">Options</label>
                <div
                    v-for="(option, optionIndex) in question.options"
                    :key="optionIndex"
                    class="flex gap-2"
                >
                  <input
                      v-model="question.options[optionIndex]"
                      type="text"
                      required
                      class="flex-1 px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      :placeholder="`Option ${optionIndex + 1}`"
                  />
                  <input
                      type="radio"
                      :name="`correct-${index}`"
                      :checked="question.correctAnswer === optionIndex"
                      @change="question.correctAnswer = optionIndex"
                      class="mt-3"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Explanation (Optional)</label>
                <textarea
                    v-model="question.explanation"
                    rows="2"
                    class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Explain why this answer is correct..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="error" class="text-red-400 text-sm">
        {{ error }}
      </div>

      <div class="flex justify-end gap-4">
        <button
            type="button"
            @click="resetForm"
            class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
        >
          Reset
        </button>
        <button
            type="submit"
            :disabled="saving"
            class="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
        >
          {{ saving ? 'Saving...' : 'Create Test' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { db } from '../../firebase/config';
import { collection, addDoc } from 'firebase/firestore';

interface Question {
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface TestData {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  questions: Question[];
  language: string;
}

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

const initialTestData: TestData = {
  title: '',
  description: '',
  category: '',
  difficulty: 'intermediate',
  duration: 30,
  questions: [],
  language: 'EN'
};

const testData = ref<TestData>({ ...initialTestData });
const saving = ref(false);
const error = ref('');
const languages = ['EN', 'UA', 'RU'];

const addQuestion = () => {
  testData.value.questions.push({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });
};

const removeQuestion = (index: number) => {
  testData.value.questions.splice(index, 1);
};

const resetForm = () => {
  testData.value = { ...initialTestData };
  error.value = '';
};

const handleSubmit = async () => {
  if (testData.value.questions.length === 0) {
    error.value = 'Please add at least one question';
    return;
  }

  saving.value = true;
  error.value = '';

  try {
    // Validate questions
    const invalidQuestion = testData.value.questions.find(q =>
        !q.text ||
        q.options.some(opt => !opt) ||
        q.correctAnswer === undefined
    );

    if (invalidQuestion) {
      throw new Error('Please fill in all question fields and select correct answers');
    }

    // Generate unique ID
    const testId = `test_${Date.now()}`;

    // Save test to Firestore
    const testDoc = {
      id: testId, // Add unique ID
      ...testData.value,
      createdAt: new Date().toISOString(),
      status: 'active',
      submissions: 0,
      successRate: 0
    };

    // Use the generated ID when adding to Firestore
    await addDoc(collection(db, 'tests'), testDoc);
    resetForm();
  } catch (err: any) {
    error.value = err.message;
  } finally {
    saving.value = false;
  }
};

</script>