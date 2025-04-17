import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';
import nodemailer from 'nodemailer';
import axios from 'axios';

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Telegram configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export async function sendEmailNotification(req: any, res: any) {
    console.log('--- sendEmailNotification function started ---'); // <-- ЛОГ: Начало функции
    try {
      const { to, userId, message, userName, userEmail } = req.body;
      console.log(`Request received. To: ${to}, UserID: ${userId}, UserName: ${userName}, UserEmail: ${userEmail}`); // <-- ЛОГ: Входящие данные (обрежьте message, если он слишком длинный)
      
      // Verify admin authentication
      console.log('Verifying admin authentication...'); // <-- ЛОГ: Проверка аутентификации
      const auth = getAuth();
      const user = auth.currentUser; // ВАЖНО: Эта проверка работает только если функция вызывается на клиенте или в среде с Firebase Auth SDK, инициализированным для КЛИЕНТА. На сервере нужен Admin SDK. Если это серверная функция, аутентификацию нужно делать иначе (например, через проверку ID токена).
      
      if (!user) {
        console.warn('Admin authentication failed. User not found.'); // <-- ЛОГ: Ошибка аутентификации
        return res.status(401).json({ error: 'Unauthorized' });
      }
      console.log(`Admin authenticated. Admin User UID: ${user.uid}`); // <-- ЛОГ: Успешная аутентификация
  
      // Get admin settings
      console.log('Fetching notification settings from Realtime Database...'); // <-- ЛОГ: Получение настроек
      const db = getDatabase(); // Опять же, это клиентский SDK. Для сервера нужен Admin SDK.
      const settingsRef = ref(db, 'adminSettings/notifications');
      const settings = await get(settingsRef);
  
      if (!settings.exists()) {
          console.warn('Notification settings node does not exist in DB.'); // <-- ЛОГ: Настройки не найдены
          return res.status(400).json({ error: 'Notification settings not found' });
      }
      
      const settingsVal = settings.val();
      console.log('Fetched settings:', settingsVal); // <-- ЛОГ: Полученные настройки
  
      if (!settingsVal.email) {
        console.warn('Email notifications are disabled in settings.'); // <-- ЛОГ: Email уведомления выключены
        // Можно вернуть успех, но с пометкой, что уведомления отключены, или ошибку - зависит от логики
        return res.status(200).json({ success: true, message: 'Email notifications are disabled' }); 
        // Или: return res.status(400).json({ error: 'Email notifications are not enabled' });
      }
      console.log('Email notifications are enabled.'); // <-- ЛОГ: Email уведомления включены
  
      // Prepare email options
      console.log(`Preparing email options for recipient: ${to}`); // <-- ЛОГ: Подготовка письма
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: `New message from ${userName}`,
        html: `
          <h2>New Message from ${userName}</h2>
          <p><strong>User ID:</strong> ${userId}</p>
          <p><strong>User Email:</strong> ${userEmail}</p>
          <p><strong>Message:</strong> ${message}</p>
          <p>Please log in to the admin panel to respond.</p>
        `
      };
      // console.log('Mail options prepared:', mailOptions); // Раскомментируйте, если нужно видеть полное тело письма в логах
  
      // Send email
      console.log(`Attempting to send email via Nodemailer to ${to}...`); // <-- ЛОГ: Попытка отправки
      // Убедитесь, что 'transporter' корректно инициализирован перед вызовом функции
      if (!transporter) {
          console.error('Nodemailer transporter is not initialized!');
          throw new Error('Transporter not initialized');
      }
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email successfully sent to ${to}. Message ID: ${info.messageId}`); // <-- ЛОГ: Успешная отправка
  
      res.status(200).json({ success: true });
  
    } catch (error: any) { // Явно указываем тип error или используем unknown
      // Логируем ошибку на каждом этапе для лучшей диагностики
      if (error.message === 'Transporter not initialized') {
          console.error('Caught error: Nodemailer transporter was not available.');
      } else if (error.code === 'auth/network-request-failed') { // Пример ошибки Firebase Auth
          console.error('Firebase Auth network error:', error);
      } else if (error.response) { // Ошибка от Nodemailer при отправке
          console.error('Nodemailer sending error response:', error.response);
      } else { // Общая ошибка
          console.error('Caught unknown error in sendEmailNotification:', error);
      }
      
      // Возвращаем общую ошибку клиенту
      res.status(500).json({ error: 'Failed to send email notification' });
    } finally {
        console.log('--- sendEmailNotification function finished ---'); // <-- ЛОГ: Завершение функции
    }
  }

export async function sendTelegramNotification(req: any, res: any) {
  try {
    const { username, userId, message, userName } = req.body;

    // Verify admin authentication
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get admin settings
    const db = getDatabase();
    const settingsRef = ref(db, 'adminSettings/notifications');
    const settings = await get(settingsRef);

    if (!settings.exists() || !settings.val().telegram) {
      return res.status(400).json({ error: 'Telegram notifications are not enabled' });
    }

    // Get chat ID from username
    const getUpdatesResponse = await axios.get(`${TELEGRAM_API_URL}/getUpdates`);
    const chat = getUpdatesResponse.data.result.find(
      (update: any) => update.message?.from?.username === username
    );

    if (!chat) {
      return res.status(404).json({ error: 'Telegram user not found' });
    }

    const chatId = chat.message.chat.id;

    // Send message
    const messageText = `*New message from ${userName}*\n\nUser ID: ${userId}\nMessage: ${message}`;
    console.log("TELEGRAM_BOT_TOKEN", TELEGRAM_BOT_TOKEN);
    await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: chatId,
      text: messageText,
      parse_mode: 'Markdown'
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    res.status(500).json({ error: 'Failed to send Telegram notification' });
  }
} 