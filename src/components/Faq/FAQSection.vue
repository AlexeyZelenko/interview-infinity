<template>
  <div class="max-w-4xl mx-auto">
    <!-- Category Tabs -->
    <div class="flex flex-wrap gap-2 mb-8 justify-center">
      <button
        v-for="category in categories"
        :key="category.id"
        @click="activeCategory = category.id"
        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="activeCategory === category.id
          ? 'bg-primary-600 text-white'
          : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'"
      >
        {{ $t(category.label) }}
      </button>
    </div>

    <!-- FAQ Items -->
    <div class="space-y-4">
      <div
        v-for="(item, index) in currentItems"
        :key="item.key"
        class="bg-gray-800 rounded-lg overflow-hidden transition-all"
      >
        <button
          @click="toggleItem(item.key)"
          class="w-full flex justify-between items-center p-5 text-left"
        >
          <h3 class="text-lg font-medium text-white pr-4">
            {{ $t('faq.articles.' + activeCategory + '.' + item.key + '.question') }}
          </h3>
          <svg
            class="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200"
            :class="{ 'rotate-180': openItems.includes(item.key) }"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <transition name="faq-expand">
          <div v-if="openItems.includes(item.key)" class="px-5 pb-5">
            <div class="text-gray-300 leading-relaxed whitespace-pre-line text-sm">
              {{ $t('faq.articles.' + activeCategory + '.' + item.key + '.answer') }}
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const activeCategory = ref('general');
const openItems = ref<string[]>([]);

const categories = [
  { id: 'general', label: 'faq.categories.general' },
  { id: 'developers', label: 'faq.categories.developers' },
  { id: 'companies', label: 'faq.categories.companies' },
];

const itemsByCategory: Record<string, { key: string }[]> = {
  general: [
    { key: 'whatIs' },
    { key: 'security' },
  ],
  developers: [
    { key: 'createResume' },
    { key: 'testing' },
    { key: 'applyJobs' },
    { key: 'trackProgress' },
  ],
  companies: [
    { key: 'createTests' },
    { key: 'evaluation' },
    { key: 'reviewResults' },
    { key: 'bestPractices' },
  ],
};

const currentItems = computed(() => itemsByCategory[activeCategory.value] || []);

const toggleItem = (key: string) => {
  const idx = openItems.value.indexOf(key);
  if (idx >= 0) {
    openItems.value.splice(idx, 1);
  } else {
    openItems.value.push(key);
  }
};
</script>

<style scoped>
.faq-expand-enter-active,
.faq-expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.faq-expand-enter-from,
.faq-expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.faq-expand-enter-to,
.faq-expand-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
