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
 
export const setGuestReminder = async (req, res) => {
  try {
    const { email, taskTitle, taskDescription, reminderDate, message } = req.body;
     
    if (!email || !taskTitle || !reminderDate) {
      return res.status(400).json({ message: 'Email, task title, and reminder date are required' });
    }
     
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }
     
    const reminderDateTime = new Date(reminderDate);
    const currentTime = new Date();
    if (reminderDateTime <= currentTime) {
      return res.status(400).json({ message: 'Reminder date must be in the future' });
    }
     
    try {
      await sendOnboardingEmail(
        email, 
        'Guest User',  
        taskTitle, 
        'General',  
        reminderDate,
        message || `Hello! This is a friendly reminder about your task: "${taskTitle}". Please make sure to complete it on time. Stay organized and productive!`
      );
      
      res.status(200).json({ 
        message: 'Guest reminder set successfully! You will receive an email notification.',
        reminderDate: reminderDate,
        email: email
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(500).json({ message: 'Failed to send reminder email', error: emailError.message });
    }
    
  } catch (err) {
    console.error('Set Guest Reminder Error:', err);
    res.status(500).json({ message: 'Failed to set guest reminder', error: err.message });
  }
};