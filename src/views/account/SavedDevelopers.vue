<script setup lang="ts">
import { ref } from 'vue';

interface SavedDeveloper {
  id: string;
  name: string;
  title: string;
  location: string;
  skills: string[];
  experience: string;
  savedAt: string;
  status: 'available' | 'interviewing' | 'hired';
  testScores: {
    testName: string;
    score: number;
  }[];
}

const savedDevelopers = ref<SavedDeveloper[]>([
  {
    id: '1',
    name: 'Sarah Chen',
    title: 'Senior Full Stack Developer',
    location: 'Seattle, WA',
    skills: ['Vue.js', 'Node.js', 'TypeScript', 'MongoDB'],
    experience: '6 years',
    savedAt: '2024-01-15',
    status: 'available',
    testScores: [
      { testName: 'Vue.js Advanced', score: 95 },
      { testName: 'Node.js Fundamentals', score: 88 }
    ]
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    title: 'Frontend Developer',
    location: 'Miami, FL',
    skills: ['React', 'JavaScript', 'Tailwind CSS'],
    experience: '3 years',
    savedAt: '2024-01-20',
    status: 'interviewing',
    testScores: [
      { testName: 'React Development', score: 92 },
      { testName: 'JavaScript Fundamentals', score: 85 }
    ]
  }
]);

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available': return 'bg-green-500/10 text-green-400';
    case 'interviewing': return 'bg-yellow-500/10 text-yellow-400';
    case 'hired': return 'bg-blue-500/10 text-blue-400';
    default: return 'bg-gray-500/10 text-gray-400';
  }
};

const removeSavedDeveloper = (developerId: string) => {
  savedDevelopers.value = savedDevelopers.value.filter(dev => dev.id !== developerId);
};

const getAverageScore = (scores: { testName: string; score: number; }[]) => {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((acc, curr) => acc + curr.score, 0) / scores.length);
};
</script>

<template>
  <div class="max-w-4xl">
    <h2 class="text-2xl font-bold mb-6">Saved Developers</h2>

    <div v-if="savedDevelopers.length === 0" class="bg-gray-800 rounded-lg p-6 text-center">
      <p class="text-gray-300">You haven't saved any developers yet.</p>
      <router-link
          to="/developers"
          class="inline-block mt-4 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
      >
        Browse Developers
      </router-link>
    </div>

    <div v-else class="space-y-4">
      <div
          v-for="developer in savedDevelopers"
          :key="developer.id"
          class="bg-gray-800 rounded-lg p-6"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-semibold mb-2">{{ developer.name }}</h3>
            <p class="text-gray-300">{{ developer.title }}</p>
            <p class="text-gray-400 text-sm">{{ developer.location }} • {{ developer.experience }} experience</p>
          </div>
          <div class="flex items-center space-x-4">
            <span
                :class="[getStatusColor(developer.status), 'px-3 py-1 rounded-full text-sm']"
            >
              {{ developer.status.charAt(0).toUpperCase() + developer.status.slice(1) }}
            </span>
            <button
                @click="removeSavedDeveloper(developer.id)"
                class="text-gray-400 hover:text-red-400"
                title="Remove from saved"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="mb-4">
          <div class="flex flex-wrap gap-2">
            <span
                v-for="skill in developer.skills"
                :key="skill"
                class="bg-gray-700 px-3 py-1 rounded-full text-sm"
            >
              {{ skill }}
            </span>
          </div>
        </div>

        <div class="border-t border-gray-700 pt-4">
          <h4 class="text-sm font-medium mb-2">Test Results</h4>
          <div class="grid grid-cols-2 gap-4">
            <div
                v-for="test in developer.testScores"
                :key="test.testName"
                class="flex justify-between items-center"
            >
              <span class="text-gray-400">{{ test.testName }}</span>
              <span
                  :class="[
                  test.score >= 90 ? 'text-green-400' :
                  test.score >= 70 ? 'text-yellow-400' :
                  'text-red-400'
                ]"
              >
                {{ test.score }}%
              </span>
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center mt-4 text-sm">
          <span class="text-gray-400">
            Saved on {{ new Date(developer.savedAt).toLocaleDateString() }}
          </span>
          <div class="flex items-center space-x-4">
            <span class="text-gray-400">
              Average Score:
              <span :class="[
                getAverageScore(developer.testScores) >= 90 ? 'text-green-400' :
                getAverageScore(developer.testScores) >= 70 ? 'text-yellow-400' :
                'text-red-400'
              ]">
                {{ getAverageScore(developer.testScores) }}%
              </span>
            </span>
            <router-link
                :to="`/developers/${developer.id}`"
                class="text-primary-400 hover:text-primary-300"
            >
              View Profile
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>