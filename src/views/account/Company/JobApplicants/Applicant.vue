<script setup lang="ts">
import {defineProps, ref, onMounted, computed} from 'vue';
import { Resume } from "@/types/resumes";
import { useResumeStore } from '@/stores/resume.ts';
import { useAuthStore } from '@/stores/auth.ts';
import { useApplicationsStore } from '@/stores/applications.ts';
import { useTestStore } from '@/stores/tests.ts';
import { JobApplication, JobApplicationStatus } from '@/types/application.ts';
import MatchScore from './MatchScore.vue';
import TestsResult from './TestsResult.vue';
import Chat from '@/components/Chat.vue';

// Properly define props with TypeScript
const props = defineProps<{
  applicant: JobApplication;
}>();

// Use resume store
const useResume = useResumeStore();
const resume = ref<Resume | null>(null);
const resumeId = ref<string | null>(null);
const resultTests = ref<any | null>(null);

const UseAuth = useAuthStore();
const currentUserId = computed(() => UseAuth.user?.uid ?? '');

const UseJobApplication = useApplicationsStore();
const UseTest = useTestStore();

// Function to update applicant status
const localStatus = ref<JobApplicationStatus>(props.applicant.status || JobApplicationStatus.Pending);

const updateApplicantStatus = async (newStatus: JobApplicationStatus) => {
  try {
    await UseJobApplication.updateApplicationStatus(props.applicant.id, newStatus);
    await UseJobApplication.fetchApplications();
  } catch (err) {
    console.error("Error updating status:", err);
  }
};

// Get color classes based on applicant status
const getStatusColor = (status: JobApplicationStatus) => {
  switch (status) {
    case JobApplicationStatus.Pending: return 'bg-blue-500/10 text-blue-400';
    case JobApplicationStatus.Reviewing: return 'bg-yellow-500/10 text-yellow-400';
    case JobApplicationStatus.Interviewing: return 'bg-green-500/10 text-green-400';
    case JobApplicationStatus.Rejected: return 'bg-red-500/10 text-red-400';
    case JobApplicationStatus.Hired: return 'bg-primary-500/10 text-primary-400';
    default: return 'bg-gray-500/10 text-gray-400';
  }
};

// Fetch resume on mounted
onMounted(async () => {
  console.log("Applicant:", props.applicant);
  console.log("Current user ID:", currentUserId.value);
  if (!props.applicant.status) {
    localStatus.value = JobApplicationStatus.Pending;
  }

  resumeId.value = props.applicant.resumeId ?? null;


  try {
    const [resumeData, testResults] = await Promise.all([
      resumeId.value ? useResume.getResumeById(resumeId.value) : Promise.resolve(null),
      UseTest.getTestAttemptUserFromJob(props.applicant.userId, props.applicant.jobId)
    ]);

    if (resumeData) {
      resume.value = resumeData;
    }

    resultTests.value = testResults;
  } catch (error) {
    console.error("Error during initialization:", error);
  }
});
</script>

<template>
  <div>
    <div v-if="resume" class="flex justify-between items-start mb-4">
      <div>
        <h3 class="text-xl font-semibold mb-2">{{ resume.title }}</h3>
        <p class="text-gray-300">{{ applicant.applicantEmail}}</p>
        <p v-if="applicant.coverLetter" class="text-gray-400 text-sm">
          Cover letter: {{ applicant.coverLetter }} experience
        </p>
      </div>

      <div v-if="resultTests?.length > 0" class="mr-3">
        <MatchScore :tests="resultTests" />
      </div>

      <div>
        <select
            v-model="localStatus"
            @change="updateApplicantStatus(localStatus)"
            :class="[getStatusColor(localStatus), 'px-3 py-1 rounded-full text-sm bg-opacity-10']"
        >
          <option :value="JobApplicationStatus.Pending">New</option>
          <option :value="JobApplicationStatus.Reviewing">Reviewing</option>
          <option :value="JobApplicationStatus.Interviewing">Interviewing</option>
          <option :value="JobApplicationStatus.Rejected">Rejected</option>
          <option :value="JobApplicationStatus.Hired">Hired</option>
        </select>
      </div>
    </div>

    <div v-if="resume?.skills" class="mb-4">
      <div class="flex flex-wrap gap-2">
        <span
            v-for="skill in resume?.skills"
            :key="skill"
            class="bg-gray-700 px-3 py-1 rounded-full text-sm"
        >
          {{ skill }}
        </span>
      </div>
    </div>

    <div v-if="resultTests">
      <TestsResult :tests="resultTests" />
    </div>

    <div class="flex justify-between items-center mt-4 text-sm">
      <span class="text-gray-400">
        Applied {{ new Date(applicant.appliedAt).toLocaleDateString() }}
      </span>
      <div class="flex gap-2">
        <button
            class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
            @click="$router.push(`/all-resumes/resume/${resumeId}`)"
        >
          View Profile
        </button>
      </div>
    </div>

    <hr class="my-4 border-gray-700" />

    <Chat
        :chatId="`chat_${props.applicant.userId}_${props.applicant.id}_${currentUserId}`"
        :currentUserId="currentUserId"
    />

  </div>
</template>
