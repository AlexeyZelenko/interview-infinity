import { defineStore } from 'pinia';
import { db } from '../firebase/config';
import { collection, addDoc, deleteDoc, getDocs, query, where, doc } from 'firebase/firestore';
import { useAuthStore } from './auth';

interface SavedJob {
    id: string;
    jobId: string;
    userId: string;
    savedAt: string;
    title: string;
    company: string;
    location: string;
    type: string;
}

export const useSavedJobsStore = defineStore('savedJobs', {
    state: () => ({
        savedJobs: [] as SavedJob[],
        loading: false,
        error: null as string | null
    }),

    getters: {
        isSaved: (state) => (jobId: string) => {
            return state.savedJobs.some(job => job.jobId === jobId);
        }
    },

    actions: {
        async fetchSavedJobs() {
            const authStore = useAuthStore();
            if (!authStore.user) return;

            this.loading = true;
            try {
                const q = query(
                    collection(db, 'savedJobs'),
                    where('userId', '==', authStore.user.uid)
                );

                const snapshot = await getDocs(q);
                this.savedJobs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as SavedJob[];
            } catch (error: any) {
                this.error = error.message;
                console.error('Error fetching saved jobs:', error);
            } finally {
                this.loading = false;
            }
        },

        async saveJob(job: {
            id: string;
            title: string;
            company: string;
            location: string;
            type: string;
        }) {
            const authStore = useAuthStore();
            if (!authStore.user) throw new Error('User not authenticated');

            this.loading = true;
            try {
                // Ensure all required fields are present
                if (!job.title || !job.company || !job.location || !job.type) {
                    throw new Error('Missing required job information');
                }

                const savedJob = {
                    jobId: job.id,
                    userId: authStore.user.uid,
                    savedAt: new Date().toISOString(),
                    title: job.title,
                    company: job.company,
                    location: job.location,
                    type: job.type
                };

                const docRef = await addDoc(collection(db, 'savedJobs'), savedJob);
                this.savedJobs.push({ id: docRef.id, ...savedJob });
            } catch (error: any) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async unsaveJob(jobId: string) {
            const savedJob = this.savedJobs.find(job => job.jobId === jobId);
            if (!savedJob) return;

            this.loading = true;
            try {
                await deleteDoc(doc(db, 'savedJobs', savedJob.id));
                this.savedJobs = this.savedJobs.filter(job => job.jobId !== jobId);
            } catch (error: any) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
});