<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const resumeId = route.params.id as string;

const resume = ref(null);
const loading = ref(false);
const error = ref('');

const fetchResume = async () => {
  try {
    loading.value = true;
    const docRef = doc(db, 'resumes', resumeId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) throw new Error("Resume not found");
    resume.value = { id: docSnap.id, ...docSnap.data() };
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const toggleActiveStatus = async () => {
  try {
    if (!resume.value) return;
    await updateDoc(doc(db, 'resumes', resumeId), {
      isActive: !resume.value.isActive,
      updatedAt: new Date().toISOString(),
    });
    resume.value.isActive = !resume.value.isActive;
  } catch (err: any) {
    error.value = err.message;
  }
};

const deleteResume = async () => {
  try {
    await deleteDoc(doc(db, 'resumes', resumeId));
    router.push('/resumes');
  } catch (err: any) {
    error.value = err.message;
  }
};

onMounted(fetchResume);
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-if="error" class="text-red-500">{{ error }}</div>

  <div v-if="resume">
    <h1>{{ resume.title }}</h1>
    <p>Status: {{ resume.isActive ? 'Active' : 'Inactive' }}</p>

    <button @click="toggleActiveStatus">
      {{ resume.isActive ? 'Set Inactive' : 'Set Active' }}
    </button>

    <button @click="deleteResume" class="btn-danger">Delete Resume</button>

    <!-- Add Edit Form Here -->
  </div>
</template>
