<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Review Test Submissions</h1>

    <div class="space-y-6">
      <!-- Filters -->
      <div class="bg-gray-800 rounded-lg p-4">
        <div class="flex gap-4">
          <select
              v-model="filters.status"
              class="bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
              v-model="filters.category"
              class="bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Categories</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
      </div>

      <!-- Submissions List -->
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p>Loading submissions...</p>
      </div>

      <div v-else-if="error" class="bg-red-500/10 text-red-400 p-4 rounded-lg">
        {{ error }}
      </div>

      <div v-else-if="filteredSubmissions.length === 0" class="bg-gray-800 rounded-lg p-6 text-center">
        <p class="text-gray-300">No submissions found</p>
      </div>

      <div v-else class="space-y-4">
        <div
            v-for="submission in filteredSubmissions"
            :key="submission.id"
            class="bg-gray-800 rounded-lg p-6"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-xl font-semibold mb-2">{{ submission.title }}</h3>
              <p class="text-gray-300">{{ submission.description }}</p>
              <div class="flex items-center gap-4 mt-2">
                <span class="text-sm text-gray-400">
                  Category: {{ submission.category }}
                </span>
                <span class="text-sm text-gray-400">
                  Difficulty: {{ submission.difficulty }}
                </span>
                <span class="text-sm text-gray-400">
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

          <div class="flex items-center justify-between mt-4">
            <div class="text-sm text-gray-400">
              Submitted by {{ submission.submittedBy }} on
              {{ new Date(submission.submittedAt).toLocaleDateString() }}
            </div>
            <div class="flex gap-2">
              <button
                  v-if="submission.status === 'pending'"
                  @click="previewTest(submission)"
                  class="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Review
              </button>
              <a
                  :href="submission.questionsFile"
                  download
                  class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                Download Questions
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <TestPreview
        v-if="showPreview"
        :submission="selectedSubmission"
        :questions="previewQuestions"
        @close="closePreview"
        @approve="approveSubmission"
        @reject="rejectSubmission"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTestStore } from '../../stores/tests';
import TestPreview from '../../components/admin/TestPreview.vue';
import { read, utils } from 'xlsx';


const testStore = useTestStore();
const loading = ref(false);
const error = ref('');
const submissions = ref<any[]>([]);
const selectedSubmission = ref<any>(null);
const showPreview = ref(false);
const previewQuestions = ref<any[]>([]);

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

const filters = ref({
  status: '',
  category: ''
});

const filteredSubmissions = computed(() => {
  return submissions.value.filter(submission => {
    if (filters.value.status && submission.status !== filters.value.status) {
      return false;
    }
    if (filters.value.category && submission.category !== filters.value.category) {
      return false;
    }
    return true;
  });
});

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-500/10 text-yellow-400';
    case 'approved': return 'bg-green-500/10 text-green-400';
    case 'rejected': return 'bg-red-500/10 text-red-400';
    default: return 'bg-gray-500/10 text-gray-400';
  }
};

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
    // Fetch the file
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch file');
    }

    // Get file extension from URL
    const fileExtension = fileUrl.split('.').pop()?.toLowerCase();

    // Handle different file types
    if (fileExtension === 'csv') {
      // Parse CSV file
      const text = await response.text();
      const rows = text.split('\n').map(row => row.split(','));
      const headers = rows[0];

      return rows.slice(1).map(row => {
        if (row.length < 6) return null; // Skip invalid rows
        return {
          text: row[0]?.trim(),
          options: [
            row[1]?.trim(),
            row[2]?.trim(),
            row[3]?.trim(),
            row[4]?.trim()
          ],
          correctAnswer: parseInt(row[5]?.trim()) - 1,
          explanation: row[6]?.trim() || ''
        };
      }).filter(q => q !== null); // Remove invalid entries

    } else {
      // Parse Excel file
      const blob = await response.blob();
      const data = await blob.arrayBuffer();
      const workbook = read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);

      return jsonData.map((row: any) => ({
        text: row.Question,
        options: [row.Option1, row.Option2, row.Option3, row.Option4],
        correctAnswer: parseInt(row.CorrectAnswer) - 1,
        explanation: row.Explanation || ''
      }));
    }
  } catch (err) {
    console.error('Error parsing questions:', err);
    throw new Error(`Failed to parse questions file: ${err.message}`);
  }
};

const previewTest = async (submission: any) => {
  try {
    if (!submission?.questionsFile) {
      throw new Error('No questions file attached');
    }

    selectedSubmission.value = submission;
    loading.value = true;

    const questions = await parseQuestions(submission.questionsFile);

    if (!questions || questions.length === 0) {
      throw new Error('No valid questions found in file');
    }

    // Validate questions format
    const invalidQuestion = questions.find(q =>
        !q.text ||
        !q.options ||
        q.options.length !== 4 ||
        q.correctAnswer === undefined ||
        q.correctAnswer < 0 ||
        q.correctAnswer > 3
    );

    if (invalidQuestion) {
      throw new Error('Invalid question format found in file');
    }

    previewQuestions.value = questions;
    showPreview.value = true;
    error.value = '';
  } catch (err: any) {
    error.value = err.message;
    console.error('Preview error:', err);
    showPreview.value = false;
  } finally {
    loading.value = false;
  }
};

const approveSubmission = async (submission: any) => {
  try {
    if (!submission || !previewQuestions.value?.length) {
      throw new Error('Invalid submission or questions data');
    }

    loading.value = true;
    error.value = '';

    // Create test data
    const testData = {
      ...submission,
      questions: previewQuestions.value,
      status: 'active',
      approvedAt: new Date().toISOString()
    };

    await testStore.approveTestSubmission(submission.id, testData);
    await loadSubmissions();
    closePreview();
  } catch (err: any) {
    error.value = err.message;
    console.error('Approval error:', err);
  } finally {
    loading.value = false;
  }
};

const closePreview = () => {
  showPreview.value = false;
  selectedSubmission.value = null;
  previewQuestions.value = [];
};

const rejectSubmission = async (submission: any) => {
  try {
    loading.value = true;
    await testStore.rejectTestSubmission(submission.id);
    await loadSubmissions();
    closePreview();
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Load submissions on mount
loadSubmissions();
</script>