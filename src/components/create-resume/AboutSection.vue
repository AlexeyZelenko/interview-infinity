<script setup lang="ts">
const props = defineProps<{
  about: string;
}>();

const emit = defineEmits<{
  (e: 'update:about', value: string): void;
}>();
</script>

<template>
  <div class="bg-gray-800 rounded-lg p-6">
    <h3 class="text-xl font-semibold mb-4">About</h3>
    <textarea
        :value="about"
        @input="emit('update:about', ($event.target as HTMLTextAreaElement).value)"
        rows="4"
        class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
        placeholder="Write a brief introduction about yourself..."
    ></textarea>
  </div>
</template>