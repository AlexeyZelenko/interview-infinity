<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuthStore } from '../../../stores/auth';
import { useRouter } from 'vue-router';

interface Resume {
  id: string;
  title: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const authStore = useAuthStore();
const router = useRouter();
const resumes = ref<Resume[]>([]);
const loading = ref(false);
const error = ref('');

const fetchResumes = async () => {
  try {
    loading.value = true;
    const userId = authStore.user?.uid;
    if (!userId) throw new Error("User not authenticated");

    const q = query(collection(db, 'resumes'), where('userId', '==', userId));
    const snapshot = await getDocs(q);

    resumes.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Resume[];
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchResumes);
</script>

<template>
  <div>
    <h1>My Resumes</h1>
    <button @click="router.push('/resumes/create')" class="btn-primary">Create New Resume</button>

    <div v-if="loading">Loading...</div>
    <div v-if="error" class="text-red-500">{{ error }}</div>

    <ul v-if="resumes.length">
      <li v-for="resume in resumes" :key="resume.id">
        <router-link :to="`/resumes/${resume.id}`">{{ resume.title }}</router-link>
        <span :class="{ 'text-green-500': resume.isActive, 'text-gray-500': !resume.isActive }">
          {{ resume.isActive ? 'Active' : 'Inactive' }}
        </span>
      </li>
    </ul>
  </div>
</template>
