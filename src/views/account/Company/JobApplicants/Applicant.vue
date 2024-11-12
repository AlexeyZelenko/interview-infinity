<script setup lang="ts">
import { defineProps, ref, onMounted } from 'vue';
import { Resume } from "@/types/resumes";
import { useResumeStore } from '@/stores/resume.ts';
import { useApplicationsStore } from '@/stores/applications.ts';
import { useTestStore } from '@/stores/tests.ts';
import { JobApplication, JobApplicationStatus } from '@/types/application.ts';
import MatchScore from './MatchScore.vue';
import TestsResult from './TestsResult.vue';

// Properly define props with TypeScript
const props = defineProps<{
  applicant: JobApplication;
}>();

// Use resume store
const useResume = useResumeStore();
const resume = ref<Resume | null>(null);
const resumeId = ref<string | null | undefined>(null);
const resultTests = ref<any | null>(null);

const UseJobApplication = useApplicationsStore();
const UseTest = useTestStore();

// Function to update applicant status
const updateApplicantStatus = async (newStatus: JobApplicationStatus) => {
  try {
    await UseJobApplication.updateApplicationStatus(props.applicant.id, newStatus);
    await UseJobApplication.fetchApplications();
  } catch (err: any) {
    console.error(err.message);
  }
};

// Get color classes based on applicant status
const getStatusColor = (status: string) => {
  switch (status) {
    case 'new': return 'bg-blue-500/10 text-blue-400';
    case 'reviewing': return 'bg-yellow-500/10 text-yellow-400';
    case 'interviewing': return 'bg-green-500/10 text-green-400';
    case 'rejected': return 'bg-red-500/10 text-red-400';
    case 'hired': return 'bg-primary-500/10 text-primary-400';
    default: return 'bg-gray-500/10 text-gray-400';
  }
};

// Fetch resume on mounted
onMounted(async () => {
  resumeId.value = props.applicant.resumeId;
  if (resumeId.value) {
    try {
      const resumeData = await useResume.getResumeById(resumeId.value);
      if (resumeData) {
        resume.value = resumeData;
      }
    } catch (error) {
      console.error("Error fetching resume:", error);
    }
  }
});

onMounted(async () => {
  try {
    resultTests.value = await UseTest.getTestAttemptUserFromJob(props.applicant.userId, props.applicant.jobId);
  } catch (err: any) {
    console.error(err.message);
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

      <div v-if="resultTests">
        <MatchScore :tests="resultTests"/>
      </div>

      <div>
        <select
            v-model="applicant.status"
            @change="updateApplicantStatus($event.target.value)"
            :class="[getStatusColor(applicant.status), 'px-3 py-1 rounded-full text-sm bg-opacity-10']"
        >
          <option value="new">New</option>
          <option value="reviewing">Reviewing</option>
          <option value="interviewing">Interviewing</option>
          <option value="rejected">Rejected</option>
          <option value="hired">Hired</option>
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
  </div>
</template>
