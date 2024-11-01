export const vueQuestions = [
    {
        id: 1,
        text: 'What is the Composition API in Vue 3?',
        options: [
            'A new way to handle component logic using composable functions',
            'A tool for composing music in Vue applications',
            'A database composition tool',
            'A way to compose HTML templates'
        ],
        correctAnswer: 0,
        explanation: 'The Composition API is a new feature in Vue 3 that provides a more flexible way to organize component logic using composable functions.'
    },
    {
        id: 2,
        text: 'What is the purpose of ref() in Vue 3?',
        options: [
            'To create a reactive reference to a value',
            'To reference DOM elements',
            'To import external libraries',
            'To define component names'
        ],
        correctAnswer: 0,
        explanation: 'ref() is used to create a reactive reference to a value, making it possible to track changes and trigger updates.'
    },
    {
        id: 3,
        text: 'How do you define props in a Vue 3 component using TypeScript?',
        options: [
            'defineProps<{ propName: type }>()',
            'props: { propName: type }',
            'defineComponent({ props: type })',
            '@Prop() propName: type'
        ],
        correctAnswer: 0,
        explanation: 'In Vue 3 with TypeScript, props are defined using the defineProps<T>() macro with a generic type.'
    },
    {
        id: 4,
        text: 'What is the purpose of watchEffect in Vue 3?',
        options: [
            'To automatically track and respond to reactive dependencies',
            'To watch DOM elements for changes',
            'To create side effects in components',
            'To monitor network requests'
        ],
        correctAnswer: 0,
        explanation: 'watchEffect automatically tracks reactive dependencies and runs the effect function whenever those dependencies change.'
    },
    {
        id: 5,
        text: 'What is the correct way to emit events in Vue 3 setup script?',
        options: [
            'defineEmits<{ (e: "event-name"): void }>()',
            'this.$emit("event-name")',
            'emit: ["event-name"]',
            '@Emit() eventName()'
        ],
        correctAnswer: 0,
        explanation: 'In Vue 3 setup script, events are defined using the defineEmits macro with TypeScript type annotations for better type safety.'
    }
];