const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (userEmail, userName, verifyUrl) => {
  const mailOptions = {
    from: `"Settle.ie" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Verify your Settle.ie email address',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1A3D2B; font-size: 24px; margin: 0;">Settle.ie</h1>
            <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0;">Your Irish relocation guide</p>
          </div>
          <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 12px;">
            Hi ${userName}! Please verify your email
          </h2>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
            Thanks for signing up to Settle.ie. Click the button below to verify 
            your email address. This link expires in 24 hours.
          </p>
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${verifyUrl}"
               style="background: #1A3D2B; color: #F7F3EB; padding: 12px 32px; 
                      border-radius: 12px; text-decoration: none; font-size: 14px; 
                      font-weight: bold; display: inline-block;">
              Verify my email
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Verification email sent to ${userEmail}`);
};

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
            <h1 style="color: #1A3D2B; font-size: 24px; margin: 0;">Settle.ie</h1>
            <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0;">Your Irish relocation guide</p>
          </div>
          <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 12px;">
            Welcome, ${userName}! 🎉
          </h2>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
            You've taken the first step towards settling in Ireland. 
            We're here to guide you through every step of the process.
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
            <a href="${process.env.CLIENT_URL}/onboarding"
               style="background: #1A3D2B; color: #F7F3EB; padding: 12px 32px; 
                      border-radius: 12px; text-decoration: none; font-size: 14px; 
                      font-weight: bold; display: inline-block;">
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
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1A3D2B; font-size: 24px; margin: 0;">Settle.ie</h1>
          </div>
          <div style="background: ${urgencyColor}15; border-left: 4px solid ${urgencyColor}; padding: 12px 16px; margin-bottom: 24px;">
            <p style="color: ${urgencyColor}; font-weight: bold; margin: 0; font-size: 14px;">
              ⚠️ ${urgencyText} — ${daysLeft} days remaining
            </p>
          </div>
          <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 12px;">Hi ${userName}!</h2>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <p style="color: #1f2937; font-weight: bold; font-size: 16px; margin: 0 0 4px;">
              ${stepTitle}
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Due by: <strong>${new Date(dueDate).toLocaleDateString('en-IE', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
              })}</strong>
            </p>
          </div>
          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/dashboard" 
               style="background: #1A3D2B; color: white; padding: 12px 32px; 
                      border-radius: 12px; text-decoration: none; font-size: 14px; 
                      font-weight: bold; display: inline-block;">
              View My Roadmap
            </a>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Reminder email sent to ${userEmail}`);
};

module.exports = { sendVerificationEmail, sendWelcomeEmail, sendDeadlineReminder };