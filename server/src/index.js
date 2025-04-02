require('dotenv').config(); // ✅ Load environment variables

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const logger = require('koa-logger');
const cors = require('@koa/cors');
const { errorHandler } = require('./middleware/errorHandler');
const router = require('./routes'); // 👈 uses your proper routes/index.js
const dbConnection = require('./db/connection');

// Create Koa app
const app = new Koa();
const PORT = process.env.PORT || 3001;

// Apply middleware
app.use(logger());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser());
app.use(errorHandler);

// Register routes
app.use(router.routes());
app.use(router.allowedMethods());

// Test database connection
(async () => {
  try {
    await dbConnection.getConnection();
    console.log('Connected to MySQL database');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
})();

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;
