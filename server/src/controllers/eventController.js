const db = require('../db/connection');

/**
 * Event Controller
 * Handles CRUD operations for calendar events
 */
const eventController = {
  /**
   * Get all events for the authenticated user
   * Includes events they created and events they are invited to
   */
  async getAllEvents(ctx) {
    const userId = ctx.state.user.id;
    
    // Get events created by the user and events they are invited to
    const [events] = await db.query(
      `SELECT e.*, 
              u.username as creator_username,
              ea.status as attendee_status
       FROM events e
       LEFT JOIN users u ON e.creator_id = u.id
       LEFT JOIN event_attendees ea ON e.id = ea.event_id AND ea.user_id = ?
       WHERE e.creator_id = ? OR ea.user_id = ?
       ORDER BY e.start_time ASC`,
      [userId, userId, userId]
    );
    
    // Get attendees for each event
    for (const event of events) {
      const [attendees] = await db.query(
        `SELECT ea.user_id, ea.status, u.username, u.email, u.first_name, u.last_name
         FROM event_attendees ea
         JOIN users u ON ea.user_id = u.id
         WHERE ea.event_id = ?`,
        [event.id]
      );
      
      // Get reminders for the event
      const [reminders] = await db.query(
        'SELECT * FROM reminders WHERE event_id = ?',
        [event.id]
      );
      
      event.attendees = attendees;
      event.reminders = reminders;
    }
    
    ctx.body = {
      status: 'success',
      data: events
    };
  },
  
  /**
   * Get a specific event by ID
   */
  async getEventById(ctx) {
    const eventId = parseInt(ctx.params.id);
    const userId = ctx.state.user.id;
    
    // Get the event
    const [events] = await db.query(
      `SELECT e.*, 
              u.username as creator_username,
              ea.status as attendee_status
       FROM events e
       LEFT JOIN users u ON e.creator_id = u.id
       LEFT JOIN event_attendees ea ON e.id = ea.event_id AND ea.user_id = ?
       WHERE e.id = ? AND (e.creator_id = ? OR ea.user_id = ?)`,
      [userId, eventId, userId, userId]
    );
    
    if (events.length === 0) {
      ctx.status = 404;
      ctx.body = {
        status: 'error',
        message: 'Event not found'
      };
      return;
    }
    
    const event = events[0];
    
    // Get attendees
    const [attendees] = await db.query(
      `SELECT ea.user_id, ea.status, u.username, u.email, u.first_name, u.last_name
       FROM event_attendees ea
       JOIN users u ON ea.user_id = u.id
       WHERE ea.event_id = ?`,
      [eventId]
    );
    
    // Get reminders
    const [reminders] = await db.query(
      'SELECT * FROM reminders WHERE event_id = ?',
      [eventId]
    );
    
    event.attendees = attendees;
    event.reminders = reminders;
    
    ctx.body = {
      status: 'success',
      data: event
    };
  },
  
  /**
   * Create a new event
   */
  async createEvent(ctx) {
    const userId = ctx.state.user.id;
    const { 
      title, 
      description, 
      location, 
      start_time, 
      end_time, 
      all_day, 
      recurring,
      attendees,
      reminders 
    } = ctx.request.body;
    
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Create the event
      const [eventResult] = await connection.query(
        `INSERT INTO events 
          (title, description, location, creator_id, start_time, end_time, all_day, recurring) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description, location, userId, start_time, end_time, all_day, recurring]
      );
      
      const eventId = eventResult.insertId;
      
      // Add creator as an attendee with 'accepted' status
      await connection.query(
        'INSERT INTO event_attendees (event_id, user_id, status) VALUES (?, ?, ?)',
        [eventId, userId, 'accepted']
      );
      
      // Add other attendees with 'pending' status
      if (attendees && attendees.length > 0) {
        for (const attendeeId of attendees) {
          // Check if user exists
          const [users] = await connection.query(
            'SELECT id FROM users WHERE id = ?',
            [attendeeId]
          );
          
          if (users.length > 0 && attendeeId !== userId) {
            await connection.query(
              'INSERT INTO event_attendees (event_id, user_id, status) VALUES (?, ?, ?)',
              [eventId, attendeeId, 'pending']
            );
          }
        }
      }
      
      // Add reminders
      if (reminders && reminders.length > 0) {
        for (const reminder of reminders) {
          await connection.query(
            'INSERT INTO reminders (event_id, remind_at, reminder_type) VALUES (?, ?, ?)',
            [eventId, reminder.remind_at, reminder.reminder_type]
          );
        }
      }
      
      await connection.commit();
      
      // Get the created event
      const [events] = await db.query(
        'SELECT * FROM events WHERE id = ?',
        [eventId]
      );
      
      const event = events[0];
      
      // Get attendees
      const [eventAttendees] = await db.query(
        `SELECT ea.user_id, ea.status, u.username, u.email, u.first_name, u.last_name
         FROM event_attendees ea
         JOIN users u ON ea.user_id = u.id
         WHERE ea.event_id = ?`,
        [eventId]
      );
      
      // Get reminders
      const [eventReminders] = await db.query(
        'SELECT * FROM reminders WHERE event_id = ?',
        [eventId]
      );
      
      event.attendees = eventAttendees;
      event.reminders = eventReminders;
      
      ctx.status = 201;
      ctx.body = {
        status: 'success',
        data: event
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },
  
  /**
   * Update an existing event
   */
  async updateEvent(ctx) {
    const eventId = parseInt(ctx.params.id);
    const userId = ctx.state.user.id;
    
    // Check if event exists and user is the creator
    const [events] = await db.query(
      'SELECT * FROM events WHERE id = ? AND creator_id = ?',
      [eventId, userId]
    );
    
    if (events.length === 0) {
      ctx.status = 404;
      ctx.body = {
        status: 'error',
        message: 'Event not found or you are not the creator'
      };
      return;
    }
    
    const {
      title,
      description,
      location,
      start_time,
      end_time,
      all_day,
      recurring,
      attendees,
      reminders
    } = ctx.request.body;
    
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Update event fields
      const updateFields = [];
      const updateParams = [];
      
      if (title !== undefined) {
        updateFields.push('title = ?');
        updateParams.push(title);
      }
      
      if (description !== undefined) {
        updateFields.push('description = ?');
        updateParams.push(description);
      }
      
      if (location !== undefined) {
        updateFields.push('location = ?');
        updateParams.push(location);
      }
      
      if (start_time !== undefined) {
        updateFields.push('start_time = ?');
        updateParams.push(start_time);
      }
      
      if (end_time !== undefined) {
        updateFields.push('end_time = ?');
        updateParams.push(end_time);
      }
      
      if (all_day !== undefined) {
        updateFields.push('all_day = ?');
        updateParams.push(all_day);
      }
      
      if (recurring !== undefined) {
        updateFields.push('recurring = ?');
        updateParams.push(recurring);
      }
      
      if (updateFields.length > 0) {
        const updateQuery = `UPDATE events SET ${updateFields.join(', ')} WHERE id = ?`;
        updateParams.push(eventId);
        await connection.query(updateQuery, updateParams);
      }
      
      // Update attendees if provided
      if (attendees !== undefined) {
        // Remove all current attendees except the creator
        await connection.query(
          'DELETE FROM event_attendees WHERE event_id = ? AND user_id != ?',
          [eventId, userId]
        );
        
        // Add new attendees
        for (const attendeeId of attendees) {
          if (attendeeId !== userId) {
            // Check if user exists
            const [users] = await connection.query(
              'SELECT id FROM users WHERE id = ?',
              [attendeeId]
            );
            
            if (users.length > 0) {
              await connection.query(
                'INSERT INTO event_attendees (event_id, user_id, status) VALUES (?, ?, ?)',
                [eventId, attendeeId, 'pending']
              );
            }
          }
        }
      }
      
      // Update reminders if provided
      if (reminders !== undefined) {
        // Remove all current reminders
        await connection.query(
          'DELETE FROM reminders WHERE event_id = ?',
          [eventId]
        );
        
        // Add new reminders
        for (const reminder of reminders) {
          await connection.query(
            'INSERT INTO reminders (event_id, remind_at, reminder_type) VALUES (?, ?, ?)',
            [eventId, reminder.remind_at, reminder.reminder_type]
          );
        }
      }
      
      await connection.commit();
      
      // Get the updated event
      const [updatedEvents] = await db.query(
        'SELECT * FROM events WHERE id = ?',
        [eventId]
      );
      
      const updatedEvent = updatedEvents[0];
      
      // Get attendees
      const [updatedAttendees] = await db.query(
        `SELECT ea.user_id, ea.status, u.username, u.email, u.first_name, u.last_name
         FROM event_attendees ea
         JOIN users u ON ea.user_id = u.id
         WHERE ea.event_id = ?`,
        [eventId]
      );
      
      // Get reminders
      const [updatedReminders] = await db.query(
        'SELECT * FROM reminders WHERE event_id = ?',
        [eventId]
      );
      
      updatedEvent.attendees = updatedAttendees;
      updatedEvent.reminders = updatedReminders;
      
      ctx.body = {
        status: 'success',
        data: updatedEvent
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },
  
  /**
   * Delete an event
   */
  async deleteEvent(ctx) {
    const eventId = parseInt(ctx.params.id);
    const userId = ctx.state.user.id;
    
    // Check if event exists and user is the creator
    const [events] = await db.query(
      'SELECT * FROM events WHERE id = ? AND creator_id = ?',
      [eventId, userId]
    );
    
    if (events.length === 0) {
      ctx.status = 404;
      ctx.body = {
        status: 'error',
        message: 'Event not found or you are not the creator'
      };
      return;
    }
    
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Delete reminders
      await connection.query(
        'DELETE FROM reminders WHERE event_id = ?',
        [eventId]
      );
      
      // Delete attendees
      await connection.query(
        'DELETE FROM event_attendees WHERE event_id = ?',
        [eventId]
      );
      
      // Delete event
      await connection.query(
        'DELETE FROM events WHERE id = ?',
        [eventId]
      );
      
      await connection.commit();
      
      ctx.body = {
        status: 'success',
        message: 'Event deleted successfully'
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },
  
  /**
   * Update attendee status
   * Used by attendees to respond to event invitations
   */
  async updateAttendeeStatus(ctx) {
    const eventId = parseInt(ctx.params.id);
    const userId = ctx.state.user.id;
    const { status } = ctx.request.body;
    
    // Check if the user is an attendee of the event
    const [attendees] = await db.query(
      'SELECT * FROM event_attendees WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );
    
    if (attendees.length === 0) {
      ctx.status = 404;
      ctx.body = {
        status: 'error',
        message: 'You are not invited to this event'
      };
      return;
    }
    
    // Update status
    await db.query(
      'UPDATE event_attendees SET status = ? WHERE event_id = ? AND user_id = ?',
      [status, eventId, userId]
    );
    
    ctx.body = {
      status: 'success',
      message: 'Attendance status updated successfully'
    };
  }
};

module.exports = eventController;
