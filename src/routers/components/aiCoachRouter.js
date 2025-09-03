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
 *   schemas:
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
 *
 *     SuggestionResponse:
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
 *         data:
 *           type: object
 *           description: Response data containing suggestions
 *           properties:
 *             suggestions:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     example: "Interval Training"
 *                   description:
 *                     type: string
 *                     example: "4x800m at fast pace with 400m recovery"
 *                   type:
 *                     type: string
 *                     example: "cardio"
 *                   duration:
 *                     type: string
 *                     example: "45 minutes"
 *                   intensity:
 *                     type: string
 *                     example: "high"
 *                   icon:
 *                     type: string
 *                     example: "⚡"
 *
 *     TrainingPlanResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: boolean
 *           example: false
 *         status:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: "SUCCESS"
 *         data:
 *           type: object
 *           properties:
 *             plans:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     example: "10K Preparation Plan"
 *                   duration:
 *                     type: string
 *                     example: "8 weeks"
 *                   level:
 *                     type: string
 *                     example: "intermediate"
 *                   description:
 *                     type: string
 *                     example: "Progressive plan to prepare for a 10K race"
 *                   goal:
 *                     type: string
 *                     example: "10K race"
 *                   frequency:
 *                     type: string
 *                     example: "4 times/week"
 *                   icon:
 *                     type: string
 *                     example: "🏃‍♂️"
 *
 *     NutritionResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: boolean
 *           example: false
 *         status:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: "SUCCESS"
 *         data:
 *           type: object
 *           properties:
 *             tips:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     example: "Post-Run Nutrition"
 *                   description:
 *                     type: string
 *                     example: "Consume protein and carbs within 30 minutes after your run"
 *                   category:
 *                     type: string
 *                     example: "recovery"
 *                   icon:
 *                     type: string
 *                     example: "💧"
 *
 *     MotivationResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: boolean
 *           example: false
 *         status:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: "SUCCESS"
 *         data:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Great job on your 15km this week! 💪 You're making real progress toward your marathon goal."
 *
 *     AllSuggestionsResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: boolean
 *           example: false
 *         status:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: "SUCCESS"
 *         data:
 *           type: object
 *           properties:
 *             motivation:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Keep up the great work! 🚀"
 *             workouts:
 *               type: object
 *               properties:
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "Hill Repeats"
 *                       description:
 *                         type: string
 *                         example: "6x400m hill repeats with jog back recovery"
 *             plans:
 *               type: object
 *               properties:
 *                 plans:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "Marathon Builder"
 *             nutrition:
 *               type: object
 *               properties:
 *                 tips:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "Hydration Strategy"
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
 *     responses:
 *       200:
 *         description: AI coach response in standardized format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "MESSAGE_SEND_SUCCESS"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                     type:
 *                       type: string
 *                       example: "text"
 *                     message:
 *                       type: string
 *                       example: "To improve your 10K pace, try incorporating interval training..."
 *                     sender:
 *                       type: string
 *                       example: "bot"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "MESSAGE_TEXT_REQUIRED"
 *                 data:
 *                   type: array
 *                   example: []
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "UNAUTHORIZED_ACCESS"
 *                 data:
 *                   type: array
 *                   example: []
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "ERROR_SENDING_MESSAGE"
 *                 data:
 *                   type: array
 *                   example: []
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
 *     responses:
 *       200:
 *         description: Workout suggestions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "SUCCESS"
 *                 data:
 *                   type: object
 *                   properties:
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             example: "Interval Training"
 *                           description:
 *                             type: string
 *                             example: "4x800m at fast pace with 400m recovery"
 *                           type:
 *                             type: string
 *                             example: "cardio"
 *                           duration:
 *                             type: string
 *                             example: "45 minutes"
 *                           intensity:
 *                             type: string
 *                             example: "high"
 *                           icon:
 *                             type: string
 *                             example: "⚡"
 *       404:
 *         description: No workouts found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "NO_WORKOUTS_FOUND"
 *                 data:
 *                   type: array
 *                   example: []
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "ERROR_GETTING_WORKOUT"
 *                 data:
 *                   type: array
 *                   example: []
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
 *     responses:
 *       200:
 *         description: Training plans retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "SUCCESS"
 *                 data:
 *                   type: object
 *                   properties:
 *                     plans:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             example: "10K Preparation Plan"
 *                           duration:
 *                             type: string
 *                             example: "8 weeks"
 *                           level:
 *                             type: string
 *                             example: "intermediate"
 *                           description:
 *                             type: string
 *                             example: "Progressive plan to prepare for a 10K race"
 *                           goal:
 *                             type: string
 *                             example: "10K race"
 *                           frequency:
 *                             type: string
 *                             example: "4 times/week"
 *                           icon:
 *                             type: string
 *                             example: "🏃‍♂️"
 *       404:
 *         description: No training plans found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "NO_PLANTS_FOUND"
 *                 data:
 *                   type: array
 *                   example: []
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "ERROR_GETTING_TRAINING_PLANT"
 *                 data:
 *                   type: array
 *                   example: []
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
 *     responses:
 *       200:
 *         description: Nutrition tips retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "SUCCESS"
 *                 data:
 *                   type: object
 *                   properties:
 *                     tips:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             example: "Post-Run Nutrition"
 *                           description:
 *                             type: string
 *                             example: "Consume protein and carbs within 30 minutes after your run"
 *                           category:
 *                             type: string
 *                             example: "recovery"
 *                           icon:
 *                             type: string
 *                             example: "💧"
 *       404:
 *         description: No nutrition tips found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "NO_NUTRITION_FOUND"
 *                 data:
 *                   type: array
 *                   example: []
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "GETTING_NUTRITION_FAILED"
 *                 data:
 *                   type: array
 *                   example: []
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
 *     responses:
 *       200:
 *         description: Motivation message retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "SUCCESS"
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Great job on your 15km this week! 💪 You're making real progress toward your marathon goal."
 *       404:
 *         description: No motivation message found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "NO_MOTIVATION_FOUND"
 *                 data:
 *                   type: array
 *                   example: []
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "ERROR_GETTING_MOTIVATION"
 *                 data:
 *                   type: array
 *                   example: []
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
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "MESSAGES_RETRIEVED"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                       type:
 *                         type: string
 *                         example: "text"
 *                       message:
 *                         type: string
 *                         example: "Hello, how can I help you today?"
 *                       sender:
 *                         type: string
 *                         example: "bot"
 *                       metadata:
 *                         type: object
 *                         example:
 *                           sentiment: "positive"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-12-01T10:30:00.000Z"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "UNAUTHORIZED_ACCESS"
 *                 data:
 *                   type: array
 *                   example: []
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "ERROR_RETRIEVING_MESSAGES"
 *                 data:
 *                   type: array
 *                   example: []
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
 *     responses:
 *       200:
 *         description: All suggestions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "SUCCESS"
 *                 data:
 *                   type: object
 *                   properties:
 *                     motivation:
 *                       type: object
 *                       properties:
 *                         message:
 *                           type: string
 *                           example: "Keep up the great work! 🚀"
 *                     workouts:
 *                       type: object
 *                       properties:
 *                         suggestions:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               title:
 *                                 type: string
 *                                 example: "Hill Repeats"
 *                               description:
 *                                 type: string
 *                                 example: "6x400m hill repeats with jog back recovery"
 *                     plans:
 *                       type: object
 *                       properties:
 *                         plans:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               title:
 *                                 type: string
 *                                 example: "Marathon Builder"
 *                     nutrition:
 *                       type: object
 *                       properties:
 *                         tips:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               title:
 *                                 type: string
 *                                 example: "Hydration Strategy"
 *       404:
 *         description: No suggestions found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "NO_SUGGESTIONS_FOUND"
 *                 data:
 *                   type: array
 *                   example: []
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "GETTTING_ALL_SUGGESTION_FAILED"
 *                 data:
 *                   type: array
 *                   example: []
 */
router.get("/all", ctr.getAllSuggestions);

module.exports = router;
