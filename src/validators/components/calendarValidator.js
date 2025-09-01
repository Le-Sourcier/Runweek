// validators/calendarValidator.js
const Joi = require("joi");

const createEventSchema = Joi.object({
  title: Joi.string().max(100).required().messages({
    "string.empty": "TITLE_REQUIRED",
    "string.max": "TITLE_TOO_LONG",
    "any.required": "TITLE_REQUIRED",
  }),
  date: Joi.date().iso().min("now").required().messages({
    "date.format": "INVALID_DATE_FORMAT",
    "date.iso": "DATE_MUST_BE_ISO_FORMAT",
    "date.min": "DATE_CANNOT_BE_PAST",
    "any.required": "DATE_REQUIRED",
  }),
  time: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .messages({
      "string.pattern.base": "INVALID_TIME_FORMAT",
    }),
  type: Joi.string()
    .valid("Run", "Bike", "Swim", "Gym", "Other")
    .required()
    .messages({
      "any.only": "INVALID_ACTIVITY_TYPE",
      "any.required": "ACTIVITY_TYPE_REQUIRED",
    }),
  distance: Joi.number().min(0).max(1000).messages({
    "number.min": "DISTANCE_TOO_LOW",
    "number.max": "DISTANCE_TOO_HIGH",
  }),
  duration: Joi.string()
    .pattern(/^([0-9]{1,2}:)?[0-5][0-9]:[0-5][0-9]$/)
    .messages({
      "string.pattern.base": "INVALID_DURATION_FORMAT",
    }),
  location: Joi.string().max(200).messages({
    "string.max": "LOCATION_TOO_LONG",
  }),
  notes: Joi.string().max(500).messages({
    "string.max": "EVENT_NOTES_TOO_LONG",
  }),
});

const updateEventSchema = Joi.object({
  title: Joi.string().max(100).messages({
    "string.empty": "TITLE_REQUIRED",
    "string.max": "TITLE_TOO_LONG",
  }),
  date: Joi.date().iso().min("now").messages({
    "date.format": "INVALID_DATE_FORMAT",
    "date.iso": "DATE_MUST_BE_ISO_FORMAT",
    "date.min": "DATE_CANNOT_BE_PAST",
  }),
  time: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .messages({
      "string.pattern.base": "INVALID_TIME_FORMAT",
    }),
  type: Joi.string().valid("Run", "Bike", "Swim", "Gym", "Other").messages({
    "any.only": "INVALID_ACTIVITY_TYPE",
  }),
  distance: Joi.number().min(0).max(1000).messages({
    "number.min": "DISTANCE_TOO_LOW",
    "number.max": "DISTANCE_TOO_HIGH",
  }),
  duration: Joi.string()
    .pattern(/^([0-9]{1,2}:)?[0-5][0-9]:[0-5][0-9]$/)
    .messages({
      "string.pattern.base": "INVALID_DURATION_FORMAT",
    }),
  location: Joi.string().max(200).messages({
    "string.max": "LOCATION_TOO_LONG",
  }),
  notes: Joi.string().max(500).messages({
    "string.max": "EVENT_NOTES_TOO_LONG",
  }),
});

module.exports = {
  createEventSchema,
  updateEventSchema,
};
