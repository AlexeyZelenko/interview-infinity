<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getDocs, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config.ts';
import Swal from 'sweetalert2';
import ResumeSelector from '@/components/resume/ResumeSelector.vue';
import AboutSection from '@/components/resume/AboutSection.vue';
import ExperienceSection from '@/components/resume/ExperienceSection.vue';
import EducationSection from '@/components/resume/EducationSection.vue';
import SkillsSection from '@/components/resume/SkillsSection.vue';
import NewResumeModal from '@/components/resume/NewResumeModal.vue';
import LanguagesSection from '@/components/resume/LanguagesSection.vue';
import CertificationsSection from '@/components/resume/CertificationsSection.vue';
import ProjectsSection from '@/components/resume/ProjectsSection.vue';
import PreferencesSection from '@/components/resume/PreferencesSection.vue';
import { useAuthStore } from '@/stores/auth.ts';
import { Resume } from '@/types/resumes.ts';

const authStore = useAuthStore();

const resumes = ref<Resume[]>([]);
const currentResumeId = ref('');
const isEditing = ref(false);
const error = ref('');
const saving = ref(false);
const showNewResumeModal = ref(false);

// Dummy employment types
const employmentTypes = ref(['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']);

// Format Resume Data
const formatResumeData = (data: any, id: string): Resume => {
  return {
    id,
    title: data?.title || 'Untitled Resume',
    isActive: data?.isActive || false,
    createdAt: data?.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
    updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
    about: data?.about || '',
    experience: Array.isArray(data?.experience) ? data.experience : [],
    education: Array.isArray(data?.education) ? data.education : [],
    skills: Array.isArray(data?.skills) ? data.skills : [],
    languages: Array.isArray(data?.languages) ? data.languages : [],
    certifications: Array.isArray(data?.certifications) ? data.certifications : [],
    projects: Array.isArray(data?.projects) ? data.projects : [],
    socialLinks: typeof data?.socialLinks === 'object' ? data.socialLinks : {},
    preferences: typeof data?.preferences === 'object' ? data.preferences : {},
  };
};

// Fetch resumes from Firestore
const fetchResumes = async () => {
  try {
    const resumesCollectionRef = collection(db, 'resumes');
    const resumesSnapshot = await getDocs(resumesCollectionRef);
    resumes.value = resumesSnapshot.docs.map(doc => formatResumeData(doc.data(), doc.id));

    // Set the current resume ID to the first one if resumes exist
    if (resumes.value.length > 0) {
      currentResumeId.value = resumes.value[0].id;
    }
  } catch (err) {
    console.error('Error fetching resumes:', err);
    error.value = 'Error fetching resumes. Please try again later.';
  }
};

const currentResume = computed(() => {
  return resumes.value.find(r => r.id === currentResumeId.value) || null;
});

// Create a new resume (navigate to a create page)
const createNewResume = () => {
  router.push(`/resumes/create`);
};

// Delete a resume by ID (with confirmation)
const deleteResume = async (id: string) => {
  try {
    const confirmation = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this resume? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (confirmation.isConfirmed) {
      // Delete document from Firestore
      await deleteDoc(doc(db, 'resumes', id));

      // Show success message
      Swal.fire({
        title: 'Deleted!',
        text: 'The resume has been deleted.',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });

      // Update resumes list
      await fetchResumes();
    }
  } catch (err) {
    console.error('Error deleting resume:', err);
    Swal.fire('Error!', 'An error occurred while deleting the resume.', 'error');
  }
};

// Toggle resume status (active/inactive) and update in Firestore
const toggleResumeStatus = async (id: string) => {
  const resume = resumes.value.find(r => r.id === id);
  if (resume) {
    try {
      const updatedStatus = !resume.isActive;

      // Update the status in Firestore
      await updateDoc(doc(db, 'resumes', id), {
        isActive: updatedStatus
      });

      // Update local state
      resume.isActive = updatedStatus;

      // Show success message
      Swal.fire('Updated!', `The resume status has been updated to ${updatedStatus ? 'active' : 'inactive'}.`, 'success');
    } catch (err) {
      console.error('Error updating resume status:', err);
      Swal.fire('Error!', 'An error occurred while updating the resume status.', 'error');
    }
  }
};

// Handle save action
const handleSave = async () => {
  if (saving.value) return; // предотвращаем двойное нажатие
  saving.value = true;

  try {
    // Убедимся, что резюме выбрано
    if (!currentResume.value) throw new Error('No resume selected to save.');

    // Логика сохранения данных
    const userId = authStore.user?.uid; // authStore предполагает, что это управление авторизацией пользователя
    if (!userId) throw new Error('User not authenticated');

    // Helper function to clean undefined values in nested objects
    const deepClean = (obj: any) => {
      return JSON.parse(
          JSON.stringify(obj, (key, value) => (value === undefined ? null : value))
      );
    };

    // Define resume data with all required fields, ensuring no undefined values
    const resumeData = {
      title: currentResume.value.title || '', // Default to an empty string if title is undefined
      isActive: currentResume.value.isActive ?? false, // Default to false if undefined
      createdAt: currentResume.value.createdAt, // Keep the existing createdAt value
      updatedAt: new Date().toISOString(), // Update timestamp for this change
      userId,
      about: currentResume.value.about || '', // Default to an empty string
      experience: currentResume.value.experience ? currentResume.value.experience.map(deepClean) : [], // Clean each experience object
      education: currentResume.value.education ? currentResume.value.education.map(deepClean) : [], // Clean each education object
      skills: currentResume.value.skills ? [...currentResume.value.skills] : [], // Ensure it's an array
      languages: currentResume.value.languages ? currentResume.value.languages.map(deepClean) : [], // Clean each language object
      certifications: currentResume.value.certifications ? currentResume.value.certifications.map(deepClean) : [], // Clean each certification object
      projects: currentResume.value.projects ? currentResume.value.projects.map(deepClean) : [], // Clean each project object
      preferences: deepClean(currentResume.value.preferences || {
        // Provide default preferences object
        jobTypes: [],
        locations: [],
        remotePreference: 'flexible',
      }),
    };

    // Log each field in resumeData to check for any remaining undefined values
    console.log('Prepared resumeData fields:');
    Object.keys(resumeData).forEach((key) => {
      console.log(`  ${key}:`, resumeData[key as keyof typeof resumeData]);
    });

    // Update the existing resume in Firestore
    const resumeDocRef = doc(db, 'resumes', currentResume.value.id);
    await updateDoc(resumeDocRef, resumeData);
    console.log('Resume updated successfully');

    // Show success notification
    Swal.fire('Saved!', 'The resume has been successfully saved.', 'success');

    // Optional: Redirect to another page if necessary
    // router.push('/developer/resumes');
  } catch (err: any) {
    console.error('Error saving resume:', err);
    error.value = err.message;
    Swal.fire('Error!', 'An error occurred while saving the resume.', 'error');
  } finally {
    saving.value = false;
    isEditing.value = false;
  }
};

const router = useRouter();

onMounted(() => {
  fetchResumes();
});
</script>

<template>
  <div v-if="currentResume" class="max-w-3xl">
    <!-- Resume Selection -->
    <ResumeSelector
        :resumes="resumes"
        v-model:currentResumeId="currentResumeId"
        @create="createNewResume"
        @delete="deleteResume"
        @toggle-status="toggleResumeStatus"
    />

    <NewResumeModal
        v-if="showNewResumeModal"
        @close="showNewResumeModal = false"
        @create="createNewResume"
    />

    <div v-if="error" class="mb-6 bg-red-500/10 text-red-400 p-4 rounded-lg">
      {{ error }}
    </div>

    <!-- Edit/Save Button -->
    <div class="flex justify-end mb-6">
      <button
          @click="isEditing ? handleSave() : isEditing = true"
          :disabled="saving"
          class="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:opacity-50"
      >
        {{ saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Edit Resume') }}
      </button>
    </div>

    <!-- Resume Content -->
    <div class="space-y-8">
      <AboutSection
          v-if="currentResume.about"
          :about="currentResume.about"
          :isEditing="isEditing"
      />
      <ExperienceSection
          v-if="currentResume.experience && currentResume.experience.length > 0"
          :experiences="currentResume.experience"
          :employmentTypes="employmentTypes"
          :isEditing="isEditing"
      />
      <EducationSection
          v-if="currentResume.education && currentResume.education.length > 0"
          :education="currentResume.education"
          :isEditing="isEditing"
      />
      <SkillsSection
          v-if="currentResume.skills && currentResume.skills.length > 0"
          :skills="currentResume.skills"
          :isEditing="isEditing"
      />
      <LanguagesSection
          v-if="currentResume.languages && currentResume.languages.length > 0"
          :languages="currentResume.languages"
          :isEditing="isEditing"
      />
      <CertificationsSection
          v-if="currentResume.certifications && currentResume.certifications.length > 0"
          :certifications="currentResume.certifications"
          :isEditing="isEditing"
      />
      <ProjectsSection
          v-if="currentResume.projects && currentResume.projects.length > 0"
          :projects="currentResume.projects"
          :isEditing="isEditing"
      />
      <PreferencesSection
          v-if="currentResume.preferences"
          :preferences="currentResume.preferences"
          :isEditing="isEditing"
      />
    </div>
  </div>
  <div v-else >
    <p class="text-center text-gray-500">
      No resumes found.
      <button
          @click="createNewResume"
          class="text-primary-600 hover:underline">
        Create a new resume
      </button></p>
  </div>
</template>
