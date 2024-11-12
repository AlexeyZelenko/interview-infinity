<script setup lang="ts">
const props = defineProps<{
  company: {
    name: string;
    description: string;
    industry: string;
    size: string;
    location: string;
    website?: string;
    founded?: string;
    logo?: string;
    socialLinks?: {
      linkedin?: string;
      twitter?: string;
      github?: string;
    };
  };
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
      <div class="flex justify-between items-start mb-6">
        <div class="flex items-center gap-4">
          <img
              v-if="company.logo"
              :src="company.logo"
              :alt="company.name"
              class="w-16 h-16 rounded-lg object-cover"
          />
          <div>
            <h2 class="text-2xl font-bold">{{ company.name }}</h2>
            <p class="text-gray-400">{{ company.industry }}</p>
          </div>
        </div>
        <button
            @click="emit('close')"
            class="text-gray-400 hover:text-white"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-semibold mb-2">About</h3>
          <p class="text-gray-300 whitespace-pre-line">{{ company.description }}</p>
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <h3 class="text-lg font-semibold mb-2">Company Details</h3>
            <div class="space-y-2 text-gray-300">
              <p>
                <span class="text-gray-400">Size:</span> {{ company.size }}
              </p>
              <p>
                <span class="text-gray-400">Location:</span> {{ company.location }}
              </p>
              <p v-if="company.founded">
                <span class="text-gray-400">Founded:</span> {{ company.founded }}
              </p>
              <p v-if="company.website">
                <span class="text-gray-400">Website:</span>
                <a
                    :href="company.website"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-primary-400 hover:text-primary-300 ml-1"
                >
                  {{ company.website }}
                </a>
              </p>
            </div>
          </div>

          <div v-if="company.socialLinks">
            <h3 class="text-lg font-semibold mb-2">Social Links</h3>
            <div class="space-y-2">
              <a
                  v-if="company.socialLinks.linkedin"
                  :href="company.socialLinks.linkedin"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-2 text-primary-400 hover:text-primary-300"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                LinkedIn
              </a>
              <a
                  v-if="company.socialLinks.twitter"
                  :href="company.socialLinks.twitter"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-2 text-primary-400 hover:text-primary-300"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                Twitter
              </a>
              <a
                  v-if="company.socialLinks.github"
                  :href="company.socialLinks.github"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-2 text-primary-400 hover:text-primary-300"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>