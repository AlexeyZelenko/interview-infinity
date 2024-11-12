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
        <label class="block text-sm font-medium mb-2">Focus Area (max 30 characters)</label>
        <textarea
            v-model="formData.description"
            maxlength="30"
            required
            rows="2"
            class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., State management, Hooks, Performance"
        ></textarea>
        <p class="text-sm text-gray-400 mt-1">
          {{ formData.description.length }}/30 characters
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Generated Prompt</label>
        <div class="bg-gray-700 p-4 rounded-lg">
          <pre class="whitespace-pre-wrap text-sm">{{ generatedPrompt }}</pre>
        </div>
      </div>

      <div class="flex gap-4">
        <button
            type="button"
            @click="generatePrompt"
            class="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
        >
          Generate Prompt
        </button>
        <button
            type="button"
            @click="downloadPrompt"
            class="flex-1 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
        >
          Download Prompt
        </button>
      </div>

      <div v-if="error" class="text-red-400 text-sm">
        {{ error }}
      </div>
      <div v-if="success" class="text-green-400 text-sm">
        Prompt generated successfully!
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const formData = ref({
  technology: '',
  difficulty: 'intermediate',
  description: ''
});

const error = ref('');
const success = ref(false);

const generatedPrompt = computed(() => {
  if (!formData.value.technology || !formData.value.description) return '';

  return `Create a CSV-formatted list of test questions for ${formData.value.technology} with the following metadata:

Required Collection Fields:
{
  "category": "${formData.value.technology.includes('Node') || formData.value.technology.includes('Python') || formData.value.technology.includes('Java') ? 'Backend' : 'Frontend'}",
  "description": "${formData.value.description}",
  "difficulty": "${formData.value.difficulty}",
  "duration": ${formData.value.difficulty === 'beginner' ? 30 : formData.value.difficulty === 'intermediate' ? 45 : 60},
  "title": "${formData.value.technology} ${formData.value.difficulty.charAt(0).toUpperCase() + formData.value.difficulty.slice(1)} Test"
}

CSV Format Requirements:
1. Format each row as: Question,Option1,Option2,Option3,Option4,CorrectAnswer,Explanation
2. CorrectAnswer should be a number (1-4) indicating the correct option
3. Include 10 questions
4. Questions should be practical and scenario-based
5. Include clear explanations for correct answers

Focus areas:
- ${formData.value.description}

Please provide the CSV-formatted questions that can be directly copied into a .csv file.`;
});

const generatePrompt = () => {
  if (!formData.value.technology || !formData.value.description) {
    error.value = 'Please fill in all fields';
    return;
  }

  success.value = true;
  error.value = '';
};

const downloadPrompt = () => {
  if (!generatedPrompt.value) {
    error.value = 'Please generate a prompt first';
    return;
  }

  const blob = new Blob([generatedPrompt.value], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${formData.value.technology.toLowerCase()}_test_prompt.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>
