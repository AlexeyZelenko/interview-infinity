<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface MapPoint {
  x: number;
  y: number;
  label: string;
  users: number;
  delay: number;
}

const sectionRef = ref<HTMLElement | null>(null);
const isVisible = ref(false);

const points: MapPoint[] = [
  { x: 20, y: 35, label: 'San Francisco', users: 245, delay: 0 },
  { x: 25, y: 42, label: 'Mexico City', users: 89, delay: 200 },
  { x: 30, y: 55, label: 'Sao Paulo', users: 134, delay: 400 },
  { x: 48, y: 30, label: 'London', users: 312, delay: 100 },
  { x: 50, y: 32, label: 'Berlin', users: 198, delay: 300 },
  { x: 52, y: 28, label: 'Stockholm', users: 76, delay: 500 },
  { x: 55, y: 38, label: 'Istanbul', users: 145, delay: 250 },
  { x: 53, y: 34, label: 'Warsaw', users: 167, delay: 150 },
  { x: 57, y: 40, label: 'Dubai', users: 98, delay: 450 },
  { x: 62, y: 42, label: 'Mumbai', users: 213, delay: 350 },
  { x: 68, y: 38, label: 'Beijing', users: 178, delay: 550 },
  { x: 72, y: 45, label: 'Singapore', users: 156, delay: 650 },
  { x: 76, y: 52, label: 'Sydney', users: 87, delay: 700 },
  { x: 70, y: 35, label: 'Tokyo', users: 267, delay: 600 },
  { x: 56, y: 32, label: 'Kyiv', users: 289, delay: 50 },
  { x: 22, y: 32, label: 'New York', users: 356, delay: 100 },
];

const activePoint = ref<MapPoint | null>(null);

let observer: IntersectionObserver | null = null;

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        isVisible.value = true;
      }
    },
    { threshold: 0.2 }
  );
  if (sectionRef.value) {
    observer.observe(sectionRef.value);
  }
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});
</script>

<template>
  <section ref="sectionRef" class="py-20 relative overflow-hidden">
    <div class="max-w-6xl mx-auto px-4">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-100">
        {{ $t('worldMap.title') }}
      </h2>
      <p class="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
        {{ $t('worldMap.subtitle') }}
      </p>

      <div class="relative mx-auto" style="max-width: 900px;">
        <!-- SVG World Map (simplified continents) -->
        <svg viewBox="0 0 100 65" class="w-full h-auto opacity-20">
          <!-- North America -->
          <path d="M5 15 L12 12 L22 14 L28 18 L26 25 L30 30 L28 35 L22 38 L18 35 L15 40 L10 38 L8 30 L5 25Z"
                fill="none" stroke="currentColor" stroke-width="0.3" class="text-gray-500"/>
          <!-- South America -->
          <path d="M22 42 L28 40 L32 45 L33 52 L30 58 L26 60 L22 55 L20 48Z"
                fill="none" stroke="currentColor" stroke-width="0.3" class="text-gray-500"/>
          <!-- Europe -->
          <path d="M44 18 L48 15 L55 16 L58 20 L55 25 L52 28 L48 30 L44 28 L42 24Z"
                fill="none" stroke="currentColor" stroke-width="0.3" class="text-gray-500"/>
          <!-- Africa -->
          <path d="M44 32 L52 30 L56 35 L58 42 L55 50 L50 55 L44 52 L42 45 L43 38Z"
                fill="none" stroke="currentColor" stroke-width="0.3" class="text-gray-500"/>
          <!-- Asia -->
          <path d="M55 14 L65 12 L75 15 L78 20 L76 28 L72 32 L68 35 L62 38 L58 35 L56 28 L58 22Z"
                fill="none" stroke="currentColor" stroke-width="0.3" class="text-gray-500"/>
          <!-- Australia -->
          <path d="M72 48 L80 46 L82 50 L80 55 L74 56 L72 52Z"
                fill="none" stroke="currentColor" stroke-width="0.3" class="text-gray-500"/>
        </svg>

        <!-- Animated Points -->
        <div class="absolute inset-0">
          <div
            v-for="(point, index) in points"
            :key="index"
            class="absolute"
            :style="{
              left: point.x + '%',
              top: point.y + '%',
              transitionDelay: point.delay + 'ms',
            }"
            @mouseenter="activePoint = point"
            @mouseleave="activePoint = null"
          >
            <!-- Pulse ring -->
            <div
              class="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full transition-all duration-700"
              :class="isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'"
            >
              <div class="absolute inset-0 rounded-full bg-indigo-500/30 animate-ping" style="animation-duration: 3s;"></div>
            </div>
            <!-- Dot -->
            <div
              class="absolute -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-indigo-400 cursor-pointer transition-all duration-500 hover:scale-150 hover:bg-indigo-300"
              :class="isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'"
            ></div>
          </div>
        </div>

        <!-- Tooltip -->
        <div
          v-if="activePoint"
          class="absolute z-20 pointer-events-none bg-gray-800/95 backdrop-blur-md border border-gray-600/50 rounded-lg px-3 py-2 shadow-xl"
          :style="{
            left: activePoint.x + '%',
            top: (activePoint.y - 8) + '%',
            transform: 'translate(-50%, -100%)',
          }"
        >
          <div class="text-gray-100 font-medium text-xs">{{ activePoint.label }}</div>
          <div class="text-indigo-400 text-xs">{{ activePoint.users }} {{ $t('worldMap.users') }}</div>
        </div>
      </div>
    </div>
  </section>
</template>
