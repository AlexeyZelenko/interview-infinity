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
    <h2 class="text-2xl font-semibold mb-6 text-gray-100">
      {{ type === 'developer' ? $t('blocks.forDevelopers') : type === 'company' ? $t('blocks.forCompanies') : $t('blocks.generalInformation') }}
    </h2>
    <div class="space-y-4">
      <div
          v-for="(feature, index) in features[type]"
          :key="feature.title"
          class="feature-block group"
          :style="{ 
            opacity: observedBlocks.includes(`${index}`) ? 1 : 0, 
            transform: observedBlocks.includes(`${index}`) ? 'translateY(0)' : 'translateY(50px)'
          }"
          :data-key="index"
      >
        <div 
          class="relative p-6 rounded-lg transition-all duration-300 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600 hover:bg-gray-800/80"
        >
          <!-- Subtle gradient overlay -->
          <div class="absolute inset-0 rounded-lg bg-gradient-to-br opacity-10 transition-opacity duration-300 group-hover:opacity-20"
               :class="index % 2 === 0 ? 'from-gray-400 to-gray-600' : 'from-gray-500 to-gray-700'">
          </div>
          
          <!-- Content -->
          <div class="relative z-10">
            <div class="flex flex-nowrap items-center gap-4 mb-3">
              <div class="text-3xl opacity-80 transition-transform duration-300 group-hover:scale-110 group-hover:opacity-100">
                {{ feature.icon }}
              </div>
              <h3 v-if="feature.title" class="text-lg font-medium text-gray-100">
                {{ $t(feature.title) }}
              </h3>
            </div>
            <p class="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
              {{ $t(feature.description) }}
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <router-link
        v-if="type === 'developer' || type === 'company'"
        :to="`/register?type=${type}`"
        class="inline-block mt-6 px-6 py-3 rounded-lg text-gray-100 bg-gray-700 hover:bg-gray-600 transition-all duration-300 border border-gray-600 hover:border-gray-500"
    >
      {{ type === 'developer' ? $t('blocks.joinAsDeveloper') : $t('blocks.joinAsCompany') }}
    </router-link>
  </div>
</template>

<style scoped>
.feature-block {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Optimize performance */
.feature-block {
  will-change: transform, opacity;
}

/* Smooth animation for hover effects */
.feature-block:hover {
  transform: translateY(-2px);
}
</style>
