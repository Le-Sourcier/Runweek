const Joi = require("joi");

const createPRValidator = Joi.object({
  distance: Joi.number().positive().required().messages({
    "number.base": "DISTANCE_MUST_BE_NUMBER",
    "number.positive": "DISTANCE_MUST_BE_POSITIVE",
    "any.required": "DISTANCE_REQUIRED",
  }),
  time: Joi.string()
    .pattern(/^([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{2}$/)
    .required()
    .messages({
      "string.pattern.base": "INVALID_TIME_FORMAT",
      "any.required": "TIME_REQUIRED",
    }),
  // date: Joi.date().iso().required().messages({
  //   "date.format": "INVALID_DATE_FORMAT",
  //   "date.iso": "DATE_MUST_BE_ISO_FORMAT",
  //   "any.required": "DATE_REQUIRED",
  // }),

  date: Joi.date()
    .iso()
    .custom((value, helpers) => {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Remettre à minuit pour ignorer l'heure

      const twoMonthsFromNow = new Date();
      twoMonthsFromNow.setMonth(now.getMonth() + 2);
      twoMonthsFromNow.setHours(23, 59, 59, 999); // Fin de journée

      // Vérifier que la date n'est pas dans le passé
      if (value < now) {
        return helpers.error("date.past");
      }

      // Vérifier que la date n'est pas plus de 2 mois dans le futur
      if (value > twoMonthsFromNow) {
        return helpers.error("date.tooFarFuture");
      }

      return value;
    })
    .messages({
      "date.format": "INVALID_DATE_FORMAT",
      "date.iso": "DATE_MUST_BE_ISO_FORMAT",
      "date.past": "DATE_CANNOT_BE_PAST",
      "date.tooFarFuture": "DATE_TOO_FAR_FUTURE",
      "any.required": "DATE_REQUIRED",
    }),
  notes: Joi.string().max(500).trim().allow("").messages({
    "string.max": "NOTES_TOO_LONG",
  }),
  location: Joi.string().max(100).trim().allow("").messages({
    "string.max": "LOCATION_TOO_LONG",
  }),
  weather: Joi.object({
    temperature: Joi.number().messages({
      "number.base": "TEMPERATURE_MUST_BE_NUMBER",
    }),
    conditions: Joi.string().messages({
      "string.base": "CONDITIONS_MUST_BE_STRING",
    }),
    humidity: Joi.number().min(0).max(100).messages({
      "number.base": "HUMIDITY_MUST_BE_NUMBER",
      "number.min": "HUMIDITY_TOO_LOW",
      "number.max": "HUMIDITY_TOO_HIGH",
    }),
    windSpeed: Joi.number().min(0).messages({
      "number.base": "WINDSPEED_MUST_BE_NUMBER",
      "number.min": "WINDSPEED_TOO_LOW",
    }),
  })
    .optional()
    .messages({
      "object.base": "WEATHER_MUST_BE_OBJECT",
    }),
  heartRate: Joi.object({
    average: Joi.number().min(40).max(220).messages({
      "number.base": "HR_AVG_MUST_BE_NUMBER",
      "number.min": "HR_AVG_TOO_LOW",
      "number.max": "HR_AVG_TOO_HIGH",
    }),
    max: Joi.number().min(40).max(220).messages({
      "number.base": "HR_MAX_MUST_BE_NUMBER",
      "number.min": "HR_MAX_TOO_LOW",
      "number.max": "HR_MAX_TOO_HIGH",
    }),
    min: Joi.number().min(40).max(220).messages({
      "number.base": "HR_MIN_MUST_BE_NUMBER",
      "number.min": "HR_MIN_TOO_LOW",
      "number.max": "HR_MIN_TOO_HIGH",
    }),
  })
    .optional()
    .messages({
      "object.base": "HEARTRATE_MUST_BE_OBJECT",
    }),
  elevation: Joi.object({
    gain: Joi.number().min(0).messages({
      "number.base": "ELEVATION_GAIN_MUST_BE_NUMBER",
      "number.min": "ELEVATION_GAIN_TOO_LOW",
    }),
    loss: Joi.number().min(0).messages({
      "number.base": "ELEVATION_LOSS_MUST_BE_NUMBER",
      "number.min": "ELEVATION_LOSS_TOO_LOW",
    }),
    maxAltitude: Joi.number().messages({
      "number.base": "MAX_ALTITUDE_MUST_BE_NUMBER",
    }),
  })
    .optional()
    .messages({
      "object.base": "ELEVATION_MUST_BE_OBJECT",
    }),
  splits: Joi.array()
    .items(
      Joi.object({
        distance: Joi.number().positive().messages({
          "number.base": "SPLIT_DISTANCE_MUST_BE_NUMBER",
          "number.positive": "SPLIT_DISTANCE_MUST_BE_POSITIVE",
        }),
        time: Joi.string().messages({
          "string.base": "SPLIT_TIME_MUST_BE_STRING",
        }),
        pace: Joi.string().messages({
          "string.base": "SPLIT_PACE_MUST_BE_STRING",
        }),
      }).messages({
        "object.base": "SPLIT_ITEM_MUST_BE_OBJECT",
      })
    )
    .optional()
    .messages({
      "array.base": "SPLITS_MUST_BE_ARRAY",
    }),
  tags: Joi.array()
    .items(
      Joi.string().messages({
        "string.base": "TAG_MUST_BE_STRING",
      })
    )
    .optional()
    .messages({
      "array.base": "TAGS_MUST_BE_ARRAY",
    }),
}).unknown(true);

const updatePRValidator = Joi.object({
  distance: Joi.number().positive().messages({
    "number.base": "DISTANCE_MUST_BE_NUMBER",
    "number.positive": "DISTANCE_MUST_BE_POSITIVE",
  }),
  time: Joi.string()
    .pattern(/^([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{2}$/)
    .messages({
      "string.pattern.base": "INVALID_TIME_FORMAT",
    }),
  // date: Joi.date().iso().messages({
  //   "date.format": "INVALID_DATE_FORMAT",
  //   "date.iso": "DATE_MUST_BE_ISO_FORMAT",
  // }),

  date: Joi.date()
    .iso()
    .custom((value, helpers) => {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Remettre à minuit pour ignorer l'heure

      const twoMonthsFromNow = new Date();
      twoMonthsFromNow.setMonth(now.getMonth() + 2);
      twoMonthsFromNow.setHours(23, 59, 59, 999); // Fin de journée

      // Vérifier que la date n'est pas dans le passé
      if (value < now) {
        return helpers.error("date.past");
      }

      // Vérifier que la date n'est pas plus de 2 mois dans le futur
      if (value > twoMonthsFromNow) {
        return helpers.error("date.tooFarFuture");
      }

      return value;
    })
    .required()
    .messages({
      "date.format": "INVALID_DATE_FORMAT",
      "date.iso": "DATE_MUST_BE_ISO_FORMAT",
      "date.past": "DATE_CANNOT_BE_PAST",
      "date.tooFarFuture": "DATE_TOO_FAR_FUTURE",
      "any.required": "DATE_REQUIRED",
    }),
  notes: Joi.string().max(500).trim().allow("").messages({
    "string.max": "NOTES_TOO_LONG",
  }),
  location: Joi.string().max(100).trim().allow("").messages({
    "string.max": "LOCATION_TOO_LONG",
  }),
  weather: Joi.object({
    temperature: Joi.number().messages({
      "number.base": "TEMPERATURE_MUST_BE_NUMBER",
    }),
    conditions: Joi.string().messages({
      "string.base": "CONDITIONS_MUST_BE_STRING",
    }),
    humidity: Joi.number().min(0).max(100).messages({
      "number.base": "HUMIDITY_MUST_BE_NUMBER",
      "number.min": "HUMIDITY_TOO_LOW",
      "number.max": "HUMIDITY_TOO_HIGH",
    }),
    windSpeed: Joi.number().min(0).messages({
      "number.base": "WINDSPEED_MUST_BE_NUMBER",
      "number.min": "WINDSPEED_TOO_LOW",
    }),
  })
    .optional()
    .messages({
      "object.base": "WEATHER_MUST_BE_OBJECT",
    }),
  heartRate: Joi.object({
    average: Joi.number().min(40).max(220).messages({
      "number.base": "HR_AVG_MUST_BE_NUMBER",
      "number.min": "HR_AVG_TOO_LOW",
      "number.max": "HR_AVG_TOO_HIGH",
    }),
    max: Joi.number().min(40).max(220).messages({
      "number.base": "HR_MAX_MUST_BE_NUMBER",
      "number.min": "HR_MAX_TOO_LOW",
      "number.max": "HR_MAX_TOO_HIGH",
    }),
    min: Joi.number().min(40).max(220).messages({
      "number.base": "HR_MIN_MUST_BE_NUMBER",
      "number.min": "HR_MIN_TOO_LOW",
      "number.max": "HR_MIN_TOO_HIGH",
    }),
  })
    .optional()
    .messages({
      "object.base": "HEARTRATE_MUST_BE_OBJECT",
    }),
  elevation: Joi.object({
    gain: Joi.number().min(0).messages({
      "number.base": "ELEVATION_GAIN_MUST_BE_NUMBER",
      "number.min": "ELEVATION_GAIN_TOO_LOW",
    }),
    loss: Joi.number().min(0).messages({
      "number.base": "ELEVATION_LOSS_MUST_BE_NUMBER",
      "number.min": "ELEVATION_LOSS_TOO_LOW",
    }),
    maxAltitude: Joi.number().messages({
      "number.base": "MAX_ALTITUDE_MUST_BE_NUMBER",
    }),
  })
    .optional()
    .messages({
      "object.base": "ELEVATION_MUST_BE_OBJECT",
    }),
  splits: Joi.array()
    .items(
      Joi.object({
        distance: Joi.number().positive().messages({
          "number.base": "SPLIT_DISTANCE_MUST_BE_NUMBER",
          "number.positive": "SPLIT_DISTANCE_MUST_BE_POSITIVE",
        }),
        time: Joi.string().messages({
          "string.base": "SPLIT_TIME_MUST_BE_STRING",
        }),
        pace: Joi.string().messages({
          "string.base": "SPLIT_PACE_MUST_BE_STRING",
        }),
      }).messages({
        "object.base": "SPLIT_ITEM_MUST_BE_OBJECT",
      })
    )
    .optional()
    .messages({
      "array.base": "SPLITS_MUST_BE_ARRAY",
    }),
  tags: Joi.array()
    .items(
      Joi.string().messages({
        "string.base": "TAG_MUST_BE_STRING",
      })
    )
    .optional()
    .messages({
      "array.base": "TAGS_MUST_BE_ARRAY",
    }),
}).unknown(true);

module.exports = {
  createPRValidator,
  updatePRValidator,
};
