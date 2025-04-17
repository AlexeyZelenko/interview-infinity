import axios from 'axios';

export const notifyNewMessageToTelegramBot = async (message: string) => {
  try {
    const response = await axios.post('/api/notify', {
      message
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при отправке уведомления боту (Axios):', error);
    throw error;
  }
}; 