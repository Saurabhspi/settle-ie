const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a deadline reminder email to a user
 */
const sendDeadlineReminder = async (userEmail, userName, stepTitle, dueDate, daysLeft) => {
  const urgencyColor = daysLeft <= 7 ? '#EA4B4B' : '#E8943A';
  const urgencyText = daysLeft <= 7 ? 'URGENT' : 'Reminder';

  const mailOptions = {
    from: `"Settle.ie" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `${urgencyText}: ${stepTitle} due in ${daysLeft} days`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        
        <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid #e5e7eb;">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1D9E75; font-size: 24px; margin: 0;">Settle.ie</h1>
            <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0;">Your Irish relocation guide</p>
          </div>

          <!-- Urgency badge -->
          <div style="background: ${urgencyColor}15; border-left: 4px solid ${urgencyColor}; padding: 12px 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="color: ${urgencyColor}; font-weight: bold; margin: 0; font-size: 14px;">
              ⚠️ ${urgencyText} — ${daysLeft} days remaining
            </p>
          </div>

          <!-- Content -->
          <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 12px;">
            Hi ${userName}!
          </h2>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
            This is a reminder that you have an important deadline coming up:
          </p>

          <!-- Step card -->
          <div style="background: #f3f4f6; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <p style="color: #1f2937; font-weight: bold; font-size: 16px; margin: 0 0 4px;">
              ${stepTitle}
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Due by: <strong>${new Date(dueDate).toLocaleDateString('en-IE', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</strong>
            </p>
          </div>

          <!-- CTA button -->
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="http://localhost:3000/dashboard" 
               style="background: #1D9E75; color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-size: 14px; font-weight: bold; display: inline-block;">
              View My Roadmap
            </a>
          </div>

          <!-- Footer -->
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            You're receiving this because you have an account on Settle.ie.<br/>
            Your Irish relocation assistant 🇮🇪
          </p>

        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Reminder email sent to ${userEmail}`);
};

/**
 * Sends a welcome email when a user registers
 */
const sendWelcomeEmail = async (userEmail, userName) => {
  const mailOptions = {
    from: `"Settle.ie" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Céad Míle Fáilte, ${userName}! 🇮🇪`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid #e5e7eb;">
          
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1D9E75; font-size: 24px; margin: 0;">Settle.ie</h1>
            <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0;">Your Irish relocation guide</p>
          </div>

          <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 12px;">
            Welcome, ${userName}! 🎉
          </h2>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
            You've taken the first step towards settling in Ireland. 
            We're here to guide you through every step of the process — 
            from your PPS number to opening a bank account.
          </p>

          <div style="background: #E1F5EE; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <p style="color: #0F6E56; font-size: 14px; font-weight: bold; margin: 0 0 8px;">
              What's next?
            </p>
            <ul style="color: #0F6E56; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Complete your onboarding quiz</li>
              <li>Get your personalised roadmap</li>
              <li>Ask Fáilte any questions about Ireland</li>
              <li>Upload your documents to the vault</li>
            </ul>
          </div>

          <div style="text-align: center;">
            <a href="http://localhost:3000/onboarding"
               style="background: #1D9E75; color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-size: 14px; font-weight: bold; display: inline-block;">
              Start My Roadmap
            </a>
          </div>

        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Welcome email sent to ${userEmail}`);
};

module.exports = { sendDeadlineReminder, sendWelcomeEmail };