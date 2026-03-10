<script setup lang="ts">
import type { BlogArticle } from './blogData';

defineProps<{
  article: BlogArticle;
}>();
</script>

<template>
  <router-link
    :to="`/blog/${article.slug}`"
    class="block bg-dark-card border border-dark-border rounded-xl overflow-hidden hover:border-primary-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 group"
  >
    <!-- Category & Date -->
    <div class="p-5">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-600/10 text-primary-400">
          {{ $t(article.categoryKey) }}
        </span>
        <span class="text-xs text-dark-text-secondary">
          {{ new Date(article.date).toLocaleDateString() }}
        </span>
      </div>

      <!-- Title -->
      <h3 class="text-dark-text font-semibold text-lg mb-2 group-hover:text-primary-400 transition-colors line-clamp-2">
        {{ $t(article.titleKey) }}
      </h3>

      <!-- Description -->
      <p class="text-dark-text-secondary text-sm leading-relaxed line-clamp-3 mb-4">
        {{ $t(article.descriptionKey) }}
      </p>

      <!-- Footer -->
      <div class="flex items-center justify-between text-xs text-dark-text-secondary">
        <span>{{ $t(article.authorKey) }}</span>
        <span>{{ article.readTime }} {{ $t('blog.minRead') }}</span>
      </div>
    </div>
  </router-link>
</template>
