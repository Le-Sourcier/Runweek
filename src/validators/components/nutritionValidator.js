const Joi = require("joi");
const createFoodValidator = Joi.object({
  name: Joi.string().required().trim().max(100).messages({
    "string.empty": "FOOD_NAME_REQUIRED",
    "any.required": "FOOD_NAME_REQUIRED",
    "string.max": "FOOD_NAME_TOO_LONG",
  }),
  calories: Joi.number().min(0).required().messages({
    "number.base": "CALORIES_MUST_BE_NUMBER",
    "number.min": "CALORIES_TOO_LOW",
    "any.required": "CALORIES_REQUIRED",
  }),
  protein: Joi.number().min(0).required().messages({
    "number.base": "PROTEIN_MUST_BE_NUMBER",
    "number.min": "PROTEIN_TOO_LOW",
    "any.required": "PROTEIN_REQUIRED",
  }),
  carbs: Joi.number().min(0).required().messages({
    "number.base": "CARBS_MUST_BE_NUMBER",
    "number.min": "CARBS_TOO_LOW",
    "any.required": "CARBS_REQUIRED",
  }),
  fat: Joi.number().min(0).required().messages({
    "number.base": "FAT_MUST_BE_NUMBER",
    "number.min": "FAT_TOO_LOW",
    "any.required": "FAT_REQUIRED",
  }),
  fiber: Joi.number().min(0).default(0).messages({
    "number.base": "FIBER_MUST_BE_NUMBER",
    "number.min": "FIBER_TOO_LOW",
  }),
  sugar: Joi.number().min(0).default(0).messages({
    "number.base": "SUGAR_MUST_BE_NUMBER",
    "number.min": "SUGAR_TOO_LOW",
  }),
  sodium: Joi.number().min(0).default(0).messages({
    "number.base": "SODIUM_MUST_BE_NUMBER",
    "number.min": "SODIUM_TOO_LOW",
  }),
  category: Joi.string()
    .valid(
      "fruits",
      "vegetables",
      "grains",
      "protein",
      "dairy",
      "fats",
      "beverages",
      "snacks",
      "other"
    )
    .default("other")
    .messages({
      "string.base": "CATEGORY_MUST_BE_STRING",
      "any.only": "INVALID_CATEGORY",
    }),
  brand: Joi.string().trim().allow("").messages({
    "string.base": "BRAND_MUST_BE_STRING",
  }),
  barcode: Joi.string().trim().allow("").messages({
    "string.base": "BARCODE_MUST_BE_STRING",
  }),
  servingSize: Joi.object({
    amount: Joi.number().positive().messages({
      "number.base": "SERVING_AMOUNT_MUST_BE_NUMBER",
      "number.positive": "SERVING_AMOUNT_MUST_BE_POSITIVE",
    }),
    unit: Joi.string().messages({
      "string.base": "SERVING_UNIT_MUST_BE_STRING",
    }),
  })
    .optional()
    .messages({
      "object.base": "SERVING_SIZE_MUST_BE_OBJECT",
    }),
  isPublic: Joi.boolean().default(false).messages({
    "boolean.base": "IS_PUBLIC_MUST_BE_BOOLEAN",
  }),
}).unknown(true);

const mealEntryValidator = Joi.object({
  foodItem_id: Joi.string().required().messages({
    "string.empty": "FOOD_ITEM_ID_REQUIRED",
    "any.required": "FOOD_ITEM_ID_REQUIRED",
  }),
  quantity: Joi.number().positive().required().messages({
    "number.base": "QUANTITY_MUST_BE_NUMBER",
    "number.positive": "QUANTITY_MUST_BE_POSITIVE",
    "any.required": "QUANTITY_REQUIRED",
  }),
  unit: Joi.string()
    .valid("g", "portion", "ml", "cup", "tbsp", "tsp")
    .required()
    .messages({
      "string.empty": "UNIT_REQUIRED",
      "any.required": "UNIT_REQUIRED",
      "any.only": "INVALID_UNIT",
    }),
  mealType: Joi.string()
    .valid("breakfast", "lunch", "dinner", "snack")
    .required()
    .messages({
      "string.empty": "MEAL_TYPE_REQUIRED",
      "any.required": "MEAL_TYPE_REQUIRED",
      "any.only": "INVALID_MEAL_TYPE",
    }),
  timestamp: Joi.date().iso().default(Date.now).messages({
    "date.format": "INVALID_TIMESTAMP_FORMAT",
    "date.iso": "TIMESTAMP_MUST_BE_ISO_FORMAT",
  }),
}).unknown(true);

const nutritionGoalsValidator = Joi.object({
  dailyCalories: Joi.number().min(1000).max(5000).required().messages({
    "number.base": "CALORIES_MUST_BE_NUMBER",
    "number.min": "CALORIES_TOO_LOW",
    "number.max": "CALORIES_TOO_HIGH",
    "any.required": "CALORIES_REQUIRED",
  }),
  dailyProtein: Joi.number().min(20).max(300).required().messages({
    "number.base": "PROTEIN_MUST_BE_NUMBER",
    "number.min": "PROTEIN_TOO_LOW",
    "number.max": "PROTEIN_TOO_HIGH",
    "any.required": "PROTEIN_REQUIRED",
  }),
  dailyCarbs: Joi.number().min(50).max(500).required().messages({
    "number.base": "CARBS_MUST_BE_NUMBER",
    "number.min": "CARBS_TOO_LOW",
    "number.max": "CARBS_TOO_HIGH",
    "any.required": "CARBS_REQUIRED",
  }),
  dailyFat: Joi.number().min(20).max(200).required().messages({
    "number.base": "FAT_MUST_BE_NUMBER",
    "number.min": "FAT_TOO_LOW",
    "number.max": "FAT_TOO_HIGH",
    "any.required": "FAT_REQUIRED",
  }),
  dailyWater: Joi.number().min(1000).max(5000).required().messages({
    "number.base": "WATER_MUST_BE_NUMBER",
    "number.min": "WATER_TOO_LOW",
    "number.max": "WATER_TOO_HIGH",
    "any.required": "WATER_REQUIRED",
  }),
  activityLevel: Joi.string()
    .valid("sedentary", "light", "moderate", "active", "very_active")
    .default("moderate")
    .messages({
      "string.base": "ACTIVITY_LEVEL_MUST_BE_STRING",
      "any.only": "INVALID_ACTIVITY_LEVEL",
    }),
  goal: Joi.string()
    .valid(
      "maintain",
      "lose_weight",
      "gain_weight",
      "build_muscle",
      "improve_performance"
    )
    .default("maintain")
    .messages({
      "string.base": "GOAL_MUST_BE_STRING",
      "any.only": "INVALID_GOAL",
    }),
}).unknown(true);

module.exports = {
  createFoodValidator,
  mealEntryValidator,
  nutritionGoalsValidator,
};
