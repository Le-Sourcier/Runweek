const Joi = require("joi");
const { serverMessage } = require("../../utils");

const userRegisterValidator = async (req, res, next) => {
  const passwordPattern = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
  );

  try {
    await Joi.object({
      email: Joi.string().email().required().messages({
        "string.email": "INVALID_EMAIL_FORMAT",
        "any.required": "MISSING_EMAIL",
      }),
      password: Joi.string().pattern(passwordPattern).required().messages({
        "string.pattern.base":
          "PASSWORD_MUST_INCLUDE_UPPERCASE_LOWERCASE_NUMBER_SPECIAL_CHAR",
        "any.required": "PASSWORD_REQUIRED",
      }),
      fname: Joi.string().required().messages({
        "any.required": "FIRST_NAME_REQUIRED",
      }),

      lname: Joi.string().required().messages({
        "any.required": "LAST_NAME_REQUIRED",
      }),
      phone: Joi.number().positive().optional().messages({
        "number.base": "PHONE_NUMBER_INVALID",
      }),
    })
      .unknown(true) // Disallow extra fields
      .validateAsync(req.body);

    return next(); // Proceed if validation passes
  } catch (error) {
    console.error("Validation error:", error.message);
    return serverMessage(
      res,
      `${error.details ? error.details.map((d) => d.message) : error.message}`
    );
  }
};
const userAuthValidator = async (req, res, next) => {
  try {
    await Joi.object({
      email: Joi.string().email().required().messages({
        "string.email": "INVALID_EMAIL_FORMAT",
        "any.required": "MISSING_EMAIL",
      }),
      password: Joi.string().required().messages({
        "any.required": "PASSWORD_REQUIRED",
      }),
    })
      .unknown(true) // Disallow extra fields
      .validateAsync(req.body);

    return next(); // Proceed if validation passes
  } catch (error) {
    console.error("Validation error:", error.message);
    return serverMessage(
      res,
      `${error.details ? error.details.map((d) => d.message) : error.message}`
    );
  }
};

module.exports = {
  userRegisterValidator,
  userAuthValidator,
};
