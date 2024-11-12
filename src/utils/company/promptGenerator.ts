export const generatePrompt = (technology: string, difficulty: string, description: string, instructions: string) => {
    return `Create a multiple-choice test about ${technology} with the following specifications:
            Requirements:
            - Difficulty level: ${difficulty}
            Create a CSV-formatted list of test questions for [TOPIC] with the following metadata: Required Collection Fields: - category: "Frontend"
             or "Backend" - description: Brief overview of what the test covers - difficulty: "beginner", "intermediate",
              or "advanced" - duration: Number of minutes to complete the test - title: Clear, descriptive test title CSV Format
               Requirements:
                1. Format each row as: Question,Option1,Option2,Option3,Option4,CorrectAnswer,Explanation
                2. CorrectAnswer should be a number (1-4) indicating the correct option
                3. Include 10 questions
                4. Questions should be practical and scenario-based
                5. Include clear explanations for correct answers Example metadata: { "category": "Frontend", "description": "Comprehensive assessment of Vue.js fundamentals and advanced concepts", "difficulty": "advanced", "duration": 30, "title": "Vue.js Advanced Concepts Test" } Example CSV row: What is the Composition API in Vue 3?,A new way to organize component logic,A database API,A routing solution,A state management pattern,1,The Composition API is Vue 3's new feature for better organizing component logic using composable functions Focus areas: - [List 2-3 specific areas you want the questions to cover] Please provide: 1. The metadata JSON block 2. The CSV-formatted questions that can be directly copied into a .csv file Create a CSV-formatted list of test questions for React Advanced Patterns. Required Collection Fields: { "category": "Frontend", "description": "Advanced assessment of React patterns including hooks, context, and performance optimization", "difficulty": "advanced", "duration": 45, "title": "React Advanced Patterns and Best Practices" } CSV Format Requirements: 1. Format each row as: Question,Option1,Option2,Option3,Option4,CorrectAnswer,Explanation 2. CorrectAnswer should be a number (1-4) indicating the correct option 3. Include 10 questions 4. Questions should be practical and scenario-based 5. Include clear explanations for correct answers Focus areas: - Custom Hooks patterns - Performance optimization techniques - State management patterns Please provide the CSV-formatted questions that can be directly copied into a .csv file.
            - Questions focus on ${instructions}            
            Return only the CSV content without any additional text.`;
};
