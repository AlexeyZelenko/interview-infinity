<script setup lang="ts">
import { ref } from 'vue';

const company = ref({
  name: 'Tech Corp',
  description: 'Leading software development company specializing in AI and machine learning solutions.',
  industry: 'Technology',
  size: '50-200 employees',
  location: 'San Francisco, CA',
  website: 'https://techcorp.com',
  founded: '2015',
  socialLinks: {
    linkedin: 'https://linkedin.com/company/techcorp',
    twitter: 'https://twitter.com/techcorp',
    github: 'https://github.com/techcorp'
  }
});

const isEditing = ref(false);
</script>

<template>
  <div class="max-w-3xl">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Company Profile</h2>
      <button 
        @click="isEditing = !isEditing"
        class="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
      >
        {{ isEditing ? 'Save Changes' : 'Edit Profile' }}
      </button>
    </div>

    <div class="space-y-6">
      <!-- Basic Information -->
      <div class="bg-gray-800 rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-4">Basic Information</h3>
        <div class="grid gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Company Name</label>
            <input
              v-if="isEditing"
              v-model="company.name"
              type="text"
              class="w-full px-3 py-2 bg-gray-700 rounded-md"
            >
            <p v-else class="text-gray-300">{{ company.name }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <textarea
              v-if="isEditing"
              v-model="company.description"
              rows="4"
              class="w-full px-3 py-2 bg-gray-700 rounded-md"
            ></textarea>
            <p v-else class="text-gray-300">{{ company.description }}</p>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Industry</label>
              <input
                v-if="isEditing"
                v-model="company.industry"
                type="text"
                class="w-full px-3 py-2 bg-gray-700 rounded-md"
              >
              <p v-else class="text-gray-300">{{ company.industry }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Company Size</label>
              <input
                v-if="isEditing"
                v-model="company.size"
                type="text"
                class="w-full px-3 py-2 bg-gray-700 rounded-md"
              >
              <p v-else class="text-gray-300">{{ company.size }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Information -->
      <div class="bg-gray-800 rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-4">Contact Information</h3>
        <div class="grid gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Location</label>
            <input
              v-if="isEditing"
              v-model="company.location"
              type="text"
              class="w-full px-3 py-2 bg-gray-700 rounded-md"
            >
            <p v-else class="text-gray-300">{{ company.location }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Website</label>
            <input
              v-if="isEditing"
              v-model="company.website"
              type="url"
              class="w-full px-3 py-2 bg-gray-700 rounded-md"
            >
            <a 
              v-else 
              :href="company.website"
              target="_blank"
              class="text-primary-400 hover:text-primary-300"
            >
              {{ company.website }}
            </a>
          </div>
        </div>
      </div>

      <!-- Social Links -->
      <div class="bg-gray-800 rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-4">Social Links</h3>
        <div class="grid gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">LinkedIn</label>
            <input
              v-if="isEditing"
              v-model="company.socialLinks.linkedin"
              type="url"
              class="w-full px-3 py-2 bg-gray-700 rounded-md"
            >
            <a 
              v-else 
              :href="company.socialLinks.linkedin"
              target="_blank"
              class="text-primary-400 hover:text-primary-300"
            >
              {{ company.socialLinks.linkedin }}
            </a>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Twitter</label>
            <input
              v-if="isEditing"
              v-model="company.socialLinks.twitter"
              type="url"
              class="w-full px-3 py-2 bg-gray-700 rounded-md"
            >
            <a 
              v-else 
              :href="company.socialLinks.twitter"
              target="_blank"
              class="text-primary-400 hover:text-primary-300"
            >
              {{ company.socialLinks.twitter }}
            </a>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">GitHub</label>
            <input
              v-if="isEditing"
              v-model="company.socialLinks.github"
              type="url"
              class="w-full px-3 py-2 bg-gray-700 rounded-md"
            >
            <a 
              v-else 
              :href="company.socialLinks.github"
              target="_blank"
              class="text-primary-400 hover:text-primary-300"
            >
              {{ company.socialLinks.github }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>