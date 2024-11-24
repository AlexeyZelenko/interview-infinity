import { defineStore } from 'pinia';
import axios from 'axios';

interface Message {
    text: string;
    sender: string;
    timestamp: number;
    read: boolean;
    targetUserId: number;
}

export const useTelegramStore = defineStore('telegramStore', () => {
    // Функция для уведомления Telegram бота о новом сообщении
    const notifyNewMessageToTelegramBot = async (messagesRef: string, message: Message) => {
        console.log('notify', messagesRef, message);
        try {
            // Отправляем POST-запрос с сообщением и его метаданными
            const response = await axios.post('https://dev-hire-bot-254341905127.us-central1.run.app/notify', {
                message: message.text,
                userId: message.sender,
                timestamp: message.timestamp,
                read: message.read,
                messagesRef: messagesRef,
                targetUserId: message.targetUserId
            });
            console.log('Уведомление успешно отправлено боту:', response.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Ошибка при отправке уведомления боту (Axios):', error.response?.data || error.message);
            } else {
                console.error('Неизвестная ошибка при отправке уведомления боту:', error);
            }
        }
    };

    return {
        notifyNewMessageToTelegramBot,
    };
});
