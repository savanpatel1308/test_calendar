const mysql = require('mysql2/promise');

// Database connection configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3307,
  user: process.env.DB_USER || 'calendar_user',
  password: process.env.DB_PASSWORD || 'calendar_password',
  database: process.env.DB_NAME || 'calendar_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;