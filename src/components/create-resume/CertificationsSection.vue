<script setup lang="ts">
import { ref } from 'vue';

// Импорт Heroicons для иконок
import { PlusCircleIcon, TrashIcon } from '@heroicons/vue/24/outline';

interface Certification {
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

const props = defineProps<{
  certifications?: Certification[];
  isEditing: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:certifications', certifications: Certification[]): void;
}>();

const newCertification = ref<Certification>({
  name: '',
  issuer: '',
  date: '',
  url: ''
});

const addCertification = () => {
  if (!newCertification.value.name || !newCertification.value.issuer || !newCertification.value.date) return;

  const updatedCertifications = [...(props.certifications || [])];
  updatedCertifications.push({
    ...newCertification.value,
    url: newCertification.value.url || undefined
  });

  emit('update:certifications', updatedCertifications);
  newCertification.value = {
    name: '',
    issuer: '',
    date: '',
    url: ''
  };
};

const removeCertification = (index: number) => {
  const updatedCertifications = [...(props.certifications || [])];
  updatedCertifications.splice(index, 1);
  emit('update:certifications', updatedCertifications);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });
};
</script>

<template>
  <div class="bg-gray-800 rounded-lg p-6">
    <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
      <!-- Иконка заголовка -->
      <PlusCircleIcon class="w-6 h-6 text-primary-400" />
      Certifications
    </h3>

    <div v-if="isEditing" class="space-y-6">
      <!-- Add New Certification Form -->
      <div class="space-y-4">
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Certification Name</label>
            <input
                v-model="newCertification.name"
                type="text"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., AWS Certified Developer"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Issuing Organization</label>
            <input
                v-model="newCertification.issuer"
                type="text"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Amazon Web Services"
            />
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Date Earned</label>
            <input
                v-model="newCertification.date"
                type="month"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Credential URL (Optional)</label>
            <input
                v-model="newCertification.url"
                type="url"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://..."
            />
          </div>
        </div>

        <button
            @click.stop="addCertification"
            class="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-2 transition disabled:opacity-50"
            :disabled="!newCertification.name || !newCertification.issuer || !newCertification.date"
        >
          <PlusCircleIcon class="w-5 h-5"/>
          Add Certification
        </button>
      </div>

      <!-- Existing Certifications List -->
      <div class="space-y-4">
        <div
            v-for="(cert, index) in certifications"
            :key="index"
            class="bg-gray-700 p-4 rounded"
        >
          <div class="flex justify-between items-start">
            <div>
              <h4 class="font-medium">{{ cert.name }}</h4>
              <p class="text-gray-300">{{ cert.issuer }}</p>
              <p class="text-sm text-gray-400">{{ formatDate(cert.date) }}</p>
              <a
                  v-if="cert.url"
                  :href="cert.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm text-primary-400 hover:text-primary-300"
              >
                View Credential
              </a>
            </div>
            <button
                @click="removeCertification(index)"
                class="text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <TrashIcon class="w-5 h-5"/>
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Display Mode -->
    <div v-else class="space-y-4">
      <div
          v-for="cert in certifications"
          :key="cert.name"
          class="border-l-2 border-gray-700 pl-4"
      >
        <h4 class="font-medium">{{ cert.name }}</h4>
        <p class="text-gray-300">{{ cert.issuer }}</p>
        <div class="flex items-center gap-4 text-sm">
          <span class="text-gray-400">{{ formatDate(cert.date) }}</span>
          <a
              v-if="cert.url"
              :href="cert.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary-400 hover:text-primary-300"
          >
            View Credential
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-primary-400 {
  color: #3b82f6; /* Пример более яркого оттенка */
}
</style>
