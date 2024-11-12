import { defineStore } from 'pinia';
// import { getCodeReview, getHint } from '../services/openai';
import { runTestsInWorker } from '../utils/worker-utils';
import { defaultChallenges } from '../data/defaultChallenges';
import type { Challenge, TestResult } from '@/types/challenges.ts';

export const useChallengesStore = defineStore('challenges', {
    state: () => ({
        challenges: [] as Challenge[], // Start with an empty array
        loading: false,
        error: null as string | null,
        feedback: null as string | null,
        hint: null as string | null
    }),

    getters: {
        getChallenge: (state) => (id: string): Challenge | undefined => {
            return state.challenges.find(c => c.id === id);
        }
    },

    actions: {
        async fetchChallenges(): Promise<void> {
            // this.loading = true;
            // this.error = null;

            try {
                console.log('Fetching challenges...');
                // Simulating an API call here
                this.challenges = defaultChallenges;
                console.log('Challenges loaded successfully');
            } catch (error) {
                const errMessage = error instanceof Error ? error.message : 'Failed to fetch challenges';
                console.error('Error fetching challenges:', errMessage);
                // this.error = errMessage;
            } finally {
                // this.loading = false;
            }
        },

        async runTests({ challengeId, code, language }: {
            challengeId: string;
            code: string;
            language: string;
        }): Promise<TestResult[]> {
            console.log('Running tests for challenge ID:', challengeId);
            // this.feedback = null;
            // this.hint = null;
            // this.error = null;

            try {
                const challenge = this.getChallenge(challengeId);
                if (!challenge) {
                    throw new Error(`Challenge with ID ${challengeId} not found`);
                }

                console.log('Running tests in worker...');
                const results = await runTestsInWorker(challenge, code, language);

                // Check if all tests passed
                const allPassed = results.every(result => result.passed);
                if (allPassed) {
                    console.log('All tests passed. Fetching code review...');
                    this.feedback = await getCodeReview(code, language, challenge);
                } else {
                    console.log('Some tests failed. Fetching hint...');
                    this.hint = await getHint(challenge, code);
                }

                console.log('Tests completed successfully');
                return results;
            } catch (error) {
                const errMessage = error instanceof Error ? error.message : 'Failed to run tests';
                console.error('Error during tests execution:', errMessage);
                this.error = errMessage;
                throw new Error(errMessage); // Rethrow to handle upstream
            }
        },

        async saveProgress({ challengeId, code, language }: {
            challengeId: string;
            code: string;
            language: string;
        }): Promise<void> {
            console.log(`Saving progress for challenge ID: ${challengeId}`, code, language);
            // Implement the actual save functionality when ready
        }
    }
});
