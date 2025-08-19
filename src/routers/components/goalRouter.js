// routers/components/goalRouter.js
const express = require("express");
const router = express.Router();
const goalController = require("../../controllers/components/goalController");
const { authorize } = require("../../middlewares/authMiddleware");

/**
 * @openapi
 * tags:
 *   - name: Goals
 *     description: Endpoints for managing user goals.
 */

/**
 * @openapi
 * /api/goals:
 *   post:
 *     tags:
 *       - Goals
 *     summary: Create a new goal
 *     description: Allows an authenticated user to create a new goal.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoalInput'
 *     responses:
 *       201:
 *         description: Goal created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: boolean, example: false }
 *                 message: { type: string, example: "Objectif créé avec succès." }
 *                 data: { $ref: '#/components/schemas/Goal' }
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
router.post("/", authorize, goalController.createGoal);

/**
 * @openapi
 * /api/goals:
 *   get:
 *     tags:
 *       - Goals
 *     summary: Get all goals for the authenticated user
 *     description: Retrieves a list of all goals for the authenticated user. Can be filtered by status.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, suggested, archived]
 *         description: Filter goals by their status.
 *     responses:
 *       200:
 *         description: A list of goals.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: boolean, example: false }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Goal'
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
router.get("/", authorize, goalController.getGoals);

/**
 * @openapi
 * /api/goals/active:
 *   get:
 *     tags:
 *       - Goals
 *     summary: Get active goals for the authenticated user
 *     description: Retrieves a list of active goals for the authenticated user.
 *     security: 
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of active goals.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: boolean, example: false }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Goal'
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
router.get("/active", authorize, goalController.getActiveGoals);

/**
 * @openapi
 * /api/goals/completed:
 *   get:
 *     tags:
 *       - Goals
 *     summary: Get completed goals for the authenticated user
 *     description: Retrieves a list of completed goals for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of completed goals.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: boolean, example: false }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Goal'
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
router.get("/completed", authorize, goalController.getCompletedGoals);

/**
 * @openapi
 * /api/goals/suggested:
 *   get:
 *     tags:
 *       - Goals
 *     summary: Get suggested goals for the authenticated user
 *     description: Retrieves a list of suggested goals for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of suggested goals.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: boolean, example: false }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Goal'
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
router.get("/suggested", authorize, goalController.getSuggestedGoals);

/**
 * @openapi
 * /api/goals/{id}:
 *   get:
 *     tags:
 *       - Goals
 *     summary: Get a goal by ID
 *     description: Retrieves a single goal by its ID for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the goal to retrieve.
 *     responses:
 *       200:
 *         description: A single goal object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: boolean, example: false }
 *                 data: { $ref: '#/components/schemas/Goal' }
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       404:
 *         description: Goal not found.
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
router.get("/:id", authorize, goalController.getGoalById);

/**
 * @openapi
 * /api/goals/{id}:
 *   put:
 *     tags:
 *       - Goals
 *     summary: Update a goal by ID
 *     description: Updates an existing goal by its ID for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the goal to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoalInput'
 *     responses:
 *       200:
 *         description: Goal updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: boolean, example: false }
 *                 message: { type: string, example: "Objectif mis à jour avec succès." }
 *                 data: { $ref: '#/components/schemas/Goal' }
 *       400:
 *         description: Bad request.
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
 *       404:
 *         description: Goal not found.
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
router.put("/:id", authorize, goalController.updateGoal);

/**
 * @openapi
 * /api/goals/{id}:
 *   delete:
 *     tags:
 *       - Goals
 *     summary: Delete a goal by ID
 *     description: Deletes an existing goal by its ID for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the goal to delete.
 *     responses:
 *       200:
 *         description: Goal deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: boolean, example: false }
 *                 message: { type: string, example: "Objectif supprimé avec succès." }
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       404:
 *         description: Goal not found.
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
router.delete("/:id", authorize, goalController.deleteGoal);

module.exports = router;
