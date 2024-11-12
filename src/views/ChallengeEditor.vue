<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div v-if="error" class="mb-6 bg-red-500/10 text-red-400 p-4 rounded-lg">
      {{ error }}
    </div>

    <div v-if="challenge" class="grid lg:grid-cols-[1fr,1fr] gap-6">
      <!-- Left Panel: Description and Tests -->
      <ChallengeDetails
          :challenge="challenge"
          :test-results="testResults"
          :is-running="isRunning"
          :current-code="currentCode"
          :current-language="selectedLanguage"
          @update:test-results="testResults = $event"
          @update:is-running="isRunning = $event"
      />

      <!-- Right Panel: Code Editor -->
      <AlternateEditor
           v-if="challenge"
          :languages="challenge.languages"
          :initial-language="selectedLanguage"
          :initial-code="getStarterCode()"
          :is-saving="isSaving"
          v-model:language="selectedLanguage"
          v-model:code="currentCode"
          @save="saveProgress"
          @reset="resetCode"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useChallengesStore } from '../stores/challenges';
import AlternateEditor from '../components/challenge/AlternateEditor.vue';
import ChallengeDetails from '../components/challenge/ChallengeDetails.vue';

const route = useRoute();
const challengesStore = useChallengesStore();

const challenge = ref<any>(null);
const selectedLanguage = ref('JavaScript');
const currentCode = ref('');
const isRunning = ref(false);
const isSaving = ref(false);
const testResults = ref<any[]>([]);
const error = ref('');

const getStarterCode = () => {
  if (!challenge.value) return '';
  return challenge.value.starterCode[selectedLanguage.value.toLowerCase()] || '';
};

const loadChallenge = async () => {
  try {
    const id = route.params.id as string;
    console.log("id", id)
    if (!id) {
      throw new Error('Challenge ID not found');
    }

    challenge.value = await challengesStore.getChallenge(id);
     console.log("challenge", challenge.value)
    if (challenge.value) {
      currentCode.value = getStarterCode();
    } else {
      throw new Error('Challenge not found');
    }
  } catch (err) {
    console.error('Error loading challenge:', err);
    error.value = err instanceof Error ? err.message : 'Failed to load challenge';
  }
};

const resetCode = () => {
  if (!challenge.value) return;
  currentCode.value = getStarterCode();
};

const saveProgress = async () => {
  if (!challenge.value || isSaving.value) return;

  isSaving.value = true;
  try {
    await challengesStore.saveProgress({
      challengeId: challenge.value.id,
      code: currentCode.value,
      language: selectedLanguage.value.toLowerCase()
    });
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to save progress';
  } finally {
    isSaving.value = false;
  }
};

onMounted(async () => {
  console.log("loadChallenge")
  loadChallenge();
});
</script>