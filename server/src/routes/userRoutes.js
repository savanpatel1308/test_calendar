// server/src/routes/userRoutes.js
const Router = require('koa-router');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { userRegistrationSchema, userLoginSchema, userUpdateSchema } = require('../utils/validationSchemas');

const router = new Router({ prefix: '/users' });

// User routes
router.post('/register', validate(userRegistrationSchema), userController.register);
router.post('/login', validate(userLoginSchema), userController.login);
router.get('/me', authenticate, userController.getCurrentUser);
router.patch('/me', authenticate, validate(userUpdateSchema), userController.updateProfile);

module.exports = router;