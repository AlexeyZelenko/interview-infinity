<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import screenfull from 'screenfull';

const emit = defineEmits<{
  (e: 'integrity-violation'): void;
}>();

const video = ref<HTMLVideoElement | null>(null);
const stream = ref<MediaStream | null>(null);
const hasLeftPage = ref(false);
const warningCount = ref(0);
const MAX_WARNINGS = 3;
const webcamEnabled = ref(false); // New ref for webcam state

// Full screen handling
const enterFullScreen = async () => {
  if (screenfull.isEnabled) {
    await screenfull.request();
  }
};

const handleFullScreenChange = () => {
  if (screenfull.isEnabled && !screenfull.isFullscreen) {
    handleIntegrityViolation('Left fullscreen mode');
  }
};

// Page visibility handling
const handleVisibilityChange = () => {
  if (document.hidden) {
    hasLeftPage.value = true;
    handleIntegrityViolation('Left test page');
  }
};

// Tab/Window focus handling
const handleFocusChange = () => {
  if (!document.hasFocus()) {
    handleIntegrityViolation('Changed window/tab');
  }
};

// Copy/Paste prevention
const preventCopyPaste = (e: Event) => {
  e.preventDefault();
  handleIntegrityViolation('Attempted to copy/paste');
};

// Right-click prevention
const preventRightClick = (e: Event) => {
  e.preventDefault();
  handleIntegrityViolation('Attempted to right-click');
};

// Keyboard shortcuts prevention
const preventKeyboardShortcuts = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) &&
      ['c', 'v', 'a', 'p', 's'].includes(e.key.toLowerCase())) {
    e.preventDefault();
    handleIntegrityViolation('Used keyboard shortcut');
  }
};

const handleIntegrityViolation = (reason: string) => {
  warningCount.value++;

  if (warningCount.value >= MAX_WARNINGS) {
    emit('integrity-violation');
  }
};

onMounted(async () => {
  await enterFullScreen();

  // Set up event listeners
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('blur', handleFocusChange);
  document.addEventListener('copy', preventCopyPaste);
  document.addEventListener('paste', preventCopyPaste);
  document.addEventListener('contextmenu', preventRightClick);
  document.addEventListener('keydown', preventKeyboardShortcuts);
  if (screenfull.isEnabled) {
    screenfull.on('change', handleFullScreenChange);
  }
});

onUnmounted(() => {
  // Cleanup
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop());
  }

  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener('blur', handleFocusChange);
  document.removeEventListener('copy', preventCopyPaste);
  document.removeEventListener('paste', preventCopyPaste);
  document.removeEventListener('contextmenu', preventRightClick);
  document.removeEventListener('keydown', preventKeyboardShortcuts);
  if (screenfull.isEnabled) {
    screenfull.off('change', handleFullScreenChange);
  }
});
</script>

<template>
  <div class="fixed bottom-4 right-4 bg-gray-800 rounded-lg shadow-lg p-4">
    <!-- Optional webcam toggle -->
    <div class="mb-4">
      <label class="flex items-center space-x-2">
        <input
            type="checkbox"
            v-model="webcamEnabled"
            class="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
        >
        <span>Enable webcam monitoring</span>
      </label>
    </div>

    <!-- Only show video if webcam is enabled -->
    <template v-if="webcamEnabled">
      <video
          ref="video"
          autoplay
          playsinline
          muted
          class="w-80 h-60 rounded-lg mb-2"
      ></video>

      <div class="text-sm text-gray-300">
        <p>Webcam monitoring active</p>
        <p v-if="warningCount > 0" class="text-yellow-400">
          Warnings: {{ warningCount }}/{{ MAX_WARNINGS }}
        </p>
      </div>
    </template>

    <!-- Always show integrity monitoring status -->
    <div class="text-sm text-gray-300">
      <p>Test integrity monitoring active</p>
      <p v-if="warningCount > 0" class="text-yellow-400">
        Warnings: {{ warningCount }}/{{ MAX_WARNINGS }}
      </p>
    </div>
  </div>
</template>
