import { defineStore } from 'pinia';
import { db } from '../firebase/config'; // Убедитесь, что это правильный путь к файлу с инициализацией Firebase
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'; // Импорт необходимых модульных функций Firestore
import { useAuthStore } from './auth';
import { Resume } from '@/types/resumes';

export const useResumeStore = defineStore('resume', {
    state: () => ({
        resume: [] as Resume[],
        loading: false,
        error: null as string | null
    }),

    getters: {
        isSaved: (state) => (jobId: string) => {
            return state.resume.some(job => job.id === jobId);
        }
    },

    actions: {
        async fetchResume() {
            const authStore = useAuthStore();
            if (!authStore.user) return;

            this.loading = true;
            try {
                const q = query(
                    collection(db, 'resumes'), // Получаем ссылку на коллекцию "resumes"
                    where('userId', '==', authStore.user.uid)
                );

                const snapshot = await getDocs(q);
                this.resume = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Resume[];
            } catch (error: any) {
                this.error = error.message;
                console.error('Ошибка при получении списка резюме:', error);
            } finally {
                this.loading = false;
            }
        },

        async getResumeById(id: string) {
            this.loading = true;
            try {
                // Создаем ссылку на документ по его ID
                const docRef = doc(db, 'resumes', id); // Правильный способ создать ссылку на документ по ID
                const docSnap = await getDoc(docRef); // Получаем данные документа

                if (docSnap.exists()) {
                    return docSnap.data() as Resume; // Приводим данные к типу Resume и возвращаем их
                } else {
                    console.error('Резюме с таким ID не найдено:', id);
                }
            } catch (error: any) {
                this.error = error.message;
                console.error('Ошибка при получении резюме:', error);
            } finally {
                this.loading = false;
            }
        }
    }
});
