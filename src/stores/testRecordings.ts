import { defineStore } from 'pinia';
import { storage, db } from '../firebase/config';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { useAuthStore } from './auth';

interface TestRecording {
    id: string;
    testId: string;
    userId: string;
    recordingUrl: string;
    thumbnailUrl?: string;
    duration: number;
    createdAt: string;
    fileSize: number;
    status: 'processing' | 'ready' | 'error';
}

export const useTestRecordingsStore = defineStore('testRecordings', {
    state: () => ({
        recordings: [] as TestRecording[],
        loading: false,
        error: null as string | null,
        currentRecording: null as Blob | null,
        isRecording: false,
        mediaRecorder: null as MediaRecorder | null,
        recordedChunks: [] as BlobPart[],
        currentFileSize: 0
    }),

    getters: {
        getTestRecordings: (state) => (testId: string) => {
            return state.recordings
                .filter(recording => recording.testId === testId)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    },

    actions: {
        async saveRecording(testId: string, recordingBlob: Blob, thumbnail?: string): Promise<string> {
            const authStore = useAuthStore();
            if (!authStore.user) throw new Error('User not authenticated');

            this.loading = true;
            try {
                const timestamp = Date.now();
                const filename = `test-recordings/${authStore.user.uid}/${testId}/${timestamp}.webm`;

                // Загрузка видео в Firebase Storage
                const videoRef = storageRef(storage, filename);
                const uploadTask = await uploadBytes(videoRef, recordingBlob, {
                    contentType: 'video/webm',
                    customMetadata: {
                        testId,
                        userId: authStore.user.uid,
                        timestamp: timestamp.toString()
                    }
                });

                const recordingUrl = await getDownloadURL(uploadTask.ref);

                // Загрузка миниатюры, если она есть
                let thumbnailUrl = '';
                if (thumbnail) {
                    const thumbnailRef = storageRef(storage, `test-recordings/${authStore.user.uid}/${testId}/${timestamp}_thumb.jpg`);
                    const thumbnailBlob = await (await fetch(thumbnail)).blob();
                    await uploadBytes(thumbnailRef, thumbnailBlob, { contentType: 'image/jpeg' });
                    thumbnailUrl = await getDownloadURL(thumbnailRef);
                }

                // Запись метаданных в Firestore
                const recordingData = {
                    testId,
                    userId: authStore.user.uid,
                    recordingUrl,
                    thumbnailUrl,
                    duration: 0,
                    createdAt: new Date().toISOString(),
                    fileSize: recordingBlob.size,
                    status: 'ready' as const
                };

                const docRef = await addDoc(collection(db, 'testRecordings'), recordingData);
                this.recordings.push({ id: docRef.id, ...recordingData });

                return docRef.id;
            } catch (error: any) {
                console.error('Error saving recording:', error);
                this.error = error.message || 'Failed to save recording';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchRecordings() {
            const authStore = useAuthStore();
            if (!authStore.user) return;

            this.loading = true;
            try {
                const q = query(collection(db, 'testRecordings'), where('userId', '==', authStore.user.uid));
                const snapshot = await getDocs(q);

                this.recordings = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as TestRecording[];
            } catch (error: any) {
                console.error('Error fetching recordings:', error);
                this.error = error.message || 'Failed to fetch recordings';
            } finally {
                this.loading = false;
            }
        },

        async deleteRecording(recordingId: string) {
            const recording = this.recordings.find(r => r.id === recordingId);
            if (!recording) return;

            try {
                // Удаление видео из Firebase Storage
                const videoRef = storageRef(storage, recording.recordingUrl);
                await deleteObject(videoRef);

                // Удаление миниатюры, если она существует
                if (recording.thumbnailUrl) {
                    const thumbnailRef = storageRef(storage, recording.thumbnailUrl);
                    await deleteObject(thumbnailRef);
                }

                // Удаление метаданных из Firestore
                await deleteDoc(doc(db, 'testRecordings', recordingId));

                // Обновление локального состояния
                this.recordings = this.recordings.filter(r => r.id !== recordingId);
            } catch (error: any) {
                console.error('Error deleting recording:', error);
                this.error = error.message || 'Failed to delete recording';
                throw error;
            }
        }
    }
});
