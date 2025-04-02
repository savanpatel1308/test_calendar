const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/connection');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = '24h';

/**
 * User Controller
 * Handles user registration, authentication, and profile management
 */
const userController = {
  /**
   * Register a new user
   */
  async register(ctx) {
    const { username, email, password, first_name, last_name } = ctx.request.body;

    // Check if username or email already exists
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      ctx.status = 409; // Conflict
      ctx.body = {
        status: 'error',
        message: 'Username or email already in use'
      };
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert new user
    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
      [username, email, passwordHash, first_name || null, last_name || null]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: result.insertId, username, email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    ctx.status = 201; // Created
    ctx.body = {
      status: 'success',
      data: {
        user: {
          id: result.insertId,
          username,
          email,
          first_name: first_name || null,
          last_name: last_name || null
        },
        token
      }
    };
  },

  /**
   * Login a user
   */
  async login(ctx) {
    const { username, password } = ctx.request.body;

    // Find user by username
    const [users] = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      ctx.status = 401; // Unauthorized
      ctx.body = {
        status: 'error',
        message: 'Invalid username or password'
      };
      return;
    }

    const user = users[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      ctx.status = 401; // Unauthorized
      ctx.body = {
        status: 'error',
        message: 'Invalid username or password'
      };
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    ctx.body = {
      status: 'success',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name
        },
        token
      }
    };
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(ctx) {
    const userId = ctx.state.user.id;

    const [users] = await db.query(
      'SELECT id, username, email, first_name, last_name, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      ctx.status = 404;
      ctx.body = {
        status: 'error',
        message: 'User not found'
      };
      return;
    }

    ctx.body = {
      status: 'success',
      data: users[0]
    };
  },

  /**
   * Update user profile
   */
  async updateProfile(ctx) {
    const userId = ctx.state.user.id;
    const { email, first_name, last_name, password } = ctx.request.body;

    // Start building the query and parameters
    let query = 'UPDATE users SET';
    const params = [];
    const updates = [];

    if (email !== undefined) {
      updates.push(' email = ?');
      params.push(email);
    }

    if (first_name !== undefined) {
      updates.push(' first_name = ?');
      params.push(first_name);
    }

    if (last_name !== undefined) {
      updates.push(' last_name = ?');
      params.push(last_name);
    }

    if (password !== undefined) {
      updates.push(' password_hash = ?');
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      params.push(passwordHash);
    }

    if (updates.length === 0) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'No fields to update'
      };
      return;
    }

    // Complete the query
    query += updates.join(',');
    query += ' WHERE id = ?';
    params.push(userId);

    // Execute the update
    await db.query(query, params);

    // Get updated user
    const [users] = await db.query(
      'SELECT id, username, email, first_name, last_name, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    ctx.body = {
      status: 'success',
      data: users[0]
    };
  }
};

module.exports = userController;
