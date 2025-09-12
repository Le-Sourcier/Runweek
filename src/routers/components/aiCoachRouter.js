const express = require("express");
const router = express.Router();
const ctr = require("./../../controllers/components/chatController");

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     BaseResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: boolean
 *           description: Indicates if an error occurred
 *           example: false
 *         status:
 *           type: integer
 *           description: HTTP status code
 *           example: 200
 *         message:
 *           type: string
 *           description: Response message key
 *           example: "SUCCESS"
 *
 *     ErrorResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               description: Empty data array for errors
 *               example: []
 *
 *     MessageCoachIA:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique message identifier
 *           example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *         type:
 *           type: string
 *           enum: [text, recommandation, conseil, advices]
 *           description: Message type
 *           example: "text"
 *         message:
 *           type: string
 *           description: Message content
 *           example: "Hello, how can I help you today?"
 *         sender:
 *           type: string
 *           enum: [bot, user]
 *           description: Message sender
 *           example: "bot"
 *         metadata:
 *           type: object
 *           description: Additional metadata associated with the message
 *           example:
 *             sentiment: "positive"
 *             confidence: 0.92
 *             category: "fitness"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Message creation timestamp
 *           example: "2023-12-01T10:30:00.000Z"
 *
 *     WorkoutSuggestion:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Interval Training"
 *         description:
 *           type: string
 *           example: "4x800m at fast pace with 400m recovery"
 *         type:
 *           type: string
 *           example: "cardio"
 *         duration:
 *           type: string
 *           example: "45 minutes"
 *         intensity:
 *           type: string
 *           example: "high"
 *         icon:
 *           type: string
 *           example: "⚡"
 *
 *     TrainingPlan:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "10K Preparation Plan"
 *         duration:
 *           type: string
 *           example: "8 weeks"
 *         level:
 *           type: string
 *           example: "intermediate"
 *         description:
 *           type: string
 *           example: "Progressive plan to prepare for a 10K race"
 *         goal:
 *           type: string
 *           example: "10K race"
 *         frequency:
 *           type: string
 *           example: "4 times/week"
 *         icon:
 *           type: string
 *           example: "🏃‍♂️"
 *
 *     NutritionTip:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Post-Run Nutrition"
 *         description:
 *           type: string
 *           example: "Consume protein and carbs within 30 minutes after your run"
 *         category:
 *           type: string
 *           example: "recovery"
 *         icon:
 *           type: string
 *           example: "💧"
 *
 *     MotivationMessage:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Great job on your 15km this week! 💪 You're making real progress toward your marathon goal."
 *
 *     # Response Schemas
 *     MessageResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseResponse'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/MessageCoachIA'
 *
 *     WorkoutsResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WorkoutSuggestion'
 *
 *     TrainingPlansResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 plans:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TrainingPlan'
 *
 *     NutritionResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 tips:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NutritionTip'
 *
 *     MotivationResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseResponse'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/MotivationMessage'
 *
 *     HistoryResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MessageCoachIA'
 *
 *     AllSuggestionsResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 motivation:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Keep up the great work! 🚀"
 *                 workouts:
 *                   type: object
 *                   properties:
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/WorkoutSuggestion'
 *                 plans:
 *                   type: object
 *                   properties:
 *                     plans:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TrainingPlan'
 *                 nutrition:
 *                   type: object
 *                   properties:
 *                     tips:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/NutritionTip'
 *
 *   parameters:
 *     FrequencyQueryParam:
 *       name: frequency
 *       in: query
 *       description: Frequency for suggestions (daily, weekly, monthly)
 *       required: false
 *       schema:
 *         type: string
 *         enum: [daily, weekly, monthly]
 *         default: daily
 *         example: daily
 *
 *   requestBodies:
 *     SendMessageRequest:
 *       description: Message to send to AI coach
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: User's question or message for the coach
 *                 example: "How can I improve my running pace for a 10K?"
 *
 *   responses:
 *     UnauthorizedError:
 *       description: Unauthorized access
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           examples:
 *             unauthorized:
 *               value:
 *                 error: true
 *                 status: 401
 *                 message: "UNAUTHORIZED_ACCESS"
 *                 data: []
 *
 *     BadRequestError:
 *       description: Bad request
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           examples:
 *             badRequest:
 *               value:
 *                 error: true
 *                 status: 400
 *                 message: "MESSAGE_TEXT_REQUIRED"
 *                 data: []
 *
 *     NotFoundError:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           examples:
 *             notFound:
 *               value:
 *                 error: true
 *                 status: 404
 *                 message: "NO_WORKOUTS_FOUND"
 *                 data: []
 *
 *     ServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           examples:
 *             serverError:
 *               value:
 *                 error: true
 *                 status: 500
 *                 message: "ERROR_SENDING_MESSAGE"
 *                 data: []
 */

/**
 * @openapi
 * /api/aicoach:
 *   post:
 *     tags:
 *       - AI Coach
 *     summary: Get advice from AI coach
 *     description: Send a message to the AI coach and receive a standardized response
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       $ref: '#/components/requestBodies/SendMessageRequest'
 *     responses:
 *       200:
 *         description: AI coach response in standardized format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *             examples:
 *               success:
 *                 value:
 *                   error: false
 *                   status: 200
 *                   message: "MESSAGE_SEND_SUCCESS"
 *                   data:
 *                     id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                     type: "text"
 *                     message: "To improve your 10K pace, try incorporating interval training..."
 *                     sender: "bot"
 *                     metadata:
 *                       sentiment: "positive"
 *                       confidence: 0.92
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/", ctr.sendMessage);

/**
 * @openapi
 * /api/aicoach/workouts:
 *   get:
 *     tags:
 *       - AI Coach
 *     summary: Get personalized workout suggestions
 *     description: Returns personalized workout suggestions based on user data and activities
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/FrequencyQueryParam'
 *     responses:
 *       200:
 *         description: Workout suggestions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkoutsResponse'
 *             examples:
 *               success:
 *                 value:
 *                   error: false
 *                   status: 200
 *                   message: "SUCCESS"
 *                   data:
 *                     suggestions:
 *                       - title: "Interval Training"
 *                         description: "4x800m at fast pace with 400m recovery"
 *                         type: "cardio"
 *                         duration: "45 minutes"
 *                         intensity: "high"
 *                         icon: "⚡"
 *       404:
 *         description: No workouts found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notFound:
 *                 value:
 *                   error: true
 *                   status: 404
 *                   message: "NO_WORKOUTS_FOUND"
 *                   data: []
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   error: true
 *                   status: 500
 *                   message: "ERROR_GETTING_WORKOUT"
 *                   data: []
 */
router.get("/workouts", ctr.getWorkoutSuggestions);

/**
 * @openapi
 * /api/aicoach/plans:
 *   get:
 *     tags:
 *       - AI Coach
 *     summary: Get personalized training plans
 *     description: Returns personalized training plans based on user goals and fitness level
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/FrequencyQueryParam'
 *     responses:
 *       200:
 *         description: Training plans retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrainingPlansResponse'
 *             examples:
 *               success:
 *                 value:
 *                   error: false
 *                   status: 200
 *                   message: "SUCCESS"
 *                   data:
 *                     plans:
 *                       - title: "10K Preparation Plan"
 *                         duration: "8 weeks"
 *                         level: "intermediate"
 *                         description: "Progressive plan to prepare for a 10K race"
 *                         goal: "10K race"
 *                         frequency: "4 times/week"
 *                         icon: "🏃‍♂️"
 *       404:
 *         description: No training plans found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notFound:
 *                 value:
 *                   error: true
 *                   status: 404
 *                   message: "NO_PLANTS_FOUND"
 *                   data: []
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   error: true
 *                   status: 500
 *                   message: "ERROR_GETTING_TRAINING_PLANT"
 *                   data: []
 */
router.get("/plans", ctr.getTrainingPlans);

/**
 * @openapi
 * /api/aicoach/nutrition:
 *   get:
 *     tags:
 *       - AI Coach
 *     summary: Get personalized nutrition tips
 *     description: Returns personalized nutrition advice based on user activities and goals
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/FrequencyQueryParam'
 *     responses:
 *       200:
 *         description: Nutrition tips retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NutritionResponse'
 *             examples:
 *               success:
 *                 value:
 *                   error: false
 *                   status: 200
 *                   message: "SUCCESS"
 *                   data:
 *                     tips:
 *                       - title: "Post-Run Nutrition"
 *                         description: "Consume protein and carbs within 30 minutes after your run"
 *                         category: "recovery"
 *                         icon: "💧"
 *       404:
 *         description: No nutrition tips found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notFound:
 *                 value:
 *                   error: true
 *                   status: 404
 *                   message: "NO_NUTRITION_FOUND"
 *                   data: []
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   error: true
 *                   status: 500
 *                   message: "GETTING_NUTRITION_FAILED"
 *                   data: []
 */
router.get("/nutrition", ctr.getNutritionTips);

/**
 * @openapi
 * /api/aicoach/motivation:
 *   get:
 *     tags:
 *       - AI Coach
 *     summary: Get personalized motivation message
 *     description: Returns a personalized motivational message based on user activities and progress
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/FrequencyQueryParam'
 *     responses:
 *       200:
 *         description: Motivation message retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MotivationResponse'
 *             examples:
 *               success:
 *                 value:
 *                   error: false
 *                   status: 200
 *                   message: "SUCCESS"
 *                   data:
 *                     message: "Great job on your 15km this week! 💪 You're making real progress toward your marathon goal."
 *       404:
 *         description: No motivation message found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notFound:
 *                 value:
 *                   error: true
 *                   status: 404
 *                   message: "NO_MOTIVATION_FOUND"
 *                   data: []
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   error: true
 *                   status: 500
 *                   message: "ERROR_GETTING_MOTIVATION"
 *                   data: []
 */
router.get("/motivation", ctr.getMotivation);

/**
 * @openapi
 * /api/aicoach/history:
 *   get:
 *     tags:
 *       - AI Coach
 *     summary: Get chat history with AI coach
 *     description: Returns the complete history of messages exchanged with the AI coach for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chat history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HistoryResponse'
 *             examples:
 *               success:
 *                 value:
 *                   error: false
 *                   status: 200
 *                   message: "MESSAGES_RETRIEVED"
 *                   data:
 *                     - id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                       type: "text"
 *                       message: "Hello, how can I help you today?"
 *                       sender: "bot"
 *                       metadata:
 *                         sentiment: "positive"
 *                       createdAt: "2023-12-01T10:30:00.000Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/history", ctr.getChatMessage);

/**
 * @openapi
 * /api/aicoach/all:
 *   get:
 *     tags:
 *       - AI Coach
 *     summary: Get all personalized suggestions
 *     description: Returns all types of personalized suggestions (motivation, workouts, plans, nutrition) in one request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/FrequencyQueryParam'
 *     responses:
 *       200:
 *         description: All suggestions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AllSuggestionsResponse'
 *             examples:
 *               success:
 *                 value:
 *                   error: false
 *                   status: 200
 *                   message: "SUCCESS"
 *                   data:
 *                     motivation:
 *                       message: "Keep up the great work! 🚀"
 *                     workouts:
 *                       suggestions:
 *                         - title: "Hill Repeats"
 *                           description: "6x400m hill repeats with jog back recovery"
 *                           type: "cardio"
 *                           duration: "30 minutes"
 *                           intensity: "high"
 *                           icon: "⛰️"
 *                     plans:
 *                       plans:
 *                         - title: "Marathon Builder"
 *                           duration: "16 weeks"
 *                           level: "advanced"
 *                           description: "Complete marathon training plan"
 *                           goal: "Marathon"
 *                           frequency: "5 times/week"
 *                           icon: "🏁"
 *                     nutrition:
 *                       tips:
 *                         - title: "Hydration Strategy"
 *                           description: "Drink 500ml water 2 hours before running"
 *                           category: "hydration"
 *                           icon: "💦"
 *       404:
 *         description: No suggestions found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notFound:
 *                 value:
 *                   error: true
 *                   status: 404
 *                   message: "NO_SUGGESTIONS_FOUND"
 *                   data: []
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   error: true
 *                   status: 500
 *                   message: "GETTTING_ALL_SUGGESTION_FAILED"
 *                   data: []
 */
router.get("/all", ctr.getAllSuggestions);

module.exports = router;
