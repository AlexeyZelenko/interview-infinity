import { defineStore } from 'pinia';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { useAuthStore } from './auth';

interface JobApplication {
    id: string;
    jobId: string;
    userId: string;
    companyId: string;
    appliedAt: string;
    status: 'pending' | 'reviewing' | 'interviewing' | 'rejected' | 'accepted';
    applicantName: string;
    applicantEmail: string;
    coverLetter?: string;
    resume?: string;
}

export const useApplicationsStore = defineStore('applications', {
    state: () => ({
        applications: [] as JobApplication[],
        loading: false,
        error: null as string | null
    }),

    getters: {
        hasApplied: (state) => (jobId: string) => {
            const authStore = useAuthStore();
            return state.applications.some(
                app => app.jobId === jobId && app.userId === authStore.user?.uid
            );
        },

        getApplicationCount: (state) => (jobId: string) => {
            return state.applications.filter(app => app.jobId === jobId).length;
        },

        getJobApplications: (state) => (jobId: string) => {
            return state.applications.filter(app => app.jobId === jobId);
        }
    },

    actions: {
        async fetchApplications() {
            const authStore = useAuthStore();
            if (!authStore.user) return;

            this.loading = true;
            try {
                const q = query(
                    collection(db, 'applications'),
                    where(authStore.isDeveloper ? 'userId' : 'companyId', '==', authStore.user.uid)
                );

                const snapshot = await getDocs(q);
                this.applications = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as JobApplication[];
            } catch (error: any) {
                this.error = error.message;
                console.error('Error fetching applications:', error);
            } finally {
                this.loading = false;
            }
        },

        async applyForJob(jobData: {
            jobId: string;
            companyId: string;
            coverLetter?: string;
            resume?: string;
        }) {
            const authStore = useAuthStore();
            if (!authStore.user) throw new Error('User not authenticated');

            this.loading = true;
            try {
                const application = {
                    jobId: jobData.jobId,
                    companyId: jobData.companyId,
                    userId: authStore.user.uid,
                    appliedAt: new Date().toISOString(),
                    status: 'pending',
                    applicantName: authStore.user.displayName || 'Anonymous',
                    applicantEmail: authStore.user.email || '',
                    coverLetter: jobData.coverLetter,
                    resume: jobData.resume
                };

                const docRef = await addDoc(collection(db, 'applications'), application);
                this.applications.push({ id: docRef.id, ...application });
            } catch (error: any) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateApplicationStatus(applicationId: string, status: JobApplication['status']) {
            this.loading = true;
            try {
                await updateDoc(doc(db, 'applications', applicationId), { status });
                const index = this.applications.findIndex(app => app.id === applicationId);
                if (index !== -1) {
                    this.applications[index].status = status;
                }
            } catch (error: any) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
});