import express from 'express';
import { setReminder , setGuestReminder} from '../controllers/reminderController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/set', authMiddleware, setReminder);
router.post('/guest', setGuestReminder);

export default router;
