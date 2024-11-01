<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

const authStore = useAuthStore()
const profile = ref<any>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    if (authStore.user) {
      const docRef = doc(db, 'users', authStore.user.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        profile.value = docSnap.data()
      }
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">Profile</h1>
    
    <div v-if="loading" class="text-center">
      <p>Loading profile...</p>
    </div>
    
    <div v-else-if="profile" class="bg-gray-800 rounded-lg p-6">
      <div class="grid gap-6">
        <div>
          <h2 class="text-xl font-semibold mb-2">Account Information</h2>
          <p class="text-gray-300">Email: {{ profile.email }}</p>
          <p class="text-gray-300">Account Type: {{ profile.userType }}</p>
        </div>
        
        <div v-if="profile.userType === 'developer'">
          <h2 class="text-xl font-semibold mb-2">Developer Profile</h2>
          <button class="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">
            Complete Your Profile
          </button>
        </div>
        
        <div v-else-if="profile.userType === 'company'">
          <h2 class="text-xl font-semibold mb-2">Company Profile</h2>
          <button class="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">
            Complete Company Profile
          </button>
        </div>
      </div>
    </div>
  </div>
</template>