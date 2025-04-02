-- Drop tables if they exist
DROP TABLE IF EXISTS event_attendees;
DROP TABLE IF EXISTS reminders;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create events table
CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  creator_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  recurring VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create reminders table
CREATE TABLE reminders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  remind_at DATETIME NOT NULL,
  reminder_type VARCHAR(50) DEFAULT 'notification',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Create event attendees table (for relationships between users and events)
CREATE TABLE event_attendees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  status ENUM('pending', 'accepted', 'declined', 'tentative') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_attendee (event_id, user_id)
);

-- Insert sample users
INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES
  ('john.doe', 'john.doe@example.com', '$2b$10$123456789012345678901uQHxzxwxN.zf.gFdCi.5H53vi6qJvbmhO', 'John', 'Doe'),
  ('jane.smith', 'jane.smith@example.com', '$2b$10$123456789012345678901uZtCAoKlYIrEQUJA/OEkWAhFE4AJ71rG', 'Jane', 'Smith');

-- Insert sample events
INSERT INTO events (title, description, location, creator_id, start_time, end_time, all_day) VALUES
  ('Team Meeting', 'Weekly team sync', 'Conference Room A', 1, '2025-04-10 10:00:00', '2025-04-10 11:00:00', FALSE),
  ('Project Deadline', 'Submit final project', 'Office', 1, '2025-04-15 00:00:00', '2025-04-15 23:59:59', TRUE),
  ('Lunch with client', 'Discuss new requirements', 'Restaurant', 2, '2025-04-12 12:30:00', '2025-04-12 13:30:00', FALSE);

-- Insert sample reminders
INSERT INTO reminders (event_id, remind_at, reminder_type) VALUES
  (1, '2025-04-10 09:45:00', 'notification'),
  (2, '2025-04-14 09:00:00', 'email'),
  (3, '2025-04-12 11:30:00', 'notification');

-- Insert sample attendees
INSERT INTO event_attendees (event_id, user_id, status) VALUES
  (1, 1, 'accepted'),
  (1, 2, 'accepted'),
  (2, 1, 'accepted'),
  (3, 1, 'pending'),
  (3, 2, 'accepted');