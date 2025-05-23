<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useJobsStore } from '@/stores/jobs';

const route = useRoute();
const router = useRouter();
const jobsStore = useJobsStore();
const jobId = route.params.id as string;

const loading = ref(true);
const saving = ref(false);
const error = ref('');

const job = ref({
  title: '',
  location: '',
  type: 'Full-time',
  salary: {
    min: 0,
    max: 0,
    currency: 'USD',
    period: 'year'
  },
  description: '',
  requirements: [] as string[],
  responsibilities: [] as string[],
  benefits: [] as string[],
  skills: [] as string[]
});

const newRequirement = ref('');
const newResponsibility = ref('');
const newBenefit = ref('');
const newSkill = ref('');

const jobTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Internship'
];

onMounted(async () => {
  try {
    const jobData = await jobsStore.getJobById(jobId);
    if (jobData) {
      job.value = { ...jobData };
    } else {
      router.push('/company/jobs');
    }
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});

const addItem = (list: string[], item: string, inputRef: any) => {
  if (item.trim()) {
    list.push(item.trim());
    inputRef.value = '';
  }
};

const removeItem = (list: string[], index: number) => {
  list.splice(index, 1);
};

const handleSubmit = async () => {
  try {
    saving.value = true;
    error.value = '';

    // Validate form
    if (!job.value.title || !job.value.location || !job.value.description) {
      throw new Error('Please fill in all required fields');
    }

    if (job.value.requirements.length === 0 || job.value.responsibilities.length === 0) {
      throw new Error('Please add at least one requirement and responsibility');
    }

    if (job.value.salary.max < job.value.salary.min) {
      throw new Error('Maximum salary cannot be less than minimum salary');
    }

    // Update job using the store
    await jobsStore.updateJob(jobId, job.value);
    router.push('/company/jobs');
  } catch (err: any) {
    error.value = err.message;
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="max-w-3xl">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Edit Job</h2>
      <div class="flex gap-2">
        <button
            @click="router.push(`/company/jobs/${jobId}/applicants`)"
            class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
        >
          View Applicants
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p>Loading job details...</p>
    </div>

    <template v-else>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Form content same as CreateJob.vue but with v-model bound to job.value -->
        <!-- Basic Information -->
        <div class="bg-gray-800 rounded-lg p-6">
          <h3 class="text-xl font-semibold mb-4">Basic Information</h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Job Title</label>
              <input
                  v-model="job.title"
                  type="text"
                  required
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Senior Frontend Developer"
              />
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Location</label>
                <input
                    v-model="job.location"
                    type="text"
                    required
                    class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., New York, NY or Remote"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Job Type</label>
                <select
                    v-model="job.type"
                    class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option v-for="type in jobTypes" :key="type" :value="type">
                    {{ type }}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Salary Range</label>
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <input
                      v-model.number="job.salary.min"
                      type="number"
                      min="0"
                      class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Minimum"
                  />
                </div>
                <div>
                  <input
                      v-model.number="job.salary.max"
                      type="number"
                      min="0"
                      class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Maximum"
                  />
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Job Description</label>
              <textarea
                  v-model="job.description"
                  rows="4"
                  required
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Describe the role and responsibilities"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Requirements -->
        <div class="bg-gray-800 rounded-lg p-6">
          <h3 class="text-xl font-semibold mb-4">Requirements</h3>

          <div class="space-y-4">
            <div class="flex gap-2">
              <input
                  v-model="newRequirement"
                  type="text"
                  class="flex-1 px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Add a requirement"
                  @keyup.enter="addItem(job.requirements, newRequirement, $refs.requirementInput)"
              />
              <button
                  type="button"
                  @click="addItem(job.requirements, newRequirement, $refs.requirementInput)"
                  class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                Add
              </button>
            </div>

            <ul class="space-y-2">
              <li
                  v-for="(req, index) in job.requirements"
                  :key="index"
                  class="flex justify-between items-center bg-gray-700 px-3 py-2 rounded"
              >
                <span>{{ req }}</span>
                <button
                    type="button"
                    @click="removeItem(job.requirements, index)"
                    class="text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- Responsibilities -->
        <div class="bg-gray-800 rounded-lg p-6">
          <h3 class="text-xl font-semibold mb-4">Responsibilities</h3>

          <div class="space-y-4">
            <div class="flex gap-2">
              <input
                  v-model="newResponsibility"
                  type="text"
                  class="flex-1 px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Add a responsibility"
                  @keyup.enter="addItem(job.responsibilities, newResponsibility, $refs.responsibilityInput)"
              />
              <button
                  type="button"
                  @click="addItem(job.responsibilities, newResponsibility, $refs.responsibilityInput)"
                  class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                Add
              </button>
            </div>

            <ul class="space-y-2">
              <li
                  v-for="(resp, index) in job.responsibilities"
                  :key="index"
                  class="flex justify-between items-center bg-gray-700 px-3 py-2 rounded"
              >
                <span>{{ resp }}</span>
                <button
                    type="button"
                    @click="removeItem(job.responsibilities, index)"
                    class="text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- Benefits -->
        <div class="bg-gray-800 rounded-lg p-6">
          <h3 class="text-xl font-semibold mb-4">Benefits</h3>

          <div class="space-y-4">
            <div class="flex gap-2">
              <input
                  v-model="newBenefit"
                  type="text"
                  class="flex-1 px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Add a benefit"
                  @keyup.enter="addItem(job.benefits, newBenefit, $refs.benefitInput)"
              />
              <button
                  type="button"
                  @click="addItem(job.benefits, newBenefit, $refs.benefitInput)"
                  class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                Add
              </button>
            </div>

            <ul class="space-y-2">
              <li
                  v-for="(benefit, index) in job.benefits"
                  :key="index"
                  class="flex justify-between items-center bg-gray-700 px-3 py-2 rounded"
              >
                <span>{{ benefit }}</span>
                <button
                    type="button"
                    @click="removeItem(job.benefits, index)"
                    class="text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- Required Skills -->
        <div class="bg-gray-800 rounded-lg p-6">
          <h3 class="text-xl font-semibold mb-4">Required Skills</h3>

          <div class="space-y-4">
            <div class="flex gap-2">
              <input
                  v-model="newSkill"
                  type="text"
                  class="flex-1 px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Add a skill"
                  @keyup.enter="addItem(job.skills, newSkill, $refs.skillInput)"
              />
              <button
                  type="button"
                  @click="addItem(job.skills, newSkill, $refs.skillInput)"
                  class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                Add
              </button>
            </div>

            <div class="flex flex-wrap gap-2">
              <span
                  v-for="(skill, index) in job.skills"
                  :key="index"
                  class="group bg-gray-700 px-3 py-1 rounded-full text-sm"
              >
                {{ skill }}
                <button
                    type="button"
                    @click="removeItem(job.skills, index)"
                    class="ml-2 text-gray-400 group-hover:text-red-400"
                >
                  ×
                </button>
              </span>
            </div>
          </div>
        </div>

        <div v-if="error" class="bg-red-500/10 text-red-400 p-4 rounded-lg">
          {{ error }}
        </div>

        <div class="flex justify-end gap-4">
          <button
              type="button"
              @click="router.push('/company/jobs')"
              class="px-6 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
              type="submit"
              :disabled="saving"
              class="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
          >
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </template>
  </div>
</template>