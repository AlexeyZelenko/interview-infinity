<template>
   <div class="space-y-6">
      <!-- Challenge Info -->
      <div class="bg-gray-800 rounded-lg p-6">
         <div class="flex justify-between items-start mb-4">
            <div>
               <h1 class="text-2xl font-bold mb-2">{{ challenge?.title || 'Loading...' }}</h1>
               <div class="flex items-center gap-2">
            <span
                    :class="[
                'px-3 py-1 rounded-full text-sm',
                getDifficultyColor(challenge?.difficulty)
              ]"
            >
              {{ challenge?.difficulty || 'N/A' }}
            </span>
                  <span class="text-gray-400">
              {{ challenge?.submissions || 0 }} submissions
            </span>
                  <span class="text-gray-400">
              {{ challenge?.successRate || 0 }}% success rate
            </span>
               </div>
            </div>
            <button
                    @click="runTests"
                    :disabled="!challenge || isRunning"
                    class="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
               <svg
                       class="w-5 h-5"
                       fill="none"
                       stroke="currentColor"
                       viewBox="0 0 24 24"
               >
                  <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
               </svg>
               {{ isRunning ? 'Running...' : 'Run Tests' }}
            </button>
         </div>

         <div class="prose prose-invert max-w-none" v-html="challenge?.description"></div>

         <div class="mt-6">
            <h3 class="font-medium mb-2">Example:</h3>
            <pre class="bg-gray-900 p-4 rounded-lg overflow-x-auto">{{ challenge?.example || 'Loading example...' }}</pre>
         </div>
      </div>

      <!-- Test Results -->
      <div v-if="testResults.length > 0" class="bg-gray-800 rounded-lg p-6">
         <h2 class="text-xl font-semibold mb-4">Test Results</h2>
         <div class="space-y-4">
            <div
                    v-for="(result, index) in testResults"
                    :key="index"
                    :class="[
            'p-4 rounded-lg',
            result.passed ? 'bg-green-500/10' : 'bg-red-500/10'
          ]"
            >
               <div class="flex justify-between items-start mb-2">
                  <div class="font-medium">
                     Test Case {{ index + 1 }}
                  </div>
                  <span
                          :class="result.passed ? 'text-green-400' : 'text-red-400'"
                  >
              {{ result.passed ? 'Passed' : 'Failed' }}
            </span>
               </div>
               <div class="space-y-2 text-sm">
                  <div>
                     <span class="text-gray-400">Input:</span>
                     <pre class="bg-gray-900 p-2 rounded mt-1">{{ formatTestCase(result.input) }}</pre>
                  </div>
                  <div>
                     <span class="text-gray-400">Expected:</span>
                     <pre class="bg-gray-900 p-2 rounded mt-1">{{ formatTestCase(result.expected) }}</pre>
                  </div>
                  <div v-if="!result.passed">
                     <span class="text-gray-400">Your Output:</span>
                     <pre class="bg-gray-900 p-2 rounded mt-1">{{ result.actualOutput }}</pre>
                  </div>
               </div>
            </div>
         </div>

         <!-- AI Feedback -->
         <div v-if="challengesStore.feedback" class="mt-6 p-4 bg-primary-500/10 rounded-lg">
            <h3 class="font-medium text-primary-400 mb-2">Code Review Feedback:</h3>
            <p class="text-gray-300 whitespace-pre-line">{{ challengesStore.feedback }}</p>
         </div>

         <!-- AI Hint -->
         <div v-if="challengesStore.hint" class="mt-6 p-4 bg-yellow-500/10 rounded-lg">
            <h3 class="font-medium text-yellow-400 mb-2">Hint:</h3>
            <p class="text-gray-300">{{ challengesStore.hint }}</p>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useChallengesStore } from '../../stores/challenges';

interface TestResult {
   passed: boolean;
   input: string;
   expected: string;
   output: string;
   actualOutput: string;
   error?: string;
}

const props = defineProps<{
   challenge: {
      id: string;
      title: string;
      description: string;
      difficulty: string;
      submissions: number;
      successRate: number;
      example: string;
   };
   testResults: TestResult[];
   isRunning: boolean;
   currentCode: string;
   currentLanguage: string;
}>();

const emit = defineEmits<{
   (e: 'update:testResults', results: TestResult[]): void;
   (e: 'update:isRunning', value: boolean): void;
}>();

const challengesStore = useChallengesStore();
const error = ref<string | null>(null);

const getDifficultyColor = (difficulty: string) => {
   switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-500/10 text-green-400';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400';
      case 'hard': return 'bg-red-500/10 text-red-400';
      default: return 'bg-gray-500/10 text-gray-400';
   }
};

const formatTestCase = (value: string) => {
   try {
      return JSON.stringify(JSON.parse(value), null, 2);
   } catch {
      return value;
   }
};

const runTests = async () => {
   if (!props.challenge || props.isRunning) return;

   error.value = null;
   emit('update:isRunning', true);

   try {
      const results = await challengesStore.runTests({
         challengeId: props.challenge.id,
         code: props.currentCode,
         language: props.currentLanguage
      });
      emit('update:testResults', results);
   } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to run tests';
      console.error('Error running tests:', err);
   } finally {
      emit('update:isRunning', false);
   }
};
</script>