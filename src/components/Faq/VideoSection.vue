<template>
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">{{ $t("faq.sections.video.title") }}</h2>
    <p>{{ $t("faq.sections.video.description") }}</p>
    <div class="space-y-4">
      <div v-for="video in videos" :key="video.id" class="mb-4">
        <h3 class="text-xl font-semibold">{{ video.title }}</h3>
        <iframe :src="video.url" class="w-full h-64" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const videos = [
  { id: 1, title: 'Introduction to the Platform', url: 'https://www.youtube.com/embed/abc123' },
  { id: 2, title: 'How to Use Features', url: 'https://www.youtube.com/embed/xyz456' }
];
</script>
