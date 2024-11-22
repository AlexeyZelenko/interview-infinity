<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '@/firebase/config';
import {doc, getDoc, addDoc, collection} from 'firebase/firestore';
import { useJobsStore } from '@/stores/jobs';
import { useAuthStore } from '@/stores/auth';
import { useTestStore } from '@/stores/tests';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const jobsStore = useJobsStore();
const testsStore = useTestStore();
const loading = ref(false);
const languages = ['EN', 'UA', 'RU'];

const testId = route.params.testId;

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
  jobId: '',
  isRequired: false,
  isVideoRecord: false,
  language: 'EN',
  createdBy: authStore.user?.uid,
  companyId: authStore.user?.uid,
  createdAt: new Date().toISOString()
});

const jobs = ref<Job[]>([]);
const editableQuestionIndex = ref<number | null>(null);
const editQuestionData = ref<Question | null>(null);

const newQuestion = ref<Question>({
  text: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  explanation: ''
});

const categories = ref<string[] | []>([]);
const difficulties = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

// Load company jobs and existing test data
onMounted(async () => {
  try {
    loading.value = true;
    await jobsStore.fetchCompanyJobs();
    jobs.value = jobsStore.companyJobs;

    await testsStore.fetchTestsCategories();
    categories.value = testsStore.testsCategories;

    const docRef = doc(db, 'tests', testId);
    const testSnapshot = await getDoc(docRef);
    if (testSnapshot.exists()) {
      const data = testSnapshot.data();
      formData.value = {
        title: data.title,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        duration: data.duration,
        questions: data.questions || [],
        jobId: data.jobId || '',
        isRequired: data.isRequired || false,
        isVideoRecord: data.isVideoRecord || false,
        language: data.language || 'EN',
        createdBy: authStore.user?.uid,
        companyId: authStore.user?.uid,
        createdAt: new Date().toISOString()
      };
    } else {
      toast.error('Test not found');
    }
  } catch (err: any) {
    toast.error(err.message);
  } finally {
    loading.value = false;
  }
});

// Add a new question
const addNewQuestion = () => {
  if (!newQuestion.value.text || newQuestion.value.options.some(opt => !opt.trim())) {
    toast.warning('Please fill in all question fields');
    return;
  }
  formData.value.questions.push({ ...newQuestion.value });
  newQuestion.value = { text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' };
  toast.success('Question added successfully');
};

// Edit a specific question inline
const editQuestion = (index: number) => {
  editableQuestionIndex.value = index;
  editQuestionData.value = { ...formData.value.questions[index] };
};

const saveQuestionEdit = () => {
  if (!editQuestionData.value || editableQuestionIndex.value === null) {
    toast.error("Couldn't save changes. Please try again.");
    return;
  }

  formData.value.questions[editableQuestionIndex.value] = { ...editQuestionData.value };
  editableQuestionIndex.value = null;
  editQuestionData.value = null;
  toast.success('Question updated successfully!');
};

// Cancel editing a question
const cancelQuestionEdit = () => {
  editableQuestionIndex.value = null;
  editQuestionData.value = null;
  toast.info('Edit canceled');
};

// Delete a specific question
const deleteQuestion = (index: number) => {
  formData.value.questions.splice(index, 1);
  toast.success('Question deleted successfully');
};

// Submit updates for the test
const handleSubmit = async () => {
  if (formData.value.questions.length === 0) {
    toast.warning('Please add at least one question before submitting.');
    return;
  }

  loading.value = true;

  try {
    // Create test document
    const testRef = await addDoc(collection(db, 'tests'), formData.value);

    // If job is selected, link test to job
    if (formData.value.jobId) {
      await addDoc(collection(db, 'jobTests'), {
        jobId: formData.value.jobId,
        testId: testRef.id,
        isRequired: formData.value.isRequired,
        createdAt: new Date().toISOString()
      });
    }

    toast.success('Test saved successfully!');
    await router.push('/company/tests');
  } catch (err: any) {
    toast.error(err.message);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-3xl">
    <div class="bg-gray-800 rounded-lg p-6">
      <h2 class="text-2xl font-bold mb-6">Edit Test</h2>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Basic Information -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Test Title</label>
            <input
                v-model="formData.title"
                type="text"
                required
                class="w-full px-3 py-2 bg-gray-700 rounded-md"
            />
          </div>

          <!-- Job Selection, Category, Difficulty, Duration Fields -->
          <!-- Similar to previous example, omitted for brevity -->
          <!-- Job Selection -->
          <div>
            <label class="block text-sm font-medium mb-2">Link to Job (Optional)</label>
            <div class="space-y-2">
              <select
                  v-model="formData.jobId"
                  required
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a job</option>
                <option
                    v-for="job in jobs"
                    :key="job.id"
                    :value="job.id">
                  {{ job.title }}
                </option>
              </select>

              <div class="flex items-center gap-2">
                <input
                    type="checkbox"
                    v-model="formData.isRequired"
                    id="required-test"
                    class="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
                />
                <label for="required-test" class="text-sm">Required for job application</label>
              </div>
            </div>
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
            <p class="text-xs text-gray-400 mt-1">This test will require a video recording to ensure integrity.</p>
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
                <option
                    v-for="category in categories"
                    :key="category" :value="category">{{ category }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Difficulty</label>
              <select
                  v-model="formData.difficulty"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option v-for="diff in difficulties" :key="diff.value" :value="diff.value">{{ diff.label }}</option>
              </select>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Language</label>
              <select
                  v-model="formData.language"
                  required
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select language</option>
                <option
                    v-for="language in languages"
                    :key="language" :value="language">{{ language }}
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

          <!-- Questions List -->
          <div v-if="formData.questions.length > 0" class="space-y-4">
            <h3 class="text-lg font-semibold">Questions ({{ formData.questions.length }})</h3>

            <div v-for="(question, index) in formData.questions" :key="index" class="bg-gray-700 p-4 rounded-lg">
              <div class="flex justify-between items-start mb-2">
                <h4 class="font-medium">Question {{ index + 1 }}</h4>

                <div>
                  <button v-if="editableQuestionIndex !== index" @click="editQuestion(index)" class="text-blue-400 hover:text-blue-300">Edit</button>
                  <button v-else @click.prevent="saveQuestionEdit" class="text-green-400 hover:text-green-300">Save</button>
                  <button v-if="editableQuestionIndex === index" @click="cancelQuestionEdit" class="ml-2 text-red-400 hover:text-red-300">Cancel</button>
                  <button @click.prevent="deleteQuestion(index)" class="ml-2 text-red-400 hover:text-red-300">Delete</button>
                </div>
              </div>

              <div v-if="editableQuestionIndex === index">
                <!-- Editable Question Form -->
                <textarea
                    v-model="editQuestionData.text"
                    type="text"
                    rows="3"
                    class="w-full px-3 py-2 mb-2 bg-gray-700 rounded-md"
                    placeholder="Edit question text"
                ></textarea>
                <div v-for="(option, optIndex) in editQuestionData.options" :key="optIndex" class="flex items-center gap-2 mb-1">
                  <input type="radio" :checked="editQuestionData.correctAnswer === optIndex" @change="editQuestionData.correctAnswer = optIndex" class="text-primary-600" />
                  <input v-model="editQuestionData.options[optIndex]" type="text" class="flex-1 px-3 py-1 bg-gray-700 rounded-md" :placeholder="`Option ${optIndex + 1}`" />
                </div>
                <textarea
                    v-model="editQuestionData.explanation"
                    class="w-full px-3 py-2 bg-gray-700 rounded-md mt-2"
                    placeholder="Explanation (optional)"></textarea>
              </div>

              <div v-else>
                <!-- Displaying Question Details -->
                <p class="mb-2">{{ question.text }}</p>
                <div
                    v-for="(option, optIndex) in question.options"
                    :key="optIndex"
                    :class="['px-3 py-1 rounded my-1', optIndex === question.correctAnswer ? 'bg-green-500/10 text-green-400' : 'bg-gray-600']"
                >
                  {{ option }} <span v-if="optIndex === question.correctAnswer" class="ml-2">(Correct)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Add New Question -->
          <div class="border-t border-gray-700 pt-6">
            <h3 class="text-lg font-semibold mb-4">Add New Question</h3>
            <textarea
                v-model="newQuestion.text"
                rows="3"
                placeholder="Question text"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
            <div v-for="(option, index) in newQuestion.options" :key="index" class="flex items-center gap-2 mb-2">
              <input type="radio" :checked="newQuestion.correctAnswer === index" @change="newQuestion.correctAnswer = index" class="text-primary-600" />
              <input v-model="newQuestion.options[index]" type="text" class="flex-1 px-3 py-1 bg-gray-700 rounded-md" :placeholder="`Option ${index + 1}`" />
            </div>
            <textarea v-model="newQuestion.explanation" class="w-full px-3 py-2 bg-gray-700 rounded-md mt-2" placeholder="Explanation (optional)"></textarea>

            <button @click="addNewQuestion" type="button" class="w-full px-4 py-2 mt-4 bg-primary-600 text-white rounded hover:bg-primary-700">Add Question</button>
          </div>
        </div>

        <button type="submit" :disabled="loading || formData.questions.length === 0" class="w-full bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:opacity-50">
          {{ loading ? 'Saving Test...' : 'Save Test' }}
        </button>
      </form>
    </div>
  </div>
</template>
