<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';
import { PlusCircleIcon, TrashIcon } from '@heroicons/vue/24/outline';

// Определение пропсов и событий
const props = defineProps<{
  languages?: { language: string; level: string }[];
}>();

const emit = defineEmits<{
  (e: 'update:languages', languages: { language: string; level: string }[]): void;
}>();

// Локальные переменные для новых добавлений
const newLanguage = ref('');
const newLevel = ref('');

// Локальная копия пропсов для редактирования
const localLanguages = ref<{ language: string; level: string }[]>(props.languages ? [...props.languages] : []);

// Следим за изменениями пропсов и обновляем локальную копию
watch(() => props.languages, (newLanguages) => {
  if (newLanguages) {
    localLanguages.value = [...newLanguages];
  }
});

// Возможные уровни владения языком
const proficiencyLevels = [
  'Native',
  'Fluent',
  'Advanced',
  'Intermediate',
  'Basic'
];

// Функция добавления нового языка
const addLanguage = () => {
  if (!newLanguage.value.trim() || !newLevel.value) return;

  // Обновление локальной копии и эмитирование события
  localLanguages.value.push({
    language: newLanguage.value.trim(),
    level: newLevel.value
  });

  emit('update:languages', localLanguages.value);
  newLanguage.value = '';
  newLevel.value = '';
};

// Функция удаления языка из списка
const removeLanguage = (index: number) => {
  localLanguages.value.splice(index, 1);
  emit('update:languages', localLanguages.value);
};

// Получение цвета для уровня владения языком
const getLevelColor = (level: string) => {
  switch (level) {
    case 'Native': return 'bg-green-500/10 text-green-400';
    case 'Fluent': return 'bg-blue-500/10 text-blue-400';
    case 'Advanced': return 'bg-yellow-500/10 text-yellow-400';
    case 'Intermediate': return 'bg-orange-500/10 text-orange-400';
    case 'Basic': return 'bg-gray-500/10 text-gray-400';
    default: return 'bg-gray-500/10 text-gray-400';
  }
};
</script>

<template>
  <div class="bg-gray-800 rounded-lg p-6">
    <h3 class="text-xl font-semibold mb-4 text-white flex items-center gap-2">
      <PlusCircleIcon class="w-6 h-6 text-primary-400" />
      Languages
    </h3>

    <!-- Editing Mode -->
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <input
              v-model="newLanguage"
              type="text"
              class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white"
              placeholder="Add a language"
              @keyup.enter="addLanguage"
          />
        </div>
        <div class="flex gap-2">
          <select
              v-model="newLevel"
              class="flex-1 px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white"
          >
            <option value="">Select level</option>
            <option v-for="level in proficiencyLevels" :key="level" :value="level">
              {{ level }}
            </option>
          </select>
          <button
              @click="addLanguage"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-1"
              :disabled="!newLanguage || !newLevel"
          >
            <PlusCircleIcon class="w-5 h-5"/>
            Add
          </button>
        </div>
      </div>

      <div class="space-y-2">
        <div
            v-for="(lang, index) in localLanguages"
            :key="index"
            class="flex justify-between items-center bg-gray-700 px-3 py-2 rounded"
        >
          <div class="flex items-center gap-2">
            <span class="text-white">{{ lang.language }}</span>
            <span :class="[getLevelColor(lang.level), 'px-2 py-0.5 rounded-full text-sm']">
              {{ lang.level }}
            </span>
          </div>
          <button
              @click="removeLanguage(index)"
              class="text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            <TrashIcon class="w-5 h-5"/>
            Remove
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
