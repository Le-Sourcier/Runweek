const express = require('express');
const router = express.Router();
const { setNutritionGoals, logMeal, getDailyStats, analyzeDiet, getRecommendations } = require('../../controllers/components/nutritionController');
const { authorize } = require("../../middlewares/authMiddleware");

/**
 * @openapi
 * tags:
 *   - name: Nutrition
 *     description: Endpoints for managing user nutrition data, goals, and AI-powered analysis/recommendations.
 */

/**
 * @openapi
 * /api/nutrition/goals:
 *   post:
 *     tags:
 *       - Nutrition
 *     summary: Set or update user nutrition goals
 *     description: Allows the authenticated user to set or update their daily nutrition goals (calories, protein, carbs, fat).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NutritionGoalsInput'
 *     responses:
 *       200:
 *         description: Nutrition goals updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Nutrition goals updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/NutritionGoals'
 *       400:
 *         description: Bad request (e.g., missing required fields).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error400'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error500'
 */
router.post('/goals', authorize, setNutritionGoals);

/**
 * @openapi
 * /api/nutrition/meals:
 *   post:
 *     tags:
 *       - Nutrition
 *     summary: Log a new meal entry
 *     description: Allows the authenticated user to log a new meal, including its type and a list of food items consumed.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MealEntryInput'
 *     responses:
 *       201:
 *         description: Meal logged successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Meal logged successfully"
 *                 data:
 *                   $ref: '#/components/schemas/MealEntry'
 *       400:
 *         description: Bad request (e.g., missing required fields, invalid food items).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error400'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error500'
 */
router.post('/meals', authorize, logMeal);

/**
 * @openapi
 * /api/nutrition/daily-stats:
 *   get:
 *     tags:
 *       - Nutrition
 *     summary: Get daily nutrition statistics
 *     description: Retrieves the daily nutrition statistics (total calories, protein, carbs, fat) for the authenticated user for a specific date or today.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Optional date in YYYY-MM-DD format to retrieve stats for a specific day. Defaults to today.
 *     responses:
 *       200:
 *         description: Daily stats retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Daily stats retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/DailyNutrition'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       404:
 *         description: No meals found for the specified date.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error500'
 */
router.get('/daily-stats', authorize, getDailyStats);

/**
 * @openapi
 * /api/nutrition/analyze:
 *   post:
 *     tags:
 *       - Nutrition
 *     summary: Get AI-powered diet analysis
 *     description: Generates an AI-powered analysis of the user's diet based on their nutrition goals and recent meal logs.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Diet analysis generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Diet analysis generated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/DietAnalysis'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       404:
 *         description: Nutrition goals or sufficient daily nutrition data not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error500'
 */
router.post('/analyze', authorize, analyzeDiet);

/**
 * @openapi
 * /api/nutrition/recommendations:
 *   get:
 *     tags:
 *       - Nutrition
 *     summary: Get AI-powered nutrition recommendations
 *     description: Generates AI-powered personalized nutrition recommendations and a sample meal plan based on the user's profile, goals, and recent consumption.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nutrition recommendations generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Nutrition recommendation generated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/NutritionRecommendation'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       404:
 *         description: User profile or nutrition goals not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error500'
 */
router.get('/recommendations', authorize, getRecommendations);

module.exports = router;