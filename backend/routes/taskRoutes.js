
import express from 'express';
import auth from '../middleware/auth.js';
import { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  getTask, 
  toggleTaskCompletion 
} from '../controllers/taskController.js';

const router = express.Router();

router.use(auth);

router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/toggle', toggleTaskCompletion);

export default router;