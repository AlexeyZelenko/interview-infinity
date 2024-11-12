export const runTestsInWorker = async (challenge: any, code: string, language: string) => {
    return new Promise((resolve, reject) => {
        try {
            // Create a new worker with type module
            const workerUrl = new URL('../workers/code-execution.worker.ts', import.meta.url);
            const worker = new Worker(workerUrl, { type: 'module' });

            // Set up message handler
            worker.onmessage = (e) => {
                const { type, data } = e.data;
                if (type === 'results') {
                    resolve(data);
                } else if (type === 'error') {
                    reject(new Error(data));
                }
                worker.terminate();
            };

            // Set up error handler
            worker.onerror = (error) => {
                console.error('Worker error:', error);
                reject(new Error('Code execution failed'));
                worker.terminate();
            };

            // Send test data to worker
            worker.postMessage({
                code,
                testCases: challenge.testCases,
                language
            });

        } catch (error) {
            console.error('Failed to create worker:', error);
            reject(new Error('Failed to initialize code execution'));
        }
    });
};