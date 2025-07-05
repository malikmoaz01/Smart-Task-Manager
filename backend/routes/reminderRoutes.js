import express from 'express';
import { setReminder } from '../controllers/reminderController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/set', authMiddleware, setReminder);

export default router;
