<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTestRecordingsStore } from '../../stores/testRecordings';
import { useAuthStore } from '../../stores/auth';
import TestRecordingPlayer from './TestRecordingPlayer.vue';

const props = defineProps<{
  testId: string;
  userId?: string;
}>();

const recordingsStore = useTestRecordingsStore();
const authStore = useAuthStore();
const selectedRecording = ref<string | null>(null);

onMounted(async () => {
  await recordingsStore.fetchRecordings(props.testId);
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const formatFileSize = (bytes: number) => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};
</script>

<template>
  <div class="space-y-4">
    <h3 class="text-xl font-semibold mb-4">Test Recordings</h3>

    <div v-if="recordingsStore.loading" class="text-center py-4">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
    </div>

    <div v-else-if="recordingsStore.error" class="text-red-400">
      {{ recordingsStore.error }}
    </div>

    <div v-else>
      <div v-if="selectedRecording" class="mb-6">
        <TestRecordingPlayer
            :recording-url="selectedRecording"
            :autoplay="true"
        />
        <button
            @click="selectedRecording = null"
            class="mt-4 text-primary-400 hover:text-primary-300"
        >
          Back to recordings list
        </button>
      </div>

      <div v-else class="space-y-4">
        <div
            v-for="recording in recordingsStore.getTestRecordings(props.testId)"
            :key="recording.id"
            class="bg-gray-800 rounded-lg p-4"
        >
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm text-gray-400">
                Recorded on {{ formatDate(recording.createdAt) }}
              </p>
              <p class="text-sm text-gray-400">
                Size: {{ formatFileSize(recording.fileSize) }}
              </p>
            </div>
            <button
                @click="selectedRecording = recording.recordingUrl"
                class="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              Watch Recording
            </button>
          </div>
        </div>

        <div v-if="recordingsStore.getTestRecordings(props.testId).length === 0" class="text-center py-4">
          <p class="text-gray-400">No recordings available</p>
        </div>
      </div>
    </div>
  </div>
</template>