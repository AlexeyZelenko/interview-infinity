<script setup lang="ts">
import { ref, computed } from 'vue';
import { blogArticles } from './blogData';
import BlogCard from './BlogCard.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const selectedCategory = ref('all');

const categories = computed(() => {
  const keys = [...new Set(blogArticles.map(a => a.categoryKey))];
  return keys;
});

const filteredArticles = computed(() => {
  if (selectedCategory.value === 'all') return blogArticles;
  return blogArticles.filter(a => a.categoryKey === selectedCategory.value);
});
</script>

<template>
  <div class="min-h-screen bg-dark-bg">
    <div class="container mx-auto px-4 py-12">
      <!-- Header -->
      <div class="text-center mb-10">
        <h1 class="text-3xl md:text-4xl font-bold text-dark-text mb-3">
          {{ $t('blog.title') }}
        </h1>
        <p class="text-dark-text-secondary max-w-2xl mx-auto">
          {{ $t('blog.subtitle') }}
        </p>
      </div>

      <!-- Category Filter -->
      <div class="flex flex-wrap items-center justify-center gap-2 mb-8">
        <button
          @click="selectedCategory = 'all'"
          class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
          :class="selectedCategory === 'all'
            ? 'bg-primary-600 text-white'
            : 'bg-dark-card border border-dark-border text-dark-text-secondary hover:text-dark-text'"
        >
          {{ $t('blog.allCategories') }}
        </button>
        <button
          v-for="cat in categories"
          :key="cat"
          @click="selectedCategory = cat"
          class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
          :class="selectedCategory === cat
            ? 'bg-primary-600 text-white'
            : 'bg-dark-card border border-dark-border text-dark-text-secondary hover:text-dark-text'"
        >
          {{ $t(cat) }}
        </button>
      </div>

      <!-- Articles Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BlogCard
          v-for="article in filteredArticles"
          :key="article.slug"
          :article="article"
        />
      </div>

      <!-- Empty State -->
      <div v-if="filteredArticles.length === 0" class="text-center py-16">
        <p class="text-dark-text-secondary text-lg">
          {{ $t('blog.noArticles') }}
        </p>
      </div>
    </div>
  </div>
</template>
