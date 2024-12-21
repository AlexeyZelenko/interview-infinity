<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Resume } from '@/types/resumes.ts';
import { MagnifyingGlassIcon, PauseCircleIcon, NoSymbolIcon, UserIcon, BriefcaseIcon, ClipboardDocumentCheckIcon } from '@heroicons/vue/24/outline';
import SkillsArena from '@/components/d3/SkillsArena.vue';

const router = useRouter();
const resumes = ref<Resume[]>([]);
const allSkills = ref([
  'Vue.js', 'React', 'Angular', 'TypeScript', 'JavaScript',
  'Python', 'Node.js', 'Java', 'Go', 'Ruby'
]);
const selectedSkills = ref<string[]>([]);
const selectedStatus = ref<string[]>([]);

// Статус резюме - фильтры и в резюме - пока отключен
const showStatus = ref<boolean>(false);
const skillsData = ref<{ name: string, count: number }[]>([]);

// Фильтры для резюме кандидатов
const filteredResumes = computed(() =>
    resumes.value.filter(({ isActive, skills, status }) => {
      const matchesSkills = selectedSkills.value.length === 0 ||
          skills?.some(skill => selectedSkills.value.includes(skill));
      const matchesStatus = selectedStatus.value.length === 0 ||
          selectedStatus.value.includes(status);

      return isActive && matchesSkills && matchesStatus;
    })
);

// Вычисляем данные для скилов только из отфильтрованных резюме
const filteredSkillsData = computed(() => {
  const allSkillsArray = filteredResumes.value.flatMap(resume => resume.skills);
  const skillCount: { name: string, count: number }[] = [];

  allSkillsArray.forEach(skill => {
    const existingSkill = skillCount.find(item => item.name === skill);
    if (existingSkill) {
      existingSkill.count += 1;
    } else {
      skillCount.push({ name: skill, count: 1 });
    }
  });

  return skillCount;
});

const statusOptions = [
  { value: 'searching', label: 'Searching', icon: MagnifyingGlassIcon },
  { value: 'paused', label: 'On Pause', icon: PauseCircleIcon },
  { value: 'not_searching', label: 'Not Searching', icon: NoSymbolIcon }
];

function toggleSkill(skill: string) {
  const index = selectedSkills.value.indexOf(skill);
  if (index === -1) {
    selectedSkills.value.push(skill);
  } else {
    selectedSkills.value.splice(index, 1);
  }
}

function toggleStatus(status: string) {
  const index = selectedStatus.value.indexOf(status);
  if (index === -1) {
    selectedStatus.value.push(status);
  } else {
    selectedStatus.value.splice(index, 1);
  }
}

function viewResume(id: string) {
  router.push(`/all-resumes/resume/${id}`);
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'searching': return 'bg-green-500';
    case 'paused': return 'bg-yellow-500';
    case 'not_searching': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const fetchResumes = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'resumes'));
    resumes.value = snapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data()?.title || 'No title',
      skills: doc.data()?.skills || [],
      status: doc.data()?.status || 'not_searching',
      experience: doc.data()?.experience || 'No experience provided',
      education: doc.data()?.education || 'No education provided',
      about: doc.data()?.about || 'No additional information',
      isActive: doc.data()?.isActive || false,
    })) as Resume[];
  } catch (error) {
    console.error('Error fetching resumes:', error);
  }
};

onMounted(() => {
  fetchResumes();
});
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold mb-8 flex items-center gap-2">
      <ClipboardDocumentCheckIcon class="h-8 w-8 text-primary-600" />
      Resumes
    </h1>

    <div class="grid md:grid-cols-[300px,1fr] gap-8">
      <!-- Filters -->
      <div class="bg-gray-800 p-6 rounded-lg h-fit">
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
            <BriefcaseIcon class="h-6 w-6 text-primary-600" />
            Skills
          </h2>
          <div class="space-y-2">
            <label
                v-for="skill in allSkills"
                :key="skill"
                class="flex items-center space-x-2 cursor-pointer"
            >
              <input
                  type="checkbox"
                  :checked="selectedSkills.includes(skill)"
                  @change="toggleSkill(skill)"
                  class="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
              >
              <span>{{ skill }}</span>
            </label>
          </div>
        </div>

        <div v-if="showStatus">
          <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
            <UserIcon class="h-6 w-6 text-primary-600" />
            Status
          </h2>
          <div class="space-y-2">
            <label
                v-for="status in statusOptions"
                :key="status.value"
                class="flex items-center space-x-2 cursor-pointer"
            >
              <input
                  type="checkbox"
                  :checked="selectedStatus.includes(status.value)"
                  @change="toggleStatus(status.value)"
                  class="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
              >
              <span class="flex items-center gap-1">
                <component :is="status.icon" class="h-4 w-4" />
                {{ status.label }}
              </span>
            </label>
          </div>
        </div>

        <!-- Отправляем только отфильтрованные скилы в компонент SkillsArena -->
        <SkillsArena v-if="filteredSkillsData.length" :skills="filteredSkillsData" />
      </div>

      <!-- Resume List -->
      <div class="grid gap-4">
        <div
            v-for="resume in filteredResumes"
            :key="resume.id"
            @click="viewResume(resume.id)"
            class="bg-gray-800 p-6 rounded-lg cursor-pointer transition-colors"
        >
          <div class="w-full flex items-start justify-between mb-4">
            <div class="w-full">
              <div class="flex justify-between items-center">
                <h3 class="text-xl font-semibold">{{ resume.title }}</h3>
                <router-link
                    to="/all-resumes/resume/{{ resume.id }}"
                    class="text-primary-600 hover:underline text-align-right"
                >
                  View Resume
                </router-link>
              </div>
              <p class="text-md my-6">{{ resume.about }}</p>
              <div v-if="showStatus" class="flex items-center mt-1">
                <span
                    :class="[getStatusColor(resume.status), 'w-2 h-2 rounded-full mr-2']"
                ></span>
                <span class="text-gray-300">
                  {{ statusOptions.find(s => s.value === resume.status)?.label }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="resume && resume.skills.length > 0" class="flex flex-wrap gap-2">
            <span
                v-for="skill in resume.skills"
                :key="skill"
                class="bg-gray-700 px-3 py-1 rounded-full text-sm"
            >
              {{ skill }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
