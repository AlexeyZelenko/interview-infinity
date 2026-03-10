<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useOnboardingStore } from '../stores/onboarding';

const router = useRouter();
const authStore = useAuthStore();
const onboardingStore = useOnboardingStore();

const isDeveloper = computed(() => authStore.isDeveloper);

const steps = computed(() => {
  if (isDeveloper.value) {
    return [
      {
        key: 'resume',
        title: 'onboarding.developer.step1.title',
        description: 'onboarding.developer.step1.description',
        tip: 'onboarding.developer.step1.tip',
        route: '/resumes/create',
        icon: 'document',
      },
      {
        key: 'test',
        title: 'onboarding.developer.step2.title',
        description: 'onboarding.developer.step2.description',
        tip: 'onboarding.developer.step2.tip',
        route: '/tests',
        icon: 'academic',
      },
      {
        key: 'apply',
        title: 'onboarding.developer.step3.title',
        description: 'onboarding.developer.step3.description',
        tip: 'onboarding.developer.step3.tip',
        route: '/jobs',
        icon: 'briefcase',
      },
    ];
  }
  return [
    {
      key: 'profile',
      title: 'onboarding.company.step1.title',
      description: 'onboarding.company.step1.description',
      tip: 'onboarding.company.step1.tip',
      route: '/company/profile',
      icon: 'building',
    },
    {
      key: 'job',
      title: 'onboarding.company.step2.title',
      description: 'onboarding.company.step2.description',
      tip: 'onboarding.company.step2.tip',
      route: '/company/jobs-create',
      icon: 'briefcase',
    },
    {
      key: 'test',
      title: 'onboarding.company.step3.title',
      description: 'onboarding.company.step3.description',
      tip: 'onboarding.company.step3.tip',
      route: '/company/create-test',
      icon: 'academic',
    },
  ];
});

const currentStep = computed(() => onboardingStore.currentStep);
const completedSteps = computed(() => onboardingStore.completedSteps);

const isStepCompleted = (index: number) => completedSteps.value.includes(index);

const goToStep = (index: number) => {
  onboardingStore.setStep(index);
};

const handleAction = (index: number) => {
  const step = steps.value[index];
  onboardingStore.completeStep(index);
  router.push(step.route);
};

const dismiss = () => {
  onboardingStore.dismiss();
};

onMounted(() => {
  onboardingStore.load();
});
</script>

<template>
  <div v-if="onboardingStore.isVisible" class="bg-dark-card border border-dark-border rounded-xl p-6 mb-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-dark-text text-lg font-bold">
          {{ $t('onboarding.title') }}
        </h2>
        <p class="text-dark-text-secondary text-sm mt-1">
          {{ $t(isDeveloper ? 'onboarding.developer.subtitle' : 'onboarding.company.subtitle') }}
        </p>
      </div>
      <button @click="dismiss"
        class="text-dark-text-secondary hover:text-dark-text text-sm transition-colors flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
        {{ $t('onboarding.skip') }}
      </button>
    </div>

    <!-- Progress bar -->
    <div class="w-full bg-dark-border rounded-full h-2 mb-6">
      <div class="bg-primary-500 h-2 rounded-full transition-all duration-500"
        :style="{ width: onboardingStore.progress + '%' }">
      </div>
    </div>

    <!-- Steps -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-for="(step, index) in steps" :key="step.key"
        class="relative border rounded-lg p-4 transition-all duration-200 cursor-pointer"
        :class="[
          isStepCompleted(index)
            ? 'border-green-500/30 bg-green-500/5'
            : currentStep === index
              ? 'border-primary-500/50 bg-primary-500/5'
              : 'border-dark-border hover:border-dark-border/80'
        ]"
        @click="goToStep(index)">

        <!-- Step number / check -->
        <div class="flex items-center gap-3 mb-3">
          <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            :class="[
              isStepCompleted(index)
                ? 'bg-green-500/20 text-green-400'
                : currentStep === index
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'bg-dark-border text-dark-text-secondary'
            ]">
            <svg v-if="isStepCompleted(index)" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
            </svg>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <h3 class="text-dark-text font-semibold text-sm">
            {{ $t(step.title) }}
          </h3>
        </div>

        <!-- Description -->
        <p class="text-dark-text-secondary text-xs mb-3 leading-relaxed">
          {{ $t(step.description) }}
        </p>

        <!-- Tip -->
        <div class="flex items-start gap-2 bg-dark-bg/50 rounded-md p-2 mb-3">
          <svg class="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="text-dark-text-secondary text-xs">{{ $t(step.tip) }}</span>
        </div>

        <!-- Action button -->
        <button
          v-if="!isStepCompleted(index)"
          @click.stop="handleAction(index)"
          class="w-full py-2 px-3 rounded-md text-sm font-medium transition-colors"
          :class="currentStep === index
            ? 'bg-primary-600 text-white hover:bg-primary-700'
            : 'bg-dark-border text-dark-text-secondary hover:text-dark-text'">
          {{ $t('onboarding.goToStep') }}
        </button>
        <div v-else class="text-center text-green-400 text-xs font-medium py-2">
          {{ $t('onboarding.stepCompleted') }}
        </div>
      </div>
    </div>

    <!-- FAQ link -->
    <div class="mt-4 text-center">
      <router-link to="/faq" class="text-primary-400 hover:text-primary-300 text-xs transition-colors">
        {{ $t('onboarding.needHelp') }}
      </router-link>
    </div>
  </div>
</template>
