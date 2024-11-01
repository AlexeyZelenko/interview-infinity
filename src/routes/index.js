import express from 'express';
import userRoutes from './users.js';

const router = express.Router();

router.use('/users', userRoutes);

router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Test endpoint working',
    timestamp: new Date().toISOString()
  });
});

router.post('/echo', (req, res) => {
  res.json({ 
    success: true,
    data: req.body,
    timestamp: new Date().toISOString()
  });
});

export default router;