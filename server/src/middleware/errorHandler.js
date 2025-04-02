/**
 * Global error handler middleware for Koa
 */
async function errorHandler(ctx, next) {
    try {
      await next();
    } catch (err) {
      const status = err.status || 500;
      const message = err.message || 'Internal Server Error';
      
      // Log server errors
      if (status >= 500) {
        console.error('Server Error:', err);
      }
      
      ctx.status = status;
      ctx.body = {
        status: 'error',
        message,
        ...(process.env.NODE_ENV !== 'production' && status >= 500 ? { stack: err.stack } : {})
      };
      
      // Emit event for error tracking (if implemented)
      ctx.app.emit('error', err, ctx);
    }
  }
  
  module.exports = {
    errorHandler
  };