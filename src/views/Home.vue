<script setup lang="ts">
</script>

<template>
  <div class="text-center">
    <h1 class="text-4xl font-bold mb-8">Find Your Next Tech Opportunity</h1>
    <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <div class="bg-gray-800 p-6 rounded-lg">
        <h2 class="text-2xl font-semibold mb-4">For Developers</h2>
        <p class="mb-4">Showcase your skills, take tests, and find your dream job</p>
        <router-link to="/register?type=developer" class="inline-block bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700">
          Join as Developer
        </router-link>
      </div>
      
      <div class="bg-gray-800 p-6 rounded-lg">
        <h2 class="text-2xl font-semibold mb-4">For Companies</h2>
        <p class="mb-4">Find top tech talent and streamline your hiring process</p>
        <router-link to="/register?type=company" class="inline-block bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700">
          Join as Company
        </router-link>
      </div>
    </div>
  </div>
</template>