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
