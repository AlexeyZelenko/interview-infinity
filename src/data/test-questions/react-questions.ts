export const reactQuestions = [
    {
        id: 1,
        text: 'What are React Hooks?',
        options: [
            'Functions that let you use state and other React features in functional components',
            'Physical hooks for hanging React components',
            'A way to connect React to external APIs',
            'Special CSS classes for React components'
        ],
        correctAnswer: 0,
        explanation: 'React Hooks are functions that allow functional components to use state and other React features without writing a class component.'
    },
    {
        id: 2,
        text: 'What is the purpose of useEffect?',
        options: [
            'To perform side effects in function components',
            'To create special effects in React',
            'To affect the DOM directly',
            'To modify component props'
        ],
        correctAnswer: 0,
        explanation: 'useEffect is used to perform side effects in function components, such as data fetching, subscriptions, or DOM mutations.'
    },
    {
        id: 3,
        text: 'What is the difference between state and props?',
        options: [
            'State is mutable and managed by the component, props are immutable and passed from parent',
            'State is passed from parent, props are managed internally',
            'They are exactly the same',
            'Props are mutable, state is immutable'
        ],
        correctAnswer: 0,
        explanation: 'State is internal and controlled by the component itself, while props are external and controlled by whatever renders the component.'
    },
    {
        id: 4,
        text: 'What is the purpose of useMemo?',
        options: [
            'To memoize expensive computations',
            'To remember user inputs',
            'To cache API responses',
            'To store component state'
        ],
        correctAnswer: 0,
        explanation: 'useMemo is used to memoize expensive computations so they are only re-computed when dependencies change.'
    },
    {
        id: 5,
        text: 'What is the virtual DOM?',
        options: [
            'A lightweight copy of the actual DOM that React uses for performance optimization',
            'A special browser feature',
            'A type of database',
            'A virtual reality interface'
        ],
        correctAnswer: 0,
        explanation: 'The virtual DOM is a programming concept where an ideal, or "virtual", representation of a UI is kept in memory and synced with the "real" DOM by React.'
    }
];