<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold">Coding Challenges</h1>
        <p class="text-light-text-secondary dark:text-dark-text-secondary mt-2">
          Test your coding skills with real-world programming challenges
        </p>
      </div>
      <div class="flex gap-4">
        <select
            v-model="filters.difficulty"
            class="bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select
            v-model="filters.language"
            class="bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">All Languages</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>
    </div>

    <div class="grid lg:grid-cols-[280px,1fr] gap-6">
      <!-- Filters Sidebar -->
      <div class="space-y-6">
        <div class="bg-gray-800 rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-4">Filters</h2>

          <!-- Topics -->
          <div class="mb-6">
            <h3 class="font-medium mb-2">Topics</h3>
            <div class="space-y-2">
              <label
                  v-for="topic in topics"
                  :key="topic"
                  class="flex items-center"
              >
                <input
                    type="checkbox"
                    :value="topic"
                    v-model="filters.topics"
                    class="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
                >
                <span class="ml-2">{{ topic }}</span>
              </label>
            </div>
          </div>

          <!-- Status -->
          <div>
            <h3 class="font-medium mb-2">Status</h3>
            <div class="space-y-2">
              <label
                  v-for="status in statuses"
                  :key="status.value"
                  class="flex items-center"
              >
                <input
                    type="checkbox"
                    :value="status.value"
                    v-model="filters.status"
                    class="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
                >
                <span class="ml-2">{{ status.label }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Challenges List -->
      <div class="space-y-4">
        <div
            v-for="challenge in filteredChallenges"
            :key="challenge.id"
            class="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors cursor-pointer"
            @click="openChallenge(challenge.id)"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-xl font-semibold mb-2">{{ challenge.title }}</h3>
              <p class="text-gray-300">{{ challenge.description }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span
                  :class="[
                  'px-3 py-1 rounded-full text-sm',
                  getDifficultyColor(challenge.difficulty)
                ]"
              >
                {{ challenge.difficulty }}
              </span>
              <span
                  v-if="challenge.status"
                  :class="[
                  'px-3 py-1 rounded-full text-sm',
                  getStatusColor(challenge.status)
                ]"
              >
                {{ challenge.status }}
              </span>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <span
                v-for="topic in challenge.topics"
                :key="topic"
                class="bg-gray-700 px-2 py-1 rounded-full text-xs"
            >
              {{ topic }}
            </span>
          </div>

          <div class="flex justify-between items-center mt-4 text-sm text-gray-400">
            <div class="flex items-center gap-4">
              <span>{{ challenge.submissions }} submissions</span>
              <span>{{ challenge.successRate }}% success rate</span>
            </div>
            <div class="flex items-center gap-2">
              <span v-for="lang in challenge.languages" :key="lang">
                {{ lang }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import { useRouter } from 'vue-router';
import { useChallengesStore } from '../stores/challenges';

const router = useRouter();
const challengesStore = useChallengesStore();

const topics = [
  'Arrays',
  'Strings',
  'Linked Lists',
  'Trees',
  'Sorting',
  'Dynamic Programming',
  'Algorithms',
  'Data Structures'
];

const statuses = [
  { value: 'completed', label: 'Completed' },
  { value: 'attempted', label: 'Attempted' },
  { value: 'todo', label: 'To Do' }
];

const filters = ref({
  difficulty: '',
  language: '',
  topics: [] as string[],
  status: [] as string[]
});

const filteredChallenges = computed(() => {
   if(challengesStore.challenges.length === 0) {
      return [];
    }
      return challengesStore.challenges.filter(challenge => {
    if (filters.value.difficulty && challenge.difficulty !== filters.value.difficulty) {
      return false;
    }
    if (filters.value.language && !challenge.languages.includes(filters.value.language)) {
      return false;
    }
    if (filters.value.topics.length > 0 && !filters.value.topics.some(topic =>
        challenge.topics.includes(topic)
    )) {
      return false;
    }
    if (filters.value.status.length > 0 && !filters.value.status.includes(challenge.status)) {
      return false;
    }
    return true;
  });
});

const getDifficultyColor = (difficulty: string) => {
   console.log("www")
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'bg-green-500/10 text-green-400';
    case 'medium': return 'bg-yellow-500/10 text-yellow-400';
    case 'hard': return 'bg-red-500/10 text-red-400';
    default: return 'bg-gray-500/10 text-gray-400';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-500/10 text-green-400';
    case 'attempted': return 'bg-yellow-500/10 text-yellow-400';
    case 'todo': return 'bg-gray-500/10 text-gray-400';
    default: return 'bg-gray-500/10 text-gray-400';
  }
};

const openChallenge = (id: string) => {
  router.push(`/developer/challenges/${id}`);
};

const fetchChallenges = () => {
  challengesStore.fetchChallenges();
};

onMounted(async () => {
    await fetchChallenges();
  console.log('Mounted');
});
</script>