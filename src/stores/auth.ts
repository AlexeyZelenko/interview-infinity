import { defineStore } from 'pinia';
import { auth, db } from '../firebase/config';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { User, Subscription } from '@/types/auth';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as User | null,
        loading: false,
        error: null as string | null,
        initialized: false
    }),

    getters: {
        isDeveloper: (state) => state.user?.userType === 'developer',
        isCompany: (state) => state.user?.userType === 'company',
        isAdmin: (state) => state.user?.email === 'infinitydevelopinfinity@gmail.com',
        userType: (state) => state.user?.userType,
        isSubscriptionActive: (state) => {
            if (!state.user?.subscription) return false;
            return state.user.subscription.status === 'active' &&
                new Date(state.user.subscription.endDate) > new Date();
        },
        daysLeftInTrial: (state) => {
            if (!state.user?.subscription || state.user.subscription.status !== 'active') return 0;
            const endDate = new Date(state.user.subscription.endDate);
            const today = new Date();
            const diffTime = endDate.getTime() - today.getTime();
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
    },

    actions: {
        async initialize() {
            if (this.initialized) return;

            try {
                this.loading = true;
                auth.onAuthStateChanged(async (firebaseUser) => {
                    if (firebaseUser) {
                        await this.loadUser(firebaseUser.uid);
                    } else {
                        this.user = null;
                    }
                    this.initialized = true;
                    this.loading = false;
                });
            } catch (error: any) {
                this.error = error.message;
                this.loading = false;
            }
        },

        async login(email: string, password: string) {
            try {
                this.loading = true;
                this.error = null;
                const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
                await this.loadUser(firebaseUser.uid);
            } catch (error: any) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async register(email: string, password: string, userType: 'developer' | 'company') {
            try {
                this.loading = true;
                this.error = null;
                const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

                const endDate = new Date();
                endDate.setMonth(endDate.getMonth() + 1);

                const subscription: Subscription = {
                    plan: 'free',
                    status: 'active',
                    startDate: new Date().toISOString(),
                    endDate: endDate.toISOString()
                };

                const userData: User = {
                    uid: firebaseUser.uid,
                    email,
                    userType: email === 'infinitydevelopinfinity@gmail.com' ? 'admin' : userType,
                    createdAt: new Date().toISOString(),
                    subscription
                };

                await setDoc(doc(db, 'users', firebaseUser.uid), userData);
                this.user = userData;
            } catch (error: any) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async logout() {
            try {
                this.loading = true;
                this.error = null;
                await signOut(auth);
                this.user = null;
            } catch (error: any) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async loadUser(uid: string) {
            try {
                const docRef = doc(db, 'users', uid);
                const docSnap = await getDoc(docRef);
                console.log("loadUser", docSnap);

                if (docSnap.exists()) {
                    const userData = docSnap.data() as User;
                    if (!userData.subscription) {
                        userData.subscription = {
                            plan: 'free',
                            status: 'expired',
                            startDate: userData.createdAt,
                            endDate: userData.createdAt
                        };
                    }
                    this.user = userData;
                    await this.checkSubscriptionStatus();
                } else {
                    console.error(`Document with uid ${uid} not found`);
                    throw new Error('User data not found');
                }
            } catch (error: any) {
                this.error = error.message;
                throw error;
            }
        },

        async activateFreeTrial() {
            if (!this.user) throw new Error('No user logged in');

            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);

            const subscription: Subscription = {
                plan: 'free',
                status: 'active',
                startDate: new Date().toISOString(),
                endDate: endDate.toISOString()
            };

            await updateDoc(doc(db, 'users', this.user.uid), { subscription });
            this.user.subscription = subscription;
        },

        async checkSubscriptionStatus() {
            if (!this.user?.subscription) return;

            const now = new Date();
            const endDate = new Date(this.user.subscription.endDate);

            if (endDate < now && this.user.subscription.status === 'active') {
                const subscription: Subscription = {
                    ...this.user.subscription,
                    status: 'expired'
                };

                await updateDoc(doc(db, 'users', this.user.uid), { subscription });
                this.user.subscription = subscription;
            }
        }
    }
});