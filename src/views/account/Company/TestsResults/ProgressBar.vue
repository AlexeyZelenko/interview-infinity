<script setup lang="ts">
import { defineProps, computed } from 'vue';

const props = defineProps({
  result: {
    type: Object as () => {
      testId: string;
      completedAt: string;
      score: number;
      answers: Array<{ isCorrect: boolean }>;
    },
    required: false,
  },
});

</script>

<template>
  <div class="w-full bg-gray-700 rounded-full h-2">
    <div
        v-if="result.score"
        class="h-2 rounded-full transition-all duration-300"
        :class="[
                  result.score >= 90 ? 'bg-green-500' :
                  result.score >= 70 ? 'bg-yellow-500' :
                  'bg-red-500'
                ]"
        :style="{ width: `${result.score}%` }"
    ></div>
  </div>
</template>