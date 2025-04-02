const db = require('../db/connection');
const emailService = require('./emailService');

/**
 * Reminder Service
 * For handling event reminders
 */

/**
 * Process all pending reminders
 * In a production app, this would be triggered by a scheduled job
 */
const processReminders = async () => {
  console.log('🔔 Processing reminders...');
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes buffer
  
  try {
    // Get all reminders that are due
    const [reminders] = await db.query(
      `SELECT r.*, e.title, e.description, e.location, e.start_time, e.end_time, e.creator_id
       FROM reminders r
       JOIN events e ON r.event_id = e.id
       WHERE r.remind_at <= ? AND r.processed = FALSE`,
      [fiveMinutesFromNow]
    );
    
    console.log(`Found ${reminders.length} reminders to process`);
    
    for (const reminder of reminders) {
      await processReminder(reminder);
    }
    
    return reminders.length;
  } catch (error) {
    console.error('Error processing reminders:', error);
    throw error;
  }
};

/**
 * Process a single reminder
 * @param {Object} reminder - Reminder to process
 */
const processReminder = async (reminder) => {
  try {
    // Get the event creator
    const [users] = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [reminder.creator_id]
    );
    
    if (users.length === 0) {
      console.error(`User with ID ${reminder.creator_id} not found`);
      return;
    }
    
    const user = users[0];
    
    // Get the event
    const event = {
      id: reminder.event_id,
      title: reminder.title,
      description: reminder.description,
      location: reminder.location,
      start_time: reminder.start_time,
      end_time: reminder.end_time
    };
    
    // Send notification based on reminder type
    if (reminder.reminder_type === 'email') {
      emailService.sendEventReminderEmail(user, event, reminder.remind_at);
    } else {
      // For system notifications, we just log them
      console.log(`🔔 System notification for ${user.username}: Event "${event.title}" is coming up soon!`);
    }
    
    // Mark the reminder as processed
    await db.query(
      'UPDATE reminders SET processed = TRUE WHERE id = ?',
      [reminder.id]
    );
    
    console.log(`Processed reminder ID ${reminder.id} for event "${event.title}"`);
  } catch (error) {
    console.error(`Error processing reminder ID ${reminder.id}:`, error);
    throw error;
  }
};

/**
 * Initialize the reminder service
 * In a production app, this would set up scheduled jobs
 */
const initialize = () => {
  // Add 'processed' column to reminders table if it doesn't exist
  db.query(`
    ALTER TABLE reminders 
    ADD COLUMN IF NOT EXISTS processed BOOLEAN DEFAULT FALSE
  `).catch(err => console.error('Error adding processed column:', err));
  
  // In a real app, you'd set up a recurring job
  // For demo purposes, we'll check every 5 minutes
  setInterval(processReminders, 5 * 60 * 1000);
  
  // Also process once on startup
  processReminders().catch(err => console.error('Error processing reminders on startup:', err));
  
  console.log('✅ Reminder service initialized');
};

module.exports = {
  initialize,
  processReminders
};