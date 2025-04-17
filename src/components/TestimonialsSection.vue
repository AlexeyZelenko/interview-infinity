<script setup lang="ts">
import { ref, onMounted } from 'vue';

const currentSlide = ref(0);
const testimonials = [
  {
    id: 1,
    name: "Alex Johnson",
    role: "Senior Developer",
    company: "Tech Corp",
    text: "testimonials.alex",
    rating: 5
  },
  {
    id: 2,
    name: "Sarah Williams",
    role: "HR Manager",
    company: "Innovation Labs",
    text: "testimonials.sarah",
    rating: 5
  },
  {
    id: 3,
    name: "Michael Chen",
    role: "Tech Lead",
    company: "StartUp Inc",
    text: "testimonials.michael",
    rating: 5
  }
];

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % testimonials.length;
};

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + testimonials.length) % testimonials.length;
};

// Автоматическая смена слайдов
let slideInterval: number;

onMounted(() => {
  slideInterval = setInterval(nextSlide, 5000);
});

const resetInterval = () => {
  clearInterval(slideInterval);
  slideInterval = setInterval(nextSlide, 5000);
};
</script>

<template>
  <section class="py-24 relative overflow-hidden">
    <!-- Background -->
    <div class="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 opacity-50"></div>
    
    <!-- Content -->
    <div class="relative z-10 max-w-7xl mx-auto px-4">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-16">
        {{ $t('testimonials.title') }}
      </h2>

      <!-- Testimonials Slider -->
      <div class="relative max-w-4xl mx-auto">
        <!-- Navigation Buttons -->
        <button 
          @click="() => { prevSlide(); resetInterval(); }"
          class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-full backdrop-blur-sm transition-all duration-300"
        >
          <svg class="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button 
          @click="() => { nextSlide(); resetInterval(); }"
          class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-full backdrop-blur-sm transition-all duration-300"
        >
          <svg class="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Testimonials -->
        <div class="relative">
          <transition-group
            name="slide"
            tag="div"
            class="relative"
          >
            <div
              v-for="(testimonial, index) in testimonials"
              :key="testimonial.id"
              v-show="currentSlide === index"
              class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 transition-all duration-500"
            >
              <div class="flex flex-col items-start text-left">
                <!-- Star Rating -->
                <div class="flex items-center gap-1 mb-4">
                  <svg 
                    v-for="i in testimonial.rating" 
                    :key="i"
                    class="w-5 h-5 text-yellow-400" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>

                <p class="text-gray-300 text-lg mb-6 leading-relaxed">{{ $t(testimonial.text) }}</p>
                
                <div class="mt-auto">
                  <h4 class="font-semibold text-gray-100">{{ testimonial.name }}</h4>
                  <p class="text-gray-400">{{ testimonial.role }}</p>
                  <p class="text-gray-500 text-sm">{{ testimonial.company }}</p>
                </div>
              </div>
            </div>
          </transition-group>
        </div>

        <!-- Dots -->
        <div class="flex justify-center gap-2 mt-6">
          <button
            v-for="(_, index) in testimonials"
            :key="index"
            @click="() => { currentSlide = index; resetInterval(); }"
            class="w-2 h-2 rounded-full transition-all duration-300"
            :class="currentSlide === index ? 'bg-gray-300 w-4' : 'bg-gray-600 hover:bg-gray-500'"
          ></button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.75s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style> 