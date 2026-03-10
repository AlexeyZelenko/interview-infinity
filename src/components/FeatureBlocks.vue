<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  type: {
    type: String,
    required: true,
  }
});

const features = {
  developer: [
    { title: 'blocks.features.developer.0.title', description: 'blocks.features.developer.0.description' },
    { title: 'blocks.features.developer.1.title', description: 'blocks.features.developer.1.description' },
    { title: 'blocks.features.developer.2.title', description: 'blocks.features.developer.2.description' },
    { title: 'blocks.features.developer.3.title', description: 'blocks.features.developer.3.description' },
    { title: 'blocks.features.developer.4.title', description: 'blocks.features.developer.4.description' },
    { title: 'blocks.features.developer.5.title', description: 'blocks.features.developer.5.description' },
    { title: 'blocks.features.developer.6.title', description: 'blocks.features.developer.6.description' },
  ],
  company: [
    { title: 'blocks.features.company.0.title', description: 'blocks.features.company.0.description' },
    { title: 'blocks.features.company.1.title', description: 'blocks.features.company.1.description' },
    { title: 'blocks.features.company.2.title', description: 'blocks.features.company.2.description' },
    { title: 'blocks.features.company.3.title', description: 'blocks.features.company.3.description' },
    { title: 'blocks.features.company.4.title', description: 'blocks.features.company.4.description' },
    { title: 'blocks.features.company.5.title', description: 'blocks.features.company.5.description' },
    { title: 'blocks.features.company.6.title', description: 'blocks.features.company.6.description' },
  ],
  general: [
    { title: 'blocks.features.general.0.title', description: 'blocks.features.general.0.description' },
    { title: 'blocks.features.general.1.title', description: 'blocks.features.general.1.description' },
    { title: 'blocks.features.general.2.title', description: 'blocks.features.general.2.description' },
  ]
};

const sectionRef = ref<HTMLElement | null>(null);
const visibleItems = ref<number[]>([]);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.getAttribute('data-idx'));
          if (!visibleItems.value.includes(idx)) {
            visibleItems.value.push(idx);
          }
          observer!.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  sectionRef.value?.querySelectorAll('.feature-item').forEach((el) => {
    observer!.observe(el);
  });
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});

const padNumber = (n: number) => String(n + 1).padStart(2, '0');
</script>

<template>
  <div ref="sectionRef" class="h-full flex flex-col">
    <!-- Section label -->
    <div class="mb-8">
      <span class="text-xs uppercase tracking-[0.25em] font-medium"
            :class="type === 'developer' ? 'text-primary-400' : 'text-accent-400'">
        {{ type === 'developer' ? $t('blocks.forDevelopers') : type === 'company' ? $t('blocks.forCompanies') : $t('blocks.generalInformation') }}
      </span>
    </div>

    <!-- Feature items -->
    <div class="space-y-0 divide-y divide-white/[0.06] flex-1">
      <div
        v-for="(feature, index) in features[type]"
        :key="feature.title"
        :data-idx="index"
        class="feature-item group py-5 first:pt-0 transition-all duration-500"
        :class="visibleItems.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
        :style="{ transitionDelay: (index * 80) + 'ms' }"
      >
        <div class="flex gap-4">
          <!-- Number -->
          <span class="text-sm font-mono shrink-0 mt-0.5 transition-colors duration-300"
                :class="type === 'developer'
                  ? 'text-primary-500/40 group-hover:text-primary-400'
                  : 'text-accent-500/40 group-hover:text-accent-400'">
            {{ padNumber(index) }}
          </span>

          <!-- Content -->
          <div>
            <h3 class="text-base font-semibold text-dark-text leading-snug group-hover:text-white transition-colors duration-300">
              {{ $t(feature.title) }}
            </h3>
            <p class="text-sm text-dark-text-secondary/70 leading-relaxed mt-1.5 group-hover:text-dark-text-secondary transition-colors duration-300">
              {{ $t(feature.description) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <router-link
      v-if="type === 'developer' || type === 'company'"
      :to="`/register?type=${type}`"
      class="inline-flex items-center gap-2 mt-8 text-sm font-medium transition-all duration-300 group/cta"
      :class="type === 'developer' ? 'text-primary-400 hover:text-primary-300' : 'text-accent-400 hover:text-accent-300'"
    >
      {{ type === 'developer' ? $t('blocks.joinAsDeveloper') : $t('blocks.joinAsCompany') }}
      <span class="transition-transform duration-300 group-hover/cta:translate-x-1">→</span>
    </router-link>
  </div>
</template>

<style scoped>
.feature-item {
  will-change: transform, opacity;
}
</style>
