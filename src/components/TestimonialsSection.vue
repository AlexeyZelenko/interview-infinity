<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';

const sectionRef = ref<HTMLElement | null>(null);
const visible = ref(false);
const activeIndex = ref(0);
let autoplayTimer: ReturnType<typeof setInterval> | null = null;
let sectionObserver: IntersectionObserver | null = null;

const testimonials = [
  {
    name: "Alex Johnson",
    role: "Senior Developer",
    company: "Tech Corp",
    textKey: "testimonials.alex",
  },
  {
    name: "Sarah Williams",
    role: "HR Manager",
    company: "Innovation Labs",
    textKey: "testimonials.sarah",
  },
  {
    name: "Michael Chen",
    role: "Tech Lead",
    company: "StartUp Inc",
    textKey: "testimonials.michael",
  },
];

const activeTestimonial = computed(() => testimonials[activeIndex.value]);

const setActive = (index: number) => {
  activeIndex.value = index;
  restartAutoplay();
};

const nextSlide = () => {
  activeIndex.value = (activeIndex.value + 1) % testimonials.length;
};

const restartAutoplay = () => {
  if (autoplayTimer) clearInterval(autoplayTimer);
  autoplayTimer = setInterval(nextSlide, 6000);
};

const getInitials = (name: string) => {
  return name.split(' ').map(w => w[0]).join('');
};

onMounted(() => {
  sectionObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        visible.value = true;
        sectionObserver!.disconnect();
      }
    },
    { threshold: 0.15 }
  );
  if (sectionRef.value) sectionObserver.observe(sectionRef.value);

  restartAutoplay();
});

onUnmounted(() => {
  if (autoplayTimer) clearInterval(autoplayTimer);
  if (sectionObserver) sectionObserver.disconnect();
});
</script>

<template>
  <section ref="sectionRef" class="py-24">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Header -->
      <div
        class="mb-16 transition-all duration-700"
        :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <span class="text-xs uppercase tracking-[0.25em] text-primary-400 font-medium">
          {{ $t('testimonials.title') }}
        </span>
      </div>

      <!-- Testimonial content area — fixed height to prevent layout shifts -->
      <div
        class="min-h-[200px] transition-all duration-700"
        :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        :style="{ transitionDelay: '200ms' }"
      >
        <!-- Quote -->
        <blockquote class="relative">
          <p class="text-xl md:text-2xl lg:text-3xl text-dark-text font-light leading-relaxed transition-opacity duration-500"
             :key="activeIndex">
            "{{ $t(activeTestimonial.textKey) }}"
          </p>
        </blockquote>

        <!-- Author -->
        <div class="mt-8 flex items-center gap-4 transition-opacity duration-500" :key="'author-' + activeIndex">
          <!-- Initials avatar -->
          <div class="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center text-sm font-medium text-dark-text-secondary">
            {{ getInitials(activeTestimonial.name) }}
          </div>
          <div>
            <p class="text-sm font-semibold text-dark-text">{{ activeTestimonial.name }}</p>
            <p class="text-xs text-dark-text-secondary">{{ activeTestimonial.role }}, {{ activeTestimonial.company }}</p>
          </div>
        </div>
      </div>

      <!-- Navigation dots + names -->
      <div
        class="mt-12 flex gap-8 transition-all duration-700"
        :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        :style="{ transitionDelay: '400ms' }"
      >
        <button
          v-for="(t, index) in testimonials"
          :key="index"
          @click="setActive(index)"
          class="group text-left transition-all duration-300"
        >
          <!-- Progress bar -->
          <div class="w-16 h-0.5 mb-3 overflow-hidden rounded-full"
               :class="activeIndex === index ? 'bg-primary-500/20' : 'bg-white/[0.06]'">
            <div
              class="h-full bg-primary-400 rounded-full transition-all duration-300"
              :class="activeIndex === index ? 'w-full' : 'w-0 group-hover:w-1/3 group-hover:bg-white/20'"
            ></div>
          </div>
          <span class="text-xs font-medium transition-colors duration-300"
                :class="activeIndex === index ? 'text-dark-text' : 'text-dark-text-secondary/50 group-hover:text-dark-text-secondary'">
            {{ t.name }}
          </span>
        </button>
      </div>
    </div>
  </section>
</template>
