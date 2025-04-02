const Router = require('koa-router');
const userController = require('../controllers/userController');
const eventController = require('../controllers/eventController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  userRegistrationSchema,
  userLoginSchema,
  userUpdateSchema,
  eventCreateSchema,
  eventUpdateSchema,
  attendeeUpdateSchema
} = require('../utils/validationSchemas');

const router = new Router({ prefix: '/api' });

// Health check
router.get('/health', ctx => {
  ctx.body = {
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString()
  };
});

// User routes
router.post('/users/register', validate(userRegistrationSchema), userController.register);
router.post('/users/login', validate(userLoginSchema), userController.login);
router.get('/users/me', authenticate, userController.getCurrentUser);
router.patch('/users/me', authenticate, validate(userUpdateSchema), userController.updateProfile);

// Event routes
router.get('/events', authenticate, eventController.getAllEvents);
router.get('/events/:id', authenticate, eventController.getEventById);
router.post('/events', authenticate, validate(eventCreateSchema), eventController.createEvent);
router.put('/events/:id', authenticate, validate(eventUpdateSchema), eventController.updateEvent);
router.delete('/events/:id', authenticate, eventController.deleteEvent);
router.patch('/events/:id/attend', authenticate, validate(attendeeUpdateSchema), eventController.updateAttendeeStatus);

module.exports = router;
