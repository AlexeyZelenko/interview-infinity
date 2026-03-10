<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const sectionRef = ref<HTMLElement | null>(null);
const visibleSteps = ref<number[]>([]);

const steps = [
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>`,
    titleKey: 'howItWorks.step1.title',
    descKey: 'howItWorks.step1.description',
  },
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z"/></svg>`,
    titleKey: 'howItWorks.step2.title',
    descKey: 'howItWorks.step2.description',
  },
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"/></svg>`,
    titleKey: 'howItWorks.step3.title',
    descKey: 'howItWorks.step3.description',
  },
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>`,
    titleKey: 'howItWorks.step4.title',
    descKey: 'howItWorks.step4.description',
  },
];

let observer: IntersectionObserver | null = null;

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.getAttribute('data-step'));
          if (!visibleSteps.value.includes(idx)) {
            visibleSteps.value.push(idx);
          }
          observer!.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  sectionRef.value?.querySelectorAll('.step-card').forEach((el) => {
    observer!.observe(el);
  });
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});
</script>

<template>
  <section ref="sectionRef" class="py-24 relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/30 to-transparent"></div>

    <div class="relative z-10 max-w-5xl mx-auto px-4">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-100">
        {{ $t('howItWorks.title') }}
      </h2>
      <p class="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
        {{ $t('howItWorks.subtitle') }}
      </p>

      <!-- Timeline -->
      <div class="relative">
        <!-- Connecting Line -->
        <div class="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-500/30 to-transparent"></div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div
            v-for="(step, index) in steps"
            :key="index"
            :data-step="index"
            class="step-card relative flex flex-col items-center text-center transition-all duration-700"
            :class="visibleSteps.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
            :style="{ transitionDelay: index * 150 + 'ms' }"
          >
            <!-- Step Number + Icon -->
            <div class="relative mb-6">
              <div class="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-primary-400 transition-all duration-300 hover:bg-white/10 hover:border-primary-400/40 hover:scale-110 hover:shadow-lg hover:shadow-primary-500/20">
                <div v-html="step.icon"></div>
              </div>
              <span class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center">
                {{ index + 1 }}
              </span>
            </div>

            <!-- Arrow (between steps, desktop only) -->
            <div v-if="index < steps.length - 1" class="hidden md:block absolute top-16 -right-4 translate-x-1/2 text-gray-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>

            <h3 class="text-lg font-semibold text-gray-100 mb-2">
              {{ $t(step.titleKey) }}
            </h3>
            <p class="text-sm text-gray-400 leading-relaxed">
              {{ $t(step.descKey) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
