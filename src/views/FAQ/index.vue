<template>
  <div class="container mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg">
    <!-- Заголовок страницы -->
    <h1 class="text-4xl font-bold mb-8 text-center text-primary-400">{{ $t("faq.title") }}</h1>

    <!-- Секция: Введение -->
    <section class="mb-12 bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 class="text-2xl font-semibold mb-4 text-primary-500" v-html="$t('faq.sections.introduction')"></h3>
<!--      <p class="text-gray-300">{{ $t("faq.sections.introductionDescription") }}</p>-->
    </section>

    <!-- Секция: Статьи -->
    <section class="mb-12">
      <ArticlesSection />
    </section>

    <!-- Секция: Видео -->
<!--    <section class="mb-12">-->
<!--      <VideoSection />-->
<!--    </section>-->

    <!-- Секция: Часто задаваемые вопросы -->
<!--    <section class="mb-12 bg-gray-800 p-6 rounded-lg shadow-md">-->
<!--      <FAQSection />-->
<!--    </section>-->
  </div>
</template>

<script setup lang="ts">
import ArticlesSection from '@/components/Faq/ArticlesSection.vue';
// import VideoSection from '@/components/Faq/VideoSection.vue';
// import FAQSection from '@/components/Faq/FAQSection.vue';
</script>

<style scoped>
/* Общие стили для всей страницы */
.container {
  max-width: 1200px;
  margin-top: 2rem;
  padding: 2rem;
  background-color: #111827;
}

/* Заголовок страницы */
h1 {
  text-align: center;
  font-weight: 700;
  color: #60A5FA; /* primary-400 */
}

/* Секция: Введение */
section {
  margin-bottom: 3rem;
  background-color: #2D3748; /* gray-800 */
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
}

/* Заголовки секций */
h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #3B82F6; /* primary-500 */
  margin-bottom: 1rem;
}

/* Текст внутри секций */
p {
  color: #E5E7EB; /* gray-300 */
  font-size: 1rem;
}

/* Стили для ссылок и кнопок */
button, a {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #3B82F6; /* primary-600 */
  color: #F9FAFB; /* white */
  border-radius: 0.375rem;
  text-decoration: none;
  cursor: pointer;
}

button:hover, a:hover {
  background-color: #2563EB; /* primary-700 */
}

/* Стили для компонента статей */
section .bg-gray-800 {
  background-color: #1F2937; /* gray-800 */
  padding: 1.5rem;
  border-radius: 0.375rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
}
</style>
