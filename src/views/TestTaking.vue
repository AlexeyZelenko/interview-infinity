<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, ComputedRef } from 'vue';
import { useTestStore } from '../stores/tests';
import { useRouter, useRoute } from 'vue-router';
import TestIntegrity from '../components/TestIntegrity.vue';
import { useAuthStore } from '../stores/auth'
import {
  startScreenRecording,
  stopScreenRecording,
} from '@/utils/screenRecording';
import Swal from 'sweetalert2';

const showInstructions = ref(true);
function closeInstructions() {
  showInstructions.value = false;
}

const authStore = useAuthStore()
const store = useTestStore();
const router = useRouter();
const route = useRoute();

const currentQuestionIndex = ref(0);
const selectedAnswer = ref<number | null>(null);
const answers = ref<Answer[]>([]);
const timeLeft = ref(0);
const timer = ref<number | null>(null);
const showCompletionModal = ref(false);
const showIntegrityWarning = ref(false);
const integrityViolations = ref<string[]>([]);
const loading = ref(true);
const error = ref('');

interface Answer {
  testId: number | string | null;
  selectedAnswer: number | null;
  isCorrect: boolean | null;
  timeTaken: number;
  correctAnswer: number;
}

interface Question {
  id: number | string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

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

const startTime = ref(0);

const startTimerForQuestion = () => {
  startTime.value = Date.now();
};

const submitAnswer = () => {
  if (selectedAnswer.value === null || !currentQuestion.value) return;

  // Рассчитываем время ответа
  const endTime = Date.now();
  const timeTaken = Math.floor((endTime - startTime.value) / 1000); // Время в секундах

  // Создаем объект ответа с правильным типом
  const answer: Answer = {
    timeTaken,
    testId: store.currentTest.id,
    selectedAnswer: selectedAnswer.value,
    correctAnswer: currentQuestion.value.correctAnswer,
    isCorrect: selectedAnswer.value === currentQuestion.value.correctAnswer,
  };

  // Сохраняем ответ в массив `answers`
  answers.value[currentQuestionIndex.value] = answer;

  // Сбрасываем выбранный ответ
  selectedAnswer.value = null;

  // Переход к следующему вопросу или завершение теста
  if (currentQuestionIndex.value < (store.currentTest?.questions?.length || 0) - 1) {
    currentQuestionIndex.value++;
    startTimerForQuestion(); // Снова запускаем таймер для нового вопроса
  } else {
    submitTest();
  }
};

const saveVideoRecording = ref(false);
const urlVideoRecording = ref('');
const startBurnVideo = async () => {
  try {
    await startScreenRecording();
  } catch (error) {
    console.error('Error starting screen recording:', error);
  }
};

const submitTest = async () => {
  urlVideoRecording.value = await stopScreenRecording();
  console.log("Video recording URL:", urlVideoRecording.value);

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

    console.log("store.currentTest:", store.currentTest);
    // Save test results
    await store.saveTestResults({
      score,
      totalQuestions: store.currentTest.questions.length,
      testId: store.currentTest.id,
      answers: answers.value,
      userId: authStore.user?.uid,
      videoUrl: urlVideoRecording.value,
      jobId: store.currentTest.jobId || null,
    });

    // Show completion modal
    showCompletionModal.value = true;
  } catch (error) {
    console.error('Error submitting test:', error);
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

const initializeTest = async () => {
  try {
    loading.value = true;
    error.value = '';

    // Fetch test details
    await store.fetchTestById(route.params.id as string);

    if (!store.currentTest) {
      throw new Error('Test not found');
    }

    if (store.currentTest.questions.length === 0) {
      throw new Error('Test has no questions');
    }

    if (store.currentTest.duration === 0) {
      throw new Error('Test has no duration');
    }

    console.log("Video recording required:", store.currentTest.isVideoRecord);

    if (store.currentTest.isVideoRecord) {
      Swal.fire({
        title: "Test with video!",
        text: "This test requires a video recording of your interview. Click 'Start' to begin recording.",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Start"
      }).then(async (result) => {
        if (result.isConfirmed) {
          console.log("Starting video recording...");
          saveVideoRecording.value = true;
          startBurnVideo();

          // Continue with test initialization
          await initializeTestDetails();
        } else {
          console.log("User canceled video recording. Redirecting to jobs.");
          router.push('/jobs');
        }
      });
    } else {
      // If video recording is not required, proceed with test setup
      await initializeTestDetails();
    }
  } catch (err: any) {
    error.value = err.message;
    console.error('Error initializing test:', err);
  } finally {
    loading.value = false;
  }
};

// Separate function to handle test details initialization
const initializeTestDetails = async () => {
  try {
    const canTake = await store.startTest(store.currentTest.id);
    if (!canTake) {
      const daysLeft = store.getDaysUntilAvailable(store.currentTest.id);
      throw new Error(`You can take this test again in ${daysLeft} days`);
    }

    // Initialize answers array with default values
    answers.value = new Array(store.currentTest.questions.length).fill(null).map(() => ({
      testId: store.currentTest.id,
      selectedAnswer: null,
      timeTaken: 0,
      isCorrect: false,
      correctAnswer: 0,
    }));

    console.log("Answers initialized:", answers.value);

    // Start main timer for the test
    startTimer();
    console.log("Main test timer started.");

    // Start question timer for the first question
    startTimerForQuestion();
    console.log("Timer started for first question.");
  } catch (err) {
    error.value = err.message;
    console.error('Error in initializeTestDetails:', err);
  }
};


onMounted(() => {
  initializeTest();
  startTimerForQuestion();
});

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value);
  }
});
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-8">
    <h2 class="text-3xl font-bold text-primary-400 mb-6"><i class="fas fa-question-circle"></i> Test Your Knowledge</h2>

    <!-- Test Instructions -->
    <div v-if="showInstructions" class="bg-gray-800 rounded-lg p-6 mb-8 space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Test Instructions</h2>
        <button @click="closeInstructions" class="text-red-400 hover:text-red-500">X</button>
      </div>
      <ul class="space-y-4 text-gray-300">
        <li class="flex items-center space-x-3">
          <i class="fas fa-expand text-primary-400 text-lg"></i>
          <span>Once the test begins, it will enter fullscreen mode automatically. Do not exit fullscreen until the test is complete.</span>
        </li>
        <li class="flex items-center space-x-3">
          <i class="fas fa-window-maximize text-primary-400 text-lg"></i>
          <span>Avoid opening additional browser tabs during the test.</span>
        </li>
        <li class="flex items-center space-x-3">
          <i class="fas fa-terminal text-primary-400 text-lg"></i>
          <span>Do not open the console or developer tools.</span>
        </li>
        <li class="flex items-center space-x-3">
          <i class="fas fa-exclamation-triangle text-primary-400 text-lg"></i>
          <span>Violating these guidelines will be recorded as infractions and may result in the test being closed automatically.</span>
        </li>
      </ul>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
      <p>Loading test...</p>
    </div>

    <div v-else-if="error" class="bg-red-500/10 text-red-400 p-4 rounded-lg mb-6 flex items-center">
      <i class="fas fa-exclamation-circle mr-2"></i>{{ error }}
      <div class="mt-4">
        <button @click="router.push('/tests')" class="text-primary-400 hover:text-primary-300 transition duration-300 ease-in-out">
          <i class="fas fa-arrow-left"></i> Back to Tests
        </button>
      </div>
    </div>

    <!-- Integrity Warning Modal -->
    <div v-else-if="showIntegrityWarning" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 p-6 rounded-lg max-w-md text-center shadow-lg">
        <h2 class="text-xl font-bold text-red-500 mb-4"><i class="fas fa-shield-alt"></i> Test Integrity Violation</h2>
        <p class="text-gray-300 mb-4">Multiple integrity violations detected. Your test will be automatically submitted.</p>
        <p class="text-gray-400">Redirecting in 5 seconds...</p>
      </div>
    </div>

    <!-- Test Completion Modal -->
    <div v-else-if="showCompletionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4 text-center shadow-lg">
        <h2 class="text-2xl font-bold mb-4 text-green-500"><i class="fas fa-trophy"></i> Test Completed!</h2>
        <button @click="finishTest" class="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition duration-300 ease-in-out">
          <i class="fas fa-check"></i> View Results
        </button>
      </div>
    </div>

    <div v-else-if="store.currentTest && !store.testCompleted" class="space-y-6">
      <!-- Test Integrity Component -->
      <TestIntegrity @integrity-violation="handleIntegrityViolation" />

      <!-- Test Video Screen-->
      <div class="space-y-4">
        <!-- Индикатор записи -->
        <div
            id="recordingIndicator"
            style="height: 50px; width: 100px; display: none;"
            class="fixed top-6 right-8 bg-red-500 text-white px-3 py-1 rounded-md shadow-lg text-sm font-semibold animate-pulse"
        >Recording...</div>
      </div>

      <!-- Test Header -->
      <div class="bg-gray-800 rounded-lg p-6 shadow-lg">
        <div class="flex justify-between items-start mb-4">
          <div class="flex flex-col justify-between">
            <h1 class="text-2xl font-bold mb-2 text-primary-300">{{ store.currentTest.title }}</h1>
            <p class="text-gray-400"><i class="fas fa-info-circle"></i> {{ store.currentTest.description }}</p>
          </div>
          <div class="text-right flex flex-col">
            <div>
              <p class="text-2xl font-bold text-primary-400 flex items-center gap-2">
                <i class="fas fa-clock"></i> {{ formatTime(timeLeft) }}
              </p>
              <p class="text-sm text-gray-400">Time Remaining</p>
            </div>
            <div>
              <!-- Navigation Buttons -->
              <div class="mt-6 flex justify-between">
<!--                <button v-if="currentQuestionIndex > 0" @click="currentQuestionIndex&#45;&#45;" class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition duration-300 ease-in-out">-->
<!--                  <i class="fas fa-arrow-left"></i> Previous-->
<!--                </button>-->
                <button v-if="selectedAnswer !== null" @click="submitAnswer" class="ml-auto px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition duration-300 ease-in-out">
                  {{ currentQuestionIndex === store.currentTest.questions.length - 1 ? 'Submit Test' : 'Next' }} <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-gray-700 rounded-full h-2">
          <div class="bg-primary-600 h-2 rounded-full transition-all duration-300" :style="{ width: `${progress}%` }"></div>
        </div>
        <p class="text-sm text-gray-400 mt-2">Question {{ currentQuestionIndex + 1 }} of {{ store.currentTest.questions?.length }}</p>
      </div>

      <!-- Current Question -->
      <div v-if="currentQuestion" class="bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
        <h2 class="text-xl font-semibold mb-6 text-primary-300"><i class="fas fa-question-circle"></i> {{ currentQuestion.text }}</h2>

        <div class="space-y-4">
          <div v-for="(option, index) in currentQuestion.options" :key="index" class="flex items-center">
            <button
                @click="selectedAnswer = index"
                class="w-full text-left px-4 py-3 rounded-lg transition-colors"
                :class="[ selectedAnswer === index ? 'bg-primary-600 text-white' : 'bg-gray-700 hover:bg-gray-600' ]"
            >
              <i class="fas fa-check-circle" v-if="selectedAnswer === index"></i> {{ option }}
            </button>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="mt-6 flex justify-between">
          <button v-if="currentQuestionIndex > 0" @click="currentQuestionIndex--" class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition duration-300 ease-in-out">
            <i class="fas fa-arrow-left"></i> Previous
          </button>
          <button v-if="selectedAnswer !== null" @click="submitAnswer" class="ml-auto px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition duration-300 ease-in-out">
            {{ currentQuestionIndex === store.currentTest.questions.length - 1 ? 'Submit Test' : 'Next' }} <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Анимация при наведении */
.bg-gray-800:hover {
  transform: scale(1.02);
}
.bg-gray-800 {
  background-color: #2d3748;
}
.text-primary-400 {
  color: #63b3ed;
}
.text-red-400 {
  color: #fc8181;
}
</style>
