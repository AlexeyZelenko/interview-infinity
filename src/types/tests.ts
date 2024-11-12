export interface TestSubmission {
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

export interface Test {
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
    category?: string;
    jobId?: string;
}

export interface TestAttempt {
    id: string;
    testId: string;
    userId: string;
    score: number;
    totalQuestions: number;
    startedAt: string;
    completedAt: string;
    answers: Array<TestAnswer>;
    category?: string;
    jobId?: string;
}

export interface TestDiscussion {
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

export interface TestAnswer {
    testId: number | string | null;
    correctAnswer: number | string | null;
    selectedAnswer: number;
    isCorrect: boolean;
    timeTaken: number;
}

export interface TestAttemptDetails {
    id: string;
    testId: string;
    userId: string;
    score: number;
    totalQuestions: number;
    startedAt: string;
    completedAt: string;
    answers: Array<TestAnswer>;
    test: Test;
    category?: string;
    jobId?: string;
}