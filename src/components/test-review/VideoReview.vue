<template>
  <div class="video-player-container my-4">
    <h2 class="text-xl font-bold mb-4">Video Preview</h2>
    <video
        v-if="videoUrl"
        :src="videoUrl"
        controls
        crossorigin="anonymous"
        class="w-full max-h-96 bg-gray-900 rounded-lg shadow-lg"
    ></video>
    <p v-else class="text-gray-400">No video available to preview.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted } from 'vue';

const props = defineProps({
  videoUrl: String,
});

</script>

<style scoped>
.video-player-container {
  text-align: center;
}
</style>
