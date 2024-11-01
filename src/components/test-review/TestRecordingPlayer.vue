<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  recordingUrl: string;
  autoplay?: boolean;
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(1);
const showControls = ref(false);
const error = ref<string | null>(null);
const isLoading = ref(true);
const retryCount = ref(0);
const MAX_RETRIES = 3;

const togglePlay = async () => {
  if (!videoRef.value) return;

  try {
    if (videoRef.value.paused) {
      await videoRef.value.play();
    } else {
      videoRef.value.pause();
    }
  } catch (err: any) {
    error.value = err.message;
    console.error('Playback error:', err);
  }
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const handleTimeUpdate = () => {
  if (!videoRef.value) return;
  currentTime.value = videoRef.value.currentTime;
};

const handleLoadedMetadata = () => {
  if (!videoRef.value) return;
  duration.value = videoRef.value.duration;
  isLoading.value = false;
};

const handleVolumeChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  volume.value = parseFloat(input.value);
  if (videoRef.value) {
    videoRef.value.volume = volume.value;
  }
};

const handleSeek = (e: Event) => {
  if (!videoRef.value) return;
  const input = e.target as HTMLInputElement;
  const newTime = parseFloat(input.value);

  // Implement smooth seeking
  const seekTo = () => {
    if (videoRef.value) {
      videoRef.value.currentTime = newTime;
    }
  };

  // If video is playing, pause briefly during seek
  const wasPlaying = !videoRef.value.paused;
  if (wasPlaying) {
    videoRef.value.pause();
  }

  // Perform seek
  seekTo();

  // Resume playback if it was playing
  if (wasPlaying) {
    videoRef.value.play().catch(console.error);
  }
};

const handleError = async (e: Event) => {
  const video = e.target as HTMLVideoElement;
  error.value = `Video playback error: ${video.error?.message || 'Unknown error'}`;
  console.error('Video error:', video.error);

  // Implement retry logic
  if (retryCount.value < MAX_RETRIES) {
    retryCount.value++;
    console.log(`Retrying playback (${retryCount.value}/${MAX_RETRIES})...`);

    // Wait briefly before retrying
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Reload video
    if (videoRef.value) {
      videoRef.value.load();
    }
  }
};

const initializeVideo = () => {
  if (!videoRef.value) return;

  // Reset state
  error.value = null;
  isLoading.value = true;
  retryCount.value = 0;

  // Set up video element
  videoRef.value.preload = 'metadata';
  videoRef.value.playsInline = true;
  videoRef.value.controls = false;

  // Add source with explicit MIME type
  const sourceEl = document.createElement('source');
  sourceEl.src = props.recordingUrl;
  sourceEl.type = 'video/webm;codecs=vp8,opus';
  videoRef.value.appendChild(sourceEl);

  // Handle autoplay
  if (props.autoplay) {
    const attemptAutoplay = async () => {
      try {
        if (videoRef.value) {
          await videoRef.value.play();
        }
      } catch (err) {
        console.warn('Autoplay failed:', err);
      }
    };

    // Wait for metadata before attempting autoplay
    videoRef.value.addEventListener('loadedmetadata', attemptAutoplay, { once: true });
  }
};

onMounted(() => {
  initializeVideo();
});

onUnmounted(() => {
  if (videoRef.value) {
    videoRef.value.pause();
    videoRef.value.src = '';
    videoRef.value.load();
  }
});
</script>

<template>
  <div
      class="relative bg-black rounded-lg overflow-hidden"
      @mouseenter="showControls = true"
      @mouseleave="showControls = false"
  >
    <!-- Loading Indicator -->
    <div
        v-if="isLoading"
        class="absolute inset-0 flex items-center justify-center bg-black/80"
    >
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
    </div>

    <!-- Error Message -->
    <div
        v-if="error"
        class="absolute inset-0 flex items-center justify-center bg-black/80 text-red-400 p-4 text-center"
    >
      {{ error }}
      <button
          v-if="retryCount < MAX_RETRIES"
          @click="initializeVideo"
          class="ml-2 text-primary-400 hover:text-primary-300"
      >
        Retry
      </button>
    </div>

    <!-- Video Element -->
    <video
        ref="videoRef"
        class="w-full aspect-video"
        @timeupdate="handleTimeUpdate"
        @loadedmetadata="handleLoadedMetadata"
        @play="isPlaying = true"
        @pause="isPlaying = false"
        @error="handleError"
    >
      Your browser doesn't support video playback.
    </video>

    <!-- Video Controls -->
    <div
        class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300"
        :class="{ 'opacity-0': !showControls && isPlaying && !isLoading }"
    >
      <!-- Progress Bar -->
      <div class="relative">
        <input
            type="range"
            min="0"
            :max="duration"
            :value="currentTime"
            @input="handleSeek"
            class="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
            :style="{
            background: `linear-gradient(to right, #0ea5e9 ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%)`
          }"
        />
        <div
            class="absolute left-0 bottom-0 h-1 bg-primary-500 rounded-full pointer-events-none"
            :style="{ width: `${(currentTime / duration) * 100}%` }"
        ></div>
      </div>

      <div class="flex items-center justify-between mt-2">
        <!-- Play/Pause Button -->
        <button
            @click="togglePlay"
            class="text-white hover:text-primary-400 focus:outline-none"
        >
          <svg
              v-if="isPlaying"
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
          >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <svg
              v-else
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
          >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>

        <!-- Time Display -->
        <div class="text-white text-sm">
          {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
        </div>

        <!-- Volume Control -->
        <div class="flex items-center group relative">
          <button
              class="text-white hover:text-primary-400 focus:outline-none"
              @click="volume = volume === 0 ? 1 : 0"
          >
            <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
              <path
                  v-if="volume > 0"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18l-6-6H2V8h4l6-6v16z"
              />
              <path
                  v-else
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
              />
            </svg>
          </button>

          <div class="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 rounded-lg p-2">
            <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                :value="volume"
                @input="handleVolumeChange"
                class="w-24 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
                :style="{
                background: `linear-gradient(to right, #0ea5e9 ${volume * 100}%, #4b5563 ${volume * 100}%)`
              }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>