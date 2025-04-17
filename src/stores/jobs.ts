import { defineStore } from 'pinia';
import { db } from '../firebase/config';
import { collection, getDocs, doc, getDoc, addDoc, query, where, updateDoc, deleteDoc, orderBy, limit, startAfter } from 'firebase/firestore';
import { useAuthStore } from './auth';

interface Company {
    id: string;
    name: string;
    description: string;
    industry: string;
    size: string;
    location: string;
    website?: string;
    founded?: string;
    logo?: string;
    socialLinks?: {
        linkedin?: string;
        twitter?: string;
        github?: string;
    };
}

interface JobTest {
    id: string;
    testId: string;
    title: string;
    description: string;
    duration: number;
    isRequired: boolean;
}

interface Job {
    id: string;
    title: string;
    company: string;
    companyId: string;
    companyInfo?: Company;
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
    applicants: number;
    tests?: JobTest[];
}

export const useJobsStore = defineStore('jobs', {
    state: () => ({
        jobs: [] as Job[],
        companyJobs: [] as Job[],
        loading: false,
        error: null as string | null,
        totalApplicants: 0,
        lastFetchTime: null as number | null,
        cacheDuration: 5 * 60 * 1000, // 5 minutes cache
        lastVisible: null as any,
        hasMore: true,
        pageSize: 12 // Increased page size
    }),

    actions: {
        async fetchAllJobs(loadMore = false) {
            try {
                if (!loadMore) {
                    // Reset state for initial load
                    this.jobs = [];
                    this.lastVisible = null;
                    this.hasMore = true;
                }

                // If no more data to load, return
                if (!this.hasMore && loadMore) {
                    return;
                }

                this.loading = true;
                this.error = null;

                // Build query
                let q = query(
                    collection(db, 'jobs'),
                    orderBy('postedAt', 'desc'),
                    limit(this.pageSize)
                );

                // Add startAfter for pagination
                if (this.lastVisible) {
                    q = query(q, startAfter(this.lastVisible));
                }

                // Fetch jobs
                const snapshot = await getDocs(q);
                const jobsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Job[];

                // Update lastVisible and hasMore
                this.lastVisible = snapshot.docs[snapshot.docs.length - 1];
                this.hasMore = snapshot.docs.length === this.pageSize;

                // Get all job IDs
                const jobIds = jobsData.map(job => job.id);

                // Fetch all tests in one query
                if (jobIds.length > 0) {
                    const testsQuery = query(
                        collection(db, 'jobTests'),
                        where('jobId', 'in', jobIds)
                    );
                    const testsSnapshot = await getDocs(testsQuery);
                    
                    // Group tests by jobId
                    const testsByJobId = testsSnapshot.docs.reduce((acc, testDoc) => {
                        const testData = testDoc.data();
                        if (!acc[testData.jobId]) {
                            acc[testData.jobId] = [];
                        }
                        acc[testData.jobId].push({
                            id: testDoc.id,
                            testId: testData.testId,
                            isRequired: testData.isRequired
                        });
                        return acc;
                    }, {} as Record<string, any[]>);

                    // Fetch test details in parallel
                    const testIds = [...new Set(testsSnapshot.docs.map(doc => doc.data().testId))];
                    const testDetailsPromises = testIds.map(testId => getDoc(doc(db, 'tests', testId)));
                    const testDetails = await Promise.all(testDetailsPromises);
                    const testDetailsMap = testDetails.reduce((acc, doc) => {
                        if (doc.exists()) {
                            acc[doc.id] = doc.data();
                        }
                        return acc;
                    }, {} as Record<string, any>);

                    // Combine test data
                    for (const job of jobsData) {
                        if (testsByJobId[job.id]) {
                            job.tests = testsByJobId[job.id].map(test => ({
                                ...test,
                                ...testDetailsMap[test.testId]
                            }));
                        }
                    }
                }

                // Append or replace jobs
                if (loadMore) {
                    this.jobs = [...this.jobs, ...jobsData];
                } else {
                    this.jobs = jobsData;
                }

                this.lastFetchTime = Date.now();
            } catch (error: any) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchCompanyJobs() {
            const authStore = useAuthStore();
            if (!authStore.user?.uid) return;

            try {
                this.loading = true;
                this.error = null;

                const q = query(
                    collection(db, 'jobs'),
                    where('companyId', '==', authStore.user.uid)
                );

                const snapshot = await getDocs(q);
                this.companyJobs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Job[];

                // Fetch tests for each company job
                for (const job of this.companyJobs) {
                    if (job.id) {
                        const testsQuery = query(
                            collection(db, 'jobTests'),
                            where('jobId', '==', job.id)
                        );
                        const testsSnapshot = await getDocs(testsQuery);

                        if (!testsSnapshot.empty) {
                            const tests = await Promise.all(
                                testsSnapshot.docs.map(async (testDoc) => {
                                    const testData = testDoc.data();
                                    if (testData.testId) {
                                        const testDetails = await getDoc(doc(db, 'tests', testData.testId));
                                        if (testDetails.exists()) {
                                            return {
                                                id: testDoc.id,
                                                testId: testData.testId,
                                                isRequired: testData.isRequired,
                                                ...testDetails.data()
                                            };
                                        }
                                    }
                                    return null;
                                })
                            );
                            job.tests = tests.filter((test): test is JobTest => test !== null);
                        }
                    }
                }
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
                    const jobData = {
                        id: docSnap.id,
                        ...docSnap.data()
                    } as Job;

                    // Fetch tests for this job
                    if (jobData.id) {
                        const testsQuery = query(
                            collection(db, 'jobTests'),
                            where('jobId', '==', jobData.id)
                        );
                        const testsSnapshot = await getDocs(testsQuery);

                        if (!testsSnapshot.empty) {
                            const tests = await Promise.all(
                                testsSnapshot.docs.map(async (testDoc) => {
                                    const testData = testDoc.data();
                                    if (testData.testId) {
                                        const testDetails = await getDoc(doc(db, 'tests', testData.testId));
                                        if (testDetails.exists()) {
                                            return {
                                                id: testDoc.id,
                                                testId: testData.testId,
                                                isRequired: testData.isRequired,
                                                ...testDetails.data()
                                            };
                                        }
                                    }
                                    return null;
                                })
                            );
                            jobData.tests = tests.filter((test): test is JobTest => test !== null);
                        }
                    }

                    return jobData;
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

                const authStore = useAuthStore();
                if (!authStore.user?.uid) throw new Error('User not authenticated');

                // Get company info
                const companyDoc = await getDoc(doc(db, 'companies', authStore.user.uid));
                const companyInfo = companyDoc.exists() ? companyDoc.data() as Company : null;

                const job = {
                    ...jobData,
                    companyId: authStore.user.uid,
                    company: companyInfo?.name || '',
                    companyInfo: companyInfo || undefined,
                    postedAt: new Date().toISOString(),
                    status: 'active',
                    applicants: 0
                };

                const docRef = await addDoc(collection(db, 'jobs'), job);
                const newJob = { id: docRef.id, ...job } as Job;
                this.jobs.push(newJob);
                this.companyJobs.push(newJob);

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

                const companyIndex = this.companyJobs.findIndex(job => job.id === id);
                if (companyIndex !== -1) {
                    this.companyJobs[companyIndex] = { ...this.companyJobs[companyIndex], ...jobData };
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

                const companyIndex = this.companyJobs.findIndex(job => job.id === id);
                if (companyIndex !== -1) {
                    this.companyJobs[companyIndex].status = status;
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
                this.companyJobs = this.companyJobs.filter(job => job.id !== id);
            } catch (error: any) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateApplicantCount(jobId: string, count: number) {
            try {
                await updateDoc(doc(db, 'jobs', jobId), {
                    applicants: count,
                    updatedAt: new Date().toISOString()
                });

                const index = this.jobs.findIndex(job => job.id === jobId);
                if (index !== -1) {
                    this.jobs[index].applicants = count;
                }

                const companyIndex = this.companyJobs.findIndex(job => job.id === jobId);
                if (companyIndex !== -1) {
                    this.companyJobs[companyIndex].applicants = count;
                }
            } catch (error: any) {
                this.error = error.message;
                throw error;
            }
        }
    }
});