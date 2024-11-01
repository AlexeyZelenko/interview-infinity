<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  skills: string[];
  isEditing: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:skills', skills: string[]): void;
}>();

const newSkill = ref('');

const addSkill = () => {
  if (newSkill.value.trim() && !props.skills.includes(newSkill.value.trim())) {
    emit('update:skills', [...props.skills, newSkill.value.trim()]);
    newSkill.value = '';
  }
};

const removeSkill = (skill: string) => {
  emit('update:skills', props.skills.filter(s => s !== skill));
};
</script>

<template>
  <div class="bg-gray-800 rounded-lg p-6">
    <h3 class="text-xl font-semibold mb-4">Skills</h3>
    <div v-if="isEditing" class="space-y-4">
      <div class="flex gap-2">
        <input
            v-model="newSkill"
            type="text"
            class="flex-1 px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder="Add a skill"
            @keyup.enter="addSkill"
        />
        <button
            @click="addSkill"
            class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
        >
          Add
        </button>
      </div>

      <div class="flex flex-wrap gap-2">
        <span
            v-for="skill in skills"
            :key="skill"
            class="group bg-gray-700 px-3 py-1 rounded-full text-sm"
        >
          {{ skill }}
          <button
              @click="removeSkill(skill)"
              class="ml-2 text-gray-400 group-hover:text-red-400"
          >
            ×
          </button>
        </span>
      </div>
    </div>
    <div v-else class="flex flex-wrap gap-2">
      <span
          v-for="skill in skills"
          :key="skill"
          class="bg-gray-700 px-3 py-1 rounded-full text-sm"
      >
        {{ skill }}
      </span>
    </div>
  </div>
</template>