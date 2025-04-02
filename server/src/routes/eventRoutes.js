// server/src/routes/eventRoutes.js
const Router = require('koa-router');
const eventController = require('../controllers/eventController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { eventCreateSchema, eventUpdateSchema, attendeeUpdateSchema } = require('../utils/validationSchemas');

const router = new Router({ prefix: '/events' });

// Event routes
router.get('/', authenticate, eventController.getAllEvents);
router.get('/:id', authenticate, eventController.getEventById);
router.post('/', authenticate, validate(eventCreateSchema), eventController.createEvent);
router.put('/:id', authenticate, validate(eventUpdateSchema), eventController.updateEvent);
router.delete('/:id', authenticate, eventController.deleteEvent);
router.patch('/:id/attend', authenticate, validate(attendeeUpdateSchema), eventController.updateAttendeeStatus);

module.exports = router;