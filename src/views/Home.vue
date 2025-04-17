<script setup lang="ts">
import FeatureBlocks from '@/components/FeatureBlocks.vue';
import TestimonialsSection from '@/components/TestimonialsSection.vue';
import PlatformDemo from '@/components/PlatformDemo.vue';
import { logEvent } from "firebase/analytics";
import { analytics } from '@/firebase/config';
import { onMounted, ref, onUnmounted, computed } from "vue";
import { useWindowScroll, useWindowSize } from '@vueuse/core';

const { y } = useWindowScroll();
const { height } = useWindowSize();
const parallaxOffset = ref(0);
const showScrollTop = computed(() => y.value > height.value * 0.5);

// Статистика платформы (можно заменить на реальные данные из API)
const stats = ref({
  developers: '5,000+',
  companies: '200+',
  tests: '1,000+',
  successRate: '95%'
});

// Функция для обновления параллакс-эффекта
const updateParallax = () => {
  parallaxOffset.value = y.value * 0.5;
};

// Плавный скролл к секции
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

// Скролл наверх
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => {
  logEvent(analytics, 'page_view', {
    page_title: 'Home',
    page_location: window.location.href,
    page_path: window.location.pathname
  });

  window.addEventListener('scroll', updateParallax);
});

onUnmounted(() => {
  window.removeEventListener('scroll', updateParallax);
});
</script>

<template>
  <!-- Hero Section with Parallax -->
  <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
    <!-- Animated Background -->
    <div class="absolute inset-0 bg-gradient-radial from-gray-900 to-gray-950">
      <div class="absolute inset-0 opacity-30">
        <div class="particles"></div>
      </div>
    </div>
    
    <!-- Content -->
    <div class="relative z-10 text-center max-w-4xl mx-auto px-4">
      <h1 class="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-300">
        {{ $t('home.title') }}
      </h1>
      <p class="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
        {{ $t('home.description') }}
      </p>
      
      <!-- CTA Buttons -->
      <div class="flex flex-wrap justify-center gap-4">
        <button 
          @click="scrollToSection('features')"
          class="px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-300 border border-gray-700 hover:border-gray-600"
        >
          {{ $t('home.exploreFeatures') }}
        </button>
        <router-link 
          to="/register" 
          class="px-8 py-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-all duration-300 border border-gray-600 hover:border-gray-500"
        >
          {{ $t('home.getStarted') }}
        </router-link>
      </div>

      <!-- Platform Statistics -->
      <div class="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div 
          v-for="(value, key) in stats" 
          :key="key"
          class="group"
        >
          <div class="text-2xl md:text-3xl font-bold text-gray-100 mb-2">{{ value }}</div>
          <div class="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
            {{ $t(`home.stats.${key}`) }}
          </div>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg 
          class="w-6 h-6 text-gray-400"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section id="features" class="py-24 bg-gray-900/50 backdrop-blur-sm">
    <div class="max-w-7xl mx-auto px-4">
      <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div class="group bg-gray-800/50 hover:bg-gray-800 p-8 rounded-2xl transition-all duration-300 backdrop-blur-sm border border-gray-800">
          <FeatureBlocks type="developer" />
        </div>
        <div class="group bg-gray-800/50 hover:bg-gray-800 p-8 rounded-2xl transition-all duration-300 backdrop-blur-sm border border-gray-800">
          <FeatureBlocks type="company" />
        </div>
      </div>
    </div>
  </section>

  <!-- Platform Demo Section -->
  <PlatformDemo />

  <!-- Testimonials Section -->
  <TestimonialsSection />

  <!-- Scroll to Top Button -->
  <button
    v-show="showScrollTop"
    @click="scrollToTop"
    class="fixed bottom-8 right-8 p-3 bg-gray-800 hover:bg-gray-700 rounded-full shadow-lg transition-all duration-300 opacity-90 hover:opacity-100 z-50"
  >
    <svg 
      class="w-6 h-6 text-gray-300"
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="2" 
        d="M5 10l7-7m0 0l7 7m-7-7v18"
      />
    </svg>
  </button>
</template>

<style scoped>
.bg-gradient-radial {
  background: radial-gradient(circle at center, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%);
}

/* Анимация частиц */
.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    transparent 0%,
    rgba(255, 255, 255, 0.05) 50%,
    transparent 100%
  );
  background-size: 200% 200%;
  animation: moveParticles 20s linear infinite;
}

@keyframes moveParticles {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 200% 200%;
  }
}

/* Плавные переходы */
* {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Оптимизация производительности */
.parallax {
  will-change: transform;
  transform: translateZ(0);
}

/* Scroll Progress Indicator */
.scroll-progress {
  position: fixed;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, var(--tw-gradient-from), var(--tw-gradient-to));
  transform-origin: top;
  z-index: 50;
}
</style>
