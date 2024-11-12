export interface Challenge {
    id: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    topics: string[];
    languages: string[];
    starterCode: Record<string, string>;
    testCases: Array<{
        input: string;
        expected: string;
    }>;
    submissions: number;
    successRate: number;
    example: string;
}

export interface TestResult {
    passed: boolean;
    input: string;
    expected: string;
    output: string;
    actualOutput: string;
    error?: string;
}