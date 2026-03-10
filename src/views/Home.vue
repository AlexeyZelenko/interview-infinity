<script setup lang="ts">
import FeatureBlocks from '@/components/FeatureBlocks.vue';
import TestimonialsSection from '@/components/TestimonialsSection.vue';
import PlatformDemo from '@/components/PlatformDemo.vue';
import SkillsBubbleChart from '@/components/SkillsBubbleChart.vue';
import WorldMapSection from '@/components/WorldMapSection.vue';
import HowItWorks from '@/components/HowItWorks.vue';
import OnboardingGuide from '@/components/OnboardingGuide.vue';
import { useAuthStore } from '@/stores/auth';
import { logEvent } from "firebase/analytics";
import { analytics } from '@/firebase/config';
import { onMounted, ref, onUnmounted, computed } from "vue";
import { useWindowScroll, useWindowSize } from '@vueuse/core';
import { useI18n } from 'vue-i18n';

const authStore = useAuthStore();

const { t } = useI18n();
const { y } = useWindowScroll();
const { height } = useWindowSize();
const parallaxOffset = ref(0);
const showScrollTop = computed(() => y.value > height.value * 0.5);

// Hero entrance animation
const heroVisible = ref(false);

// Typing animation
const typingText = ref('');
const typingIndex = ref(0);
const charIndex = ref(0);
const isDeleting = ref(false);
let typingTimer: ReturnType<typeof setTimeout> | null = null;

const companyNames = ['Google', 'Meta', 'Microsoft', 'Amazon', 'Apple'];

const typeEffect = () => {
  const current = companyNames[typingIndex.value];

  if (!isDeleting.value) {
    typingText.value = current.substring(0, charIndex.value + 1);
    charIndex.value++;

    if (charIndex.value === current.length) {
      isDeleting.value = true;
      typingTimer = setTimeout(typeEffect, 1500);
      return;
    }
  } else {
    typingText.value = current.substring(0, charIndex.value - 1);
    charIndex.value--;

    if (charIndex.value === 0) {
      isDeleting.value = false;
      typingIndex.value = (typingIndex.value + 1) % companyNames.length;
    }
  }

  typingTimer = setTimeout(typeEffect, isDeleting.value ? 50 : 100);
};

// Scroll progress
const scrollProgress = computed(() => {
  const docHeight = document.documentElement?.scrollHeight || 1;
  const winHeight = window.innerHeight || 1;
  const maxScroll = docHeight - winHeight;
  if (maxScroll <= 0) return 0;
  return Math.min(y.value / maxScroll, 1);
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
  typeEffect();

  // Trigger hero entrance animation after mount
  requestAnimationFrame(() => {
    heroVisible.value = true;
  });
});

onUnmounted(() => {
  window.removeEventListener('scroll', updateParallax);
  if (typingTimer) clearTimeout(typingTimer);
});
</script>

<template>
  <!-- Scroll Progress Bar -->
  <div
    class="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary-500 to-accent-500 z-[100] transition-none"
    :style="{ width: (scrollProgress * 100) + '%' }"
  ></div>

  <!-- Onboarding Guide for logged-in users -->
  <OnboardingGuide v-if="authStore.user" class="mt-4" />

  <!-- Hero Section -->
  <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
    <!-- Floating spheres -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="float-el sphere sphere-1"></div>
      <div class="float-el sphere sphere-2"></div>
      <div class="float-el sphere sphere-3"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 text-center max-w-4xl mx-auto px-4">
      <!-- Badge -->
      <div
        class="hero-animate transition-all duration-700"
        :class="heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        :style="{ transitionDelay: '100ms' }"
      >
        <span class="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-sm text-dark-text-secondary">
          <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          {{ $t('home.platformBadge') }}
        </span>
      </div>

      <h1
        class="text-5xl md:text-7xl font-bold mb-6 hero-animate transition-all duration-700"
        :class="heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        :style="{ transitionDelay: '250ms' }"
      >
        <span class="text-dark-text">{{ $t('home.titleLine1') }}</span>
        <br />
        <span class="bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">
          {{ $t('home.titleLine2') }}
        </span>
      </h1>

      <p
        class="text-lg md:text-xl text-dark-text-secondary mb-4 max-w-2xl mx-auto leading-relaxed hero-animate transition-all duration-700"
        :class="heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        :style="{ transitionDelay: '400ms' }"
      >
        {{ $t('home.description') }}
      </p>

      <p
        class="text-2xl md:text-3xl font-semibold mb-12 h-10 hero-animate transition-all duration-700"
        :class="heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        :style="{ transitionDelay: '550ms' }"
      >
        <span class="text-primary-400">{{ typingText }}</span><span class="typing-cursor">|</span>
      </p>

      <!-- CTA Buttons -->
      <div
        class="flex flex-wrap justify-center gap-4 hero-animate transition-all duration-700"
        :class="heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        :style="{ transitionDelay: '700ms' }"
      >
        <button
          @click="scrollToSection('features')"
          class="px-8 py-3 bg-dark-card hover:bg-dark-hover rounded-lg transition-all duration-300 border border-dark-border text-dark-text hover:-translate-y-0.5"
        >
          {{ $t('home.exploreFeatures') }}
        </button>
        <router-link
          to="/register"
          class="cta-glow px-8 py-3 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-1"
        >
          {{ $t('home.getStarted') }}
        </router-link>
      </div>     

    </div>
  </section>

  <!-- Skills Bubble Chart -->
  <SkillsBubbleChart />

  <!-- Features Section -->
  <section id="features" class="py-24">
    <div class="max-w-5xl mx-auto px-4">
      <div class="grid md:grid-cols-2 gap-16">
        <FeatureBlocks type="developer" />
        <FeatureBlocks type="company" />
      </div>
    </div>
  </section>

  <!-- How It Works -->
  <HowItWorks />

  <!-- Platform Demo Section -->
  <!-- <PlatformDemo /> -->

  <!-- World Map Section -->
  <WorldMapSection />

  <!-- Testimonials Section -->
  <TestimonialsSection />

  <!-- Scroll to Top Button -->
  <button
    v-show="showScrollTop"
    @click="scrollToTop"
    class="fixed bottom-8 right-8 p-3 bg-primary-600 hover:bg-primary-500 rounded-full shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all duration-300 hover:-translate-y-1 z-50 border border-primary-500/30"
  >
    <svg
      class="w-6 h-6 text-white"
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

/* Typing cursor */
.typing-cursor {
  animation: blink 0.7s infinite;
  color: var(--color-text-secondary);
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Плавные переходы */
* {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Bento Grid Layout */
.bento-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .bento-grid {
    grid-template-columns: 1.4fr 1fr;
    grid-template-rows: auto;
  }

  .bento-main {
    grid-row: 1;
    grid-column: 1;
  }

  .bento-side {
    grid-row: 1;
    grid-column: 2;
  }
}

/* Floating geometric elements */
.float-el {
  position: absolute;
  will-change: transform;
  pointer-events: none;
}

/* Spheres — gradient circles with blur */
.sphere {
  border-radius: 50%;
}
.sphere-1 {
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.15), transparent 70%);
  filter: blur(20px);
  top: 15%;
  left: 10%;
  animation: floatSphere1 28s ease-in-out infinite;
}
.sphere-2 {
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(217, 70, 239, 0.12), transparent 70%);
  filter: blur(15px);
  bottom: 20%;
  right: 8%;
  animation: floatSphere2 34s ease-in-out infinite;
}
.sphere-3 {
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.15), transparent 70%);
  filter: blur(10px);
  top: 60%;
  left: 65%;
  animation: floatSphere3 22s ease-in-out infinite;
}

@keyframes floatSphere1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -40px) scale(1.05); }
  50% { transform: translate(-20px, 20px) scale(0.95); }
  75% { transform: translate(15px, 35px) scale(1.02); }
}
@keyframes floatSphere2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(-25px, 30px) scale(1.03); }
  50% { transform: translate(35px, -15px) scale(0.97); }
  75% { transform: translate(-10px, -25px) scale(1.04); }
}
@keyframes floatSphere3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(20px, -30px) scale(1.06); }
  66% { transform: translate(-15px, 20px) scale(0.94); }
}

/* Gradient text animation */
@keyframes gradientShift {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}
.animate-gradient-shift {
  animation: gradientShift 4s linear infinite;
}

/* CTA Glow Effect */
.cta-glow {
  position: relative;
}
.cta-glow::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.4), rgba(217, 70, 239, 0.4));
  filter: blur(12px);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}
.cta-glow:hover::before {
  opacity: 1;
}

/* Product card hover glow */
.product-card {
  position: relative;
}
.product-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 1rem;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
  z-index: 0;
}
.bento-main::after {
  background: radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.08), transparent 70%);
}
.bento-side::after {
  background: radial-gradient(circle at 50% 50%, rgba(217, 70, 239, 0.08), transparent 70%);
}
.product-card:hover::after {
  opacity: 1;
}
</style>
