<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase/config';
import Swal from 'sweetalert2';

// Импортируем разделы резюме
import AboutSection from '../components/resume/AboutSection.vue';
import ExperienceSection from '../components/resume/ExperienceSection.vue';
import EducationSection from '../components/resume/EducationSection.vue';
import SkillsSection from '../components/resume/SkillsSection.vue';
import LanguagesSection from '../components/resume/LanguagesSection.vue';
import CertificationsSection from '../components/resume/CertificationsSection.vue';
import ProjectsSection from '../components/resume/ProjectsSection.vue';
import PreferencesSection from '../components/resume/PreferencesSection.vue';

// Импорт иконок Heroicons (или используйте SVG)
import { ArrowLeftIcon, PencilSquareIcon } from '@heroicons/vue/24/outline';

// Интерфейс резюме
interface Resume {
  id: string;
  title: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  about: string;
  experience: any[];
  education: any[];
  skills: string[];
  languages: any[];
  certifications: any[];
  projects: any[];
  socialLinks?: any;
  preferences?: any;
}

const resumes = ref<Resume[]>([]);
const currentResumeId = ref('');
const isEditing = ref(false);
const error = ref('');

const employmentTypes = ref(['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']);

// Получение ID резюме из URL
const route = useRoute();
const router = useRouter();
const resumeId = route.params.id as string;

// Форматирование данных резюме
const formatResumeData = (data: any, id: string): Resume => ({
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
});

// Получение резюме из Firestore
const fetchResumes = async () => {
  try {
    const resumesCollectionRef = collection(db, 'resumes');
    const resumesSnapshot = await getDocs(resumesCollectionRef);
    resumes.value = resumesSnapshot.docs.map(doc => formatResumeData(doc.data(), doc.id));

    // Установка текущего ID резюме
    if (resumes.value.length > 0) {
      currentResumeId.value = resumeId || resumes.value[0].id;
    }
  } catch (err) {
    console.error('Error fetching resumes:', err);
    error.value = 'Error fetching resumes. Please try again later.';
  }
};

const currentResume = computed(() => {
  return resumes.value.find(r => r.id === currentResumeId.value) || null;
});

// Инициализация при монтировании компонента
onMounted(() => {
  fetchResumes();
});
</script>

<template>
  <div v-if="currentResume" class="max-w-3xl mx-auto">
    <!-- Заголовок и кнопка назад -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-4">
        <ArrowLeftIcon class="w-6 h-6 text-blue-400 cursor-pointer hover:text-blue-500" @click="router.push('/all-resumes')" />
        <h2 class="text-3xl font-bold text-white">{{ currentResume.title }}</h2>
      </div>
    </div>

    <!-- Сообщение об ошибке -->
    <div v-if="error" class="mb-6 bg-red-500/10 text-red-400 p-4 rounded-lg">
      {{ error }}
    </div>

    <!-- Секции резюме -->
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
</template>

<style scoped>
/* Добавление стилей для яркости */
.bg-blue-600:hover {
  background-color: #2563eb; /* Более яркий синий для hover */
}

.text-blue-400:hover {
  color: #3b82f6; /* Более яркий оттенок синего */
}
</style>
