import cron from 'node-cron';
import Task from '../models/Task.js'; 
import { sendDeadlineReminderEmail } from './emailSender.js';
 
const checkDeadlineReminders = async () => {
  try {
    console.log('Checking for deadline reminders...');
     
    const now = new Date();
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const tasks = await Task.find({
      deadline: {
        $gte: now,
        $lte: twentyFourHoursLater
      },
      completed: false,
      deadlineReminderSent: { $ne: true } 
    }).populate('userId');

    console.log(`Found ${tasks.length} tasks with deadlines in next 24 hours`);
 
    for (const task of tasks) {
      try {
        if (task.userId && task.userId.email) {
          await sendDeadlineReminderEmail(
            task.userId.email,
            task.userId.name,
            task.title,
            task.description,
            task.category,
            task.deadline
          );
           
          task.deadlineReminderSent = true;
          await task.save();
          
          console.log(`Deadline reminder sent for task: ${task.title} to ${task.userId.email}`);
        }
      } catch (emailError) {
        console.error(`Failed to send deadline reminder for task ${task.title}:`, emailError);
      }
    }
    
  } catch (error) {
    console.error('Error in deadline reminder check:', error);
  }
};
 
const startDeadlineReminderCron = () => { 
  cron.schedule('0 * * * *', checkDeadlineReminders, {
    scheduled: true,
    timezone: "Asia/Karachi"  
  });
  
  console.log('Deadline reminder cron job started - runs every hour');
};

export { startDeadlineReminderCron, checkDeadlineReminders };
 