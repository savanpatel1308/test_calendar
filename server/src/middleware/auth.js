// server/src/middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Authentication middleware
 * Verifies JWT token in Authorization header
 */
async function authenticate(ctx, next) {
  try {
    // Get the token from the Authorization header
    const authHeader = ctx.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ctx.status = 401;
      ctx.body = { status: 'error', message: 'Authentication token required' };
      return;
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user info to state
    ctx.state.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email
    };
    
    await next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      ctx.status = 401;
      ctx.body = { status: 'error', message: 'Invalid or expired token' };
      return;
    }
    throw err;
  }
}

module.exports = {
  authenticate
};