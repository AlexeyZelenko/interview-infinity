<script setup lang="ts">
import { ref } from 'vue';

const currentFeature = ref(0);
const features = [
  {
    id: 1,
    title: 'demo.features.tests.title',
    description: 'demo.features.tests.description',
    image: '/demo/test-creation.png',
    animation: 'fade-right'
  },
  {
    id: 2,
    title: 'demo.features.jobs.title',
    description: 'demo.features.jobs.description',
    image: '/demo/job-search.png',
    animation: 'fade-left'
  },
  {
    id: 3,
    title: 'demo.features.interviews.title',
    description: 'demo.features.interviews.description',
    image: '/demo/interview.png',
    animation: 'fade-up'
  }
];

const selectFeature = (index: number) => {
  currentFeature.value = index;
};
</script>

<template>
  <section class="py-24 relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-4">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-100">
        {{ $t('demo.title') }}
      </h2>

      <!-- Feature Navigation -->
      <div class="flex justify-center gap-4 mb-12">
        <button
          v-for="(feature, index) in features"
          :key="feature.id"
          @click="selectFeature(index)"
          class="px-6 py-3 rounded-lg transition-all duration-300 text-sm md:text-base"
          :class="currentFeature === index 
            ? 'bg-gray-700 text-gray-100' 
            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'"
        >
          {{ $t(feature.title) }}
        </button>
      </div>

      <!-- Feature Display -->
      <div class="relative">
        <transition-group name="feature" tag="div">
          <div
            v-for="(feature, index) in features"
            :key="feature.id"
            v-show="currentFeature === index"
            class="grid md:grid-cols-2 gap-8 items-center"
            :data-aos="feature.animation"
          >
            <!-- Feature Description -->
            <div class="order-2 md:order-1">
              <h3 class="text-2xl font-semibold mb-4 text-gray-100">
                {{ $t(feature.title) }}
              </h3>
              <p class="text-gray-300 leading-relaxed mb-6">
                {{ $t(feature.description) }}
              </p>
              <router-link
                :to="'/register'"
                class="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors duration-300"
              >
                {{ $t('demo.tryItNow') }}
                <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </router-link>
            </div>

            <!-- Feature Image -->
            <div class="order-1 md:order-2">
              <div class="relative">
                <img
                  :src="feature.image"
                  :alt="$t(feature.title)"
                  class="rounded-lg shadow-xl w-full"
                />
                <!-- Interactive Overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-50 rounded-lg"></div>
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </div>
  </section>
</template>

<style scoped>
.feature-enter-active,
.feature-leave-active {
  transition: all 0.5s ease;
}

.feature-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.feature-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.feature-enter-to,
.feature-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style> 