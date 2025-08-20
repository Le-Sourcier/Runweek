const router = require("express").Router();
const ctr = require("../../controllers/components/nutritionController");
const { authorize } = require("../../middlewares/authMiddleware");

/**
 * @openapi
 * tags:
 *   name: Nutrition
 *   description: Nutrition tracking and food management
 */
router
  /**
   * @openapi
   * /api/nutrition/foods/search:
   *   get:
   *     tags: [Nutrition]
   *     summary: Search foods
   *     description: Search for foods in the database with optional category filtering.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: q
   *         required: true
   *         schema:
   *           type: string
   *         description: Search query (minimum 2 characters)
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *           enum: [fruits, vegetables, grains, protein, dairy, fats, beverages, snacks, other, all]
   *         description: Filter by food category
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *         description: Maximum number of results to return
   *     responses:
   *       200:
   *         description: Foods found successfully
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
   *                   example: "Aliments trouvés avec succès"
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       _id:
   *                         type: string
   *                         format: uuid
   *                         example: "507f1f77bcf86cd799439011"
   *                       name:
   *                         type: string
   *                         example: "Apple"
   *                       calories:
   *                         type: number
   *                         example: 52
   *                       protein:
   *                         type: number
   *                         example: 0.3
   *                       carbs:
   *                         type: number
   *                         example: 14
   *                       fat:
   *                         type: number
   *                         example: 0.2
   *                       fiber:
   *                         type: number
   *                         example: 2.4
   *                       sugar:
   *                         type: number
   *                         example: 10
   *                       sodium:
   *                         type: number
   *                         example: 1
   *                       category:
   *                         type: string
   *                         example: "fruits"
   *                       brand:
   *                         type: string
   *                         example: ""
   *                       barcode:
   *                         type: string
   *                         example: ""
   *                       servingSize:
   *                         type: object
   *                         properties:
   *                           amount:
   *                             type: number
   *                             example: 100
   *                           unit:
   *                             type: string
   *                             example: "g"
   *                       isPublic:
   *                         type: boolean
   *                         example: true
   *                       isCustom:
   *                         type: boolean
   *                         example: false
   *                       createdBy:
   *                         type: string
   *                         format: uuid
   *                         example: "507f1f77bcf86cd799439012"
   *       400:
   *         description: Invalid search query
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "La requête de recherche doit contenir au moins 2 caractères"
   *       401:
   *         description: Unauthorized access
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "UNAUTHORIZED_ACCESS"
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Erreur lors de la recherche d'aliments"
   */

  .get("/foods/search", authorize, ctr.searchFoods) // GET /api/nutrition/foods/search - Search foods

  /**
   * @openapi
   * /api/nutrition/foods:
   *   post:
   *     tags: [Nutrition]
   *     summary: Create custom food
   *     description: Create a new custom food item in the database.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - calories
   *               - protein
   *               - carbs
   *               - fat
   *             properties:
   *               name:
   *                 type: string
   *                 maxLength: 100
   *                 example: "Homemade Protein Shake"
   *               calories:
   *                 type: number
   *                 minimum: 0
   *                 example: 250
   *               protein:
   *                 type: number
   *                 minimum: 0
   *                 example: 30
   *               carbs:
   *                 type: number
   *                 minimum: 0
   *                 example: 15
   *               fat:
   *                 type: number
   *                 minimum: 0
   *                 example: 8
   *               fiber:
   *                 type: number
   *                 minimum: 0
   *                 example: 5
   *               sugar:
   *                 type: number
   *                 minimum: 0
   *                 example: 10
   *               sodium:
   *                 type: number
   *                 minimum: 0
   *                 example: 150
   *               category:
   *                 type: string
   *                 enum: [fruits, vegetables, grains, protein, dairy, fats, beverages, snacks, other]
   *                 example: "beverages"
   *               brand:
   *                 type: string
   *                 example: "Homemade"
   *               barcode:
   *                 type: string
   *                 example: ""
   *               servingSize:
   *                 type: object
   *                 properties:
   *                   amount:
   *                     type: number
   *                     example: 250
   *                   unit:
   *                     type: string
   *                     example: "ml"
   *               isPublic:
   *                 type: boolean
   *                 example: false
   *     responses:
   *       200:
   *         description: Food created successfully
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
   *                   example: "FOOD_CREATED"
   *                 data:
   *                   type: object
   *                   properties:
   *                     _id:
   *                       type: string
   *                       format: uuid
   *                       example: "507f1f77bcf86cd799439011"
   *                     name:
   *                       type: string
   *                       example: "Homemade Protein Shake"
   *                     calories:
   *                       type: number
   *                       example: 250
   *                     protein:
   *                       type: number
   *                       example: 30
   *                     carbs:
   *                       type: number
   *                       example: 15
   *                     fat:
   *                       type: number
   *                       example: 8
   *                     isCustom:
   *                       type: boolean
   *                       example: true
   *                     createdBy:
   *                       type: string
   *                       format: uuid
   *                       example: "507f1f77bcf86cd799439012"
   *       400:
   *         description: Invalid food data
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "INVALID_FOOD_DATA"
   *       401:
   *         description: Unauthorized access
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "UNAUTHORIZED_ACCESS"
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "SERVER_ERROR"
   */
  .post("/foods", authorize, ctr.createFood) // POST /api/nutrition/foods - Create custom food

  /**
   * @openapi
   * /api/nutrition/daily/{date}:
   *   get:
   *     tags: [Nutrition]
   *     summary: Get daily nutrition
   *     description: Retrieve nutrition data for a specific date.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: date
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *           example: "2024-01-15"
   *         description: Date in YYYY-MM-DD format
   *     responses:
   *       200:
   *         description: Daily nutrition retrieved successfully
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
   *                   example: "SUCCESS"
   *                 data:
   *                   type: object
   *                   properties:
   *                     _id:
   *                       type: string
   *                       format: uuid
   *                       example: "507f1f77bcf86cd799439011"
   *                     user_id:
   *                       type: string
   *                       format: uuid
   *                       example: "507f1f77bcf86cd799439012"
   *                     date:
   *                       type: string
   *                       format: date
   *                       example: "2024-01-15"
   *                     waterIntake:
   *                       type: number
   *                       example: 2000
   *                     meals:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           _id:
   *                             type: string
   *                             format: uuid
   *                             example: "507f1f77bcf86cd799439013"
   *                           foodItem:
   *                             type: object
   *                             properties:
   *                               _id:
   *                                 type: string
   *                                 format: uuid
   *                                 example: "507f1f77bcf86cd799439014"
   *                               name:
   *                                 type: string
   *                                 example: "Chicken Breast"
   *                               calories:
   *                                 type: number
   *                                 example: 165
   *                               protein:
   *                                 type: number
   *                                 example: 31
   *                               carbs:
   *                                 type: number
   *                                 example: 0
   *                               fat:
   *                                 type: number
   *                                 example: 3.6
   *                           quantity:
   *                             type: number
   *                             example: 150
   *                           unit:
   *                             type: string
   *                             example: "g"
   *                           mealType:
   *                             type: string
   *                             example: "lunch"
   *                           timestamp:
   *                             type: string
   *                             format: date-time
   *                             example: "2024-01-15T12:30:00.000Z"
   *                     totalCalories:
   *                       type: number
   *                       example: 1850
   *                     totalProtein:
   *                       type: number
   *                       example: 120
   *                     totalCarbs:
   *                       type: number
   *                       example: 200
   *                     totalFat:
   *                       type: number
   *                       example: 65
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T12:30:00.000Z"
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T20:45:00.000Z"
   *       400:
   *         description: Invalid date format
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "INVALID_DATE_FORMAT"
   *       404:
   *         description: No nutrition data found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "NO_NUTRITION_DATA"
   *       401:
   *         description: Unauthorized access
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "UNAUTHORIZED_ACCESS"
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "SERVER_ERROR"
   */
  .get("/daily/:date", authorize, ctr.getDailyNutrition) // GET /api/nutrition/daily/:date - Get daily nutrition

  /**
   * @openapi
   * /api/nutrition/daily/{date}/meals:
   *   post:
   *     tags: [Nutrition]
   *     summary: Add meal
   *     description: Add a meal to the daily nutrition log.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: date
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *           example: "2024-01-15"
   *         description: Date in YYYY-MM-DD format
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - foodItem_id
   *               - quantity
   *               - unit
   *               - mealType
   *             properties:
   *               foodItem_id:
   *                 type: string
   *                 format: uuid
   *                 example: "507f1f77bcf86cd799439011"
   *               quantity:
   *                 type: number
   *                 minimum: 0.1
   *                 example: 150
   *               unit:
   *                 type: string
   *                 enum: [g, portion, ml, cup, tbsp, tsp]
   *                 example: "g"
   *               mealType:
   *                 type: string
   *                 enum: [breakfast, lunch, dinner, snack]
   *                 example: "lunch"
   *               timestamp:
   *                 type: string
   *                 format: date-time
   *                 example: "2024-01-15T12:30:00.000Z"
   *     responses:
   *       200:
   *         description: Meal added successfully
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
   *                   example: "MEAL_ADDED"
   *                 data:
   *                   $ref: '#/components/schemas/DailyNutrition'
   *       400:
   *         description: Invalid meal data or date format
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   oneOf:
   *                     - example: "INVALID_MEAL_DATA"
   *                     - example: "INVALID_DATE_FORMAT"
   *       404:
   *         description: Food not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "FOOD_NOT_FOUND"
   *       401:
   *         description: Unauthorized access
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "UNAUTHORIZED_ACCESS"
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "SERVER_ERROR"
   */
  .post("/daily/:date/meals", authorize, ctr.addMeal) // POST /api/nutrition/daily/:date/meals - Add meal

  /**
   * @openapi
   * /api/nutrition/daily/{date}/meals/{meal_id}:
   *   delete:
   *     tags: [Nutrition]
   *     summary: Delete meal
   *     description: Delete a meal from the daily nutrition log.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: date
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *           example: "2024-01-15"
   *         description: Date in YYYY-MM-DD format
   *       - in: path
   *         name: meal_id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID of the meal to delete
   *     responses:
   *       200:
   *         description: Meal deleted successfully
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
   *                   example: "MEAL_DELETED"
   *                 data:
   *                   $ref: '#/components/schemas/DailyNutrition'
   *       404:
   *         description: No nutrition data found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "NO_NUTRITION_DATA"
   *       401:
   *         description: Unauthorized access
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "UNAUTHORIZED_ACCESS"
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "SERVER_ERROR"
   */
  .delete("/daily/:date/meals/:meal_id", authorize, ctr.deleteMeal) // DELETE /api/nutrition/daily/:date/meals/:meal_id - Delete meal

  /**
   * @openapi
   * /api/nutrition/daily/{date}/water:
   *   put:
   *     tags: [Nutrition]
   *     summary: Update water intake
   *     description: Update the water intake for a specific date.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: date
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *           example: "2024-01-15"
   *         description: Date in YYYY-MM-DD format
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - waterIntake
   *             properties:
   *               waterIntake:
   *                 type: number
   *                 minimum: 0
   *                 example: 2500
   *     responses:
   *       200:
   *         description: Water intake updated successfully
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
   *                   example: "WATER_UPDATED"
   *                 data:
   *                   $ref: '#/components/schemas/DailyNutrition'
   *       400:
   *         description: Invalid water intake or date format
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   oneOf:
   *                     - example: "INVALID_WATER_INTAKE"
   *                     - example: "INVALID_DATE_FORMAT"
   *       401:
   *         description: Unauthorized access
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "UNAUTHORIZED_ACCESS"
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "SERVER_ERROR"
   */
  .put("/daily/:date/water", authorize, ctr.updateWaterIntake) // PUT /api/nutrition/daily/:date/water - Update water intake

  /**
   * @openapi
   * /api/nutrition/goals:
   *   get:
   *     tags: [Nutrition]
   *     summary: Get nutrition goals
   *     description: Retrieve the user's nutrition goals.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Nutrition goals retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               oneOf:
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: boolean
   *                       example: false
   *                     message:
   *                       type: string
   *                       example: "SUCCESS"
   *                     data:
   *                       type: object
   *                       properties:
   *                         _id:
   *                           type: string
   *                           format: uuid
   *                           example: "507f1f77bcf86cd799439011"
   *                         user_id:
   *                           type: string
   *                           format: uuid
   *                           example: "507f1f77bcf86cd799439012"
   *                         dailyCalories:
   *                           type: number
   *                           example: 2200
   *                         dailyProtein:
   *                           type: number
   *                           example: 120
   *                         dailyCarbs:
   *                           type: number
   *                           example: 275
   *                         dailyFat:
   *                           type: number
   *                           example: 75
   *                         dailyWater:
   *                           type: number
   *                           example: 2500
   *                         activityLevel:
   *                           type: string
   *                           enum: [sedentary, light, moderate, active, very_active]
   *                           example: "moderate"
   *                         goal:
   *                           type: string
   *                           enum: [maintain, lose_weight, gain_weight, build_muscle, improve_performance]
   *                           example: "maintain"
   *                         createdAt:
   *                           type: string
   *                           format: date-time
   *                           example: "2024-01-15T10:30:00.000Z"
   *                         updatedAt:
   *                           type: string
   *                           format: date-time
   *                           example: "2024-01-15T10:30:00.000Z"
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: boolean
   *                       example: false
   *                     message:
   *                       type: string
   *                       example: "DEFAULT_GOALS_RECOVER"
   *                     data:
   *                       type: object
   *                       properties:
   *                         dailyCalories:
   *                           type: number
   *                           example: 2200
   *                         dailyProtein:
   *                           type: number
   *                           example: 120
   *                         dailyCarbs:
   *                           type: number
   *                           example: 275
   *                         dailyFat:
   *                           type: number
   *                           example: 75
   *                         dailyWater:
   *                           type: number
   *                           example: 2500
   *                         activityLevel:
   *                           type: string
   *                           example: "moderate"
   *                         goal:
   *                           type: string
   *                           example: "maintain"
   *       401:
   *         description: Unauthorized access
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "UNAUTHORIZED_ACCESS"
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "SERVER_ERROR"
   */
  .get("/goals", authorize, ctr.getNutritionGoals)
  /**
   * @openapi
   * /api/nutrition/goals:
   *   put:
   *     tags: [Nutrition]
   *     summary: Update nutrition goals
   *     description: Update the user's nutrition goals.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - dailyCalories
   *               - dailyProtein
   *               - dailyCarbs
   *               - dailyFat
   *               - dailyWater
   *             properties:
   *               dailyCalories:
   *                 type: number
   *                 minimum: 1000
   *                 maximum: 5000
   *                 example: 2200
   *               dailyProtein:
   *                 type: number
   *                 minimum: 20
   *                 maximum: 300
   *                 example: 120
   *               dailyCarbs:
   *                 type: number
   *                 minimum: 50
   *                 maximum: 500
   *                 example: 275
   *               dailyFat:
   *                 type: number
   *                 minimum: 20
   *                 maximum: 200
   *                 example: 75
   *               dailyWater:
   *                 type: number
   *                 minimum: 1000
   *                 maximum: 5000
   *                 example: 2500
   *               activityLevel:
   *                 type: string
   *                 enum: [sedentary, light, moderate, active, very_active]
   *                 example: "moderate"
   *               goal:
   *                 type: string
   *                 enum: [maintain, lose_weight, gain_weight, build_muscle, improve_performance]
   *                 example: "maintain"
   *     responses:
   *       200:
   *         description: Nutrition goals updated successfully
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
   *                   example: "SUCCESS"
   *                 data:
   *                   $ref: '#/components/schemas/NutritionGoals'
   *       400:
   *         description: Invalid nutrition goals
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "INVALID_NUTRITION_GOALS"
   *       401:
   *         description: Unauthorized access
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "UNAUTHORIZED_ACCESS"
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "SERVER_ERROR"
   */
  .put("/goals", authorize, ctr.updateNutritionGoals) // PUT /api/nutrition/goals - Update nutrition goals

  /**
   * @openapi
   * /api/nutrition/analysis/{date}:
   *   get:
   *     tags: [Nutrition]
   *     summary: Get nutrition analysis
   *     description: Get a detailed nutritional analysis for a specific date.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: date
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *           example: "2024-01-15"
   *         description: Date in YYYY-MM-DD format
   *     responses:
   *       200:
   *         description: Nutrition analysis retrieved successfully
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
   *                   example: "SUCCESS"
   *                 data:
   *                   type: object
   *                   properties:
   *                     overallScore:
   *                       type: integer
   *                       minimum: 0
   *                       maximum: 100
   *                       example: 85
   *                     recommendations:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           type:
   *                             type: string
   *                             enum: [warning, improvement, success]
   *                             example: "improvement"
   *                           title:
   *                             type: string
   *                             example: "Augmentez votre apport en protéines"
   *                           description:
   *                             type: string
   *                             example: "Actuel: 80g, Objectif: 120g"
   *                           priority:
   *                             type: string
   *                             enum: [high, medium, low]
   *                             example: "high"
   *                           category:
   *                             type: string
   *                             example: "protein"
   *                     strengths:
   *                       type: array
   *                       items:
   *                         type: string
   *                       example: ["Excellent apport en protéines", "Excellente hydratation"]
   *                     areasForImprovement:
   *                       type: array
   *                       items:
   *                         type: string
   *                       example: ["Augmenter l'apport calorique", "Diversifier les aliments"]
   *                     weeklyTrend:
   *                       type: string
   *                       enum: [improving, declining, stable]
   *                       example: "stable"
   *       404:
   *         description: No nutrition data found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "NO_NUTRITION_DATA"
   *                 data:
   *                   type: object
   *                   properties:
   *                     message:
   *                       type: string
   *                       example: "Aucune donnée nutritionnelle pour cette date"
   *                     data:
   *                       type: object
   *                       properties:
   *                         overallScore:
   *                           type: integer
   *                           example: 0
   *                         recommendations:
   *                           type: array
   *                           items: []
   *                         strengths:
   *                           type: array
   *                           items: []
   *                         areasForImprovement:
   *                           type: array
   *                           items:
   *                             - type: string
   *                               example: "Commencez à enregistrer vos repas"
   *                         weeklyTrend:
   *                           type: string
   *                           example: "stable"
   *       401:
   *         description: Unauthorized access
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "UNAUTHORIZED_ACCESS"
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "SERVER_ERROR"
   */
  .get("/analysis/:date", authorize, ctr.getNutritionAnalysis) // GET /api/nutrition/analysis/:date - Get nutrition analysis for a specific date

  /**
   * @openapi
   * /api/nutrition/weekly:
   *   get:
   *     tags: [Nutrition]
   *     summary: Get weekly nutrition
   *     description: Retrieve nutrition data for the past 7 days.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Weekly nutrition retrieved successfully
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
   *                   example: "SUCCESS"
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/DailyNutrition'
   *       401:
   *         description: Unauthorized access
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "UNAUTHORIZED_ACCESS"
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "SERVER_ERROR"
   */
  .get("/weekly", authorize, ctr.getWeeklyNutrition) // GET /api/nutrition/weekly - Get weekly nutrition data

  /**
   * @openapi
   * /api/nutrition/stats:
   *   get:
   *     tags: [Nutrition]
   *     summary: Get nutrition statistics
   *     description: Retrieve nutrition statistics for the past 30 days.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Nutrition statistics retrieved successfully
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
   *                   example: "SUCCESS"
   *                 data:
   *                   type: object
   *                   properties:
   *                     avgCalories:
   *                       type: number
   *                       example: 2100
   *                     avgProtein:
   *                       type: number
   *                       example: 110
   *                     avgWater:
   *                       type: number
   *                       example: 2300
   *                     totalMeals:
   *                       type: integer
   *                       example: 84
   *                     daysLogged:
   *                       type: integer
   *                       example: 28
   *                     maxCalories:
   *                       type: number
   *                       example: 2800
   *                     minCalories:
   *                       type: number
   *                       example: 1800
   *                     streakDays:
   *                       type: integer
   *                       example: 7
   *       401:
   *         description: Unauthorized access
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "UNAUTHORIZED_ACCESS"
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "SERVER_ERROR"
   */
  .get("/stats", authorize, ctr.getNutritionStats); // GET /api/nutrition/stats - Get nutrition statistics

module.exports = router;
