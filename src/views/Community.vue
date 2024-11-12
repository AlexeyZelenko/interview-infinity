<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useTestStore } from '../stores/tests';
import TestSubmissionModal from '../components/community/TestSubmissionModal.vue';
import AITestGenerator from '../components/AITestGenerator.vue';
import { DocumentArrowUpIcon, BoltIcon, BriefcaseIcon, WrenchScrewdriverIcon } from '@heroicons/vue/24/outline';

const authStore = useAuthStore();
const testStore = useTestStore();
const showSubmissionModal = ref(false);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    await testStore.fetchTestDiscussions();
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold">Community</h1>
        <p class="text-light-text-secondary dark:text-dark-text-secondary mt-2">
          Contribute to our test collection
        </p>
      </div>
    </div>

    <div class="space-y-6 mb-8">
      <!-- Block 1: Upload Test Table -->
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 flex items-start gap-4">
        <DocumentArrowUpIcon class="h-10 w-10 text-white" />
        <div>
          <h2 class="text-2xl font-semibold text-white mb-4">Create Tests by Uploading a Table</h2>
          <p class="text-gray-200">
            Download a template by clicking "Submit Test," and upload as many tests as you like. You can generate tests using ChatGPT by providing it with the template and asking it to create and save tests in the required format. Manual test entry in the table is also supported.
          </p>
        </div>
      </div>

      <!-- Block 2: AI-Generated Tests -->
      <div class="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-6 flex items-start gap-4">
        <BoltIcon class="h-10 w-10 text-white" />
        <div>
          <h2 class="text-2xl font-semibold text-white mb-4">Generate Tests with AI Assistance</h2>
          <p class="text-gray-200">
            Generate tests with up to 20 questions, specifying the technology focus. You can add a brief description (e.g., tests in Chinese or for emerging technologies) to personalize the AI-generated tests.
          </p>
        </div>
      </div>

      <!-- Block 3: Company Dashboard Test Creation -->
      <div class="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg p-6 flex items-start gap-4">
        <BriefcaseIcon class="h-10 w-10 text-white" />
        <div>
          <h2 class="text-2xl font-semibold text-white mb-4">For Companies: Create Tests in Your Dashboard</h2>
          <p class="text-gray-200">
            Companies have a dedicated option to create tests directly in the dashboard, where they can attach these tests to job listings for applicants. Candidates must complete the required tests before applying.
          </p>
        </div>
      </div>

      <!-- Block 4: Site Development Notice -->
      <div class="bg-gradient-to-r from-gray-500 to-gray-700 rounded-lg p-6 flex items-start gap-4">
        <WrenchScrewdriverIcon class="h-10 w-10 text-white" />
        <div>
          <h2 class="text-2xl font-semibold text-white mb-4">Site Under Development</h2>
          <p class="text-gray-200">
            This site is continuously improving. Your feedback is valuable to us! Please send any suggestions or comments to
            <a href="mailto:infinitydevelopinfinity@gmail.com" class="text-primary-300 hover:text-primary-200">infinitydevelopinfinity@gmail.com</a>.
          </p>
        </div>
      </div>
    </div>

    <!-- Guidelines Panel -->
    <div class="bg-gray-800 rounded-lg p-6 mb-8">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold mb-4">Test Submission Guidelines</h2>
        <button
            v-if="authStore.user"
            @click="showSubmissionModal = true"
            class="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        >
          Submit Test
        </button>
        <router-link
            v-else
            to="/login"
            class="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        >
          Login to Contribute
        </router-link>
      </div>
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <h3 class="font-medium mb-2">Required Parameters</h3>
          <ul class="list-disc list-inside space-y-1 text-light-text-secondary dark:text-dark-text-secondary">
            <li>Test title and description</li>
            <li>Target difficulty level</li>
            <li>Estimated duration</li>
            <li>Technology/topic category</li>
            <li>Questions in Excel/CSV format</li>
          </ul>
        </div>
        <div>
          <h3 class="font-medium mb-2">Question Format</h3>
          <ul class="list-disc list-inside space-y-1 text-light-text-secondary dark:text-dark-text-secondary">
            <li>Question text</li>
            <li>4 multiple choice options</li>
            <li>Correct answer index (1-4)</li>
            <li>Explanation for the answer</li>
            <li>Optional code snippets</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- AI Test Generator Component -->
    <AITestGenerator />

    <!-- Test Submission Modal -->
    <TestSubmissionModal
        v-if="showSubmissionModal"
        @close="showSubmissionModal = false"
    />
  </div>
</template>
