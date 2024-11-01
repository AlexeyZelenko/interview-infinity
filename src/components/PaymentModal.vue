<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { loadStripe } from '@stripe/stripe-js';
import { useAuthStore } from '../stores/auth';

const props = defineProps<{
  plan: {
    id: string;
    name: string;
    price: number;
    period: string;
  }
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'payment-success'): void;
}>();

const authStore = useAuthStore();
const paymentMethod = ref<'card' | 'paypal'>('card');
const loading = ref(false);
const error = ref('');

let stripe: any = null;
let elements: any = null;
let card: any = null;

onMounted(async () => {
  if (props.plan.id !== 'free') {
    // Initialize Stripe only for paid plans
    stripe = await loadStripe('your_publishable_key');
    elements = stripe.elements();
    card = elements.create('card');
    card.mount('#card-element');

    card.on('change', (event: any) => {
      if (event.error) {
        error.value = event.error.message;
      } else {
        error.value = '';
      }
    });
  }
});

async function handleSubmit() {
  if (loading.value) return;

  loading.value = true;
  error.value = '';

  try {
    if (props.plan.id === 'free') {
      // Handle free trial activation
      await authStore.activateFreeTrial();
      emit('payment-success');
    } else {
      if (paymentMethod.value === 'card') {
        const { token, error } = await stripe.createToken(card);
        if (error) {
          throw new Error(error.message);
        }
        // Send token to your server
        // await processPayment(token);
        emit('payment-success');
      } else {
        // Handle PayPal payment
      }
    }
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">{{ plan.id === 'free' ? 'Activate Free Trial' : 'Payment Details' }}</h2>
        <button @click="emit('close')" class="text-gray-400 hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="mb-6">
        <h3 class="font-semibold mb-2">{{ plan.name }}</h3>
        <p class="text-gray-300">
          {{ plan.id === 'free' ? '7-day free trial' : `$${plan.price}/${plan.period}` }}
        </p>
      </div>

      <template v-if="plan.id !== 'free'">
        <div class="mb-6">
          <div class="flex gap-4 mb-4">
            <button
                @click="paymentMethod = 'card'"
                :class="[
                'flex-1 py-2 rounded transition-colors',
                paymentMethod === 'card'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              ]"
            >
              Credit Card
            </button>
            <button
                @click="paymentMethod = 'paypal'"
                :class="[
                'flex-1 py-2 rounded transition-colors',
                paymentMethod === 'paypal'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              ]"
            >
              PayPal
            </button>
          </div>

          <div v-if="paymentMethod === 'card'">
            <div id="card-element" class="bg-gray-700 p-3 rounded mb-4"></div>
          </div>

          <div v-else>
            <p class="text-gray-300 mb-4">You will be redirected to PayPal to complete your payment.</p>
          </div>
        </div>
      </template>

      <div v-if="error" class="text-red-500 text-sm mb-4">
        {{ error }}
      </div>

      <button
          @click="handleSubmit"
          :disabled="loading"
          class="w-full bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="loading">Processing...</span>
        <span v-else>{{ plan.id === 'free' ? 'Start Free Trial' : 'Pay Now' }}</span>
      </button>

      <p v-if="plan.id !== 'free'" class="text-sm text-gray-400 text-center mt-4">
        Your payment is secure and encrypted
      </p>
    </div>
  </div>
</template>