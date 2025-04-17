<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    <h1 class="text-3xl font-bold mb-8 text-center">{{ t('ourProducts.title') }}</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- English Words Learning Product -->
      <div class="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors duration-300 transform hover:scale-105">
        <h2 class="text-xl font-semibold mb-4">{{ t('ourProducts.englishWordsLearning') }}</h2>
        <p class="text-gray-300 mb-6 min-h-[80px]">{{ t('ourProducts.englishWordsLearningDescription') }}</p>
        <a href="https://batleground-oz.web.app/" target="_blank" class="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-500 transition-colors w-full text-center">
          {{ t('ourProducts.openApp') }}
        </a>
      </div>

      <!-- AI Interview Product -->
      <div class="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors duration-300 transform hover:scale-105">
        <h2 class="text-xl font-semibold mb-4">{{ t('ourProducts.aiInterview') }}</h2>
        <p class="text-gray-300 mb-6 min-h-[80px]">{{ t('ourProducts.aiInterviewDescription') }}</p>
        <a href="https://interview-practice-344fe.web.app/" target="_blank" class="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-500 transition-colors w-full text-center">
          {{ t('ourProducts.openApp') }}
        </a>
      </div>

      <!-- My Dictionary -->
      <div class="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors duration-300 transform hover:scale-105">
        <h2 class="text-xl font-semibold mb-4">{{ t('ourProducts.myDictionary') }}</h2>
        <p class="text-gray-300 mb-6 min-h-[80px]">{{ t('ourProducts.myDictionaryDescription') }}</p>
        <a href="https://electronenglishwords.web.app" target="_blank" class="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-500 transition-colors w-full text-center">
          {{ t('ourProducts.openApp') }}
        </a>
      </div>

      <!-- IT Cheat Sheets -->
      <div class="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors duration-300 transform hover:scale-105">
        <h2 class="text-xl font-semibold mb-4">{{ t('ourProducts.itCheatSheets') }}</h2>
        <p class="text-gray-300 mb-6 min-h-[80px]">{{ t('ourProducts.itCheatSheetsDescription') }}</p>
        <a href="https://alexeyzelenko.github.io/vitepress/" target="_blank" class="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-500 transition-colors w-full text-center">
          {{ t('ourProducts.openApp') }}
        </a>
      </div>

      <!-- Fitness AI -->
      <div class="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors duration-300 transform hover:scale-105">
        <h2 class="text-xl font-semibold mb-4">{{ t('ourProducts.fitnessAI') }}</h2>
        <p class="text-gray-300 mb-6 min-h-[80px]">{{ t('ourProducts.fitnessAIDescription') }}</p>
        <a href="https://fitness-268b1.web.app/" target="_blank" class="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-500 transition-colors w-full text-center">
          {{ t('ourProducts.openApp') }}
        </a>
      </div>

      <!-- Recipe Search -->
      <div class="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors duration-300 transform hover:scale-105">
        <h2 class="text-xl font-semibold mb-4">{{ t('ourProducts.recipeSearch') }}</h2>
        <p class="text-gray-300 mb-6 min-h-[80px]">{{ t('ourProducts.recipeSearchDescription') }}</p>
        <a href="https://main.d2pdc4k1nmqnb.amplifyapp.com/" target="_blank" class="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-500 transition-colors w-full text-center">
          {{ t('ourProducts.openApp') }}
        </a>
      </div>

      <!-- English Words Learning Product (Laravel version) -->
      <div class="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors duration-300 transform hover:scale-105">
        <h2 class="text-xl font-semibold mb-4">{{ t('ourProducts.englishWordsLearningLaravel') }}</h2>
        <p class="text-gray-300 mb-6 min-h-[80px]">{{ t('ourProducts.englishWordsLearningLaravelDescription') }}</p>
        <a href="https://laravel-vue-main-hnozai.laravel.cloud/" target="_blank" class="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-500 transition-colors w-full text-center">
          {{ t('ourProducts.openApp') }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Remove the white background style as we're using dark theme */
</style> 