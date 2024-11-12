<script setup lang="ts">
import { ref } from 'vue';

interface Project {
  name: string;
  description: string;
  url?: string;
  technologies: string[];
  role?: string;
  highlights?: string[];
}

const props = defineProps<{
  projects?: Project[];
  isEditing: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:projects', projects: Project[]): void;
}>();

const newProject = ref<Project>({
  name: '',
  description: '',
  url: '',
  technologies: [],
  role: '',
  highlights: []
});

const newTechnology = ref('');
const newHighlight = ref('');

const addProject = () => {
  if (!newProject.value.name || !newProject.value.description) return;

  const updatedProjects = [...(props.projects || [])];
  updatedProjects.push({
    ...newProject.value,
    url: newProject.value.url || undefined,
    role: newProject.value.role || undefined,
    technologies: [...newProject.value.technologies],
    highlights: newProject.value.highlights?.length ? [...newProject.value.highlights] : undefined
  });

  emit('update:projects', updatedProjects);
  newProject.value = {
    name: '',
    description: '',
    url: '',
    technologies: [],
    role: '',
    highlights: []
  };
};

const removeProject = (index: number) => {
  const updatedProjects = [...(props.projects || [])];
  updatedProjects.splice(index, 1);
  emit('update:projects', updatedProjects);
};

const addTechnology = () => {
  if (!newTechnology.value.trim()) return;
  newProject.value.technologies.push(newTechnology.value.trim());
  newTechnology.value = '';
};

const removeTechnology = (index: number) => {
  newProject.value.technologies.splice(index, 1);
};

const addHighlight = () => {
  if (!newHighlight.value.trim()) return;
  if (!newProject.value.highlights) {
    newProject.value.highlights = [];
  }
  newProject.value.highlights.push(newHighlight.value.trim());
  newHighlight.value = '';
};

const removeHighlight = (index: number) => {
  newProject.value.highlights?.splice(index, 1);
};
</script>

<template>
  <div class="bg-gray-800 rounded-lg p-6">
    <h3 class="text-xl font-semibold mb-4">Projects</h3>

    <div v-if="isEditing" class="space-y-6">
      <!-- Add New Project Form -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Project Name</label>
          <input
              v-model="newProject.name"
              type="text"
              class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., E-commerce Platform"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Description</label>
          <textarea
              v-model="newProject.description"
              rows="3"
              class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="Describe the project and its impact..."
          ></textarea>
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Project URL (Optional)</label>
            <input
                v-model="newProject.url"
                type="url"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://..."
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Your Role (Optional)</label>
            <input
                v-model="newProject.role"
                type="text"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Lead Developer"
            />
          </div>
        </div>

        <!-- Technologies -->
        <div>
          <label class="block text-sm font-medium mb-2">Technologies Used</label>
          <div class="flex gap-2 mb-2">
            <input
                v-model="newTechnology"
                type="text"
                class="flex-1 px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Add a technology"
                @keyup.enter.prevent="addTechnology"
            />
            <button
                @click.prevent="addTechnology"
                class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              Add
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
                v-for="(tech, index) in newProject.technologies"
                :key="index"
                class="group bg-gray-700 px-3 py-1 rounded-full text-sm"
            >
              {{ tech }}
              <button
                  @click.prevent="removeTechnology(index)"
                  class="ml-2 text-gray-400 group-hover:text-red-400"
              >
                ×
              </button>
            </span>
          </div>
        </div>

        <!-- Key Highlights -->
        <div>
          <label class="block text-sm font-medium mb-2">Key Highlights</label>
          <div class="flex gap-2 mb-2">
            <input
                v-model="newHighlight"
                type="text"
                class="flex-1 px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Add a highlight"
                @keyup.enter.prevent="addHighlight"
            />
            <button
                @click.prevent="addHighlight"
                class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              Add
            </button>
          </div>
          <ul class="space-y-2">
            <li
                v-for="(highlight, index) in newProject.highlights"
                :key="index"
                class="flex justify-between items-center bg-gray-700 px-3 py-2 rounded"
            >
              <span>{{ highlight }}</span>
              <button
                  @click.prevent="removeHighlight(index)"
                  class="text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </li>
          </ul>
        </div>

        <button
            @click.prevent="addProject"
            class="w-full px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
            :disabled="!newProject.name || !newProject.description"
        >
          Add Project
        </button>
      </div>

      <!-- Existing Projects List -->
      <div class="space-y-4">
        <div
            v-for="(project, index) in projects"
            :key="index"
            class="bg-gray-700 p-4 rounded"
        >
          <div class="flex justify-between items-start">
            <div class="space-y-2">
              <div>
                <h4 class="font-medium">{{ project.name }}</h4>
                <p v-if="project.role" class="text-gray-300">{{ project.role }}</p>
              </div>
              <p class="text-gray-300">{{ project.description }}</p>

              <div v-if="project.technologies.length" class="flex flex-wrap gap-2">
                <span
                    v-for="tech in project.technologies"
                    :key="tech"
                    class="bg-gray-600 px-2 py-1 rounded-full text-xs"
                >
                  {{ tech }}
                </span>
              </div>

              <ul v-if="project.highlights?.length" class="list-disc list-inside text-gray-300">
                <li v-for="highlight in project.highlights" :key="highlight">
                  {{ highlight }}
                </li>
              </ul>

              <a
                  v-if="project.url"
                  :href="project.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary-400 hover:text-primary-300"
              >
                View Project
              </a>
            </div>
            <button
                @click.prevent="removeProject(index)"
                class="text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Display Mode -->
    <div v-else class="space-y-6">
      <div
          v-for="project in projects"
          :key="project.name"
          class="border-l-2 border-gray-700 pl-4"
      >
        <div class="space-y-2">
          <div>
            <h4 class="font-medium">{{ project.name }}</h4>
            <p v-if="project.role" class="text-gray-300">{{ project.role }}</p>
          </div>
          <p class="text-gray-300">{{ project.description }}</p>

          <div v-if="project.technologies.length" class="flex flex-wrap gap-2">
            <span
                v-for="tech in project.technologies"
                :key="tech"
                class="bg-gray-700 px-2 py-1 rounded-full text-xs"
            >
              {{ tech }}
            </span>
          </div>

          <ul v-if="project.highlights?.length" class="list-disc list-inside text-gray-300">
            <li v-for="highlight in project.highlights" :key="highlight">
              {{ highlight }}
            </li>
          </ul>

          <a
              v-if="project.url"
              :href="project.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary-400 hover:text-primary-300"
          >
            View Project
          </a>
        </div>
      </div>
    </div>
  </div>
</template>