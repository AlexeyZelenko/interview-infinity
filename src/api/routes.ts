import { Router } from 'express';
import { sendEmailNotification, sendTelegramNotification } from './notifications';

const router = Router();

// Email notification endpoint
router.post('/sendEmailNotification', sendEmailNotification);

// Telegram notification endpoint
router.post('/sendTelegramNotification', sendTelegramNotification);

export default router; 