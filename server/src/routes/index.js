// server/src/routes/index.js
const Router = require('koa-router');
const userRoutes = require('./userRoutes');
const eventRoutes = require('./eventRoutes');

const router = new Router({ prefix: '/api' });

// Health check
router.get('/health', ctx => {
  ctx.body = {
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString()
  };
});

// Apply routes
router.use(userRoutes.routes());
router.use(eventRoutes.routes());

module.exports = router;