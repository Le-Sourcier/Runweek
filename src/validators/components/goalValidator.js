const Joi = require("joi");

// Schémas de validation avec messages personnalisés
const createGoalValidator = Joi.object({
  title: Joi.string().required().max(100).trim().messages({
    "string.empty": "TITLE_REQUIRED",
    "any.required": "TITLE_REQUIRED",
    "string.max": "TITLE_TOO_LONG",
  }),
  description: Joi.string().max(500).trim().allow("").messages({
    "string.max": "DESCRIPTION_TOO_LONG",
  }),
  category: Joi.string()
    .valid("distance", "speed", "consistency", "event", "other")
    .required()
    .messages({
      "any.only": "INVALID_CATEGORY",
      "any.required": "CATEGORY_REQUIRED",
    }),
  target: Joi.number().positive().required().messages({
    "number.base": "TARGET_MUST_BE_NUMBER",
    "number.positive": "TARGET_MUST_BE_POSITIVE",
    "any.required": "TARGET_REQUIRED",
  }),
  unit: Joi.string().required().trim().messages({
    "string.empty": "UNIT_REQUIRED",
    "any.required": "UNIT_REQUIRED",
  }),
  deadline: Joi.date().iso().greater("now").required().messages({
    "date.format": "INVALID_DEADLINE_FORMAT",
    "date.iso": "DEADLINE_MUST_BE_ISO",
    "date.greater": "DEADLINE_MUST_BE_FUTURE",
    "any.required": "DEADLINE_REQUIRED",
  }),
  priority: Joi.string()
    .valid("low", "medium", "high")
    .default("medium")
    .messages({
      "any.only": "INVALID_PRIORITY",
    }),
});

const updateGoalValidator = Joi.object({
  title: Joi.string().max(100).trim().messages({
    "string.empty": "TITLE_REQUIRED",
    "string.max": "TITLE_TOO_LONG",
  }),
  description: Joi.string().max(500).trim().allow("").messages({
    "string.max": "DESCRIPTION_TOO_LONG",
  }),
  category: Joi.string()
    .valid("distance", "speed", "consistency", "event", "other")
    .messages({
      "any.only": "INVALID_CATEGORY",
    }),
  target: Joi.number().positive().messages({
    "number.base": "TARGET_MUST_BE_NUMBER",
    "number.positive": "TARGET_MUST_BE_POSITIVE",
  }),
  current: Joi.number().min(0).messages({
    "number.base": "CURRENT_MUST_BE_NUMBER",
    "number.min": "CURRENT_TOO_LOW",
  }),
  unit: Joi.string().trim().messages({
    "string.empty": "UNIT_REQUIRED",
  }),
  deadline: Joi.date().iso().messages({
    "date.format": "INVALID_DEADLINE_FORMAT",
    "date.iso": "DEADLINE_MUST_BE_ISO",
  }),
  completed: Joi.boolean().messages({
    "boolean.base": "COMPLETED_MUST_BE_BOOLEAN",
  }),
  priority: Joi.string().valid("low", "medium", "high").messages({
    "any.only": "INVALID_PRIORITY",
  }),
});

const progressValidator = Joi.object({
  value: Joi.number().min(0).required().messages({
    "number.base": "VALUE_MUST_BE_NUMBER",
    "number.min": "VALUE_TOO_LOW",
    "any.required": "VALUE_REQUIRED",
  }),
  notes: Joi.string().max(200).trim().allow("").messages({
    "string.max": "NOTES_TOO_LONG",
  }),
});
module.exports = {
  createGoalValidator,
  updateGoalValidator,
  progressValidator,
};
