<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useTestStore } from '../../stores/tests';
  import TestPreview from './TestPreview.vue';
  import { read, utils } from 'xlsx';

  const testStore = useTestStore();
  const loading = ref(false);
  const error = ref('');
  const submissions = ref<any[]>([]);
  const selectedSubmission = ref<any>(null);
  const showPreview = ref(false);
  const previewQuestions = ref<any[]>([]);

  onMounted(async () => {
    await loadSubmissions();
  });

  const loadSubmissions = async () => {
    loading.value = true;
    try {
      const response = await testStore.fetchTestSubmissions();
      submissions.value = response;
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const parseQuestions = async (fileUrl: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const data = await blob.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);

      return jsonData.map((row: any) => ({
        text: row.Question,
        options: [row.Option1, row.Option2, row.Option3, row.Option4],
        correctAnswer: parseInt(row.CorrectAnswer) - 1,
        explanation: row.Explanation || ''
      }));
    } catch (err) {
      throw new Error('Failed to parse questions file');
    }
  };

  const previewTest = async (submission: any) => {
    try {
      selectedSubmission.value = submission;
      const questions = await parseQuestions(submission.questionsFile);
      previewQuestions.value = questions;
      showPreview.value = true;
    } catch (err: any) {
      error.value = err.message;
    }
  };

  const approveSubmission = async (submission: any) => {
    try {
      loading.value = true;
      await testStore.approveTestSubmission(submission.id, previewQuestions.value);
      await loadSubmissions();
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const rejectSubmission = async (submission: any) => {
    try {
      loading.value = true;
      await testStore.rejectTestSubmission(submission.id);
      await loadSubmissions();
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-400';
      case 'approved': return 'bg-green-500/10 text-green-400';
      case 'rejected': return 'bg-red-500/10 text-red-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };
</script>

<template>
  <div class="space-y-6">
    <div class="bg-light-card dark:bg-dark-card rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-4">Test Submissions</h2>

      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p>Loading submissions...</p>
      </div>

      <div v-else-if="error" class="bg-red-500/10 text-red-400 p-4 rounded-lg">
        {{ error }}
      </div>

      <div v-else-if="submissions.length === 0" class="text-center py-8">
        <p class="text-light-text-secondary dark:text-dark-text-secondary">
          No pending test submissions
        </p>
      </div>

      <div v-else class="space-y-4">
        <div
            v-for="submission in submissions"
            :key="submission.id"
            class="border border-light-border dark:border-dark-border rounded-lg p-4"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-semibold">{{ submission.title }}</h3>
              <p class="text-light-text-secondary dark:text-dark-text-secondary">
                {{ submission.description }}
              </p>
              <div class="flex items-center gap-4 mt-2">
                <span class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Category: {{ submission.category }}
                </span>
                <span class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Difficulty: {{ submission.difficulty }}
                </span>
                <span class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Duration: {{ submission.duration }} minutes
                </span>
              </div>
            </div>
            <span
                :class="[getStatusColor(submission.status), 'px-3 py-1 rounded-full text-sm']"
            >
              {{ submission.status }}
            </span>
          </div>

          <div class="flex items-center justify-between">
            <div class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Submitted by {{ submission.submittedBy }} on
              {{ new Date(submission.submittedAt).toLocaleDateString() }}
            </div>
            <div class="flex gap-2">
              <button
                  v-if="submission.status === 'pending'"
                  @click="previewTest(submission)"
                  class="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Preview & Review
              </button>
              <a
                  :href="submission.questionsFile"
                  download
                  class="px-4 py-2 bg-light-hover dark:bg-dark-hover rounded hover:bg-light-hover dark:hover:bg-dark-hover"
              >
                Download Questions
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Test Preview Modal -->
    <TestPreview
        v-if="showPreview"
        :submission="selectedSubmission"
        :questions="previewQuestions"
        @close="showPreview = false"
        @approve="approveSubmission"
        @reject="rejectSubmission"
    />
  </div>
</template>