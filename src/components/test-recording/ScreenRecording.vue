<script setup lang="ts">
import {
  startScreenRecording,
  stopScreenRecording,
  previewRecording,
  deleteRecording,
  uploadRecording
} from '../../utils/screenRecording';

</script>

<template>
  <div class="space-y-4">
    <!-- Видео предпросмотр -->
    <video id="videoPreview" controls class="w-full max-h-96 border-2 border-gray-700 rounded-lg"></video>

    <!-- Кнопки управления записью -->
    <div class="flex space-x-4">
      <button @click="startScreenRecording" class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200"
      >Start Recording </button>
      <button @click="previewRecording" class="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors duration-200"
      >Preview Recording</button>
      <button
          @click="stopScreenRecording"
          class="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors duration-200"
      >Stop Recording</button>
      <button @click="uploadRecording" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
      >Upload to Loom</button>
      <button @click="deleteRecording" class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200"
      >Delete Recording</button>
    </div>
    <!-- Индикатор записи -->
    <div
        id="recordingIndicator"
        style="height: 50px; width: 100px; display: none;"
        class="fixed top-6 right-8 bg-red-500 text-white px-3 py-1 rounded-md shadow-lg text-sm font-semibold animate-pulse"
    >Recording...</div>
  </div>
</template>