<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '@/firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { useAuthStore } from '@/stores/auth';
import { useJobsStore } from '@/stores/jobs';

const authStore = useAuthStore();
const jobsStore = useJobsStore();
const loading = ref(false);
const error = ref(false);
const success = ref(false);
const languages = ['EN', 'UA', 'RU'];

interface Job {
  id: string;
  title: string;
  company: string;
}

interface Question {
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

const formData = ref({
  title: '',
  description: '',
  category: '',
  difficulty: 'intermediate',
  duration: 10,
  questions: [] as Question[],
  jobId: '', // New field for job linking
  isRequired: false, // Whether the test is required for job application
  isVideoRecord: false,
  language: 'EN'
});

const jobs = ref<Job[]>([]);

const newQuestion = ref({
  text: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  explanation: ''
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

// Load company's jobs
onMounted(async () => {
  try {
    await jobsStore.fetchCompanyJobs();
    jobs.value = jobsStore.companyJobs;
  } catch (err: any) {
    error.value = err.message;
  }
});

const addQuestion = () => {
  if (!newQuestion.value.text || newQuestion.value.options.some(opt => !opt.trim())) {
    error.value = 'Please fill in all question fields';
    return;
  }

  formData.value.questions.push({
    ...newQuestion.value,
    options: [...newQuestion.value.options]
  });

  newQuestion.value = {
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  };
};

const removeQuestion = (index: number) => {
  formData.value.questions.splice(index, 1);
};

const handleSubmit = async () => {
  if (formData.value.questions.length === 0) {
    error.value = 'Please add at least one question';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const testData = {
      ...formData.value,
      createdBy: authStore.user?.uid,
      companyId: authStore.user?.uid,
      createdAt: new Date().toISOString(),
      status: 'active',
      submissions: 0,
      passedCount: 0,
      averageScore: 0
    };

    // Create test document
    const testRef = await addDoc(collection(db, 'tests'), testData);

    // If job is selected, link test to job
    if (formData.value.jobId) {
      await addDoc(collection(db, 'jobTests'), {
        jobId: formData.value.jobId,
        testId: testRef.id,
        isRequired: formData.value.isRequired,
        createdAt: new Date().toISOString()
      });
    }

    success.value = true;
    formData.value = {
      title: '',
      description: '',
      category: '',
      difficulty: 'intermediate',
      duration: 30,
      questions: [],
      jobId: '',
      isRequired: false,
      isVideoRecord: false,
      language: 'EN'
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
      <h2 class="text-2xl font-bold mb-6">Create Test Manually</h2>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Basic Information -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Test Title</label>
            <input
                v-model="formData.title"
                type="text"
                required
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <!-- Job Selection -->
          <div>
            <label class="block text-sm font-medium mb-2">Link to Job (Optional)</label>
            <div class="space-y-2">
              <select
                  v-model="formData.jobId"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a job</option>
                <option v-for="job in jobs" :key="job.id" :value="job.id">
                  {{ job.title }}
                </option>
              </select>

              <div v-if="formData.jobId" class="flex items-center gap-2">
                <input
                    type="checkbox"
                    v-model="formData.isRequired"
                    id="required-test"
                    class="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
                />
                <label for="required-test" class="text-sm">
                  Required for job application
                </label>
              </div>
            </div>
          </div>

          <!-- Rest of the form remains the same -->
          <div>
            <label class="block text-sm font-medium mb-2">Description</label>
            <textarea
                v-model="formData.description"
                required
                rows="3"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>

          <!-- isVideoRecord -->
          <div class="flex flex-col gap-2">
            <label for="video-record" class="text-sm font-semibold">Video Recording Requirement</label>
            <div class="flex items-center gap-2">
              <input
                  type="checkbox"
                  v-model="formData.isVideoRecord"
                  id="video-record"
                  class="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
              />
              <span class="text-sm">Enable video recording during the test</span>
            </div>
            <p class="text-xs text-gray-400 mt-1">
              This test will require a video recording of your screen and surroundings to ensure integrity.
            </p>
          </div>


          <div class="grid md:grid-cols-2 gap-4">
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
              <label class="block text-sm font-medium mb-2">Language</label>
              <select
                  v-model="formData.language"
                  required
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select category</option>
                <option v-for="language in languages" :key="language" :value="language">
                  {{ language }}
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
        </div>

        <!-- Rest of the template remains the same -->
        <!-- Add Question Form -->
        <div class="border-t border-gray-700 pt-6">
          <h3 class="text-lg font-semibold mb-4">Add Question</h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Question Text</label>
              <textarea
                  v-model="newQuestion.text"
                  rows="2"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              ></textarea>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium mb-2">Options</label>
              <div
                  v-for="(option, index) in newQuestion.options"
                  :key="index"
                  class="flex items-center gap-2"
              >
                <input
                    type="radio"
                    :checked="newQuestion.correctAnswer === index"
                    @change="newQuestion.correctAnswer = index"
                    :name="'new-question-option'"
                    class="text-primary-600 focus:ring-primary-500"
                />
                <input
                    v-model="newQuestion.options[index]"
                    type="text"
                    class="flex-1 px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    :placeholder="`Option ${index + 1}`"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Explanation (Optional)</label>
              <textarea
                  v-model="newQuestion.explanation"
                  rows="2"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Explain why this answer is correct..."
              ></textarea>
            </div>

            <button
                type="button"
                @click="addQuestion"
                class="w-full px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              Add Question
            </button>
          </div>
        </div>

        <!-- Questions List -->
        <div v-if="formData.questions.length > 0" class="space-y-4">
          <h3 class="text-lg font-semibold">Questions ({{ formData.questions.length }})</h3>

          <div
              v-for="(question, index) in formData.questions"
              :key="index"
              class="bg-gray-700 p-4 rounded-lg"
          >
            <div class="flex justify-between items-start mb-2">
              <h4 class="font-medium">Question {{ index + 1 }}</h4>
              <button
                  type="button"
                  @click="removeQuestion(index)"
                  class="text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>

            <p class="mb-2">{{ question.text }}</p>

            <div class="space-y-1">
              <div
                  v-for="(option, optIndex) in question.options"
                  :key="optIndex"
                  :class="[
                  'px-3 py-1 rounded',
                  optIndex === question.correctAnswer ? 'bg-green-500/10 text-green-400' : 'bg-gray-600'
                ]"
              >
                {{ option }}
                <span v-if="optIndex === question.correctAnswer" class="ml-2">(Correct)</span>
              </div>
            </div>

            <p v-if="question.explanation" class="mt-2 text-sm text-gray-400">
              Explanation: {{ question.explanation }}
            </p>
          </div>
        </div>

        <div v-if="error" class="text-red-500 text-sm">
          {{ error }}
        </div>

        <div v-if="success" class="text-green-500 text-sm">
          Test created successfully!
        </div>

        <button
            type="submit"
            :disabled="loading || formData.questions.length === 0"
            class="w-full bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:opacity-50"
        >
          {{ loading ? 'Creating Test...' : 'Create Test' }}
        </button>
      </form>
    </div>
  </div>
</template>