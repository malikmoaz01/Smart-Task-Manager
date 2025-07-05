import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendOnboardingEmail = async (toEmail, username, taskTitle, taskCategory, reminderDate, customMessage) => {
  try {
    const formattedDate = new Date(reminderDate).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: `🔔 Reminder about task: ${taskTitle}`,
      html: `
        <div style="background-color: #f8f9fa; padding: 30px; font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background-color: #3b82f6; padding: 20px; color: white;">
              <h2>⏰ Smart Task Reminder</h2>
            </div>
            <div style="padding: 20px;">
              <p>Hi <strong>${username}</strong>,</p>
              <p>${customMessage || "This is a friendly reminder for your upcoming task:"}</p>
              <div style="margin: 20px 0; border-left: 4px solid #3b82f6; padding-left: 15px;">
                <p><strong>📝 Task:</strong> ${taskTitle}</p>
                <p><strong>📁 Category:</strong> ${taskCategory}</p>
                <p><strong>📅 Reminder Date:</strong> ${formattedDate}</p>
              </div>
              <p>Stay productive and keep crushing your goals 💪</p>
              <p>— Smart Task Manager</p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return info;
  } catch (err) {
    console.error('Email sending error:', err);
    throw err;
  }
};
 
export const sendDeadlineReminderEmail = async (toEmail, username, taskTitle, taskDescription, taskCategory, deadline) => {
  try {
    const formattedDeadline = new Date(deadline).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: `⚠️ URGENT: Task deadline in 24 hours - ${taskTitle}`,
      html: `
        <div style="background-color: #fef2f2; padding: 30px; font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 3px solid #ef4444;">
            <div style="background-color: #ef4444; padding: 20px; color: white;">
              <h2>⚠️ URGENT: Deadline Approaching!</h2>
            </div>
            <div style="padding: 20px;">
              <p>Hi <strong>${username}</strong>,</p>
              <p style="color: #dc2626; font-weight: bold;">This is an urgent reminder that your task deadline is approaching in less than 24 hours!</p>
              
              <div style="margin: 20px 0; border-left: 4px solid #ef4444; padding-left: 15px; background-color: #fef2f2; padding: 15px;">
                <p><strong>📝 Task:</strong> ${taskTitle}</p>
                ${taskDescription ? `<p><strong>📄 Description:</strong> ${taskDescription}</p>` : ''}
                <p><strong>📁 Category:</strong> ${taskCategory}</p>
                <p><strong>⏰ Deadline:</strong> <span style="color: #dc2626; font-weight: bold;">${formattedDeadline}</span></p>
              </div>
              
              <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e;">
                  <strong>💡 Tip:</strong> Don't let this task slip away! Set aside some time now to complete it before the deadline.
                </p>
              </div>
              
              <p>Time to take action and complete this task! 💪</p>
              <p>— Smart Task Manager</p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Deadline reminder email sent:', info.response);
    return info;
  } catch (err) {
    console.error('Deadline reminder email error:', err);
    throw err;
  }
};
