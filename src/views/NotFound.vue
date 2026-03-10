<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();

const quickLinks = [
  { path: '/', label: 'menu.Home' },
  { path: '/jobs', label: 'menu.Jobs' },
  { path: '/tests', label: 'menu.Tests' },
  { path: '/developers', label: 'menu.Developers' },
];

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/');
  }
};
</script>

<template>
  <section class="min-h-[80vh] flex items-center justify-center px-4">
    <div class="text-center max-w-lg mx-auto">
      <!-- 404 Number -->
      <h1 class="text-[8rem] sm:text-[10rem] font-bold leading-none bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift select-none">
        404
      </h1>

      <!-- Message -->
      <h2 class="text-2xl sm:text-3xl font-semibold text-dark-text mb-3 -mt-4">
        {{ $t('notFound.title') }}
      </h2>
      <p class="text-dark-text-secondary mb-8 text-base sm:text-lg">
        {{ $t('notFound.description') }}
      </p>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row justify-center gap-3 mb-10">
        <button
          @click="goBack"
          class="px-6 py-2.5 bg-dark-card hover:bg-dark-hover rounded-lg transition-all duration-300 border border-dark-border text-dark-text hover:-translate-y-0.5"
        >
          {{ $t('notFound.goBack') }}
        </button>
        <router-link
          to="/"
          class="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5"
        >
          {{ $t('notFound.goHome') }}
        </router-link>
      </div>

      <!-- Quick Links -->
      <div class="bg-dark-card/50 backdrop-blur-md border border-dark-border rounded-xl p-6">
        <p class="text-sm text-dark-text-secondary mb-4">{{ $t('notFound.quickLinks') }}</p>
        <div class="flex flex-wrap justify-center gap-3">
          <router-link
            v-for="link in quickLinks"
            :key="link.path"
            :to="link.path"
            class="px-4 py-2 bg-dark-hover/50 hover:bg-dark-hover rounded-lg text-sm text-dark-text-secondary hover:text-dark-text transition-all duration-200 border border-dark-border/50"
          >
            {{ $t(link.label) }}
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes gradientShift {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}
.animate-gradient-shift {
  animation: gradientShift 4s linear infinite;
}
</style>
