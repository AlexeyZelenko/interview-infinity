<script setup lang="ts">
import { ref } from 'vue';
import { collection, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '@/firebase/config.ts';
import { useAuthStore } from '@/stores/auth.ts';
import { useRouter } from 'vue-router';
import { Resume, Experience, Education } from '@/types/resumes.ts';

import AboutSection from '../../../components/create-resume/AboutSection.vue';
import ExperienceSection from '../../../components/create-resume/ExperienceSection.vue';
import EducationSection from '../../../components/create-resume/EducationSection.vue';
import SkillsSection from '../../../components/create-resume/SkillsSection.vue';
import LanguagesSection from '../../../components/create-resume/LanguagesSection.vue';
import CertificationsSection from '../../../components/create-resume/CertificationsSection.vue';
import ProjectsSection from '../../../components/create-resume/ProjectsSection.vue';
import PreferencesSection from '../../../components/create-resume/PreferencesSection.vue';

// Initialize Auth and Router
const authStore = useAuthStore();
const router = useRouter();

// Resume fields and interface definitions
const title = ref('');
const isActive = ref(true);
const about = ref('');
const experience = ref<Experience[]>([]);
const education = ref<Education[]>([]);
const skills = ref<string[]>([]);
const languages = ref<{ language: string; level: string }[]>([]);
const certifications = ref([]);
const projects = ref([]);
const preferences = ref({
  jobTypes: [],
  locations: [],
  remotePreference: 'flexible' as 'remote' | 'hybrid' | 'onsite' | 'flexible',
});
const employmentTypes = ref<string[]>([
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Internship',
]);

// State for error handling and loading
const error = ref('');
const saving = ref(false);

// Save function
const saveResume = async () => {
  try {
    saving.value = true;
    error.value = '';

    const userId = authStore.user?.uid;
    if (!userId) throw new Error("User not authenticated");

    // Helper function to clean undefined values in nested objects
    const deepClean = (obj: any) => {
      return JSON.parse(JSON.stringify(obj, (key, value) => (value === undefined ? null : value)));
    };

    // Define resume data with all required fields, ensuring no undefined values
    const resumeData: Resume = {
      title: title.value || '', // Default to an empty string if title is undefined
      isActive: isActive.value ?? false, // Default to false if undefined
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userId,
      about: about.value || '', // Default to an empty string
      experience: experience.value ? experience.value.map(deepClean) : [], // Clean each experience object
      education: education.value ? education.value.map(deepClean) : [], // Clean each education object
      skills: skills.value ? [...skills.value] : [], // Ensure it's an array
      languages: languages.value ? languages.value.map(deepClean) : [], // Clean each language object
      certifications: certifications.value ? certifications.value.map(deepClean) : [], // Clean each certification object
      projects: projects.value ? projects.value.map(deepClean) : [], // Clean each project object
      preferences: deepClean(preferences.value || { // Provide default preferences object
        jobTypes: [],
        locations: [],
        remotePreference: 'flexible',
      })
    };

    // Add the new resume to Firestore
    await addDoc(collection(db, 'resumes'), resumeData);
    console.log("Resume saved successfully");

    await router.push('/developer/resumes'); // Redirect to the resumes list page after saving
  } catch (err: any) {
    console.error("Error saving resume:", err);
    error.value = err.message;
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="max-w-3xl">
    <h1 class="text-2xl font-bold mb-4">Create New Resume</h1>

    <div v-if="error" class="mb-4 text-red-500">{{ error }}</div>

    <!-- Form to input resume details -->
    <form @submit.prevent="saveResume" class="space-y-8">
      <!-- Title and Active Status -->
      <div>
        <label class="block text-sm font-medium mb-2">Resume Title</label>
        <input v-model="title" type="text" required class="w-full px-3 py-2 bg-gray-700 rounded-md" placeholder="Resume Title" />

        <div class="flex items-center gap-2 mt-2">
          <input
              type="checkbox"
              v-model="isActive"
              class="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
          />
          <label class="text-sm">Set as Active</label>
        </div>
      </div>

      <!-- Resume Content Sections -->
      <AboutSection v-model:about="about" @update="exp => about.value = exp" />
      <ExperienceSection
          :employmentTypes="employmentTypes"
          :experiences="experience"
          @add="experience.push($event)"
          @remove="experience = experience.filter(exp => exp.id !== $event)"
          @update="exp => experience = experience.map(e => (e.id === exp.id ? exp : e))"
      />

      <EducationSection
          :education="education"
          @add="education.push($event)"
          @remove="education = education.filter(edu => edu.id !== $event)"
          @update="edu => education = education.map(e => (e.id === edu.id ? edu : e))"
      />

      <SkillsSection v-model:skills="skills" />

      <LanguagesSection v-model:languages="languages" :isEditing="true" />

      <CertificationsSection v-model:certifications="certifications" :isEditing="true" />

      <ProjectsSection v-model:projects="projects" :isEditing="true" />

      <PreferencesSection v-model:preferences="preferences" :isEditing="true" />

      <!-- Save Button -->
      <div class="flex justify-end">
        <button type="submit" :disabled="saving" class="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:opacity-50">
          {{ saving ? 'Saving...' : 'Save Resume' }}
        </button>
      </div>
    </form>
  </div>
</template>
