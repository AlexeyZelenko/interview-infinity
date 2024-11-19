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
</template>
