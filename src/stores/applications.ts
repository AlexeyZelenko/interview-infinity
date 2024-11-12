import { defineStore } from 'pinia';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { useAuthStore } from './auth';
import { JobApplication } from '@/types/application.ts';

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
            resumeId: string;
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
                    resume: jobData.resume,
                    resumeId: jobData.resumeId
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
        },

        async duplicationPassingTest(testId: string, jobId: string): Promise<boolean> {
            const authStore = useAuthStore();
            if (!authStore.user) {
                console.error('User not authenticated');
                throw new Error('User not authenticated');
            }

            const userId = authStore.user.uid;
            try {
                // Create a base query to the collection 'jobTests' with conditions 'jobId'
                const attemptsCollectionRef = collection(db, 'jobTests');
                const q = query(
                    attemptsCollectionRef,
                    where('jobId', '==', jobId)
                );
                const querySnapshot = await getDocs(q);
                if (querySnapshot.empty) {
                    return false; // No records found for the jobId, hence no duplication
                }
                const jobTests = querySnapshot.docs.map(doc => {
                    return {
                        id: doc.id,       // ID самого документа
                        ...doc.data()     // Все данные документа
                    };
                });
                // Iterate over jobTests to check if a matching testId exists
                for (const jobTest of jobTests) {
                    if (jobTest.id === testId) {
                        const testAttemptsCollectionRef = collection(db, 'testAttempts');
                        const testAttemptsQuery = query(
                            testAttemptsCollectionRef,
                            where('userId', '==', userId),
                            where('testId', '==', jobTest.testId)
                        );
                        const testAttemptsSnapshot = await getDocs(testAttemptsQuery);
                        const testAttempts = testAttemptsSnapshot.docs.map(doc => { return { id: doc.id, ...doc.data() }; });
                        if(testAttempts.length === 0) {
                            console.log('No test attempts found for testId:', testId, 'jobId:', jobId);
                            return false; // No test attempts found
                        }
                        return true; // Test attempt already exists
                    }
                }
                return false;

            } catch (error) {
                console.error('Error occurred during duplicationPassingTest function:', error);
                throw error;
            }
        },
    }
});