<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const developerId = route.params.id;

const developer = ref({
  id: '1',
  name: 'Alex Johnson',
  technologies: ['Vue.js', 'TypeScript', 'Node.js'],
  status: 'searching',
  testsCompleted: 5,
  bio: 'Full-stack developer with 5 years of experience',
  location: 'New York, USA',
  experience: '5 years',
  github: 'github.com/alexj',
  linkedin: 'linkedin.com/in/alexj',
  testResults: [
    {
      name: 'Vue.js Fundamentals',
      score: 90,
      date: '2024-02-15'
    }
  ]
});

const getStatusColor = (status: string) => {
  switch (status) {
    case 'searching': return 'bg-green-500';
    case 'paused': return 'bg-yellow-500';
    case 'not_searching': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="bg-gray-800 rounded-lg p-8">
      <div class="flex items-start justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold mb-2">{{ developer.name }}</h1>
          <div class="flex items-center">
            <span 
              :class="[getStatusColor(developer.status), 'w-2 h-2 rounded-full mr-2']"
            ></span>
            <span class="text-gray-300">
              {{ developer.status === 'searching' ? 'Open to work' : 
                 developer.status === 'paused' ? 'On pause' : 'Not searching' }}
            </span>
          </div>
        </div>
        <button class="bg-primary-600 px-4 py-2 rounded hover:bg-primary-700">
          Contact
        </button>
      </div>

      <div class="grid md:grid-cols-2 gap-8">
        <div>
          <h2 class="text-xl font-semibold mb-4">About</h2>
          <p class="text-gray-300 mb-4">{{ developer.bio }}</p>
          
          <div class="space-y-2 text-gray-300">
            <p>📍 {{ developer.location }}</p>
            <p>💼 {{ developer.experience }} of experience</p>
          </div>

          <h2 class="text-xl font-semibold mt-6 mb-4">Technologies</h2>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="tech in developer.technologies" 
              :key="tech"
              class="bg-gray-700 px-3 py-1 rounded-full"
            >
              {{ tech }}
            </span>
          </div>
        </div>

        <div>
          <h2 class="text-xl font-semibold mb-4">Test Results</h2>
          <div class="space-y-4">
            <div 
              v-for="test in developer.testResults" 
              :key="test.name"
              class="bg-gray-700 p-4 rounded-lg"
            >
              <div class="flex justify-between items-center mb-2">
                <h3 class="font-medium">{{ test.name }}</h3>
                <span class="text-green-400">{{ test.score }}%</span>
              </div>
              <p class="text-sm text-gray-400">
                Completed on {{ new Date(test.date).toLocaleDateString() }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>