<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import PricingCard from '../components/PricingCard.vue';
import PaymentModal from '../components/PaymentModal.vue';

const authStore = useAuthStore();
const router = useRouter();
const showPaymentModal = ref(false);
const selectedPlan = ref<any>(null);

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
    ],
    popular: false
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 20,
    period: 'month',
    features: [
      'Advanced profile access',
      'Unlimited job postings',
      'Full test access',
      'Priority support',
      'Analytics dashboard'
    ],
    popular: true
  },
  {
    id: 'business',
    name: 'Business',
    price: 50,
    period: 'month',
    features: [
      'Everything in Professional',
      'Custom branding',
      'API access',
      'Dedicated account manager',
      'Custom test creation'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 100,
    period: 'month',
    features: [
      'Everything in Business',
      'Custom integration',
      'SLA support',
      'Custom features',
      'Onboarding assistance'
    ]
  }
];

function selectPlan(plan: any) {
  if (!authStore.user) {
    router.push('/login');
    return;
  }
  selectedPlan.value = plan;
  showPaymentModal.value = true;
}

function handlePaymentSuccess() {
  showPaymentModal.value = false;
  // Redirect to appropriate dashboard based on user type
  router.push(authStore.isDeveloper ? '/developer' : '/company');
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold mb-4">Choose Your Plan</h1>
      <p class="text-xl text-gray-300">Find the perfect plan for your needs</p>
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      <PricingCard
          v-for="plan in plans"
          :key="plan.id"
          :plan="plan"
          @select-plan="selectPlan"
      />
    </div>

    <div class="mt-12 bg-gray-800 rounded-lg p-8">
      <h2 class="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
      <div class="grid md:grid-cols-2 gap-8">
        <div>
          <h3 class="font-semibold mb-2">Can I change plans later?</h3>
          <p class="text-gray-300">Yes, you can upgrade or downgrade your plan at any time.</p>
        </div>
        <div>
          <h3 class="font-semibold mb-2">What payment methods do you accept?</h3>
          <p class="text-gray-300">We accept all major credit cards and PayPal.</p>
        </div>
        <div>
          <h3 class="font-semibold mb-2">Is there a long-term contract?</h3>
          <p class="text-gray-300">No, all plans are month-to-month with no long-term commitment.</p>
        </div>
        <div>
          <h3 class="font-semibold mb-2">Do you offer refunds?</h3>
          <p class="text-gray-300">Yes, we offer a 30-day money-back guarantee for all paid plans.</p>
        </div>
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