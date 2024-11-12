<template>
  <div class="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
    <h2 class="text-xl font-semibold mb-4 text-white">Generate Test with AI</h2>

    <form @submit.prevent="generateTest" class="space-y-4">

      <!-- Test Title -->
      <div>
        <label class="block text-sm font-medium mb-2 text-gray-300">Test Title</label>
        <input
            v-model="formData.title"
            type="text"
            required
            class="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., React Hooks Test"
        />
      </div>

      <!-- Test Description -->
      <div>
        <label class="block text-sm font-medium mb-2 text-gray-300">Description</label>
        <textarea
            v-model="formData.description"
            maxlength="50"
            required
            rows="2"
            class="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., Short description of the test"
        ></textarea>
        <p class="text-sm text-gray-400 mt-1">
          {{ formData.description.length }}/50 characters
        </p>
      </div>

      <!-- Link to Job -->
      <div>
        <label class="block text-sm font-medium mb-2 text-gray-300">Link to Job (Optional)</label>
        <select
            v-model="formData.jobId"
            class="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Select a job</option>
          <option v-for="job in jobs" :key="job.id" :value="job.id">
            {{ job.title }}
          </option>
        </select>
        <div v-if="formData.jobId" class="flex items-center gap-2 mt-2">
          <input
              type="checkbox"
              v-model="formData.isRequired"
              id="required-test"
              class="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
          />
          <label for="required-test" class="text-sm text-gray-300">
            Required for job application
          </label>
        </div>
      </div>

      <!-- Technology -->
      <div>
        <label class="block text-sm font-medium mb-2 text-gray-300">Technology</label>
        <input
            v-model="formData.technology"
            type="text"
            required
            class="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., React, Vue.js, Node.js"
        />
      </div>

      <!-- Video Recording Option -->
      <div class="flex items-center gap-2">
        <input
            type="checkbox"
            v-model="formData.isVideoRecord"
            id="video-record"
            class="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
        />
        <label for="video-record" class="text-sm text-gray-300">
          Video recording
        </label>
      </div>

      <!-- Difficulty Level -->
      <div>
        <label class="block text-sm font-medium mb-2 text-gray-300">Difficulty</label>
        <select
            v-model="formData.difficulty"
            required
            class="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <!-- Focus Area -->
      <div>
        <label class="block text-sm font-medium mb-2 text-gray-300">Focus Area (max 30 characters)</label>
        <textarea
            v-model="formData.instructions"
            maxlength="30"
            required
            rows="2"
            class="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., українською мовою, State management, Hooks"
        ></textarea>
        <p class="text-sm text-gray-400 mt-1">
          {{ formData.instructions.length }}/30 characters
        </p>
      </div>

      <!-- Submit Button -->
      <button
          type="submit"
          :disabled="loading"
          class="w-full px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
      >
        {{ loading ? 'Generating...' : 'Generate Test' }}
      </button>

      <!-- Error & Success Messages -->
      <div v-if="error" class="text-red-400 text-sm mt-2">
        {{ error }}
      </div>
      <div v-if="success" class="text-green-400 text-sm mt-2">
        Test generated and uploaded successfully!
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { generatePrompt } from '@/utils/company/promptGenerator';
import { validateAndUploadTest } from '@/utils/company/testUploader';
import { useAuthStore } from '@/stores/auth';
import { useJobsStore } from '@/stores/jobs';
import { useToast } from 'vue-toastification';

const toast = useToast();
const authStore = useAuthStore();
const jobsStore = useJobsStore();
const jobs = ref<Job[]>([]);

interface Job {
  id: string;
  title: string;
  company: string;
}

const formData = ref({
  technology: '',
  difficulty: 'intermediate',
  description: '',
  jobId: '',
  isRequired: false,
  title: '',
  instructions: '',
  isVideoRecord: false,
});

const loading = ref(false);
const error = ref('');
const success = ref(false);

const generateTest = async () => {
  loading.value = true;
  error.value = '';
  success.value = false;

  try {
    const prompt = generatePrompt(
        formData.value.technology,
        formData.value.difficulty,
        formData.value.description,
        formData.value.instructions
    );

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    await validateAndUploadTest(data.choices[0].message.content, {
      title: formData.value.title,
      description: formData.value.description,
      category: formData.value.technology,
      difficulty: formData.value.difficulty,
      companyId: authStore.user?.uid,
      jobId: formData.value.jobId,
      isRequired: formData.value.isRequired,
      isVideoRecord: formData.value.isVideoRecord
    });

    success.value = true;
    toast.success('Test generated and uploaded successfully!');

    formData.value = {
      technology: '',
      difficulty: 'intermediate',
      description: '',
      jobId: '',
      isRequired: false,
      title: '',
      instructions: '',
      isVideoRecord: false,
    };
  } catch (err: any) {
    error.value = err.message;
    toast.error(`Error: ${error.value}`);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  try {
    await jobsStore.fetchCompanyJobs();
    jobs.value = jobsStore.companyJobs;
  } catch (err: any) {
    error.value = err.message;
    toast.error(`Error loading jobs: ${error.value}`);
  }
});
</script>
