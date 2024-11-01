import { defineStore } from 'pinia';
import { db, storage } from '../firebase/config';
import { collection, getDocs, doc, getDoc, addDoc, query, where, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { vueQuestions } from '../data/test-questions/vue-questions';
import { nodeQuestions } from '../data/test-questions/node-questions';
import { reactQuestions } from '../data/test-questions/react-questions';
import { laravelQuestions } from '../data/test-questions/laravel-questions';
import { javascriptQuestions } from '../data/test-questions/javascript-questions';

interface TestSubmission {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: number;
    questionsFile: string;
    submittedBy: string;
    submittedAt: string;
    status: 'pending' | 'approved' | 'rejected';
    adminEmail: string;
}

interface Test {
    id: string;
    title: string;
    description: string;
    duration: number;
    difficulty: string;
    questions: Array<{
        id: number;
        text: string;
        options: string[];
        correctAnswer: number;
        explanation?: string;
    }>;
    status: 'active' | 'archived';
    createdAt: string;
    createdBy: string;
}

interface TestAttempt {
    id: string;
    testId: string;
    userId: string;
    score: number;
    totalQuestions: number;
    startedAt: string;
    completedAt: string;
    answers: Array<{
        questionId: number;
        selectedAnswer: number;
        isCorrect: boolean;
        timeSpent: number;
    }>;
}

interface TestDiscussion {
    id: string;
    testId: string;
    title: string;
    content: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
    };
    createdAt: string;
    type: 'discussion' | 'submission';
    status?: 'pending' | 'approved' | 'rejected';
    replies: Array<{
        id: string;
        content: string;
        author: {
            id: string;
            name: string;
            avatar?: string;
        };
        createdAt: string;
    }>;
}

export const useTestStore = defineStore('tests', {
    state: () => ({
        tests: [] as Test[],
        currentTest: null as Test | null,
        testHistory: [] as TestAttempt[],
        discussions: [] as TestDiscussion[],
        loading: false,
        error: null as string | null,
        testCompleted: false,
        averageScore: 0
    }),

    getters: {
        activeTests: (state) => state.tests.filter(test => test.status === 'active'),

        getTestById: (state) => (id: string) => {
            return state.tests.find(test => test.id === id);
        },

        getTestHistory: (state) => (testId: string) => {
            return state.testHistory.filter(attempt => attempt.testId === testId);
        },

        getTestDiscussions: (state) => (testId: string) => {
            return state.discussions.filter(discussion => discussion.testId === testId);
        }
    },

    actions: {
        async fetchTests() {
            this.loading = true;
            try {
                const snapshot = await getDocs(collection(db, 'tests'));
                this.tests = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Test[];
            } catch (error: any) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchTestDiscussions() {
            this.loading = true;
            try {
                const snapshot = await getDocs(collection(db, 'testDiscussions'));
                this.discussions = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as TestDiscussion[];
                return this.discussions;
            } catch (error: any) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchTestSubmissions() {
            this.loading = true;
            try {
                const q = query(
                    collection(db, 'testSubmissions'),
                    where('status', '==', 'pending')
                );
                const snapshot = await getDocs(q);
                return snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as TestSubmission[];
            } catch (error: any) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async submitTest(submission: Omit<TestSubmission, 'id' | 'status' | 'submittedAt'>) {
            this.loading = true;
            try {
                // Upload questions file to storage
                const fileRef = storageRef(storage, `test-submissions/${Date.now()}_${submission.questionsFile.name}`);
                await uploadBytes(fileRef, submission.questionsFile);
                const fileUrl = await getDownloadURL(fileRef);

                // Save submission to Firestore
                const submissionData = {
                    ...submission,
                    questionsFile: fileUrl,
                    status: 'pending',
                    submittedAt: new Date().toISOString()
                };

                await addDoc(collection(db, 'testSubmissions'), submissionData);
            } catch (error: any) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async approveTestSubmission(submissionId: string, questions: any[]) {
            this.loading = true;
            try {
                const submissionRef = doc(db, 'testSubmissions', submissionId);
                const submissionDoc = await getDoc(submissionRef);

                if (!submissionDoc.exists()) {
                    throw new Error('Submission not found');
                }

                const submission = submissionDoc.data() as TestSubmission;

                // Create new test
                const testData = {
                    title: submission.title,
                    description: submission.description,
                    category: submission.category,
                    difficulty: submission.difficulty,
                    duration: submission.duration,
                    questions,
                    status: 'active',
                    createdAt: new Date().toISOString(),
                    createdBy: submission.submittedBy
                };

                await addDoc(collection(db, 'tests'), testData);

                // Update submission status
                await updateDoc(submissionRef, { status: 'approved' });
            } catch (error: any) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async rejectTestSubmission(submissionId: string) {
            this.loading = true;
            try {
                const submissionRef = doc(db, 'testSubmissions', submissionId);
                await updateDoc(submissionRef, { status: 'rejected' });
            } catch (error: any) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        canTakeTest(testId: string): boolean {
            const attempts = this.testHistory.filter(attempt => attempt.testId === testId);
            if (attempts.length === 0) return true;

            const lastAttempt = attempts.reduce((latest, current) => {
                return new Date(current.completedAt) > new Date(latest.completedAt) ? current : latest;
            }, attempts[0]);

            const lastAttemptDate = new Date(lastAttempt.completedAt);
            const now = new Date();
            const daysSinceLastAttempt = Math.floor(
                (now.getTime() - lastAttemptDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            return daysSinceLastAttempt >= 7;
        },

        getDaysUntilAvailable(testId: string): number {
            const attempts = this.testHistory.filter(attempt => attempt.testId === testId);
            if (attempts.length === 0) return 0;

            const lastAttempt = attempts.reduce((latest, current) => {
                return new Date(current.completedAt) > new Date(latest.completedAt) ? current : latest;
            }, attempts[0]);

            const lastAttemptDate = new Date(lastAttempt.completedAt);
            const now = new Date();
            const daysSinceLastAttempt = Math.floor(
                (now.getTime() - lastAttemptDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            return Math.max(0, 7 - daysSinceLastAttempt);
        },

        async startTest(testId: string) {
            if (!this.canTakeTest(testId)) return false;

            const test = this.tests.find(t => t.id === testId);
            if (!test) return false;

            // Randomize questions order
            const randomizedQuestions = [...test.questions]
                .sort(() => Math.random() - 0.5)
                .slice(0, 10); // Limit to 10 questions

            this.currentTest = {
                ...test,
                questions: randomizedQuestions
            };

            this.testCompleted = false;
            return true;
        },

        async loadTestHistory() {
            this.loading = true;
            try {
                const snapshot = await getDocs(collection(db, 'testAttempts'));
                this.testHistory = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as TestAttempt[];

                // Calculate average score
                if (this.testHistory.length > 0) {
                    const totalScore = this.testHistory.reduce((sum, attempt) =>
                        sum + (attempt.score / attempt.totalQuestions * 100), 0);
                    this.averageScore = Math.round(totalScore / this.testHistory.length);
                }
            } catch (error: any) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async saveTestResults(results: {
            score: number;
            totalQuestions: number;
            testId: string;
        }) {
            if (!this.currentTest) return;

            this.loading = true;
            try {
                const testAttempt = {
                    testId: results.testId,
                    score: results.score,
                    totalQuestions: results.totalQuestions,
                    startedAt: new Date().toISOString(),
                    completedAt: new Date().toISOString()
                };

                await addDoc(collection(db, 'testAttempts'), testAttempt);
                this.testCompleted = true;
            } catch (error: any) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
});