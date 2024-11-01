export const javascriptQuestions = [
    {
        id: 1,
        text: 'What is the difference between let and var?',
        options: [
            'let has block scope while var has function scope',
            'var has block scope while let has function scope',
            'They are exactly the same',
            'let is not a valid JavaScript keyword'
        ],
        correctAnswer: 0,
        explanation: 'let introduces block scope to JavaScript, while var is function-scoped and can lead to hoisting-related issues.'
    },
    {
        id: 2,
        text: 'What is the purpose of the Promise object?',
        options: [
            'To handle asynchronous operations',
            'To make promises to the user',
            'To store temporary data',
            'To handle errors only'
        ],
        correctAnswer: 0,
        explanation: 'Promises are used to handle asynchronous operations in JavaScript, providing a cleaner way to handle callbacks.'
    },
    {
        id: 3,
        text: 'What is closure in JavaScript?',
        options: [
            'A function that has access to variables in its outer scope',
            'A way to close browser windows',
            'A method to end functions',
            'A type of loop'
        ],
        correctAnswer: 0,
        explanation: 'A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned.'
    },
    {
        id: 4,
        text: 'What is the purpose of the Map object?',
        options: [
            'To store key-value pairs and maintain insertion order',
            'To create geographical maps',
            'To transform arrays only',
            'To store only string values'
        ],
        correctAnswer: 0,
        explanation: 'Map is a collection of keyed data items where both keys and values can be of any type, maintaining insertion order.'
    },
    {
        id: 5,
        text: 'What is event bubbling?',
        options: [
            'When an event triggers on a child element and propagates up through its ancestors',
            'Creating bubble-like animations',
            'A way to debug code',
            'A method to sort arrays'
        ],
        correctAnswer: 0,
        explanation: 'Event bubbling is a type of event propagation where the event first triggers on the innermost target element, and then triggers on its ancestors.'
    }
];