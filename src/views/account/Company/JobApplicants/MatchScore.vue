<script setup lang="ts">
import { defineProps, ref, onMounted, computed } from 'vue';

const props = defineProps<{
  tests: Array<{ score: number }>;
}>();

const matchScore = ref<number>(0);

const allScoresTests = computed(() => {
  return props.tests.map((test) => {
    return test.score;
  });
});

const calculateScore = () => {
  if (allScoresTests.value.length === 0) return 0; // Обработка пустого массива
  const totalScore = allScoresTests.value.reduce((acc: number, score: number) => acc + score, 0);
  return totalScore / allScoresTests.value.length;
};

onMounted(() => {
  matchScore.value = calculateScore();
});
</script>

<template>
  <div v-if="matchScore" class="flex items-center gap-4">
    <div class="text-right">
      <p class="text-sm text-gray-400 mb-1">Match Score</p>
      <p
          class="text-lg font-bold"
          :class="[matchScore >= 80 ? 'text-green-400' :
                    matchScore >= 60 ? 'text-yellow-400' :
                    'text-red-400']"
      >
        {{ matchScore }}%
      </p>
    </div>
  </div>
</template>
