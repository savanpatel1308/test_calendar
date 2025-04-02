// server/src/middleware/validation.js
/**
 * Validation middleware factory
 * Creates a middleware that validates request body using the provided schema
 * 
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Koa middleware
 */
function validate(schema) {
    return async (ctx, next) => {
      try {
        // Validate the request body against the schema
        const validatedData = await schema.validateAsync(ctx.request.body, {
          abortEarly: false,
          stripUnknown: true
        });
        
        // Replace request body with validated data
        ctx.request.body = validatedData;
        
        await next();
      } catch (err) {
        if (err.name === 'ValidationError') {
          ctx.status = 400;
          ctx.body = {
            status: 'error',
            message: 'Validation error',
            details: err.details.map(detail => ({
              path: detail.path.join('.'),
              message: detail.message
            }))
          };
          return;
        }
        throw err;
      }
    };
  }
  
  module.exports = {
    validate
  };