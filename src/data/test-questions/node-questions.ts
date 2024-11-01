export const nodeQuestions = [
    {
        id: 1,
        text: 'What is the Event Loop in Node.js?',
        options: [
            'A mechanism that allows Node.js to perform non-blocking I/O operations',
            'A special type of for loop',
            'A UI component for handling events',
            'A database query loop'
        ],
        correctAnswer: 0,
        explanation: 'The Event Loop is what allows Node.js to perform non-blocking I/O operations despite JavaScript being single-threaded.'
    },
    {
        id: 2,
        text: 'What is the purpose of process.nextTick()?',
        options: [
            'To execute a callback function at the start of the next iteration of the event loop',
            'To pause the execution for one tick',
            'To schedule a task for the next day',
            'To restart the Node.js process'
        ],
        correctAnswer: 0,
        explanation: 'process.nextTick() is used to schedule a callback to execute at the beginning of the next iteration of the event loop.'
    },
    {
        id: 3,
        text: 'How do you handle uncaught exceptions in Node.js?',
        options: [
            'Using process.on("uncaughtException", handler)',
            'Using try/catch blocks',
            'Using window.onerror',
            'Using error.log()'
        ],
        correctAnswer: 0,
        explanation: 'The process.on("uncaughtException") event handler is used to catch and handle uncaught exceptions globally in Node.js.'
    },
    {
        id: 4,
        text: 'What is the purpose of the Buffer class in Node.js?',
        options: [
            'To handle binary data',
            'To cache database queries',
            'To store temporary files',
            'To buffer network requests'
        ],
        correctAnswer: 0,
        explanation: 'Buffer is used to handle binary data in Node.js, providing a way to work with streams of raw data.'
    },
    {
        id: 5,
        text: 'What is the difference between require and import in Node.js?',
        options: [
            'require is CommonJS, import is ES modules',
            'require is faster than import',
            'import is older than require',
            'They are exactly the same'
        ],
        correctAnswer: 0,
        explanation: 'require is the CommonJS way of importing modules, while import is the newer ES modules syntax supported in newer versions of Node.js.'
    }
];