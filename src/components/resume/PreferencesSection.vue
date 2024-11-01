<script setup lang="ts">
interface Preferences {
  jobTypes: string[];
  locations: string[];
  remotePreference: 'remote' | 'hybrid' | 'onsite' | 'flexible';
  salaryExpectation?: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  industries?: string[];
  companySize?: string[];
}

const props = defineProps<{
  preferences?: Preferences;
  isEditing: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:preferences', preferences: Preferences): void;
}>();

const jobTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Internship'
];

const workModes = [
  { value: 'remote', label: 'Remote Only' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
  { value: 'flexible', label: 'Flexible' }
];

const industries = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'E-commerce',
  'Manufacturing',
  'Consulting',
  'Media',
  'Gaming'
];

const companySizes = [
  'Startup (1-10)',
  'Small (11-50)',
  'Medium (51-200)',
  'Large (201-1000)',
  'Enterprise (1000+)'
];

const currencies = [
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD'
];

const periods = [
  'year',
  'month',
  'hour'
];

const toggleJobType = (type: string) => {
  if (!props.preferences) return;

  const updatedTypes = props.preferences.jobTypes.includes(type)
      ? props.preferences.jobTypes.filter(t => t !== type)
      : [...props.preferences.jobTypes, type];

  emit('update:preferences', {
    ...props.preferences,
    jobTypes: updatedTypes
  });
};

const toggleIndustry = (industry: string) => {
  if (!props.preferences) return;

  const updatedIndustries = props.preferences.industries?.includes(industry)
      ? props.preferences.industries.filter(i => i !== industry)
      : [...(props.preferences.industries || []), industry];

  emit('update:preferences', {
    ...props.preferences,
    industries: updatedIndustries
  });
};

const toggleCompanySize = (size: string) => {
  if (!props.preferences) return;

  const updatedSizes = props.preferences.companySize?.includes(size)
      ? props.preferences.companySize.filter(s => s !== size)
      : [...(props.preferences.companySize || []), size];

  emit('update:preferences', {
    ...props.preferences,
    companySize: updatedSizes
  });
};

const updateLocation = (event: Event) => {
  if (!props.preferences) return;

  const input = event.target as HTMLInputElement;
  const locations = input.value.split(',').map(loc => loc.trim()).filter(Boolean);

  emit('update:preferences', {
    ...props.preferences,
    locations
  });
};

const updateSalary = (field: 'min' | 'max' | 'currency' | 'period', value: string | number) => {
  if (!props.preferences) return;

  const currentSalary = props.preferences.salaryExpectation || {
    min: 0,
    max: 0,
    currency: 'USD',
    period: 'year'
  };

  emit('update:preferences', {
    ...props.preferences,
    salaryExpectation: {
      ...currentSalary,
      [field]: value
    }
  });
};

const formatSalary = (salary?: { min: number; max: number; currency: string; period: string }) => {
  if (!salary) return 'Not specified';
  return `${salary.currency}${salary.min.toLocaleString()} - ${salary.currency}${salary.max.toLocaleString()} per ${salary.period}`;
};
</script>

<template>
  <div class="bg-gray-800 rounded-lg p-6">
    <h3 class="text-xl font-semibold mb-4">Job Preferences</h3>

    <div v-if="isEditing" class="space-y-6">
      <!-- Job Types -->
      <div>
        <label class="block text-sm font-medium mb-2">Job Types</label>
        <div class="flex flex-wrap gap-2">
          <button
              v-for="type in jobTypes"
              :key="type"
              @click="toggleJobType(type)"
              class="px-3 py-1 rounded-full text-sm transition-colors"
              :class="preferences?.jobTypes.includes(type)
              ? 'bg-primary-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
          >
            {{ type }}
          </button>
        </div>
      </div>

      <!-- Work Mode -->
      <div>
        <label class="block text-sm font-medium mb-2">Work Mode Preference</label>
        <select
            :value="preferences?.remotePreference"
            @change="$emit('update:preferences', { ...preferences, remotePreference: ($event.target as HTMLSelectElement).value })"
            class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
        >
          <option v-for="mode in workModes" :key="mode.value" :value="mode.value">
            {{ mode.label }}
          </option>
        </select>
      </div>

      <!-- Locations -->
      <div>
        <label class="block text-sm font-medium mb-2">Preferred Locations</label>
        <input
            :value="preferences?.locations.join(', ')"
            @input="updateLocation"
            type="text"
            class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., New York, London, Remote"
        />
        <p class="mt-1 text-sm text-gray-400">Separate multiple locations with commas</p>
      </div>

      <!-- Salary Expectations -->
      <div>
        <label class="block text-sm font-medium mb-2">Salary Expectations</label>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <input
                :value="preferences?.salaryExpectation?.min"
                @input="updateSalary('min', +($event.target as HTMLInputElement).value)"
                type="number"
                min="0"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Minimum"
            />
          </div>
          <div>
            <input
                :value="preferences?.salaryExpectation?.max"
                @input="updateSalary('max', +($event.target as HTMLInputElement).value)"
                type="number"
                min="0"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Maximum"
            />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 mt-2">
          <div>
            <select
                :value="preferences?.salaryExpectation?.currency"
                @change="updateSalary('currency', ($event.target as HTMLSelectElement).value)"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option v-for="currency in currencies" :key="currency" :value="currency">
                {{ currency }}
              </option>
            </select>
          </div>
          <div>
            <select
                :value="preferences?.salaryExpectation?.period"
                @change="updateSalary('period', ($event.target as HTMLSelectElement).value)"
                class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option v-for="period in periods" :key="period" :value="period">
                per {{ period }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Industries -->
      <div>
        <label class="block text-sm font-medium mb-2">Preferred Industries</label>
        <div class="flex flex-wrap gap-2">
          <button
              v-for="industry in industries"
              :key="industry"
              @click="toggleIndustry(industry)"
              class="px-3 py-1 rounded-full text-sm transition-colors"
              :class="preferences?.industries?.includes(industry)
              ? 'bg-primary-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
          >
            {{ industry }}
          </button>
        </div>
      </div>

      <!-- Company Size -->
      <div>
        <label class="block text-sm font-medium mb-2">Company Size Preference</label>
        <div class="flex flex-wrap gap-2">
          <button
              v-for="size in companySizes"
              :key="size"
              @click="toggleCompanySize(size)"
              class="px-3 py-1 rounded-full text-sm transition-colors"
              :class="preferences?.companySize?.includes(size)
              ? 'bg-primary-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
          >
            {{ size }}
          </button>
        </div>
      </div>
    </div>

    <!-- Display Mode -->
    <div v-else class="space-y-4">
      <div v-if="preferences?.jobTypes.length" class="space-y-1">
        <h4 class="text-sm font-medium text-gray-400">Job Types</h4>
        <div class="flex flex-wrap gap-2">
          <span
              v-for="type in preferences.jobTypes"
              :key="type"
              class="bg-gray-700 px-2 py-1 rounded-full text-sm"
          >
            {{ type }}
          </span>
        </div>
      </div>

      <div class="space-y-1">
        <h4 class="text-sm font-medium text-gray-400">Work Mode</h4>
        <p class="text-gray-300">
          {{ workModes.find(mode => mode.value === preferences?.remotePreference)?.label }}
        </p>
      </div>

      <div v-if="preferences?.locations.length" class="space-y-1">
        <h4 class="text-sm font-medium text-gray-400">Preferred Locations</h4>
        <div class="flex flex-wrap gap-2">
          <span
              v-for="location in preferences.locations"
              :key="location"
              class="bg-gray-700 px-2 py-1 rounded-full text-sm"
          >
            {{ location }}
          </span>
        </div>
      </div>

      <div v-if="preferences?.salaryExpectation" class="space-y-1">
        <h4 class="text-sm font-medium text-gray-400">Salary Expectation</h4>
        <p class="text-gray-300">{{ formatSalary(preferences.salaryExpectation) }}</p>
      </div>

      <div v-if="preferences?.industries?.length" class="space-y-1">
        <h4 class="text-sm font-medium text-gray-400">Preferred Industries</h4>
        <div class="flex flex-wrap gap-2">
          <span
              v-for="industry in preferences.industries"
              :key="industry"
              class="bg-gray-700 px-2 py-1 rounded-full text-sm"
          >
            {{ industry }}
          </span>
        </div>
      </div>

      <div v-if="preferences?.companySize?.length" class="space-y-1">
        <h4 class="text-sm font-medium text-gray-400">Company Size Preference</h4>
        <div class="flex flex-wrap gap-2">
          <span
              v-for="size in preferences.companySize"
              :key="size"
              class="bg-gray-700 px-2 py-1 rounded-full text-sm"
          >
            {{ size }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>