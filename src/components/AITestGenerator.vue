<template>
  <div class="bg-gray-800 rounded-lg p-6 mb-8">
    <h2 class="text-xl font-semibold mb-4">Generate Test with AI</h2>

    <form @submit.prevent="generateTest" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-2">Technology</label>
        <input
            v-model="formData.technology"
            type="text"
            required
            class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., React, Vue.js, Node.js"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Difficulty</label>
        <select
            v-model="formData.difficulty"
            required
            class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Focus Area (max 50 characters)</label>
        <textarea
            v-model="formData.description"
            maxlength="50"
            required
            rows="2"
            class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., State management, питання та відповіді українською мовою, Performance"
        ></textarea>
        <p class="text-sm text-gray-400 mt-1">
          {{ formData.description.length }}/30 characters
        </p>
      </div>

      <div class="w-full px-4 py-2">
        <button
            v-if="authStore.user"
            type="submit"
            :disabled="loading"
            class="w-full px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
        >
          {{ loading ? 'Generating...' : 'Generate Test' }}
        </button>
        <router-link
            v-else
            to="/login"
            class="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        >
          Login to Contribute
        </router-link>
      </div>

      <div v-if="error" class="text-red-400 text-sm">
        {{ error }}
      </div>
      <div v-if="success" class="text-green-400 text-sm">
        Test generated and uploaded successfully!
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { generatePrompt } from '../utils/promptGenerator';
import { validateAndUploadTest } from '../utils/testUploader';

const formData = ref({
  technology: '',
  difficulty: 'intermediate',
  description: ''
});

const authStore = useAuthStore();

const loading = ref(false);
const error = ref('');
const success = ref(false);

const generateTest = async () => {
  loading.value = true;
  error.value = '';
  success.value = false;

  try {
    // Generate prompt
    const prompt = generatePrompt(
        formData.value.technology,
        formData.value.difficulty,
        formData.value.description
    );
    console.log('Generated prompt:', prompt);

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500
      })
    });

    const data = await response.json();
    console.log('OpenAI API response data:', data);

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    // Validate and upload the generated test
    await validateAndUploadTest(data.choices[0].message.content, {
      title: `${formData.value.technology} ${formData.value.difficulty} Test`,
      description: formData.value.description,
      category: formData.value.technology,
      difficulty: formData.value.difficulty
    });

    console.log('Test uploaded successfully');
    success.value = true;

    // Reset form data
    formData.value = {
      technology: '',
      difficulty: 'intermediate',
      description: ''
    };
  } catch (err: any) {
    console.error('Error generating test:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
    console.log('Test generation process complete');
  }
};
</script>
