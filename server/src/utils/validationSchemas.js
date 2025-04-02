const Joi = require('joi');

// User schemas
const userRegistrationSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  first_name: Joi.string().max(255),
  last_name: Joi.string().max(255)
});

const userLoginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

const userUpdateSchema = Joi.object({
  email: Joi.string().email(),
  first_name: Joi.string().max(255),
  last_name: Joi.string().max(255),
  password: Joi.string().min(6)
}).min(1);

// Event schemas
const eventCreateSchema = Joi.object({
  title: Joi.string().max(255).required(),
  description: Joi.string().allow('', null),
  location: Joi.string().max(255).allow('', null),
  start_time: Joi.date().iso().required(),
  end_time: Joi.date().iso().min(Joi.ref('start_time')).required(),
  all_day: Joi.boolean().default(false),
  recurring: Joi.string().valid('none', 'daily', 'weekly', 'monthly', 'yearly').default('none'),
  attendees: Joi.array().items(Joi.number().integer()).default([]),
  reminders: Joi.array().items(
    Joi.object({
      remind_at: Joi.date().iso().required(),
      reminder_type: Joi.string().valid('notification', 'email').default('notification')
    })
  ).default([])
});

const eventUpdateSchema = Joi.object({
  title: Joi.string().max(255),
  description: Joi.string().allow('', null),
  location: Joi.string().max(255).allow('', null),
  start_time: Joi.date().iso(),
  end_time: Joi.date().iso(),
  all_day: Joi.boolean(),
  recurring: Joi.string().valid('none', 'daily', 'weekly', 'monthly', 'yearly'),
  attendees: Joi.array().items(Joi.number().integer()),
  reminders: Joi.array().items(
    Joi.object({
      id: Joi.number().integer(),
      remind_at: Joi.date().iso().required(),
      reminder_type: Joi.string().valid('notification', 'email').default('notification')
    })
  )
}).min(1);

// Attendee schemas
const attendeeUpdateSchema = Joi.object({
  status: Joi.string().valid('pending', 'accepted', 'declined', 'tentative').required()
});

module.exports = {
  userRegistrationSchema,
  userLoginSchema,
  userUpdateSchema,
  eventCreateSchema,
  eventUpdateSchema,
  attendeeUpdateSchema
};