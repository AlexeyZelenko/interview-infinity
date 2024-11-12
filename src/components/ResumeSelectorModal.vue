<template>
  <div>
    <select
        v-model="localSelectedResumeId"
        @change="updateSelectedResume($event.target.value)"
        class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
    >
      <option value="" disabled>Select a resume</option>
      <option v-for="resume in resumes" :key="resume.id" :value="resume.id">{{ resume.title }}</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue';

const props = defineProps<{
  resumes: Array<{ id: string; title: string }>;
  selectedResumeId: string | null;
}>();

const emit = defineEmits<{
  (event: 'update:selectedResumeId', value: string): void;
}>();

// Создание локальной копии prop
const localSelectedResumeId = ref(props.selectedResumeId);

// Следим за изменением prop и обновляем локальную переменную
watch(
    () => props.selectedResumeId,
    (newValue) => {
      localSelectedResumeId.value = newValue;
    }
);

// Функция для обновления выбранного резюме
const updateSelectedResume = (id: string) => {
  emit('update:selectedResumeId', id);
};
</script>
