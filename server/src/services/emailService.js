/**
 * Email Service
 * For a production application, you'd integrate with a real email service
 * like SendGrid, Mailgun, AWS SES, etc.
 * 
 * This is a placeholder implementation that logs to console
 */

/**
 * Send a reminder email for an event
 * @param {Object} user - User to send the reminder to
 * @param {Object} event - Event details
 * @param {Date} reminderTime - Time of the reminder
 */
const sendEventReminderEmail = (user, event, reminderTime) => {
    console.log('🚀 Sending email reminder:');
    console.log(`To: ${user.email}`);
    console.log(`Subject: Reminder: ${event.title}`);
    
    const timeUntilEvent = calculateTimeUntil(new Date(event.start_time), new Date(reminderTime));
    
    console.log(`Body: 
      Hello ${user.first_name || user.username},
      
      This is a reminder that your event "${event.title}" is coming up ${timeUntilEvent}.
      
      Event Details:
      - Date: ${formatDate(new Date(event.start_time))}
      - Time: ${formatTime(new Date(event.start_time))} - ${formatTime(new Date(event.end_time))}
      ${event.location ? `- Location: ${event.location}` : ''}
      
      You can view the full details in your calendar.
      
      Regards,
      Calendar App Team
    `);
    
    // In a real implementation, you would actually send the email here
    return true;
  };
  
  /**
   * Format date to human-readable string
   * @param {Date} date 
   * @returns {string}
   */
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  /**
   * Format time to human-readable string
   * @param {Date} date 
   * @returns {string}
   */
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  /**
   * Calculate human-readable time until event
   * @param {Date} eventTime 
   * @param {Date} reminderTime 
   * @returns {string}
   */
  const calculateTimeUntil = (eventTime, reminderTime) => {
    const diffMs = eventTime - reminderTime;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else {
      return `in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    }
  };
  
  module.exports = {
    sendEventReminderEmail
  };