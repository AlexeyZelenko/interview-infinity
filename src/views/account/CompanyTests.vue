<script setup lang="ts">
import { ref } from 'vue';

interface Test {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: number;
  createdAt: string;
  status: 'active' | 'draft' | 'archived';
  attempts: number;
  averageScore: number;
}

const tests = ref<Test[]>([
  {
    id: '1',
    title: 'Frontend Development Skills',
    description: 'Comprehensive test covering modern frontend development concepts',
    duration: 60,
    difficulty: 'intermediate',
    questions: 40,
    createdAt: '2024-01-15',
    status: 'active',
    attempts: 25,
    averageScore: 82
  },
  {
    id: '2',
    title: 'JavaScript Fundamentals',
    description: 'Core JavaScript concepts and best practices',
    duration: 45,
    difficulty: 'beginner',
    questions: 30,
    createdAt: '2024-01-20',
    status: 'draft',
    attempts: 0,
    averageScore: 0
  }
]);

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-500/10 text-green-400';
    case 'draft': return 'bg-yellow-500/10 text-yellow-400';
    case 'archived': return 'bg-gray-500/10 text-gray-400';
    default: return 'bg-gray-500/10 text-gray-400';
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return 'bg-green-500/10 text-green-400';
    case 'intermediate': return 'bg-yellow-500/10 text-yellow-400';
    case 'advanced': return 'bg-red-500/10 text-red-400';
    default: return 'bg-gray-500/10 text-gray-400';
  }
};

const archiveTest = (testId: string) => {
  const test = tests.value.find(t => t.id === testId);
  if (test) {
    test.status = 'archived';
  }
};
</script>

<template>
  <div class="max-w-4xl">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Company Tests</h2>
      <router-link
          to="/account/create-test"
          class="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
      >
        Create New Test
      </router-link>
    </div>

    <div class="space-y-4">
      <div
          v-for="test in tests"
          :key="test.id"
          class="bg-gray-800 rounded-lg p-6"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-semibold mb-2">{{ test.title }}</h3>
            <p class="text-gray-300">{{ test.description }}</p>
          </div>
          <div class="flex items-center space-x-2">
            <span
                :class="[getDifficultyColor(test.difficulty), 'px-3 py-1 rounded-full text-sm']"
            >
              {{ test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1) }}
            </span>
            <span
                :class="[getStatusColor(test.status), 'px-3 py-1 rounded-full text-sm']"
            >
              {{ test.status.charAt(0).toUpperCase() + test.status.slice(1) }}
            </span>
          </div>
        </div>

        <div class="grid md:grid-cols-4 gap-4 mb-4">
          <div>
            <p class="text-sm text-gray-400">Duration</p>
            <p class="font-medium">{{ test.duration }} minutes</p>
          </div>
          <div>
            <p class="text-sm text-gray-400">Questions</p>
            <p class="font-medium">{{ test.questions }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-400">Attempts</p>
            <p class="font-medium">{{ test.attempts }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-400">Average Score</p>
            <p
                class="font-medium"
                :class="[
                test.averageScore >= 90 ? 'text-green-400' :
                test.averageScore >= 70 ? 'text-yellow-400' :
                'text-red-400'
              ]"
            >
              {{ test.averageScore > 0 ? `${test.averageScore}%` : 'N/A' }}
            </p>
          </div>
        </div>

        <div class="flex justify-between items-center text-sm">
          <span class="text-gray-400">
            Created on {{ new Date(test.createdAt).toLocaleDateString() }}
          </span>
          <div class="flex space-x-2">
            <router-link
                :to="`/account/tests/${test.id}/edit`"
                class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              Edit
            </router-link>
            <router-link
                :to="`/account/tests/${test.id}/results`"
                class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              View Results
            </router-link>
            <button
                v-if="test.status !== 'archived'"
                @click="archiveTest(test.id)"
                class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              Archive
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 bg-gray-800 rounded-lg p-6">
      <h3 class="text-xl font-semibold mb-4">Test Statistics</h3>
      <div class="grid grid-cols-4 gap-4">
        <div class="bg-gray-700 rounded-lg p-4">
          <p class="text-sm text-gray-400 mb-1">Total Tests</p>
          <p class="text-2xl font-bold">{{ tests.length }}</p>
        </div>
        <div class="bg-gray-700 rounded-lg p-4">
          <p class="text-sm text-gray-400 mb-1">Active Tests</p>
          <p class="text-2xl font-bold">
            {{ tests.filter(t => t.status === 'active').length }}
          </p>
        </div>
        <div class="bg-gray-700 rounded-lg p-4">
          <p class="text-sm text-gray-400 mb-1">Total Attempts</p>
          <p class="text-2xl font-bold">
            {{ tests.reduce((acc, test) => acc + test.attempts, 0) }}
          </p>
        </div>
        <div class="bg-gray-700 rounded-lg p-4">
          <p class="text-sm text-gray-400 mb-1">Overall Average</p>
          <p class="text-2xl font-bold">
            {{ Math.round(
              tests.reduce((acc, test) => acc + (test.attempts > 0 ? test.averageScore : 0), 0) /
              tests.filter(t => t.attempts > 0).length
          ) }}%
          </p>
        </div>
      </div>
    </div>
  </div>
</template>