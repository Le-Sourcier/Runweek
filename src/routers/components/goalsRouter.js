const express = require("express");
const router = express.Router();
const goalsController = require("../../controllers/components/goalsController");
const { authorize } = require("../../middlewares/authMiddleware");

/**
 * @openapi
 * tags:
 *   name: Goals
 *   description: User goals management and tracking
 */
router
  /**
   * @openapi
   * /api/goals:
   *   get:
   *     tags: [Goals]
   *     summary: Get all user goals
   *     description: Retrieves all active goals for the authenticated user with optional filtering and sorting.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: completed
   *         schema:
   *           type: boolean
   *         description: Filter goals by completion status (true/false)
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *           enum: [distance, speed, consistency, event, other, all]
   *         description: Filter goals by category. Use "all" or omit for all categories.
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *           enum: [deadline, created, progress, priority]
   *           default: deadline
   *         description: Field to sort goals by.
   *     responses:
   *       200:
   *         description: Goals retrieved successfully
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
   *                   example: GOALS_RETRIEVED
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         format: uuid
   *                         example: "507f1f77bcf86cd799439011"
   *                       user_id:
   *                         type: string
   *                         format: uuid
   *                         example: "507f1f77bcf86cd799439012"
   *                       title:
   *                         type: string
   *                         example: "Run a marathon"
   *                       description:
   *                         type: string
   *                         nullable: true
   *                         example: "Complete a full marathon race"
   *                       category:
   *                         type: string
   *                         enum: [distance, speed, consistency, event, other]
   *                         example: "distance"
   *                       target:
   *                         type: number
   *                         example: 42.2
   *                       current:
   *                         type: number
   *                         example: 25.5
   *                       unit:
   *                         type: string
   *                         example: "km"
   *                       deadline:
   *                         type: string
   *                         format: date
   *                         example: "2024-12-31"
   *                       completed:
   *                         type: boolean
   *                         example: false
   *                       completedAt:
   *                         type: string
   *                         format: date-time
   *                         nullable: true
   *                         example: null
   *                       priority:
   *                         type: string
   *                         enum: [low, medium, high]
   *                         example: "high"
   *                       progress:
   *                         type: array
   *                         items:
   *                           type: object
   *                           properties:
   *                             value:
   *                               type: number
   *                               example: 10.5
   *                             notes:
   *                               type: string
   *                               example: "Long run session"
   *                             date:
   *                               type: string
   *                               format: date-time
   *                               example: "2024-01-15T10:30:00.000Z"
   *                       isActive:
   *                         type: boolean
   *                         example: true
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-01T12:00:00.000Z"
   *                       updatedAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-15T12:00:00.000Z"
   *       400:
   *         description: Invalid query parameters
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
   *                   example: INVALID_QUERY_PARAMETERS
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
   *                 status:
   *                   type: integer
   *                   example: 401
   *                 message:
   *                   type: string
   *                   example: UNAUTHORIZED_ACCESS
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
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   example: GOALS_RETRIEVAL_FAILED
   */
  .get("/", authorize, goalsController.getAllGoals) // GET /api/goals - get all user goals

  /**
   * @openapi
   * /api/goals/stats:
   *   get:
   *     tags: [Goals]
   *     summary: Get goals statistics
   *     description: Retrieves comprehensive statistics about the user's goals including completion rates and progress.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Goals statistics retrieved successfully
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
   *                   example: GOALS_STATS_RETRIEVED
   *                 data:
   *                   type: object
   *                   properties:
   *                     totalGoals:
   *                       type: integer
   *                       example: 8
   *                     completedGoals:
   *                       type: integer
   *                       example: 3
   *                     activeGoals:
   *                       type: integer
   *                       example: 5
   *                     overdueGoals:
   *                       type: integer
   *                       example: 2
   *                     averageProgress:
   *                       type: number
   *                       format: float
   *                       example: 65.5
   *       404:
   *         description: No goals statistics found
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
   *                   example: NO_STATS_FOR_GOALS_FOUND
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
   *                 status:
   *                   type: integer
   *                   example: 401
   *                 message:
   *                   type: string
   *                   example: UNAUTHORIZED_ACCESS
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
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   example: GOALS_STATS_RETRIEVAL_FAILED
   */
  .get("/stats", authorize, goalsController.getGoalsStats) // GET /api/goals/stats - get statistics about goals

  /**
   * @openapi
   * /api/goals/{id}:
   *   get:
   *     tags: [Goals]
   *     summary: Get specific goal
   *     description: Retrieves a specific goal by its ID.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The ID of the goal to retrieve
   *     responses:
   *       200:
   *         description: Goal retrieved successfully
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
   *                   example: GOAL_RETRIEVED
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       format: uuid
   *                       example: "507f1f77bcf86cd799439011"
   *                     user_id:
   *                       type: string
   *                       format: uuid
   *                       example: "507f1f77bcf86cd799439012"
   *                     title:
   *                       type: string
   *                       example: "Run a marathon"
   *                     description:
   *                       type: string
   *                       nullable: true
   *                       example: "Complete a full marathon race"
   *                     category:
   *                       type: string
   *                       enum: [distance, speed, consistency, event, other]
   *                       example: "distance"
   *                     target:
   *                       type: number
   *                       example: 42.2
   *                     current:
   *                       type: number
   *                       example: 25.5
   *                     unit:
   *                       type: string
   *                       example: "km"
   *                     deadline:
   *                       type: string
   *                       format: date
   *                       example: "2024-12-31"
   *                     completed:
   *                       type: boolean
   *                       example: false
   *                     completedAt:
   *                       type: string
   *                       format: date-time
   *                       nullable: true
   *                       example: null
   *                     priority:
   *                       type: string
   *                       enum: [low, medium, high]
   *                       example: "high"
   *                     progress:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           value:
   *                             type: number
   *                             example: 10.5
   *                           notes:
   *                             type: string
   *                             example: "Long run session"
   *                           date:
   *                             type: string
   *                             format: date-time
   *                             example: "2024-01-15T10:30:00.000Z"
   *                     isActive:
   *                       type: boolean
   *                       example: true
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-01T12:00:00.000Z"
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T12:00:00.000Z"
   *       404:
   *         description: Goal not found
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
   *                   example: GOAL_NOT_FOUND
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
   *                 status:
   *                   type: integer
   *                   example: 401
   *                 message:
   *                   type: string
   *                   example: UNAUTHORIZED_ACCESS
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
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   example: GOAL_RETRIEVAL_FAILED
   */
  .get("/:id", authorize, goalsController.getGoalById) // Get /api/goals/:id - get a specific goal

  /**
   * @openapi
   * /api/goals:
   *   post:
   *     tags: [Goals]
   *     summary: Create a new goal
   *     description: Creates a new goal for the authenticated user.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - category
   *               - target
   *               - unit
   *               - deadline
   *             properties:
   *               title:
   *                 type: string
   *                 maxLength: 100
   *                 example: "Run a marathon"
   *                 description: Goal title
   *               description:
   *                 type: string
   *                 maxLength: 500
   *                 example: "Complete a full marathon race"
   *                 description: Goal description
   *               category:
   *                 type: string
   *                 enum: [distance, speed, consistency, event, other]
   *                 example: "distance"
   *                 description: Goal category
   *               target:
   *                 type: number
   *                 minimum: 0.1
   *                 example: 42.2
   *                 description: Target value to achieve
   *               unit:
   *                 type: string
   *                 example: "km"
   *                 description: Unit of measurement
   *               deadline:
   *                 type: string
   *                 format: date
   *                 example: "2024-12-31"
   *                 description: Goal deadline date
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high]
   *                 example: "high"
   *                 description: Goal priority level
   *     responses:
   *       201:
   *         description: Goal created successfully
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
   *                   example: 201
   *                 message:
   *                   type: string
   *                   example: GOAL_CREATED
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       format: uuid
   *                       example: "507f1f77bcf86cd799439011"
   *                     user_id:
   *                       type: string
   *                       format: uuid
   *                       example: "507f1f77bcf86cd799439012"
   *                     title:
   *                       type: string
   *                       example: "Run a marathon"
   *                     description:
   *                       type: string
   *                       example: "Complete a full marathon race"
   *                     category:
   *                       type: string
   *                       example: "distance"
   *                     target:
   *                       type: number
   *                       example: 42.2
   *                     current:
   *                       type: number
   *                       example: 0
   *                     unit:
   *                       type: string
   *                       example: "km"
   *                     deadline:
   *                       type: string
   *                       format: date
   *                       example: "2024-12-31"
   *                     completed:
   *                       type: boolean
   *                       example: false
   *                     priority:
   *                       type: string
   *                       example: "high"
   *                     isActive:
   *                       type: boolean
   *                       example: true
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T12:00:00.000Z"
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T12:00:00.000Z"
   *       400:
   *         description: Invalid goal data
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
   *                   example: INVALID_GOAL_DATA
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
   *                 status:
   *                   type: integer
   *                   example: 401
   *                 message:
   *                   type: string
   *                   example: UNAUTHORIZED_ACCESS
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
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   example: GOAL_CREATION_FAILED
   */
  .post("/", authorize, goalsController.createGoal) // POST /api/goals - create a new goal

  /**
   * @openapi
   * /api/goals/{id}:
   *   put:
   *     tags: [Goals]
   *     summary: Update a goal
   *     description: Updates an existing goal. Automatically marks as completed if current progress reaches target.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The ID of the goal to update
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 maxLength: 100
   *                 example: "Updated marathon goal"
   *               description:
   *                 type: string
   *                 maxLength: 500
   *                 example: "Updated description"
   *               category:
   *                 type: string
   *                 enum: [distance, speed, consistency, event, other]
   *                 example: "distance"
   *               target:
   *                 type: number
   *                 minimum: 0.1
   *                 example: 50
   *               current:
   *                 type: number
   *                 minimum: 0
   *                 example: 30
   *               unit:
   *                 type: string
   *                 example: "km"
   *               deadline:
   *                 type: string
   *                 format: date
   *                 example: "2024-12-31"
   *               completed:
   *                 type: boolean
   *                 example: false
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high]
   *                 example: "medium"
   *     responses:
   *       200:
   *         description: Goal updated successfully
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
   *                   example: GOAL_UPDATED
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       format: uuid
   *                       example: "507f1f77bcf86cd799439011"
   *                     user_id:
   *                       type: string
   *                       format: uuid
   *                       example: "507f1f77bcf86cd799439012"
   *                     title:
   *                       type: string
   *                       example: "Updated marathon goal"
   *                     description:
   *                       type: string
   *                       example: "Updated description"
   *                     category:
   *                       type: string
   *                       example: "distance"
   *                     target:
   *                       type: number
   *                       example: 50
   *                     current:
   *                       type: number
   *                       example: 30
   *                     unit:
   *                       type: string
   *                       example: "km"
   *                     deadline:
   *                       type: string
   *                       format: date
   *                       example: "2024-12-31"
   *                     completed:
   *                       type: boolean
   *                       example: false
   *                     priority:
   *                       type: string
   *                       example: "medium"
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-16T12:00:00.000Z"
   *       400:
   *         description: Invalid goal data
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
   *                   example: INVALID_GOAL_DATA
   *       404:
   *         description: Goal not found
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
   *                   example: GOAL_NOT_FOUND
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
   *                 status:
   *                   type: integer
   *                   example: 401
   *                 message:
   *                   type: string
   *                   example: UNAUTHORIZED_ACCESS
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
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   example: GOAL_UPDATE_FAILED
   */
  .put("/:id", authorize, goalsController.updateGoal) // PUT /api/goals/:id - update a goal

  /**
   * @openapi
   * /api/goals/{id}/progress:
   *   post:
   *     tags: [Goals]
   *     summary: Add progress to a goal
   *     description: Adds progress to a goal and automatically marks as completed if target is reached.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The ID of the goal to add progress to
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - value
   *             properties:
   *               value:
   *                 type: number
   *                 minimum: 0
   *                 example: 5.5
   *                 description: Progress value to add
   *               notes:
   *                 type: string
   *                 maxLength: 200
   *                 example: "Morning run session"
   *                 description: Optional notes about the progress
   *     responses:
   *       200:
   *         description: Progress added successfully
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
   *                   example: GOAL_UPDATED
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       format: uuid
   *                       example: "507f1f77bcf86cd799439011"
   *                     current:
   *                       type: number
   *                       example: 35.5
   *                     completed:
   *                       type: boolean
   *                       example: false
   *                     progress:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           value:
   *                             type: number
   *                             example: 5.5
   *                           notes:
   *                             type: string
   *                             example: "Morning run session"
   *                           date:
   *                             type: string
   *                             format: date-time
   *                             example: "2024-01-16T08:30:00.000Z"
   *       400:
   *         description: Invalid progress data
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
   *                   example: INVALID_RECORD_DATA
   *       404:
   *         description: Goal not found
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
   *                   example: GOAL_NOT_FOUND
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
   *                 status:
   *                   type: integer
   *                   example: 401
   *                 message:
   *                   type: string
   *                   example: UNAUTHORIZED_ACCESS
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
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   example: GOAL_UPDATE_FAILED
   */
  .post("/:id/progress", authorize, goalsController.addProgress) // POST /api/goals/:id/progress - add progress to a goal

  /**
   * @openapi
   * /api/goals/{id}:
   *   delete:
   *     tags: [Goals]
   *     summary: Delete a goal
   *     description: Soft deletes a goal by setting isActive to false.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The ID of the goal to delete
   *     responses:
   *       200:
   *         description: Goal deleted successfully
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
   *                   example: GOAL_DELETED
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       format: uuid
   *                       example: "507f1f77bcf86cd799439011"
   *       404:
   *         description: Goal not found
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
   *                   example: GOAL_NOT_FOUND
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
   *                 status:
   *                   type: integer
   *                   example: 401
   *                 message:
   *                   type: string
   *                   example: UNAUTHORIZED_ACCESS
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
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   example: GOAL_DELETION_FAILED
   */
  .delete("/:id", authorize, goalsController.deleteGoal); // DELETE /api/goals/:id - delete a goal

module.exports = router;
