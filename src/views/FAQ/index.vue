<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold mb-4">{{ $t('faq.title') }}</h1>
      <p class="text-xl text-gray-400" v-html="$t('faq.sections.introduction')"></p>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex justify-center mb-8">
      <nav class="flex space-x-4 p-1 bg-gray-800 rounded-xl">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex items-center px-4 py-2 rounded-lg transition-colors"
          :class="activeTab === tab.id ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" />
          </svg>
          {{ $t('faq.sections.' + tab.id + '.title') }}
        </button>
      </nav>
    </div>

    <!-- Content Sections -->
    <div class="space-y-8">
      <!-- Overview Section -->
      <div v-if="activeTab === 'overview'" class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div v-for="feature in features" :key="feature.title" class="bg-gray-800 rounded-xl p-6 transition-transform hover:scale-105">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="feature.icon" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-white mb-2">{{ $t(feature.title) }}</h3>
              <p class="text-gray-400">{{ $t(feature.description) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Articles Section -->
      <ArticlesSection v-if="activeTab === 'articles'" />

      <!-- Video Section -->
      <VideoSection v-if="activeTab === 'videos'" />

      <!-- FAQ Section -->
      <FAQSection v-if="activeTab === 'faq'" />
    </div>

    <!-- Contact Support -->
    <div class="mt-12 text-center bg-gray-800 rounded-xl p-8">
      <h2 class="text-2xl font-bold mb-4">{{ $t('faq.sections.support.title') }}</h2>
      <p class="text-gray-400 mb-6">{{ $t('faq.sections.support.description') }}</p>
      <button class="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">
        {{ $t('faq.sections.support.contact') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ArticlesSection from '@/components/Faq/ArticlesSection.vue';
import VideoSection from '@/components/Faq/VideoSection.vue';
import FAQSection from '@/components/Faq/FAQSection.vue';

const activeTab = ref('overview');

const tabs = [
  { id: 'overview', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'articles', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'videos', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { id: 'faq', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
];

const features = [
  {
    title: 'tests.skillTests',
    description: 'faq.sections.functionsOverview.featuresList.0',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    title: 'menu.Jobs',
    description: 'faq.sections.functionsOverview.featuresList.1',
    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
  },
  {
    title: 'menu.Resumes',
    description: 'faq.sections.functionsOverview.featuresList.3',
    icon: 'M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2'
  },
  {
    title: 'menu.Community',
    description: 'faq.sections.functionsOverview.featuresList.4',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
  }
];
</script>

<style scoped>
.transition-transform {
  transition: transform 0.2s ease-in-out;
}
</style>
