<script setup lang="ts">
import { ref, computed } from 'vue';
import ResumeSelector from '../../components/resume/ResumeSelector.vue';
import AboutSection from '../../components/resume/AboutSection.vue';
import ExperienceSection from '../../components/resume/ExperienceSection.vue';
import EducationSection from '../../components/resume/EducationSection.vue';
import SkillsSection from '../../components/resume/SkillsSection.vue';
import NewResumeModal from '../../components/resume/NewResumeModal.vue';
import LanguagesSection from '../../components/resume/LanguagesSection.vue';
import CertificationsSection from '../../components/resume/CertificationsSection.vue';
import ProjectsSection from '../../components/resume/ProjectsSection.vue';
import PreferencesSection from '../../components/resume/PreferencesSection.vue';

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

interface Education {
  id: string;
  degree: string;
  school: string;
  year: string;
  field?: string;
  gpa?: string;
  courses?: string[];
  activities?: string[];
  awards?: string[];
  location?: string;
}

interface Resume {
  id: string;
  title: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  about: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages?: { language: string; level: string }[];
  certifications?: { name: string; issuer: string; date: string; url?: string }[];
  projects?: {
    name: string;
    description: string;
    url?: string;
    technologies: string[];
    role?: string;
    highlights?: string[];
  }[];
  socialLinks?: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
    twitter?: string;
  };
  preferences?: {
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
  };
}

const resumes = ref<Resume[]>([
  {
    id: '1',
    title: 'Full Stack Developer Resume',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    about: 'Experienced full-stack developer with a passion for creating user-friendly interfaces.',
    experience: [
      {
        id: '1',
        title: 'Senior Frontend Developer',
        company: 'Tech Corp',
        startDate: '2022-01',
        endDate: null,
        current: true,
        description: 'Leading frontend development team, implementing new features and maintaining existing codebase.',
        location: 'San Francisco, CA',
        employmentType: 'Full-time',
        technologies: ['Vue.js', 'TypeScript', 'Tailwind CSS'],
        teamSize: '5-10',
        achievements: [
          'Reduced page load time by 40%',
          'Implemented new design system'
        ]
      }
    ],
    education: [
      {
        id: '1',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        school: 'Tech University',
        year: '2020',
        gpa: '3.8',
        location: 'New York, NY',
        courses: [
          'Advanced Algorithms',
          'Web Development',
          'Database Systems'
        ]
      }
    ],
    skills: ['JavaScript', 'TypeScript', 'Vue.js', 'React', 'Node.js'],
    languages: [
      { language: 'English', level: 'Native' },
      { language: 'Spanish', level: 'Intermediate' }
    ],
    certifications: [
      {
        name: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
        date: '2023-06',
        url: 'https://aws.amazon.com/certification'
      }
    ],
    socialLinks: {
      github: 'https://github.com/username',
      linkedin: 'https://linkedin.com/in/username'
    },
    preferences: {
      jobTypes: ['Full-time', 'Contract'],
      locations: ['San Francisco', 'New York', 'Remote'],
      remotePreference: 'hybrid',
      industries: ['Technology', 'Finance', 'Healthcare'],
      companySize: ['Startup', 'Mid-size']
    }
  }
]);

const currentResumeId = ref(resumes.value[0].id);
const isEditing = ref(false);
const error = ref('');
const saving = ref(false);
const showNewResumeModal = ref(false);

const currentResume = computed(() => {
  return resumes.value.find(r => r.id === currentResumeId.value)!;
});

const handleSave = async () => {
  try {
    saving.value = true;
    error.value = '';

    // Validate required fields
    const hasEmptyExperience = currentResume.value.experience.some(
        exp => !exp.title || !exp.company || !exp.startDate || (!exp.current && !exp.endDate)
    );

    const hasEmptyEducation = currentResume.value.education.some(
        edu => !edu.degree || !edu.school || !edu.year
    );

    if (hasEmptyExperience || hasEmptyEducation) {
      throw new Error('Please fill in all required fields');
    }

    // Sort experience by date (most recent first)
    currentResume.value.experience.sort((a, b) => {
      const dateA = a.current ? new Date() : new Date(a.endDate || '');
      const dateB = b.current ? new Date() : new Date(b.endDate || '');
      return dateB.getTime() - dateA.getTime();
    });

    // Sort education by year (most recent first)
    currentResume.value.education.sort((a, b) => parseInt(b.year) - parseInt(a.year));

    currentResume.value.updatedAt = new Date().toISOString();

    // TODO: Save resume to backend
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call

    isEditing.value = false;
  } catch (err: any) {
    error.value = err.message;
  } finally {
    saving.value = false;
  }
};

const createNewResume = (title: string) => {
  const newResume: Resume = {
    id: Date.now().toString(),
    title,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    about: '',
    experience: [],
    education: [],
    skills: [],
    languages: [],
    certifications: [],
    projects: [],
    preferences: {
      jobTypes: [],
      locations: [],
      remotePreference: 'flexible'
    }
  };

  resumes.value.push(newResume);
  currentResumeId.value = newResume.id;
  showNewResumeModal.value = false;
};

const duplicateResume = (id: string) => {
  const original = resumes.value.find(r => r.id === id);
  if (!original) return;

  const copy: Resume = {
    ...JSON.parse(JSON.stringify(original)),
    id: Date.now().toString(),
    title: `${original.title} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  resumes.value.push(copy);
  currentResumeId.value = copy.id;
};

const deleteResume = (id: string) => {
  if (resumes.value.length === 1) {
    error.value = 'Cannot delete the last resume';
    return;
  }

  resumes.value = resumes.value.filter(r => r.id !== id);
  if (currentResumeId.value === id) {
    currentResumeId.value = resumes.value[0].id;
  }
};

const toggleResumeStatus = (id: string) => {
  const resume = resumes.value.find(r => r.id === id);
  if (resume) {
    resume.isActive = !resume.isActive;
  }
};
</script>

<template>
  <div class="max-w-3xl">
    <!-- Resume Selection -->
    <ResumeSelector
        :resumes="resumes"
        v-model:currentResumeId="currentResumeId"
        @create="showNewResumeModal = true"
        @duplicate="duplicateResume"
        @delete="deleteResume"
        @toggle-status="toggleResumeStatus"
    />

    <!-- New Resume Modal -->
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
          v-model:about="currentResume.about"
          :isEditing="isEditing"
      />

      <ExperienceSection
          :experiences="currentResume.experience"
          :isEditing="isEditing"
          @update="exp => currentResume.experience = exp"
      />

      <EducationSection
          :education="currentResume.education"
          :isEditing="isEditing"
          @update="edu => currentResume.education = edu"
      />

      <SkillsSection
          v-model:skills="currentResume.skills"
          :isEditing="isEditing"
      />

      <LanguagesSection
          v-model:languages="currentResume.languages"
          :isEditing="isEditing"
      />

      <CertificationsSection
          v-model:certifications="currentResume.certifications"
          :isEditing="isEditing"
      />

      <ProjectsSection
          v-model:projects="currentResume.projects"
          :isEditing="isEditing"
      />

      <PreferencesSection
          v-model:preferences="currentResume.preferences"
          :isEditing="isEditing"
      />
    </div>
  </div>
</template>