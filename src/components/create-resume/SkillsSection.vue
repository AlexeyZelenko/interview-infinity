<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';

// Определение пропсов и событий
const props = defineProps<{
  skills: string[];
}>();

const emit = defineEmits<{
  (e: 'update:skills', skills: string[]): void;
}>();

// Локальная копия навыков для редактирования
const localSkills = ref<string[]>([...props.skills]);

// Следим за изменениями пропсов и обновляем локальную копию
watch(() => props.skills, (newSkills) => {
  localSkills.value = [...newSkills];
});

// Новое значение для добавления навыка
const newSkill = ref('');

// Функция добавления нового навыка
const addSkill = () => {
  const trimmedSkill = newSkill.value.trim();
  if (trimmedSkill && !localSkills.value.includes(trimmedSkill)) {
    localSkills.value.push(trimmedSkill);
    emit('update:skills', localSkills.value);
    newSkill.value = '';
  }
};

// Функция удаления навыка
const removeSkill = (skill: string) => {
  localSkills.value = localSkills.value.filter(s => s !== skill);
  emit('update:skills', localSkills.value);
};
</script>

<template>
  <div class="bg-gray-800 rounded-lg p-6">
    <h3 class="text-xl font-semibold mb-4">Skills</h3>
    <div class="space-y-4">
      <div class="flex gap-2">
        <input
            v-model="newSkill"
            type="text"
            class="flex-1 px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder="Add a skill"
            @keyup.enter="addSkill"
        />
        <button
            @click.prevent="addSkill"
            class="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
        >
          Add
        </button>
      </div>

      <div class="flex flex-wrap gap-2">
        <span
            v-for="skill in localSkills"
            :key="skill"
            class="group bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
        >
          {{ skill }}
          <button
              @click.stop="removeSkill(skill)"
              class="ml-2 text-gray-400 group-hover:text-red-400"
          >
            ×
          </button>
        </span>
      </div>
    </div>
  </div>
</template>
