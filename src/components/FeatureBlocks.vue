<script setup lang="ts">
import { ref, onMounted, defineProps } from 'vue';

const props = defineProps({
  type: {
    type: String,
    required: true,
  }
});

const features = {
  developer: [
    { icon: "🌐", title: "Join the Community and Create Tests", description: "Create and share tests to challenge your knowledge, using AI or upload your own test templates." },
    { icon: "🔍", title: "Search and Apply for Jobs", description: "Browse and apply for tech jobs that match your skills and preferences." },
    { icon: "📝", title: "Create and Manage Resumes", description: "Easily manage multiple resumes and tailor them for different applications." },
    { icon: "💡", title: "Skill Assessment Tests", description: "Take tests to prove your skills and increase your chances of landing the right job." },
    { icon: "📊", title: "Track Application Status", description: "Stay informed about each application’s status, right from your dashboard." },
    { icon: "🎯", title: "Set Job Alerts", description: "Get alerts for jobs that match your career goals and skill set." },
  ],
  company: [
    { icon: "👥", title: "Search and Evaluate Candidates", description: "Find top talent with filters, and review candidates’ test results." },
    { icon: "📋", title: "Create Custom Tests", description: "Create or generate skill tests in multiple languages and technologies using AI, or upload custom test templates." },
    { icon: "📈", title: "Track Applicant Progress", description: "Monitor candidates' test scores and progress directly within the platform." },
    { icon: "📮", title: "Post and Manage Job Listings", description: "List job openings and reach a large audience of tech professionals." },
    { icon: "💼", title: "Flexible Job Posting", description: "Post jobs with or without tests, allowing flexibility in hiring processes." },
    { icon: "📹", title: "Video Test Recording", description: "Subscribe to enable video recordings of candidates during tests for enhanced screening." },
  ],
  general: [
    { icon: "🗓️", title: "One Month Free Access", description: "Enjoy a full month of free access without the need for credit card information." },
    { icon: "🔒", title: "Anti-Fraud Measures", description: "Candidates can retake a test only after a week to prevent gaming the system." },
    { icon: "🚧", title: "Site in Development", description: "We’re constantly improving. Send suggestions and feedback to infinitydevelopinfinity@gmail.com." },
  ]
};

const observedBlocks = ref([]);

onMounted(() => {
  // Lazy load blocks with IntersectionObserver
  const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            observedBlocks.value.push(entry.target.getAttribute('data-key'));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
  );

  document.querySelectorAll('.feature-block').forEach((block) => observer.observe(block));
});
</script>

<template>
  <div class="h-full flex flex-col justify-between">
    <h2 class="text-2xl font-semibold mb-6">{{ type === 'developer' ? 'For Developers' : type === 'company' ? 'For Companies' : 'General Information' }}</h2>
    <div class="space-y-4">
      <div
          v-for="(feature, index) in features[type]"
          :key="feature.title"
          class="feature-block flex items-start gap-4 p-6 rounded-md transition duration-500 transform"
          :style="{ opacity: observedBlocks.includes(`${index}`) ? 1 : 0, transform: observedBlocks.includes(`${index}`) ? 'translateY(0)' : 'translateY(50px)' }"
          :class="{
          'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500': index % 2 === 0,
          'bg-gradient-to-r from-green-500 to-blue-500': index % 2 !== 0
        }"
          :data-key="index"
      >
        <div class="text-4xl">{{ feature.icon }}</div>
        <div>
          <h3 class="text-lg font-semibold">{{ feature.title }}</h3>
          <p class="text-gray-300">{{ feature.description }}</p>
        </div>
      </div>
    </div>
    <router-link
        v-if="type === 'developer' || type === 'company'"
        :to="`/register?type=${type}`"
        class="inline-block bg-primary-600 text-white px-6 py-2 mt-6 rounded-md hover:bg-primary-700"
    >
      {{ type === 'developer' ? 'Join as Developer' : 'Join as Company' }}
    </router-link>
  </div>
</template>
