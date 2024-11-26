<template>
  <div class="max-w-7xl mx-auto px-6 py-8">
    <h1 class="text-4xl font-bold text-white text-center mb-10">
      Frequently Asked Questions
    </h1>

    <div class="space-y-6">
      <div v-for="(faq, index) in faqs" :key="index" class="bg-gray-800 p-6 rounded-lg shadow-lg transition-all">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-semibold text-white">{{ faq.question }}</h2>
          <button
              @click="faq.open = !faq.open"
              :class="faq.open ? 'rotate-180' : 'rotate-0'"
              class="transition-transform duration-200 text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <transition name="fade">
          <p v-if="faq.open" class="mt-4 text-gray-300">{{ faq.answer }}</p>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface FAQ {
  question: string;
  answer: string;
  open: boolean;
}

const faqs = ref<FAQ[]>([
  {
    question: "Can I change my plan later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time.",
    open: false
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards and PayPal.",
    open: false
  },
  {
    question: "Is there a long-term contract?",
    answer: "No, all plans are month-to-month with no long-term commitment.",
    open: false
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 30-day money-back guarantee for all paid plans.",
    open: false
  },
]);
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
