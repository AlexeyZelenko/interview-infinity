<script lang="ts" setup>
import { defineProps, ref, onMounted } from 'vue';
import { TestAttempt } from '@/types/tests.ts';
import { useTestStore } from '@/stores/tests.ts';

const props = defineProps<{
  tests: Array<TestAttempt>;
}>();

interface TestResult {
  name: string;
  score: number;
}

const UseTest = useTestStore();

const fullTests = ref<TestResult[]>([]);

onMounted(async () => {
  if (props.tests) {
    const results: TestResult[] = [];

    for (const test of props.tests) {
      try {
        const testInfo = await UseTest.fetchTestById(test.testId);
        results.push({
          name: testInfo?.title || 'Unknown Test',
          score: test?.score ?? 0,
        });
      } catch (error) {
        console.error(`Failed to fetch test by ID ${test.testId}:`, error);
        results.push({
          name: 'Unknown Test',
          score: 0,
        });
      }
    }

    fullTests.value = results;
  }
});

</script>

<template>
  <div v-if="fullTests.length" class="border-t border-gray-700 pt-4">
    <h4 class="text-sm font-medium mb-2">Test Results</h4>
    <div class="flex flex-col justify-center">
      <div
          v-for="(test, i) in fullTests"
          :key="test.name"
          class="flex justify-between items-center"
      >
        <div class="text-sm text-gray-400 mb-1">
          <span class="text-gray-400 mr-0.5">{{i + 1}}.</span>
          <span class="text-gray-400">{{ test.name }}</span>
        </div>
        <div
            :class="[test.score >= 90 ? 'text-green-400' :
                     test.score >= 70 ? 'text-yellow-400' :
                     'text-red-400']"
        >
            {{ test.score }}%
          </div>
      </div>
    </div>
  </div>
</template>
