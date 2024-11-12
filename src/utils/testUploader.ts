import { db, storage } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

interface TestMetadata {
    title: string;
    description: string;
    category: string;
    difficulty: string;
}

export const validateAndUploadTest = async (csvContent: string, metadata: TestMetadata) => {
    try {
        // Parse CSV
        const rows = csvContent.split('\n').map(row => row.split(','));
        const headers = rows[0];
        const questions = rows.slice(1);

        // Validate format
        if (!validateFormat(headers)) {
            throw new Error('Invalid CSV format');
        }

        // Convert to questions format
        const formattedQuestions = questions.map(row => ({
            text: row[0],
            options: [row[1], row[2], row[3], row[4]],
            correctAnswer: parseInt(row[5]) - 1,
            explanation: row[6]
        }));

        // Create file blob
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const fileName = `${metadata.category}_${Date.now()}.csv`;

        // Upload to Storage
        const fileRef = storageRef(storage, `test-files/${metadata.category}/${fileName}`);
        await uploadBytes(fileRef, blob);
        const fileUrl = await getDownloadURL(fileRef);

        // Save to Firestore
        await addDoc(collection(db, 'tests'), {
            ...metadata,
            questions: formattedQuestions,
            fileUrl,
            createdAt: new Date().toISOString(),
            status: 'active',
            submissions: 0,
            successRate: 0,
            duration: 30
        });

    } catch (error) {
        throw new Error('Failed to process and upload test');
    }
};

const validateFormat = (headers: string[]) => {
    const requiredHeaders = [
        'Question',
        'Option1',
        'Option2',
        'Option3',
        'Option4',
        'CorrectAnswer',
        'Explanation'
    ];

    return requiredHeaders.every((header, index) =>
        headers[index]?.trim().toLowerCase() === header.toLowerCase()
    );
};
