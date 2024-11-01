<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useTestStore } from '../stores/tests';
import { useTestRecordingsStore } from '../stores/testRecordings';
import { useRouter } from 'vue-router';
import TestIntegrity from '../components/TestIntegrity.vue';
import VideoRecorder from '../components/test-recording/VideoRecorder.vue';
import { VideoProcessor } from '../components/test-recording/VideoProcessor';

const store = useTestStore();
const recordingsStore = useTestRecordingsStore();
const router = useRouter();

const currentQuestionIndex = ref(0);
const selectedAnswer = ref<number | null>(null);
const answers = ref<number[]>([]);
const timeLeft = ref(0);
const timer = ref<number | null>(null);
const showCompletionModal = ref(false);
const recordingUrl = ref('');
const savingRecording = ref(false);
const recordingError = ref<string | null>(null);

const showIntegrityWarning = ref(false);
const integrityViolations = ref<string[]>([]);

const currentQuestion = computed(() => {
  if (!store.currentTest?.questions) return null;
  return store.currentTest.questions[currentQuestionIndex.value];
});

const progress = computed(() => {
  if (!store.currentTest?.questions) return 0;
  return Math.round((currentQuestionIndex.value / store.currentTest.questions.length) * 100);
});

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const startTimer = () => {
  if (!store.currentTest) return;

  timeLeft.value = store.currentTest.duration * 60;
  timer.value = window.setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      submitTest();
    }
  }, 1000);
};

const submitAnswer = () => {
  if (selectedAnswer.value === null) return;

  answers.value[currentQuestionIndex.value] = selectedAnswer.value;
  selectedAnswer.value = null;

  if (currentQuestionIndex.value < (store.currentTest?.questions?.length || 0) - 1) {
    currentQuestionIndex.value++;
  } else {
    submitTest();
  }
};

const handleRecordingComplete = async (recording: Blob) => {
  try {
    savingRecording.value = true;
    recordingError.value = null;

    // Compress video before saving
    const compressedRecording = await VideoProcessor.compressVideo(recording, {
      maxWidth: 1280,
      maxHeight: 720,
      videoBitrate: 1000000, // 1 Mbps
      targetSize: 10 * 1024 * 1024 // 10MB
    });

    // Generate thumbnail
    const thumbnail = await VideoProcessor.generateThumbnail(compressedRecording);

    // Save recording
    const recordingId = await recordingsStore.saveRecording(
        store.currentTest!.id,
        compressedRecording,
        thumbnail
    );

    // Get recording URL
    const recordingData = recordingsStore.recordings.find(r => r.id === recordingId);
    if (recordingData) {
      recordingUrl.value = recordingData.recordingUrl;
    }
  } catch (error) {
    console.error('Error saving recording:', error);
    recordingError.value = error instanceof Error ? error.message : 'Failed to save recording';
  } finally {
    savingRecording.value = false;
  }
};

const handleRecordingError = (error: Error) => {
  console.error('Recording error:', error);
  recordingError.value = error.message;
};

const submitTest = async () => {
  if (timer.value) {
    clearInterval(timer.value);
  }

  if (!store.currentTest) return;

  try {
    // Calculate score
    let score = 0;
    answers.value.forEach((answer, index) => {
      if (answer === store.currentTest?.questions[index].correctAnswer) {
        score++;
      }
    });

    // Save test results
    const testResultId = await store.saveTestResults({
      score,
      totalQuestions: store.currentTest.questions.length,
      testId: store.currentTest.id
    });

    // Show completion modal
    showCompletionModal.value = true;
  } catch (error) {
    console.error('Error submitting test:', error);
    recordingError.value = error instanceof Error ? error.message : 'Failed to submit test';
  }
};

const finishTest = () => {
  router.push('/developer/test-results');
};

const handleIntegrityViolation = () => {
  showIntegrityWarning.value = true;
  setTimeout(() => {
    submitTest();
  }, 5000);
};

// Initialize test
onMounted(async () => {
  if (!store.currentTest) {
    router.push('/tests');
    return;
  }

  // Randomize questions
  if (store.currentTest.questions) {
    store.currentTest.questions = shuffleArray([...store.currentTest.questions]);
    // For each question, also shuffle the options while keeping track of correct answer
    store.currentTest.questions = store.currentTest.questions.map(q => {
      const options = [...q.options];
      const correctOption = options[q.correctAnswer];
      const shuffledOptions = shuffleArray(options);
      return {
        ...q,
        options: shuffledOptions,
        correctAnswer: shuffledOptions.indexOf(correctOption)
      };
    });
  }

  // Initialize answers array
  answers.value = new Array(store.currentTest.questions?.length || 0).fill(null);

  // Start timer
  startTimer();
});

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value);
  }
});

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <!-- Integrity Warning Modal -->
    <div
        v-if="showIntegrityWarning"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-gray-800 p-6 rounded-lg max-w-md">
        <h2 class="text-xl font-bold text-red-500 mb-4">Test Integrity Violation</h2>
        <p class="text-gray-300 mb-4">
          Multiple integrity violations detected. Your test will be automatically submitted.
        </p>
        <div class="text-center">
          <p class="text-gray-400">Redirecting in 5 seconds...</p>
        </div>
      </div>
    </div>

    <!-- Test Completion Modal -->
    <div
        v-if="showCompletionModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4">
        <h2 class="text-2xl font-bold mb-4">Test Completed!</h2>

        <div v-if="savingRecording" class="text-center py-4">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto mb-2"></div>
          <p>Saving your test recording...</p>
        </div>

        <div v-else-if="recordingError" class="bg-red-500/10 text-red-400 p-4 rounded-lg mb-4">
          {{ recordingError }}
        </div>

        <div v-else-if="recordingUrl" class="mb-6">
          <h3 class="text-lg font-medium mb-2">Test Recording</h3>
          <video
              :src="recordingUrl"
              controls
              class="w-full rounded-lg"
              preload="metadata"
          >
            Your browser doesn't support video playback.
          </video>
        </div>

        <div class="mt-6 flex justify-end">
          <button
              @click="finishTest"
              class="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            View Results
          </button>
        </div>
      </div>
    </div>

    <div v-if="store.currentTest && !store.testCompleted" class="space-y-6">
      <!-- Test Integrity Component -->
      <TestIntegrity @integrity-violation="handleIntegrityViolation" />

      <!-- Video Recording -->
<!--      <VideoRecorder-->
<!--          @recording-complete="handleRecordingComplete"-->
<!--          @recording-error="handleRecordingError"-->
<!--      />-->

      <!-- Test Header -->
      <div class="bg-gray-800 rounded-lg p-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h1 class="text-2xl font-bold mb-2">{{ store.currentTest.title }}</h1>
            <p class="text-gray-300">{{ store.currentTest.description }}</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-primary-400">
              {{ formatTime(timeLeft) }}
            </p>
            <p class="text-sm text-gray-400">Time Remaining</p>
          </div>
        </div>

        <div class="w-full bg-gray-700 rounded-full h-2">
          <div
              class="bg-primary-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <p class="text-sm text-gray-400 mt-2">
          Question {{ currentQuestionIndex + 1 }} of {{ store.currentTest.questions?.length }}
        </p>
      </div>

      <!-- Current Question -->
      <div v-if="currentQuestion" class="bg-gray-800 rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-6">{{ currentQuestion.text }}</h2>

        <div class="space-y-4">
          <div
              v-for="(option, index) in currentQuestion.options"
              :key="index"
              class="flex items-center"
          >
            <button
                @click="selectedAnswer = index"
                class="w-full text-left px-4 py-3 rounded-lg transition-colors"
                :class="[
                selectedAnswer === index
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600'
              ]"
            >
              {{ option }}
            </button>
          </div>
        </div>

        <div class="mt-6 flex justify-between">
          <button
              v-if="currentQuestionIndex > 0"
              @click="currentQuestionIndex--"
              class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            Previous
          </button>
          <button
              v-if="selectedAnswer !== null"
              @click="submitAnswer"
              class="ml-auto px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            {{ currentQuestionIndex === store.currentTest.questions.length - 1 ? 'Submit Test' : 'Next' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>