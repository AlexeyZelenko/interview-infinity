<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  plan: {
    id: string;
    name: string;
    price: number;
    period: string;
    features: string[];
    popular?: boolean;
    buttonText?: string;
  }
}>();

const emit = defineEmits<{
  (e: 'select-plan', plan: any): void
}>();

const cardClasses = computed(() => {
  return {
    'border-primary-500': props.plan.popular,
    'border-gray-700': !props.plan.popular,
    'transform hover:scale-105': props.plan.popular
  };
});
</script>

<template>
  <div 
    class="flex flex-col justify-between bg-gray-800 rounded-lg p-6 border-2 transition-all duration-300"
    :class="cardClasses"
  >
    <div class="relative">
      <h3 class="text-xl font-bold mb-2">{{ plan.name }}</h3>
      <span 
        v-if="plan.popular" 
        class="absolute top-0 right-0 bg-primary-500 text-white text-xs px-2 py-1 rounded"
      >
        Popular
      </span>
    </div>

    <div class="my-4">
      <span class="text-3xl font-bold">${{ plan.price }}</span>
      <span class="text-gray-400">/{{ plan.period }}</span>
    </div>

    <ul class="space-y-3 mb-6">
      <li 
        v-for="feature in plan.features" 
        :key="feature"
        class="flex items-center text-gray-300"
      >
        <svg class="w-5 h-5 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        {{ feature }}
      </li>
    </ul>

    <button
      @click="emit('select-plan', plan)"
      class="w-full bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors"
    >
      {{ plan.buttonText || 'Select Plan' }}
    </button>
  </div>
</template>