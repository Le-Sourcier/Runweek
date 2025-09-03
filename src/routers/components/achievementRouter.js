const router = require("express").Router();
const { authorize } = require("../../middlewares/authMiddleware");
const ctr = require("../../controllers/components/achievementsController");

/**
 * @openapi
 * tags:
 *   name: Achievements
 *   description: User achievements management and tracking
 */
router
  /**
   * @openapi
   * /api/achievements:
   *   get:
   *     tags: [Achievements]
   *     summary: Get user achievements
   *     description: Retrieves all achievements for the authenticated user, including locked and unlocked achievements with optional filtering.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *           enum: [beginner, distance, speed, habit, consistency, challenge, milestone, all]
   *         description: Filter achievements by category. Use "all" or omit for all categories.
   *       - in: query
   *         name: earned
   *         schema:
   *           type: string
   *           enum: [true, false]
   *         description: Filter by earned status (true for unlocked, false for locked)
   *     responses:
   *       200:
   *         description: Achievements retrieved successfully
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
   *                   example: "ACHIEVEMENTS_RETRIEVED"
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       achievement_id:
   *                         type: string
   *                         example: "first_run"
   *                       title:
   *                         type: string
   *                         example: "Premier Pas"
   *                       description:
   *                         type: string
   *                         example: "Complété votre première course"
   *                       icon:
   *                         type: string
   *                         example: "Award"
   *                       category:
   *                         type: string
   *                         example: "beginner"
   *                       points:
   *                         type: integer
   *                         example: 50
   *                       rarity:
   *                         type: string
   *                         enum: [common, rare, epic, legendary]
   *                         example: "common"
   *                       earnedDate:
   *                         type: string
   *                         format: date-time
   *                         nullable: true
   *                         example: "2024-01-15T10:30:00.000Z"
   *                       isLocked:
   *                         type: boolean
   *                         example: false
   *                       requirements:
   *                         type: object
   *                         properties:
   *                           totalRuns:
   *                             type: integer
   *                             example: 1
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
   *                   example: "FORBIDDEN_RESOURCE"
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
   *                   example: "ACHIEVEMENTS_RETRIEVE_FAILED"
   */
  .get("/", authorize, ctr.getUserAchievements)

  /**
   * @openapi
   * /api/achievements/unlock:
   *   post:
   *     tags: [Achievements]
   *     summary: Unlock an achievement
   *     description: Manually unlock a specific achievement for the authenticated user.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - achievement_id
   *             properties:
   *               achievement_id:
   *                 type: string
   *                 example: "first_run"
   *                 description: The ID of the achievement to unlock
   *               activityData:
   *                 type: object
   *                 description: Optional activity data related to the achievement
   *                 properties:
   *                   distance:
   *                     type: number
   *                     example: 5.0
   *                   time:
   *                     type: string
   *                     example: "00:30:00"
   *                   date:
   *                     type: string
   *                     format: date-time
   *                     example: "2024-01-15T10:30:00.000Z"
   *     responses:
   *       201:
   *         description: Achievement unlocked successfully
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
   *                   example: "ACHIEVEMENT_UNLOCKED"
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
   *                     achievement_id:
   *                       type: string
   *                       example: "first_run"
   *                     title:
   *                       type: string
   *                       example: "Premier Pas"
   *                     description:
   *                       type: string
   *                       example: "Complété votre première course"
   *                     icon:
   *                       type: string
   *                       example: "Award"
   *                     category:
   *                       type: string
   *                       example: "beginner"
   *                     points:
   *                       type: integer
   *                       example: 50
   *                     rarity:
   *                       type: string
   *                       example: "common"
   *                     requirements:
   *                       type: object
   *                       properties:
   *                         totalRuns:
   *                           type: integer
   *                           example: 1
   *                     earnedDate:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T10:30:00.000Z"
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T10:30:00.000Z"
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T10:30:00.000Z"
   *       400:
   *         description: Invalid request data
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
   *                   example: "INVALID_DATA"
   *                 details:
   *                   type: string
   *                   example: "achievement_id is required"
   *       404:
   *         description: Achievement not found
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
   *                   example: "ACHIEVEMENT_NOT_FOUND"
   *       409:
   *         description: Achievement already unlocked
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
   *                   example: "ACHIEVEMENT_ALREADY_UNLOCKED"
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
   *                   example: "FORBIDDEN_RESOURCE"
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
   *                   example: "ACHIEVEMENT_UNLOCK_FAILED"
   */
  .post("/unlock", authorize, ctr.unlockAchievement)

  /**
   * @openapi
   * /api/achievements/check:
   *   post:
   *     tags: [Achievements]
   *     summary: Check for new achievements
   *     description: Automatically checks and unlocks achievements based on user statistics and activity data.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userStats:
   *                 type: object
   *                 description: User statistics for achievement checking
   *                 properties:
   *                   totalRuns:
   *                     type: integer
   *                     example: 25
   *                   totalDistance:
   *                     type: number
   *                     example: 150.5
   *                   streakDays:
   *                     type: integer
   *                     example: 7
   *                   averagePace:
   *                     type: number
   *                     example: 5.2
   *               activityData:
   *                 type: object
   *                 description: Recent activity data for achievement checking
   *                 properties:
   *                   distance:
   *                     type: number
   *                     example: 10.5
   *                   time:
   *                     type: string
   *                     example: "00:55:30"
   *                   pace:
   *                     type: string
   *                     example: "5:17 min/km"
   *                   date:
   *                     type: string
   *                     format: date-time
   *                     example: "2024-01-15T10:30:00.000Z"
   *     responses:
   *       200:
   *         description: Achievements checked successfully
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
   *                   example: "ACHIEVEMENTS_CHECKED"
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         format: uuid
   *                         example: "507f1f77bcf86cd799439011"
   *                       achievement_id:
   *                         type: string
   *                         example: "marathon"
   *                       title:
   *                         type: string
   *                         example: "Marathonien"
   *                       description:
   *                         type: string
   *                         example: "Complété un marathon complet (42.2 km)"
   *                       points:
   *                         type: integer
   *                         example: 1000
   *                       earnedDate:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-15T10:30:00.000Z"
   *                 count:
   *                   type: integer
   *                   example: 3
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
   *                   example: "FORBIDDEN_RESOURCE"
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
   *                   example: "ACHIEVEMENTS_CHECK_FAILED"
   */
  .post("/check", authorize, ctr.checkAchievements)

  /**
   * @openapi
   * /api/achievements/stats:
   *   get:
   *     tags: [Achievements]
   *     summary: Get achievement statistics
   *     description: Retrieves comprehensive statistics about the user's achievements including completion rates and points.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Achievement statistics retrieved successfully
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
   *                   example: "ACHIEVEMENT_STATS_RETRIEVED"
   *                 data:
   *                   type: object
   *                   properties:
   *                     totalAvailable:
   *                       type: integer
   *                       example: 25
   *                     totalEarned:
   *                       type: integer
   *                       example: 15
   *                     totalPoints:
   *                       type: integer
   *                       example: 2500
   *                     completionRate:
   *                       type: number
   *                       format: float
   *                       example: 60.0
   *                     categoriesEarned:
   *                       type: array
   *                       items:
   *                         type: string
   *                       example: ["beginner", "distance", "consistency"]
   *                     raritiesEarned:
   *                       type: array
   *                       items:
   *                         type: string
   *                       example: ["common", "rare", "epic"]
   *                     recentAchievements:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           achievement_id:
   *                             type: string
   *                             example: "week_streak"
   *                           title:
   *                             type: string
   *                             example: "Série Hebdomadaire"
   *                           earnedDate:
   *                             type: string
   *                             format: date-time
   *                             example: "2024-01-15T10:30:00.000Z"
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
   *                   example: "FORBIDDEN_RESOURCE"
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
   *                   example: "ACHIEVEMENT_STATS_RETRIEVE_FAILED"
   */
  .get("/stats", authorize, ctr.getAchievementStats)

  /**
   * @openapi
   * /api/achievements/available:
   *   get:
   *     tags: [Achievements]
   *     summary: Get available achievements
   *     description: Retrieves all available achievements in the system with their requirements and details.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Available achievements retrieved successfully
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
   *                   example: "AVAILABLE_ACHIEVEMENTS_RETRIEVED"
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         example: "first_run"
   *                       title:
   *                         type: string
   *                         example: "Premier Pas"
   *                       description:
   *                         type: string
   *                         example: "Complété votre première course"
   *                       icon:
   *                         type: string
   *                         example: "Award"
   *                       category:
   *                         type: string
   *                         example: "beginner"
   *                       points:
   *                         type: integer
   *                         example: 50
   *                       rarity:
   *                         type: string
   *                         enum: [common, rare, epic, legendary]
   *                         example: "common"
   *                       requirements:
   *                         type: object
   *                         properties:
   *                           totalRuns:
   *                             type: integer
   *                             example: 1
   *                       isActive:
   *                         type: boolean
   *                         example: true
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
   *                   example: "FORBIDDEN_RESOURCE"
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
   *                   example: "AVAILABLE_ACHIEVEMENTS_RETRIEVE_FAILED"
   */
  .get("/available", authorize, ctr.getAvailableAchievements);

module.exports = router;
