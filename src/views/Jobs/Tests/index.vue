<script lang="ts" setup>
import { defineProps, onMounted, ref } from 'vue';
import { Test } from '@/types/tests.ts';
import { useApplicationsStore } from '@/stores/applications.ts';

const applicationsStore = useApplicationsStore();

const props = defineProps<{
  tests: Test[];
  jobId: string;
  canApplyStatus: boolean;
}>();

// Reactive object to store results for each test
const testResults = ref<Record<string, string | null>>({});

// Fetch the results for each test
const fetchResults = async () => {
  for (const test of props.tests) {
    try {
      const result = await applicationsStore.duplicationPassingTest(test.id, props.jobId);
      console.log("result", result)
      testResults.value[test.id] = result; // Store the result using test.id as the key
    } catch (error) {
      console.error('Failed to fetch test result:', error);
      testResults.value[test.id] = null; // Set null if the fetch fails
    }
  }
};

// Fetch results when the component mounts
onMounted(async () => {
  await fetchResults();
});
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-6">
    <!-- Filters Sidebar - Fixed -->
    <div class="lg:w-[280px] flex-shrink-0">
      <div class="sticky top-4 space-y-6">
        <div class="bg-gray-800 rounded-lg p-4">
          <h2 class="text-lg font-semibold mb-4">Filters</h2>
          
          <!-- Test Type Filter -->
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Test Type</label>
            <select class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500">
              <option value="all">All Tests</option>
              <option value="required">Required Only</option>
              <option value="optional">Optional Only</option>
            </select>
          </div>

          <!-- Duration Filter -->
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Duration</label>
            <select class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500">
              <option value="all">Any Duration</option>
              <option value="short">Under 30 min</option>
              <option value="medium">30-60 min</option>
              <option value="long">Over 60 min</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Status</label>
            <select class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500">
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Tests List - Scrollable -->
    <div class="flex-1 min-w-0">
      <h2 class="text-xl font-semibold mb-4">Required Tests</h2>
      <div class="space-y-4">
        <div
            v-for="test in tests"
            :key="test.id"
            class="bg-gray-700 p-4 rounded-lg"
        >
          <div class="flex justify-between items-start">
            <div class="mr-4">
              <h3 class="font-medium mb-1">{{ test.title }}</h3>
              <p class="text-gray-300 text-sm">{{ test.description }}</p>
              <div class="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <span>Duration: {{ test.duration }} minutes</span>
                <span v-if="test.isRequired" class="text-red-400">Required</span>
                <span v-else class="text-gray-400">Optional</span>
              </div>
            </div>
            <router-link
                v-if="!testResults[test.id]"
                :to="`/test/${test.testId}`"
                class="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              Take Test
            </router-link>
            <p v-else class="px-4 py-2 bg-green-500/10 text-green-400 rounded">Test result already exists</p>
          </div>
        </div>
      </div>
      <p v-if="tests.some(t => t.isRequired)" class="mt-4 text-sm text-red-400">
        * Some tests are required before applying
      </p>
    </div>
  </div>
</template>
