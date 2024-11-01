<script setup lang="ts">
import { ref } from 'vue';

interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
  location?: string;
  employmentType?: string;
  achievements?: string[];
  technologies?: string[];
  teamSize?: string;
  responsibilities?: string[];
}

const props = defineProps<{
  experiences: Experience[];
  isEditing: boolean;
  employmentTypes: string[];
}>();

const emit = defineEmits<{
  (e: 'add'): void;
  (e: 'remove', id: string): void;
  (e: 'update', experience: Experience): void;
}>();

const newAchievement = ref('');

const addAchievement = (experience: Experience) => {
  if (!newAchievement.value.trim()) return;
  if (!experience.achievements) experience.achievements = [];
  experience.achievements.push(newAchievement.value.trim());
  newAchievement.value = '';
  emit('update', experience);
};

const removeAchievement = (experience: Experience, index: number) => {
  experience.achievements?.splice(index, 1);
  emit('update', experience);
};

const toggleCurrentJob = (experience: Experience) => {
  experience.current = !experience.current;
  if (experience.current) {
    experience.endDate = null;
  }
  emit('update', experience);
};
</script>

<template>
  <div class="bg-gray-800 rounded-lg p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold">Experience</h3>
      <button
          v-if="isEditing"
          @click="emit('add')"
          class="text-primary-400 hover:text-primary-300"
      >
        Add Experience
      </button>
    </div>

    <div class="space-y-6">
      <div
          v-for="exp in experiences"
          :key="exp.id"
          class="border-l-2 border-gray-700 pl-4"
      >
        <!-- Experience editing form -->
        <div v-if="isEditing" class="space-y-4">
          <!-- Form fields for experience -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Job Title</label>
              <input
                  v-model="exp.title"
                  type="text"
                  required
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Company</label>
              <input
                  v-model="exp.company"
                  type="text"
                  required
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <!-- Additional fields -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Location</label>
              <input
                  v-model="exp.location"
                  type="text"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., San Francisco, CA"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Employment Type</label>
              <select
                  v-model="exp.employmentType"
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option v-for="type in employmentTypes" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>
          </div>

          <!-- Dates -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Start Date</label>
              <input
                  v-model="exp.startDate"
                  type="month"
                  required
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">End Date</label>
              <div class="space-y-2">
                <input
                    v-if="!exp.current"
                    v-model="exp.endDate"
                    type="month"
                    required
                    class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
                <label class="flex items-center">
                  <input
                      type="checkbox"
                      :checked="exp.current"
                      @change="toggleCurrentJob(exp)"
                      class="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
                  />
                  <span class="ml-2">Current Position</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Description and other fields -->
          <div>
            <label class="block text-sm font-medium mb-2">Description</label>
            <textarea
                v-model="exp.description"
                rows="3"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>

          <!-- Technologies -->
          <div>
            <label class="block text-sm font-medium mb-2">Technologies Used</label>
            <input
                v-model="exp.technologies"
                type="text"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Vue.js, TypeScript, Node.js"
            />
          </div>

          <!-- Team Size -->
          <div>
            <label class="block text-sm font-medium mb-2">Team Size</label>
            <input
                v-model="exp.teamSize"
                type="text"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., 5-10 people"
            />
          </div>

          <!-- Achievements -->
          <div>
            <label class="block text-sm font-medium mb-2">Key Achievements</label>
            <div class="space-y-2">
              <div v-for="(achievement, index) in exp.achievements" :key="index" class="flex gap-2">
                <input
                    v-model="exp.achievements[index]"
                    type="text"
                    class="flex-1 px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                    @click="removeAchievement(exp, index)"
                    class="text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
              <div class="flex gap-2">
                <input
                    v-model="newAchievement"
                    type="text"
                    class="flex-1 px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Add an achievement"
                    @keyup.enter="addAchievement(exp)"
                />
                <button
                    @click="addAchievement(exp)"
                    class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <button
              @click="emit('remove', exp.id)"
              class="text-red-400 hover:text-red-300"
          >
            Remove Experience
          </button>
        </div>

        <!-- Experience display -->
        <div v-else>
          <div class="flex justify-between items-start">
            <div>
              <h4 class="font-semibold">{{ exp.title }}</h4>
              <p class="text-gray-300">{{ exp.company }}</p>
              <p class="text-sm text-gray-400">
                {{ exp.location }} • {{ exp.employmentType }}
              </p>
              <p class="text-sm text-gray-400">
                {{ new Date(exp.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }} -
                {{ exp.current ? 'Present' : new Date(exp.endDate!).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }}
              </p>
            </div>
            <div v-if="exp.teamSize" class="text-sm text-gray-400">
              Team Size: {{ exp.teamSize }}
            </div>
          </div>

          <p class="mt-2 text-gray-300">{{ exp.description }}</p>

          <div v-if="exp.technologies?.length" class="mt-2">
            <p class="text-sm font-medium text-gray-400">Technologies:</p>
            <div class="flex flex-wrap gap-2 mt-1">
              <span
                  v-for="tech in exp.technologies"
                  :key="tech"
                  class="bg-gray-700 px-2 py-1 rounded-full text-xs"
              >
                {{ tech }}
              </span>
            </div>
          </div>

          <div v-if="exp.achievements?.length" class="mt-2">
            <p class="text-sm font-medium text-gray-400">Key Achievements:</p>
            <ul class="list-disc list-inside mt-1 text-gray-300">
              <li v-for="achievement in exp.achievements" :key="achievement">
                {{ achievement }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>