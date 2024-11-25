<script setup lang="ts">
import FeatureBlocks from '@/components/FeatureBlocks.vue';
</script>

<template>
  <div class="text-center">
    <h1 class="text-4xl font-bold mb-8">{{ $t('home.title') }}</h1>
  </div>
  <div class="text-center mt-12">
    <p class="text-gray-300 mb-12 max-w-2xl mx-auto">
      {{ $t('home.description') }}
    </p>
    <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <div class="bg-gray-800 p-6 rounded-lg">
        <FeatureBlocks type="developer" />
      </div>
      <div class="bg-gray-800 p-6 rounded-lg">
        <FeatureBlocks type="company" />
      </div>
    </div>

    <div class="bg-gray-800 p-6 rounded-lg mt-12 max-w-3xl mx-auto">
      <FeatureBlocks type="general" />
    </div>
    <div class="text-center mt-10">
      <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div class="bg-gray-800 p-6 rounded-lg">
          <h2 class="text-2xl font-semibold mb-4">{{ $t('home.forDevelopers') }}</h2>
          <p class="mb-4">{{ $t('home.developerDescription') }}</p>
          <router-link to="/register?type=developer" class="inline-block bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700">
            {{ $t('home.joinAsDeveloper') }}
          </router-link>
        </div>

        <div class="bg-gray-800 p-6 rounded-lg">
          <h2 class="text-2xl font-semibold mb-4">{{ $t('home.forCompanies') }}</h2>
          <p class="mb-4">{{ $t('home.companyDescription') }}</p>
          <router-link to="/register?type=company" class="inline-block bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700">
            {{ $t('home.joinAsCompany') }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
