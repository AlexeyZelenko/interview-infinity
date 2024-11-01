<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useTestStore } from '../stores/tests';
import TestDiscussion from '../components/community/TestDiscussion.vue';
import TestSubmissionModal from '../components/community/TestSubmissionModal.vue';

const authStore = useAuthStore();
const testStore = useTestStore();
const showSubmissionModal = ref(false);
const loading = ref(true);
const error = ref('');

const discussions = ref([]);
const filter = ref('all'); // all, discussions, submissions

onMounted(async () => {
  try {
    await testStore.fetchTestDiscussions();
    discussions.value = testStore.discussions;
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
          Discuss and contribute to our test collection
        </p>
      </div>
      <div class="flex gap-4">
        <select
            v-model="filter"
            class="bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border rounded-md"
        >
          <option value="all">All Posts</option>
          <option value="discussions">Discussions</option>
          <option value="submissions">Test Submissions</option>
        </select>
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
    </div>

    <!-- Guidelines Panel -->
    <div class="bg-light-card dark:bg-dark-card rounded-lg p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Test Submission Guidelines</h2>
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

    <!-- Discussions List -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
      <p>Loading discussions...</p>
    </div>

    <div v-else-if="error" class="bg-red-500/10 text-red-400 p-4 rounded-lg">
      {{ error }}
    </div>

    <div v-else class="space-y-6">
      <TestDiscussion
          v-for="discussion in discussions"
          :key="discussion.id"
          :discussion="discussion"
      />
    </div>

    <!-- Test Submission Modal -->
    <TestSubmissionModal
        v-if="showSubmissionModal"
        @close="showSubmissionModal = false"
    />
  </div>
</template>