<script setup lang="ts">
import { ref } from 'vue';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';

import AboutSection from '../../components/resume/AboutSection.vue';
import ExperienceSection from '../../components/resume/ExperienceSection.vue';
import EducationSection from '../../components/resume/EducationSection.vue';
import SkillsSection from '../../components/resume/SkillsSection.vue';
import LanguagesSection from '../../components/resume/LanguagesSection.vue';
import CertificationsSection from '../../components/resume/CertificationsSection.vue';
import ProjectsSection from '../../components/resume/ProjectsSection.vue';
import PreferencesSection from '../../components/resume/PreferencesSection.vue';

// Initialize Auth and Router
const authStore = useAuthStore();
const router = useRouter();

// Resume fields and interface definitions
const title = ref('');
const isActive = ref(true);
const about = ref('');
const experience = ref([]);
const education = ref([]);
const skills = ref([]);
const languages = ref([]);
const certifications = ref([]);
const projects = ref([]);
const preferences = ref({
  jobTypes: [],
  locations: [],
  remotePreference: 'flexible' as 'remote' | 'hybrid' | 'onsite' | 'flexible',
});

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

    const resumeData = {
      title: title.value,
      isActive: isActive.value,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userId,
      about: about.value,
      experience: experience.value,
      education: education.value,
      skills: skills.value,
      languages: languages.value,
      certifications: certifications.value,
      projects: projects.value,
      preferences: preferences.value
    };

    // Add the new resume to Firestore
    await addDoc(collection(db, 'resumes'), resumeData);
    router.push('/resumes'); // Redirect to the resumes list page after saving
  } catch (err: any) {
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
          <input type="checkbox" v-model="isActive" class="rounded border-gray-600 text-primary-600 focus:ring-primary-500" />
          <label class="text-sm">Set as Active</label>
        </div>
      </div>

      <!-- Resume Content Sections -->
      <AboutSection v-model:about="about" :isEditing="true" />

      <ExperienceSection :experiences="experience" :isEditing="true" @update="exp => experience.value = exp" />

      <EducationSection :education="education" :isEditing="true" @update="edu => education.value = edu" />

      <SkillsSection v-model:skills="skills" :isEditing="true" />

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
