import { defineStore } from 'pinia';
import { db, storage } from '../firebase/config';
import { collection, getDocs, doc, getDoc, addDoc, query, where, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, getStorage, ref, deleteObject } from 'firebase/storage';
// import { vueQuestions } from '../data/test-questions/vue-questions';
// import { nodeQuestions } from '../data/test-questions/node-questions';
// import { reactQuestions } from '../data/test-questions/react-questions';
// import { laravelQuestions } from '../data/test-questions/laravel-questions';
// import { javascriptQuestions } from '../data/test-questions/javascript-questions';
import { useAuthStore } from './auth';
import Swal from 'sweetalert2';
import {
    Test,
    TestAttempt,
    TestDiscussion,
    TestSubmission,
    TestAnswer,
    TestAttemptDetails
} from '../types/tests';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();

export const useTestStore = defineStore('tests', {
    state: () => ({
        tests: [] as Test[],
        currentTest: null as Test | null,
        testHistory: [] as TestAttempt[],
        testHistoryCompany: [] as TestAttempt[],
        discussions: [] as TestDiscussion[],
        loading: false,
        error: null as string | null,
        testCompleted: false,
        averageScore: 0,
        testResults: [] as TestAttempt[],
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
        },

        async getTestAttempt(id: string): Promise<TestAttemptDetails | null> {
            try {
                const docRef = doc(db, 'testAttempts', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    return {
                        id: docSnap.id,
                        ...docSnap.data()
                    } as TestAttemptDetails;
                }
                return null;
            } catch (error) {
                console.error('Error fetching test attempt:', error);
                return null;
            }
        },
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

        async submitTest(submission: Omit<TestSubmission, 'id' | 'status' | 'submittedAt' | string>) {
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

                console.log("authStore.user", authStore.user)
                if(authStore.user) {
                    await addDoc(collection(db, 'testSubmissions'), submissionData);
                } else {
                    this.testResults.push(submissionData);
                    console.log('Test results:', this.testResults);
                }
            } catch (error: any) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async approveTestSubmission(submissionId: string, submissionData: any) {
            this.loading = true;
            try {
                const submissionRef = doc(db, 'testSubmissions', submissionId);
                const submissionDoc = await getDoc(submissionRef);

                if (!submissionDoc.exists()) {
                    throw new Error('Submission not found');
                }

                const submission = submissionDoc.data() as TestSubmission;

                // Create new test with ID
                const testData = {
                    id: submissionData.id,
                    title: submission.title,
                    description: submission.description,
                    category: submission.category,
                    difficulty: submission.difficulty,
                    duration: submission.duration,
                    questions: submissionData.questions,
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

        async fetchTestById(id: string) {
            this.loading = true;
            try {
                const docRef = doc(db, 'tests', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    this.currentTest = {
                        id: docSnap.id,
                        ...docSnap.data()
                    };
                    return this.currentTest;
                } else {
                    throw new Error('Test not found');
                }
            } catch (error: any) {
                this.error = error.message;
                throw error; // Пробрасываем ошибку дальше, чтобы её можно было обработать на уровне вызова
            } finally {
                this.loading = false;
            }
        },

        async startTest(testId: string) {
            if (!this.canTakeTest(testId)) return false;

            const test = this.tests.find(t => t.id === testId) || this.currentTest;
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

        calculateScore(result: { answers: TestAnswer[] }): number {
            if (!result || !result.answers) return 0;

            const totalQuestions = result.answers.length;
            const correctAnswers = result.answers.filter(answer => answer.isCorrect).length;

            return totalQuestions > 0
                ? Math.round((correctAnswers / totalQuestions) * 100)
                : 0;
        },

        async loadTestHistory() {
            const authStore = useAuthStore();
            if (!authStore.user) {
                console.warn('User is not authenticated');
                return; // Выходим из функции, если пользователь не авторизован
            }

            this.loading = true;

            try {
                // Получаем данные из коллекции тестов
                const snapshot = await getDocs(collection(db, 'testAttempts'));

                // Преобразуем документы в массив объектов тестов
                const allTestsHistory = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        score: this.calculateScore(data)
                    } as TestAttempt;
                });

                // Фильтруем результаты тестов для текущего пользователя
                this.testHistory = allTestsHistory.filter(attempt => attempt.userId === authStore.user?.uid);
                this.testHistoryCompany = allTestsHistory;

                // Рассчитываем средний результат, если есть тесты
                if (this.testHistory.length > 0) {
                    const totalScorePercentage = this.testHistory.reduce((sum, attempt) => sum + (attempt.score ?? 0), 0);
                    this.averageScore = Math.round(totalScorePercentage / this.testHistory.length);
                } else {
                    this.averageScore = 0;
                }

                if (this.testHistoryCompany.length > 0) {
                    const totalScorePercentage = this.testHistoryCompany.reduce((sum, attempt) => sum + (attempt.score ?? 0), 0);
                    this.averageScore = Math.round(totalScorePercentage / this.testHistoryCompany.length);
                } else {
                    this.averageScore = 0;
                }

                console.log('Average score:', this.averageScore);
            } catch (error: any) {
                this.error = 'An error occurred while loading test history. Please try again later.';
                console.error('Error fetching test attempts:', error);
            } finally {
                this.loading = false;
            }
        },

        async saveTestResults(results: {
            score: number;
            totalQuestions: number;
            testId: string;
            answers: TestAnswer[],
            userId: string,
            videoUrl: string | null,
            jobId: string
        }) {
            if (!this.currentTest) return;

            this.loading = true;
            try {
                const testScore = this.calculateScore(results);
                console.log('Test score:', testScore)

                const testAttempt = {
                    testId: results.testId,
                    score: testScore,
                    totalQuestions: results.totalQuestions,
                    startedAt: new Date().toISOString(),
                    completedAt: new Date().toISOString(),
                    answers: results.answers,
                    userId: results.userId,
                    videoUrl: results.videoUrl,
                    jobId: results.jobId
                };

                console.log('...Saving test attempt:', testAttempt)

                if(authStore && authStore?.user) {
                    console.log('authStore.user', authStore?.user)
                    await addDoc(collection(db, 'testAttempts'), testAttempt);
                } else {
                    this.testResults = [];
                    this.testResults.push(testAttempt);
                    console.log('Test results:', this.testResults);
                }
                this.testCompleted = true;
            } catch (error: any) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteTest(testId: string) {
            try {
                // Reference to the Firestore document
                const docRef = doc(db, 'testAttempts', testId);

                // Fetch the document to check conditions
                const docSnapshot = await getDoc(docRef);
                if (docSnapshot.exists()) {
                    const testData = docSnapshot.data();

                    // Определение completedAt в зависимости от типа данных
                    let completedAt;
                    if (testData.completedAt instanceof Date) {
                        completedAt = testData.completedAt;
                    } else if (testData.completedAt?.toDate) {
                        completedAt = testData.completedAt.toDate(); // Если это Firestore Timestamp
                    } else if (typeof testData.completedAt === 'string') {
                        completedAt = new Date(testData.completedAt); // Если это строка
                    } else {
                        throw new Error('Unknown completedAt format');
                    }

                    // Проверяем, прошло ли 7 дней с момента завершения теста
                    const currentDate = new Date();
                    const sevenDaysLater = new Date(completedAt);
                    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

                    if (currentDate < sevenDaysLater) {
                        Swal.fire({
                            icon: 'info',
                            title: 'Cannot Delete Test Yet',
                            text: 'You can delete this test only 7 days after its completion. Please try again later.',
                            confirmButtonText: 'OK'
                        });
                        return;
                    }

                    // Если прошло 7 дней, продолжаем с удалением
                    const videoUrl = testData.videoUrl;

                    // Если есть videoUrl, удаляем файл из Firebase Storage
                    if (videoUrl) {
                        const storage = getStorage();
                        const videoRef = ref(storage, videoUrl);

                        try {
                            await deleteObject(videoRef);
                            console.log('Video successfully deleted from Firebase Storage.');
                        } catch (storageError) {
                            console.error('Error deleting video from Firebase Storage:', storageError);
                            throw storageError;
                        }
                    }

                    // Удаляем документ из Firestore
                    await deleteDoc(docRef);
                    console.log('Test document successfully deleted.');

                    // Показываем сообщение об успешном удалении пользователю
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'The test and related data have been successfully deleted.',
                        confirmButtonText: 'OK'
                    });

                } else {
                    // Если документ не найден
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No document found with the specified test ID.',
                        confirmButtonText: 'OK'
                    });
                    console.log('No document found with the specified testId.');
                }
            } catch (error: any) {
                console.error('Error deleting test:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Deletion Failed',
                    text: 'An error occurred while trying to delete the test. Please try again later.',
                    confirmButtonText: 'OK'
                });
            }
        },

        async getTestAttemptUserFromJob(idUser: string, idJob: string) {
            try {
                const snapshot = await getDocs(collection(db, 'testAttempts'));
                const allTestsHistory = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        score: this.calculateScore(data)
                    } as TestAttempt;
                });

                const testHistory = allTestsHistory.filter(attempt => attempt.userId === idUser && attempt.jobId === idJob);
                return testHistory;
            } catch (error: any) {
                this.error = 'An error occurred while loading test history. Please try again later.';
                console.error('Error fetching test attempts:', error);
            }
        }

    }
});