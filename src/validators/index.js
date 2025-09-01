const {
  registerAdminValidator,
  loginAdminValidator,
  userRegisterValidator,
  userAuthValidator,
} = require("./components/userValidators");

const {
  createPRValidator,
  updatePRValidator,
} = require("./components/persnalRecordValidator");

const {
  createFoodValidator,
  mealEntryValidator,
  nutritionGoalsValidator,
} = require("./components/nutritionValidator");
const {
  createEventSchema,
  updateEventSchema,
} = require("./components/calendarValidator");

module.exports = {
  // Admin and User Validator
  registerAdminValidator,
  loginAdminValidator,
  userRegisterValidator,
  userAuthValidator,
  // PR
  createPRValidator,
  updatePRValidator,
  // Food
  createFoodValidator,
  mealEntryValidator,
  nutritionGoalsValidator,

  // Calandar
  createEventSchema,
  updateEventSchema,
};
