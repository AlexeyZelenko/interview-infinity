import { defineStore } from 'pinia';
import { db } from '../firebase/config';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

interface Job {
    id: string;
    title: string;
    company: string;
    companyId: string;
    location: string;
    type: string;
    salary: {
        min: number;
        max: number;
        currency: string;
        period: string;
    };
    description: string;
    requirements: string[];
    responsibilities: string[];
    benefits: string[];
    skills: string[];
    postedAt: string;
    status: 'active' | 'draft' | 'closed';
    remote: boolean;
    experience?: string;
}

export const useJobsStore = defineStore('jobs', {
    state: () => ({
        jobs: [] as Job[],
        companyJobs: [] as Job[],
        loading: false,
        error: null as string | null,
        totalApplicants: 0
    }),

    getters: {
        activeJobs: (state) => state.jobs.filter(job => job.status === 'active')
    },

    actions: {
        async fetchAllJobs() {
            try {
                this.loading = true;
                this.error = null;

                const snapshot = await getDocs(collection(db, 'jobs'));
                this.jobs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Job[];
            } catch (error: any) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async getJobById(id: string) {
            try {
                const docRef = doc(db, 'jobs', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    return {
                        id: docSnap.id,
                        ...docSnap.data()
                    } as Job;
                }
                return null;
            } catch (error: any) {
                this.error = error.message;
                throw error;
            }
        },

        async createJob(jobData: Partial<Job>) {
            try {
                this.loading = true;
                this.error = null;

                const docRef = await addDoc(collection(db, 'jobs'), {
                    ...jobData,
                    status: 'active',
                    postedAt: new Date().toISOString()
                });

                const newJob = {
                    id: docRef.id,
                    ...jobData,
                    status: 'active',
                    postedAt: new Date().toISOString()
                } as Job;

                this.jobs.push(newJob);
                return newJob;
            } catch (error: any) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateJob(id: string, jobData: Partial<Job>) {
            try {
                this.loading = true;
                this.error = null;

                await updateDoc(doc(db, 'jobs', id), {
                    ...jobData,
                    updatedAt: new Date().toISOString()
                });

                const index = this.jobs.findIndex(job => job.id === id);
                if (index !== -1) {
                    this.jobs[index] = { ...this.jobs[index], ...jobData };
                }
            } catch (error: any) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateJobStatus(id: string, status: Job['status']) {
            try {
                this.loading = true;
                this.error = null;

                await updateDoc(doc(db, 'jobs', id), {
                    status,
                    updatedAt: new Date().toISOString()
                });

                const index = this.jobs.findIndex(job => job.id === id);
                if (index !== -1) {
                    this.jobs[index].status = status;
                }
            } catch (error: any) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteJob(id: string) {
            try {
                this.loading = true;
                this.error = null;

                await deleteDoc(doc(db, 'jobs', id));
                this.jobs = this.jobs.filter(job => job.id !== id);
            } catch (error: any) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
});