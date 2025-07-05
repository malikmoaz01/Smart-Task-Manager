import Task from '../models/Task.js';
import User from '../models/User.js';
import { sendOnboardingEmail } from '../config/emailSender.js';

export const setReminder = async (req, res) => {
  try {
    const { taskId, reminderDate } = req.body;
    const userId = req.userId;

    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.reminder = reminderDate;
    await task.save();

    const user = await User.findById(userId);
    if (user) {
      await sendOnboardingEmail(user.email, user.name, task.title, task.category, reminderDate);
    }

    res.status(200).json({ message: 'Reminder set and email sent' });
  } catch (err) {
    console.error('Set Reminder Error:', err);
    res.status(500).json({ message: 'Failed to set reminder', error: err.message });
  }
};
