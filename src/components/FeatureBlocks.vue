<script setup lang="ts">
import { defineProps, ref, onMounted } from 'vue';

const props = defineProps({
  type: {
    type: String,
    required: true,
  }
});

const features = {
  developer: [
    { icon: "🌐", title: 'blocks.features.developer.0.title', description: 'blocks.features.developer.0.description' },
    { icon: "🔍", title: 'blocks.features.developer.1.title', description: 'blocks.features.developer.1.description' },
    { icon: "📝", title: 'blocks.features.developer.2.title', description: 'blocks.features.developer.2.description' },
    { icon: "💡", title: 'blocks.features.developer.3.title', description: 'blocks.features.developer.3.description' },
    { icon: "📊", title: 'blocks.features.developer.4.title', description: 'blocks.features.developer.4.description' },
    { icon: "🎯", title: 'blocks.features.developer.5.title', description: 'blocks.features.developer.5.description' },
    { icon: "💬", title: 'blocks.features.developer.6.title', description: 'blocks.features.developer.6.description' },
  ],
  company: [
    { icon: "👥", title: 'blocks.features.company.0.title', description: 'blocks.features.company.0.description' },
    { icon: "📋", title: 'blocks.features.company.1.title', description: 'blocks.features.company.1.description' },
    { icon: "📝", title: 'blocks.features.company.2.title', description: 'blocks.features.company.2.description' },
    { icon: "📈", title: 'blocks.features.company.3.title', description: 'blocks.features.company.3.description' },
    { icon: "📮", title: 'blocks.features.company.4.title', description: 'blocks.features.company.4.description' },
    { icon: "💼", title: 'blocks.features.company.5.title', description: 'blocks.features.company.5.description' },
    { icon: "📹", title: 'blocks.features.company.6.title', description: 'blocks.features.company.6.description' },
  ],
  general: [
    { icon: "🗓️", title: 'blocks.features.general.0.title', description: 'blocks.features.general.0.description' },
    { icon: "🔒", title: 'blocks.features.general.1.title', description: 'blocks.features.general.1.description' },
    { icon: "🚧", title: 'blocks.features.general.2.title', description: 'blocks.features.general.2.description' },
  ]
};

const observedBlocks = ref([]);
onMounted(() => {
  // Lazy load blocks with IntersectionObserver
  const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            observedBlocks.value.push(entry.target.getAttribute('data-key'));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
  );

  document.querySelectorAll('.feature-block').forEach((block) => observer.observe(block));
});
</script>

<template>
  <div class="h-full flex flex-col">
    <h2 class="text-2xl font-semibold mb-6">{{ type === 'developer' ? $t('blocks.forDevelopers') : type === 'company' ? $t('blocks.forCompanies') : $t('blocks.generalInformation') }}</h2>
    <div class="space-y-4">
      <div
          v-for="(feature, index) in features[type]"
          :key="feature.title"
          class="feature-block flex flex-col gap-4 p-6 rounded-md transition duration-500 transform"
          :style="{ opacity: observedBlocks.includes(`${index}`) ? 1 : 0, transform: observedBlocks.includes(`${index}`) ? 'translateY(0)' : 'translateY(50px)' }"
          :class="{
            'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500': index % 2 === 0,
            'bg-gradient-to-r from-green-500 to-blue-500': index % 2 !== 0
          }"
          :data-key="index"
      >
        <div class="flex flex-nowrap items-center justify-between">
          <div class="text-4xl">{{ feature.icon }}</div>
          <h3 v-if="feature.title" class="text-lg font-semibold">{{ $t(feature.title) }}</h3>
        </div>
        <p class="text-gray-300">{{ $t(feature.description) }}</p>
      </div>
    </div>
    <router-link
        v-if="type === 'developer' || type === 'company'"
        :to="`/register?type=${type}`"
        class="inline-block bg-primary-600 text-white px-6 py-2 mt-6 rounded-md hover:bg-primary-700"
    >
      {{ type === 'developer' ? $t('blocks.joinAsDeveloper') : $t('blocks.joinAsCompany') }}
    </router-link>
  </div>
</template>
