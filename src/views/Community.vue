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
        <h1 class="text-3xl font-bold mb-4">{{ $t('community.title') }}</h1>
        <p class="text-light-text-secondary dark:text-dark-text-secondary mt-2">
          {{ $t('community.description') }}
        </p>
      </div>
    </div>

    <div class="space-y-6 mb-8">
      <!-- Block 1: Upload Test Table -->
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 flex items-start gap-4">
        <DocumentArrowUpIcon class="h-10 w-10 text-white" />
        <div>
          <h2 class="text-2xl font-semibold text-white mb-4">{{ $t('community.aiTests.title') }}</h2>
          <p class="text-gray-200">
            {{ $t('community.aiTests.description') }}
          </p>
        </div>
      </div>

      <!-- Block 2: AI-Generated Tests -->
      <div class="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-6 flex items-start gap-4">
        <BoltIcon class="h-10 w-10 text-white" />
        <div>
          <h2 class="text-2xl font-semibold text-white mb-4">{{ $t('community.companyTests.title') }}</h2>
          <p class="text-gray-200">
            {{ $t('community.companyTests.description') }}
          </p>
        </div>
      </div>

      <!-- Block 3: Company Dashboard Test Creation -->
      <div class="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg p-6 flex items-start gap-4">
        <BriefcaseIcon class="h-10 w-10 text-white" />
        <div>
          <h2 class="text-2xl font-semibold text-white mb-4">{{ $t('community.developmentNotice.title') }}</h2>
          <p class="text-gray-200">
            {{ $t('community.developmentNotice.description') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Guidelines Panel -->
    <div class="bg-gray-800 rounded-lg p-6 mb-8">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold mb-4">{{ $t('community.testSubmissionGuidelines.title') }}</h2>
        <button
            v-if="authStore.user"
            @click="showSubmissionModal = true"
            class="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        >
          {{ $t('community.testSubmissionGuidelines.submitTest') }}
        </button>
        <router-link
            v-else
            to="/login"
            class="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        >
          {{ $t('community.testSubmissionGuidelines.loginToContribute') }}
        </router-link>
      </div>
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <h3 class="font-medium mb-2">{{ $t('community.testSubmissionGuidelines.requiredParamsTitle') }}</h3>
          <ul class="list-disc list-inside space-y-1 text-light-text-secondary dark:text-dark-text-secondary">
            <li>{{ $t('community.testSubmissionGuidelines.requiredParamsList[0]') }}</li>
            <li>{{ $t('community.testSubmissionGuidelines.requiredParamsList[1]') }}</li>
            <li>{{ $t('community.testSubmissionGuidelines.requiredParamsList[2]') }}</li>
            <li>{{ $t('community.testSubmissionGuidelines.requiredParamsList[3]') }}</li>
            <li>{{ $t('community.testSubmissionGuidelines.requiredParamsList[4]') }}</li>
          </ul>
        </div>
        <div>
          <h3 class="font-medium mb-2">{{ $t('community.testSubmissionGuidelines.questionFormatTitle') }}</h3>
          <ul class="list-disc list-inside space-y-1 text-light-text-secondary dark:text-dark-text-secondary">
            <li>{{ $t('community.testSubmissionGuidelines.questionFormatList[0]') }}</li>
            <li>{{ $t('community.testSubmissionGuidelines.questionFormatList[1]') }}</li>
            <li>{{ $t('community.testSubmissionGuidelines.questionFormatList[2]') }}</li>
            <li>{{ $t('community.testSubmissionGuidelines.questionFormatList[3]') }}</li>
            <li>{{ $t('community.testSubmissionGuidelines.questionFormatList[4]') }}</li>
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
