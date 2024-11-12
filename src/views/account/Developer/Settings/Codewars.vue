<script lang="ts" setup>
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import axios from 'axios';

const props = defineProps({
  username: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:username']);

// Локальная реактивная переменная
const localUsername = ref(props.username);

const isCheckingCodewars = ref(false);
const codewarsData = ref<any>(null);

// Функция проверки Codewars
const checkCodewarsConnection = async () => {
  // Если имя пользователя пустое, показываем ошибку
  if (!localUsername.value.trim()) {
    useToast().error("Please enter a Codewars username.");
    return;
  }

  isCheckingCodewars.value = true;

  try {
    // Отправляем запрос к API Codewars
    const response = await axios.get(`https://www.codewars.com/api/v1/users/${localUsername.value}`);
    codewarsData.value = response.data;
  } catch (error) {
    useToast().error("Failed to connect to Codewars. Please check the username.");
  } finally {
    isCheckingCodewars.value = false;
  }
};

// Обновление значения `username` через событие `emit`
const updateUsername = () => {
  emit('update:username', localUsername.value);
};
</script>

<template>
  <div class="mb-6">
    <label for="codewarsUsername" class="block mb-2">Codewars Username</label>
    <div class="flex items-center mb-4">
      <input
          v-model="localUsername"
          @input="updateUsername"
          type="text"
          id="codewarsUsername"
          class="w-full p-2 mr-4 bg-gray-700 rounded"
          placeholder="Enter Codewars username"
      />
      <button
          type="button"
          @click="checkCodewarsConnection"
          :disabled="isCheckingCodewars"
          class="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
      >
        {{ isCheckingCodewars ? 'Checking...' : 'Check Codewars Connection' }}
      </button>
    </div>

    <!-- Displaying Codewars Data -->
    <div v-if="codewarsData" class="bg-gray-700 p-4 rounded mb-6">
      <h2 class="text-lg font-bold mb-2">Codewars Information</h2>
      <p><strong>Username:</strong> {{ codewarsData.username }}</p>
      <p><strong>Honor:</strong> {{ codewarsData.honor }}</p>
      <p><strong>Clan:</strong> {{ codewarsData.clan }}</p>
      <p><strong>Leaderboard Position:</strong> {{ codewarsData.leaderboardPosition }}</p>
    </div>
  </div>
</template>
