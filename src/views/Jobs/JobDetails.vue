<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.ts';
import { useJobsStore } from '@/stores/jobs.ts';
import { useSavedJobsStore } from '@/stores/savedJobs.ts';
import { useApplicationsStore } from '@/stores/applications.ts';
import CompanyInfoModal from '@/components/CompanyInfoModal.vue';
import ResumeSelectorModal from '@/components/ResumeSelectorModal.vue';
import JobTests from '@/views/Jobs/Tests/index.vue';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '@/firebase/config.ts';
import { Job, Salary } from '@/types/jobs.ts';

const resumes = ref([]); // Store resumes of the user
const selectedResumeId = ref<string | null>(null); // Selected resume ID
const showCompanyInfo = ref(false);
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const jobsStore = useJobsStore();
const savedJobsStore = useSavedJobsStore();
const applicationsStore = useApplicationsStore();

const jobId = route.params.id as string;
const loading = ref(true);
const error = ref('');
const showApplyModal = ref(false);
const coverLetter = ref('');
const resume = ref<File | null>(null);
const applying = ref(false);

const job = ref<Job>({
  id: jobId,
  title: '',
  company: '',
  companyId: '',
  location: '',
  type: '',
  salary: {
    min: 0,
    max: 0,
    currency: 'USD',
    period: 'year'
  },
  description: '',
  requirements: [],
  responsibilities: [],
  benefits: [],
  skills: [],
  postedAt: '',
  remote: false
});

// Firebase Storage
const storage = getStorage();

const fetchUserResumes = async () => {
  try {
    if (!authStore.user) return;

    const resumesCollectionRef = collection(db, 'resumes');
    const q = query(resumesCollectionRef, where('userId', '==', authStore.user.uid));
    const snapshot = await getDocs(q);

    resumes.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (err: any) {
    error.value = 'Failed to fetch resumes. Please try again.';
    console.error(err);
  }
};

const formatSalary = (salary: Salary) => {
  if (!salary) return 'Competitive';
  return `${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} ${salary.currency}`;
};

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    resume.value = input.files[0];
  }
};

const uploadResumeToStorage = async (file: File) => {
  if (!authStore.user) throw new Error('User must be logged in to upload a file');

  const storagePath = `resumes/${authStore.user.uid}/${file.name}`;
  const fileRef = storageRef(storage, storagePath);

  // Upload file to Firebase Storage
  await uploadBytes(fileRef, file);

  // Get downloadable URL
  const downloadUrl = await getDownloadURL(fileRef);
  return downloadUrl;
};

const toggleSaveJob = async () => {
  if (!authStore.user) {
    router.push('/login');
    return;
  }

  try {
    if (savedJobsStore.isSaved(job.value.id)) {
      await savedJobsStore.unsaveJob(job.value.id);
    } else {
      await savedJobsStore.saveJob(job.value);
    }
  } catch (err: any) {
    error.value = err.message;
  }
};

const applyForJob = async () => {
  if (!authStore.user) {
    await router.push('/login');
    return;
  }

  if (applicationsStore.hasApplied(job.value.id)) {
    error.value = 'You have already applied for this job';
    return;
  }

  try {
    applying.value = true;
    error.value = '';

    // Validate cover letter and selected resume
    if (!coverLetter.value.trim()) {
      throw new Error('Please provide a cover letter');
    }
    if (!selectedResumeId.value) {
      throw new Error('Please select a resume');
    }

    // Upload resume if the user has uploaded a new file (optional)
    let resumeUrl = '';
    if (resume.value) {
      resumeUrl = await uploadResumeToStorage(resume.value);
    }

    await applicationsStore.applyForJob({
      jobId: job.value.id,
      companyId: job.value.companyId,
      coverLetter: coverLetter.value,
      resume: resumeUrl,
      resumeId: selectedResumeId.value // Include the selected resume ID
    });

    showApplyModal.value = false;
    // Show success message or redirect
  } catch (err: any) {
    error.value = err.message;
  } finally {
    applying.value = false;
  }
};

const canApplyStatus = ref<boolean>(true);

// Function to check if the user can apply for the job
const checkCanApply = async () => {
  if (!job.value || !job.value.tests) {
    canApplyStatus.value = true;
    return;
  }

  const requiredTests = job.value.tests.filter(test => test.isRequired);
  if (requiredTests.length === 0) {
    canApplyStatus.value = true;
    return;
  }

  // Проверяем, прошел ли пользователь все обязательные тесты
  for (const test of requiredTests) {
    try {
      // const testResult = await applicationsStore.getTestResult(test.id, job.value.id);
      const testResult = await applicationsStore.duplicationPassingTest(test.id, job.value.id);;

      // Проверяем, существует ли документ результата теста
      if (!testResult) {
        // Документ не найден, следовательно, пользователь не прошел тест
        canApplyStatus.value = false;
        return;
      }
    } catch (error) {
      // Обрабатываем ошибки при запросе результата теста
      console.error('Error fetching test result:', error);
      canApplyStatus.value = false; // При ошибке считаем, что тест не пройден
      return;
    }
  }

  // Если все обязательные тесты пройдены, можно подавать заявку
  canApplyStatus.value = true;
};


// Call `checkCanApply` whenever the job changes or on mounted
watchEffect(() => {
  if (job.value) {
    checkCanApply();
  }
});

onMounted(() => {
  if (job.value) {
    checkCanApply();
  }
});

onMounted(async () => {
  try {
    const jobData = await jobsStore.getJobById(jobId);
    if (jobData) {
      job.value = jobData;
    } else {
      await router.push('/jobs');
      return;
    }

    // Load saved jobs, applications, and resumes if user is authenticated
    if (authStore.user) {
      await Promise.all([
        savedJobsStore.fetchSavedJobs(),
        applicationsStore.fetchApplications(),
        fetchUserResumes() // Load user resumes
      ]);
    }
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>


<template>
  <div class="max-w-4xl mx-auto">
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
      <p>Loading job details...</p>
    </div>

    <div v-else-if="error" class="bg-red-500/10 text-red-400 p-4 rounded-lg">
      {{ error }}
    </div>

    <template v-else>
      <!-- Job Header -->
      <div class="bg-gray-800 rounded-lg p-6 mb-6">
        <div class="flex flex-col justify-between items-start mb-4">
          <div>
            <h1 class="text-3xl font-bold mb-2">{{ job.title }}</h1>
            <p class="text-xl text-gray-300 mb-2">{{ job.company }}</p>
            <div class="flex flex-wrap gap-4 text-gray-400">
              <span class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ job.location }}
                <span v-if="job.remote" class="ml-1">(Remote)</span>
              </span>
              <span class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {{ job.type }}
              </span>
              <span class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ formatSalary(job.salary) }}
              </span>
              <span v-if="job.experience" class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {{ job.experience }}
              </span>
            </div>

            <div class="bg-gray-800 rounded-lg p-6 mb-4">
              <JobTests
                  v-if="job.tests?.length"
                  :tests="job.tests"
                  :jobId="job.id"
                  :canApplyStatus="canApplyStatus"
              />
            </div>
          </div>
          <div class="flex gap-2">
            <button
                @click="toggleSaveJob"
                class="flex items-center px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                :class="{ 'text-primary-400': savedJobsStore.isSaved(job.id) }"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              {{ savedJobsStore.isSaved(job.id) ? 'Saved' : 'Save Job' }}
            </button>
            <button
                v-if="!applicationsStore.hasApplied(job?.id)"
                @click="showApplyModal = true"
                :disabled="applying || !canApplyStatus"
                class="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <span v-if="applying">Applying...</span>
              <span v-else-if="!canApplyStatus">Complete required tests to apply</span>
              <span v-else>Apply for this Position</span>
            </button>
            <span
                v-else
                class="inline-block px-8 py-3 bg-green-500/10 text-green-400 rounded-lg"
            >
              You have already applied for this position
            </span>
          </div>
        </div>

        <div class="flex justify-between items-center text-sm text-gray-400">
          <p>Posted {{ new Date(job.postedAt).toLocaleDateString() }}</p>
          <p>{{ applicationsStore.getApplicationCount(job.id) }} applicants</p>
        </div>
      </div>

      <div class="bg-gray-800 rounded-lg p-6 mb-6">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-xl font-semibold mb-2">About {{ job.company }}</h2>
            <div v-if="job.companyInfo" class="space-y-2">
              <p class="text-gray-300">{{ job.companyInfo.industry }} • {{ job.companyInfo.size }}</p>
              <p class="text-gray-300 line-clamp-3">{{ job.companyInfo.description }}</p>
              <button
                  @click="showCompanyInfo = true"
                  class="text-primary-400 hover:text-primary-300"
              >
                Learn more about {{ job.company }}
              </button>
            </div>
          </div>
          <img
              v-if="job.companyInfo?.logo"
              :src="job.companyInfo.logo"
              :alt="job.company"
              class="w-16 h-16 rounded-lg object-cover"
          />
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid gap-6">
        <!-- Description -->
        <div class="bg-gray-800 rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-4">Job Description</h2>
          <p class="text-gray-300 whitespace-pre-line">{{ job.description }}</p>
        </div>

        <!-- Requirements -->
        <div class="bg-gray-800 rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-4">Requirements</h2>
          <ul class="list-disc list-inside space-y-2 text-gray-300">
            <li v-for="req in job.requirements" :key="req">{{ req }}</li>
          </ul>
        </div>

        <!-- Responsibilities -->
        <div class="bg-gray-800 rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-4">Responsibilities</h2>
          <ul class="list-disc list-inside space-y-2 text-gray-300">
            <li v-for="resp in job.responsibilities" :key="resp">{{ resp }}</li>
          </ul>
        </div>

        <!-- Benefits -->
        <div class="bg-gray-800 rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-4">Benefits</h2>
          <ul class="list-disc list-inside space-y-2 text-gray-300">
            <li v-for="benefit in job.benefits" :key="benefit">{{ benefit }}</li>
          </ul>
        </div>

        <!-- Skills -->
        <div class="bg-gray-800 rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-4">Required Skills</h2>
          <div class="flex flex-wrap gap-2">
            <span
                v-for="skill in job.skills"
                :key="skill"
                class="bg-gray-700 px-3 py-1 rounded-full text-sm"
            >
              {{ skill }}
            </span>
          </div>
        </div>
      </div>

      <!-- Apply Button (Bottom) -->
      <div class="mt-8 text-center">
        <div v-if="!canApplyStatus" class="text-red-500 text-sm mb-4">
          Please complete all required tests before applying.
        </div>

        <button
            v-if="!applicationsStore.hasApplied(job?.id)"
            @click="showApplyModal = true"
            :disabled="applying || !canApplyStatus"
            class="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {{ applying ? 'Applying...' : 'Apply for this Position' }}
        </button>
      </div>

      <!-- Application Modal -->
      <div
          v-if="showApplyModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-gray-800 rounded-lg p-6 max-w-xl w-full mx-4">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">Apply for {{ job.title }}</h2>
            <button @click="showApplyModal = false" class="text-gray-400 hover:text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="applyForJob" class="space-y-4">
            <!-- Select Resume -->
            <div>
              <label class="block text-sm font-medium mb-2">Select Resume <span class="text-red-500">*</span></label>
              <ResumeSelectorModal
                  :resumes="resumes"
                  v-model:selectedResumeId="selectedResumeId"
              />
              <p v-if="!selectedResumeId" class="text-red-500 text-sm">Selecting a resume is required.</p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Cover Letter</label>
              <textarea
                  v-model="coverLetter"
                  rows="6"
                  required
                  class="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Tell us why you're interested in this position..."
              ></textarea>
            </div>

            <!-- Optional Resume Upload -->
            <div>
              <label class="block text-sm font-medium mb-2">Upload Resume (Optional)</label>
              <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  @change="handleFileUpload"
                  class="block w-full text-sm text-gray-300
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-primary-600 file:text-white
              hover:file:bg-primary-700"
              />
              <p class="mt-1 text-sm text-gray-400">
                Accepted formats: PDF, DOC, DOCX (Max 5MB)
              </p>
            </div>

            <div v-if="error" class="text-red-500 text-sm">
              {{ error }}
            </div>

            <div class="flex justify-end gap-4">
              <button
                  type="button"
                  @click="showApplyModal = false"
                  class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                  type="submit"
                  :disabled="applying"
                  class="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
              >
                {{ applying ? 'Submitting...' : 'Submit Application' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <CompanyInfoModal
          v-if="showCompanyInfo"
          :company="job.companyInfo"
          @close="showCompanyInfo = false"
      />
    </template>
  </div>
</template>