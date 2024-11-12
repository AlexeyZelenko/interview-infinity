<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '../../stores/auth';
import PaymentModal from '../../components/PaymentModal.vue';

const authStore = useAuthStore();
const showPaymentModal = ref(false);
const selectedPlan = ref<any>(null);

const subscription = computed(() => ({
  plan: authStore.user?.subscription.plan || 'none',
  status: authStore.user?.subscription.status || 'inactive',
  endDate: authStore.user?.subscription.endDate,
  daysLeft: authStore.daysLeftInTrial
}));

const plans = [
  {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    period: 'week',
    features: [
      'Basic profile access',
      '3 job postings',
      'Limited test access',
      '7-day trial'
    ],
    buttonText: 'Start Free Trial'
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 10,
    period: 'month',
    features: [
      'Full profile access',
      '10 job postings',
      'Basic test access',
      'Email support'
    ]
  },
  // ... other plans
];

function selectPlan(plan: any) {
  selectedPlan.value = plan;
  showPaymentModal.value = true;
}

function handlePaymentSuccess() {
  showPaymentModal.value = false;
  // Refresh user data
  authStore.loadUser(authStore.user!.uid);
}
</script>

<template>
  <div class="max-w-3xl">
    <div class="bg-gray-800 rounded-lg p-6 mb-8">
      <div class="flex justify-between items-start mb-6">
        <div>
          <h2 class="text-2xl font-bold mb-2">Current Plan</h2>
          <p class="text-gray-300">
            <template v-if="subscription.plan === 'free'">
              Free Trial - {{ subscription.daysLeft }} days remaining
            </template>
            <template v-else>
              You are on the
              <span class="font-semibold text-primary-400">
                {{ subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) }}
              </span>
              plan
            </template>
          </p>
        </div>
        <span
            class="px-3 py-1 rounded-full text-sm"
            :class="subscription.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'"
        >
          {{ subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1) }}
        </span>
      </div>

      <template v-if="subscription.status === 'expired'">
        <div class="bg-red-500/10 text-red-400 p-4 rounded-lg mb-4">
          Your subscription has expired. Please choose a plan to continue using all features.
        </div>
      </template>

      <template v-else-if="subscription.plan === 'free' && subscription.daysLeft <= 2">
        <div class="bg-yellow-500/10 text-yellow-400 p-4 rounded-lg mb-4">
          Your free trial will expire soon. Choose a plan to continue using all features.
        </div>
      </template>
    </div>

    <div class="grid md:grid-cols-3 gap-6">
      <div
          v-for="plan in plans"
          :key="plan.id"
          class="flex flex-col justify-between bg-gray-800 rounded-lg p-6"
      >
        <h3 class="text-xl font-bold mb-2">{{ plan.name }}</h3>
        <p class="text-2xl font-bold mb-4">
          ${{ plan.price }}<span class="text-sm text-gray-400">/{{ plan.period }}</span>
        </p>
        <ul class="space-y-2 mb-6">
          <li
              v-for="feature in plan.features"
              :key="feature"
              class="flex items-center text-gray-300"
          >
            <svg class="w-5 h-5 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ feature }}
          </li>
        </ul>
        <button
            @click="selectPlan(plan)"
            class="w-full bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
            :disabled="plan.id === subscription.plan && subscription.status === 'active'"
        >
          {{ plan.buttonText || 'Select Plan' }}
        </button>
      </div>
    </div>

    <PaymentModal
        v-if="showPaymentModal"
        :plan="selectedPlan"
        @close="showPaymentModal = false"
        @payment-success="handlePaymentSuccess"
    />
  </div>
</template>