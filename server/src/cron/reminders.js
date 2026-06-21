const cron = require('node-cron');
const db = require('../db');
const { sendDeadlineReminder } = require('../services/emailService');

/**
 * Checks for upcoming deadlines and sends reminder emails
 * Runs every day at 9:00 AM
 */
const startReminderJob = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Running daily deadline reminder job...');

    try {
      // Find all steps with due dates in the next 30 days
      // that are not yet done
      const result = await db.query(
        `SELECT 
          rs.id,
          rs.title,
          rs.due_date,
          rs.status,
          u.email,
          u.full_name,
          EXTRACT(DAY FROM rs.due_date - CURRENT_DATE) as days_left
         FROM roadmap_steps rs
         JOIN users u ON u.id = rs.user_id
         WHERE rs.due_date IS NOT NULL
           AND rs.status != 'done'
           AND rs.due_date >= CURRENT_DATE
           AND rs.due_date <= CURRENT_DATE + INTERVAL '30 days'
         ORDER BY rs.due_date ASC`
      );

      if (result.rows.length === 0) {
        console.log('✅ No upcoming deadlines to remind about');
        return;
      }

      console.log(`📧 Sending ${result.rows.length} reminder emails...`);

      // Send reminder for each upcoming deadline
      for (const step of result.rows) {
        const daysLeft = Math.ceil(step.days_left);

        // Only send reminders at 30, 14, 7, 3, and 1 days before deadline
        if ([30, 14, 7, 3, 1].includes(daysLeft)) {
          try {
            await sendDeadlineReminder(
              step.email,
              step.full_name,
              step.title,
              step.due_date,
              daysLeft
            );
          } catch (emailErr) {
            console.error(`❌ Failed to send email to ${step.email}:`, emailErr.message);
          }
        }
      }

      console.log('✅ Reminder job complete');

    } catch (err) {
      console.error('❌ Reminder job failed:', err.message);
    }
  });

  console.log('⏰ Daily reminder job scheduled for 9:00 AM');
};

module.exports = { startReminderJob };