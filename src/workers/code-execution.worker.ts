// Web Worker for code execution
self.onmessage = async (e) => {
    const { code, testCases, language } = e.data;
    console.log('Worker received:', { language, testCases });
    console.log('Code to execute:', code);

    try {
        const results = testCases.map((testCase: any, index: number) => {
            console.log(`Running test case ${index + 1}:`, testCase);

            try {
                // Create function wrapper to handle both named and anonymous functions
                const wrappedCode = code.includes('function') ?
                    `(${code})` : // Named function
                    `(function(x) { ${code} })`; // Anonymous function body

                console.log('Creating function with wrapped code:', wrappedCode);
                const func = new Function('return ' + wrappedCode)();

                // Parse input parameters
                let input;
                try {
                    // Extract input parameters based on the test case format
                    const params = testCase.input.split(',').map((param: string) => {
                        const [name, value] = param.split('=').map(p => p?.trim());
                        if (!value) return undefined;

                        try {
                            // Try parsing as JSON first
                            return JSON.parse(value);
                        } catch {
                            // If JSON parsing fails, handle other formats
                            if (value.startsWith('"') && value.endsWith('"')) {
                                return value.slice(1, -1); // Remove quotes
                            }
                            if (/^-?\d+$/.test(value)) {
                                return parseInt(value, 10);
                            }
                            if (value === 'true') return true;
                            if (value === 'false') return false;
                            if (value === 'null') return null;
                            if (value === 'undefined') return undefined;

                            return value;
                        }
                    }).filter(v => v !== undefined);

                    input = params;
                    console.log('Parsed input:', input);
                } catch (parseError) {
                    console.error('Error parsing input:', parseError);
                    throw new Error(`Invalid input format: ${testCase.input}`);
                }

                // Execute function with parsed arguments
                const result = func(...input);
                console.log('Function returned:', result);

                // Format output based on result type
                let output;
                if (Array.isArray(result)) {
                    output = JSON.stringify(result);
                } else if (typeof result === 'boolean') {
                    output = result.toString();
                } else if (result === null) {
                    output = 'null';
                } else if (result === undefined) {
                    output = 'undefined';
                } else if (typeof result === 'object') {
                    output = JSON.stringify(result);
                } else {
                    output = result.toString();
                }

                // For in-place array modifications, check the first argument
                if (Array.isArray(input[0]) && typeof result === 'undefined') {
                    output = JSON.stringify(input[0]);
                }

                // Try to parse expected value as JSON for comparison
                let expectedValue = testCase.expected;
                try {
                    expectedValue = JSON.parse(testCase.expected);
                    if (typeof expectedValue === 'object') {
                        expectedValue = JSON.stringify(expectedValue);
                    }
                } catch {
                    // If parsing fails, use the original string
                }

                console.log('Formatted output:', output);
                console.log('Expected:', expectedValue);

                // Compare results
                const passed = output === expectedValue.toString();
                console.log('Test result:', passed ? 'PASSED' : 'FAILED');

                return {
                    passed,
                    input: testCase.input,
                    expected: testCase.expected,
                    output: output,
                    actualOutput: `Function returned: ${output}`
                };
            } catch (err) {
                console.error(`Error in test case ${index + 1}:`, err);
                return {
                    passed: false,
                    input: testCase.input,
                    expected: testCase.expected,
                    output: err instanceof Error ? err.message : 'Execution failed',
                    error: err instanceof Error ? err.message : 'Execution failed',
                    actualOutput: `Error: ${err instanceof Error ? err.message : 'Execution failed'}`
                };
            }
        });

        console.log('All test results:', results);
        self.postMessage({ type: 'results', data: results });
    } catch (err) {
        console.error('Worker error:', err);
        self.postMessage({
            type: 'error',
            data: err instanceof Error ? err.message : 'Test execution failed'
        });
    }
};