import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_interview';
const TEMPLATE_ID = 'template_chat_notify';
const PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

let initialized = false;

const init = () => {
  if (!initialized) {
    emailjs.init(PUBLIC_KEY);
    initialized = true;
  }
};

export interface ChatEmailParams {
  userName: string;
  userEmail: string;
  messageText: string;
  chatLink: string;
}

export const sendChatNotificationEmail = async (params: ChatEmailParams): Promise<void> => {
  try {
    init();

    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      to_email: 'zelenkooleksii75@gmail.com',
      user_name: params.userName || 'Anonymous User',
      user_email: params.userEmail || 'No email provided',
      message_text: params.messageText,
      chat_link: params.chatLink,
    });

    console.log('Email notification sent successfully');
  } catch (error) {
    console.error('Failed to send email notification:', error);
  }
};
