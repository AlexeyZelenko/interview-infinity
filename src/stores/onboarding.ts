import { defineStore } from 'pinia';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuthStore } from './auth';

export interface OnboardingState {
    completed: boolean;
    dismissed: boolean;
    currentStep: number;
    completedSteps: number[];
}

export const useOnboardingStore = defineStore('onboarding', {
    state: (): OnboardingState => ({
        completed: false,
        dismissed: false,
        currentStep: 0,
        completedSteps: [],
    }),

    getters: {
        isVisible(state): boolean {
            return !state.completed && !state.dismissed;
        },
        totalSteps(): number {
            return 3;
        },
        progress(state): number {
            return Math.round((state.completedSteps.length / 3) * 100);
        },
    },

    actions: {
        async load() {
            const authStore = useAuthStore();
            if (!authStore.user) return;

            try {
                const docRef = doc(db, 'onboarding', authStore.user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data() as OnboardingState;
                    this.completed = data.completed;
                    this.dismissed = data.dismissed;
                    this.currentStep = data.currentStep;
                    this.completedSteps = data.completedSteps || [];
                }
            } catch (e) {
                console.error('Failed to load onboarding state:', e);
            }
        },

        async save() {
            const authStore = useAuthStore();
            if (!authStore.user) return;

            try {
                await setDoc(doc(db, 'onboarding', authStore.user.uid), {
                    completed: this.completed,
                    dismissed: this.dismissed,
                    currentStep: this.currentStep,
                    completedSteps: this.completedSteps,
                });
            } catch (e) {
                console.error('Failed to save onboarding state:', e);
            }
        },

        async completeStep(step: number) {
            if (!this.completedSteps.includes(step)) {
                this.completedSteps.push(step);
            }
            if (this.completedSteps.length >= 3) {
                this.completed = true;
            } else {
                this.currentStep = step + 1;
            }
            await this.save();
        },

        setStep(step: number) {
            this.currentStep = step;
        },

        async dismiss() {
            this.dismissed = true;
            await this.save();
        },

        async reset() {
            this.completed = false;
            this.dismissed = false;
            this.currentStep = 0;
            this.completedSteps = [];
            await this.save();
        },
    },
});
