<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useTestRecordingsStore } from '../../stores/testRecordings';

const emit = defineEmits<{
  (e: 'recording-complete', blob: Blob): void;
  (e: 'recording-error', error: Error): void;
}>();

const RECORDING_OPTIONS = {
  video: {
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 },
    frameRate: { ideal: 24, max: 30 },
    facingMode: 'user'
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 44100,
    channelCount: 1
  }
};

const VIDEO_MIME_TYPE = 'video/webm;codecs=vp8,opus';
const MAX_RECORDING_SIZE = 50 * 1024 * 1024; // 50MB

const videoPreview = ref<HTMLVideoElement | null>(null);
const mediaRecorder = ref<MediaRecorder | null>(null);
const recordedChunks = ref<Blob[]>([]);
const currentSize = ref(0);
const isRecording = ref(false);
const stream = ref<MediaStream | null>(null);
const error = ref<string | null>(null);

const startRecording = async () => {
  console.log("Запуск записи...");
  try {
    error.value = null;
    stream.value = await navigator.mediaDevices.getUserMedia(RECORDING_OPTIONS);
    console.log("Медиа-поток получен:", stream.value);

    if (videoPreview.value) {
      videoPreview.value.srcObject = stream.value;
      await videoPreview.value.play();
      console.log("Видео-предпросмотр запущен");
    }

    mediaRecorder.value = new MediaRecorder(stream.value, {
      mimeType: VIDEO_MIME_TYPE,
      videoBitsPerSecond: 1500000 // 1.5 Mbps
    });

    recordedChunks.value = [];
    currentSize.value = 0;

    mediaRecorder.value.ondataavailable = handleDataAvailable;
    mediaRecorder.value.onstop = handleRecordingStop;
    mediaRecorder.value.onerror = handleRecordingError;

    mediaRecorder.value.start(1000); // Start recording in chunks every second
    isRecording.value = true;
    console.log("Запись начата...");
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
    error.value = errorMessage;
    console.error('Ошибка при запуске записи:', errorMessage);
    emit('recording-error', new Error(errorMessage));
  }
};

const handleDataAvailable = (event: BlobEvent) => {
  if (event.data && event.data.size > 0) {
    recordedChunks.value.push(event.data);
    currentSize.value += event.data.size;
    console.log(`Новый фрагмент получен, текущий размер: ${currentSize.value / (1024 * 1024)} MB`);

    // Check size limit
    if (currentSize.value >= MAX_RECORDING_SIZE) {
      console.warn("Достигнут максимальный размер записи. Остановка записи...");
      stopRecording();
    }
  }
};

const handleRecordingStop = async () => {
  console.log("Запись остановлена. Обработка записи...");
  try {
    if (recordedChunks.value.length === 0) {
      console.warn("Фрагменты записи отсутствуют.");
      return;
    }

    const fullBlob = new Blob(recordedChunks.value, { type: VIDEO_MIME_TYPE });
    console.log("Полная запись создана, передача записи через emit");
    emit('recording-complete', fullBlob);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to process recording';
    error.value = errorMessage;
    console.error('Ошибка при обработке записи:', errorMessage);
    emit('recording-error', new Error(errorMessage));
  } finally {
    cleanUp();
  }
};

const handleRecordingError = (event: Event) => {
  const errorMessage = event instanceof ErrorEvent ? event.error.message : 'Recording failed';
  error.value = errorMessage;
  console.error('Ошибка записи:', errorMessage);
  emit('recording-error', new Error(errorMessage));
};

const stopRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
    console.log("Остановка записи...");
    mediaRecorder.value.stop();
    isRecording.value = false;
  }
};

const cleanUp = () => {
  console.log("Очистка ресурсов...");
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop());
    stream.value = null;
  }
  if (videoPreview.value) {
    videoPreview.value.srcObject = null;
  }
  recordedChunks.value = [];
  currentSize.value = 0;
  console.log("Очистка завершена.");
};

onMounted(() => {
  console.log("Компонент смонтирован, запуск записи...");
  startRecording();
});

onUnmounted(() => {
  console.log("Компонент демонтируется, остановка записи и очистка...");
  stopRecording();
  cleanUp();
});
</script>

<template>
  <div class="relative">
    <video
        ref="videoPreview"
        class="w-full aspect-video bg-black rounded-lg"
        muted
        playsinline
    ></video>

    <div
        v-if="isRecording"
        class="absolute top-4 right-4 flex items-center space-x-2 bg-black/50 px-3 py-1 rounded-full"
    >
      <div class="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
      <span class="text-sm text-white">Recording</span>
    </div>

    <div
        v-if="error"
        class="absolute bottom-4 left-4 right-4 bg-red-500/10 text-red-400 px-4 py-2 rounded-lg text-sm"
    >
      {{ error }}
    </div>
  </div>
</template>
