<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getArticleBySlug } from './blogData';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const article = computed(() => {
  const slug = route.params.slug as string;
  return getArticleBySlug(slug);
});

const goBack = () => {
  router.push('/blog');
};
</script>

<template>
  <div class="min-h-screen bg-dark-bg">
    <div class="container mx-auto px-4 py-12">
      <!-- Not Found -->
      <div v-if="!article" class="text-center py-20">
        <h2 class="text-2xl font-bold text-dark-text mb-4">
          {{ $t('blog.articleNotFound') }}
        </h2>
        <button
          @click="goBack"
          class="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          {{ $t('blog.backToBlog') }}
        </button>
      </div>

      <!-- Article Content -->
      <article v-else class="max-w-3xl mx-auto">
        <!-- Back Button -->
        <button
          @click="goBack"
          class="flex items-center text-dark-text-secondary hover:text-primary-400 transition-colors mb-8"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          {{ $t('blog.backToBlog') }}
        </button>

        <!-- Meta -->
        <div class="flex items-center gap-3 mb-4">
          <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-600/10 text-primary-400">
            {{ $t(article.categoryKey) }}
          </span>
          <span class="text-xs text-dark-text-secondary">
            {{ new Date(article.date).toLocaleDateString() }}
          </span>
          <span class="text-xs text-dark-text-secondary">
            {{ article.readTime }} {{ $t('blog.minRead') }}
          </span>
        </div>

        <!-- Title -->
        <h1 class="text-3xl md:text-4xl font-bold text-dark-text mb-4">
          {{ $t(article.titleKey) }}
        </h1>

        <!-- Author -->
        <div class="flex items-center gap-2 mb-8 pb-8 border-b border-dark-border">
          <div class="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center">
            <svg class="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span class="text-sm text-dark-text-secondary">
            {{ $t(article.authorKey) }}
          </span>
        </div>

        <!-- Content -->
        <div class="prose prose-invert max-w-none text-dark-text-secondary leading-relaxed whitespace-pre-line">
          {{ $t(article.contentKey) }}
        </div>

        <!-- Back to Blog -->
        <div class="mt-12 pt-8 border-t border-dark-border">
          <button
            @click="goBack"
            class="bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-colors"
          >
            {{ $t('blog.backToBlog') }}
          </button>
        </div>
      </article>
    </div>
  </div>
</template>
