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
   *           enum: [running, distance, consistency, speed, challenge, all]
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
   *                   example: "Achievements récupérés avec succès"
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       achievement_id:
   *                         type: string
   *                         example: "first_5k"
   *                       title:
   *                         type: string
   *                         example: "First 5K"
   *                       description:
   *                         type: string
   *                         example: "Complete your first 5K run"
   *                       icon:
   *                         type: string
   *                         example: "🏃‍♂️"
   *                       category:
   *                         type: string
   *                         example: "running"
   *                       points:
   *                         type: integer
   *                         example: 100
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
   *                   example: "Unauthorized access"
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
   *                   example: "Erreur lors de la récupération des achievements"
   */
  .get("/", authorize, ctr.getUserAchievements) // GET /api/achievements - Retrieves all achievements for the authenticated user, including locked and unlocked achievements with optional filtering

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
   *                 example: "first_5k"
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
   *                   example: "Achievement débloqué avec succès"
   *                 data:
   *                   type: object
   *                   properties:
   *                     _id:
   *                       type: string
   *                       format: uuid
   *                       example: "507f1f77bcf86cd799439011"
   *                     userId:
   *                       type: string
   *                       format: uuid
   *                       example: "507f1f77bcf86cd799439012"
   *                     achievement_id:
   *                       type: string
   *                       example: "first_5k"
   *                     title:
   *                       type: string
   *                       example: "First 5K"
   *                     description:
   *                       type: string
   *                       example: "Complete your first 5K run"
   *                     icon:
   *                       type: string
   *                       example: "🏃‍♂️"
   *                     category:
   *                       type: string
   *                       example: "running"
   *                     points:
   *                       type: integer
   *                       example: 100
   *                     rarity:
   *                       type: string
   *                       example: "common"
   *                     requirements:
   *                       type: object
   *                       properties:
   *                         totalRuns:
   *                           type: integer
   *                           example: 1
   *                         totalDistance:
   *                           type: number
   *                           example: 5.0
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
   *                   example: "Données invalides"
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
   *                   example: "Achievement non trouvé"
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
   *                   example: "Achievement déjà débloqué"
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
   *                   example: "Unauthorized access"
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
   *                   example: "Erreur lors du déblocage de l'achievement"
   */
  .post("/unlock", authorize, ctr.unlockAchievement) // POST /api/achievements/unlock - Manually unlock a specific achievement for the authenticated user

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
   *                   example: "3 nouveaux achievements débloqués"
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       _id:
   *                         type: string
   *                         format: uuid
   *                         example: "507f1f77bcf86cd799439011"
   *                       achievement_id:
   *                         type: string
   *                         example: "marathon_runner"
   *                       title:
   *                         type: string
   *                         example: "Marathon Runner"
   *                       description:
   *                         type: string
   *                         example: "Complete a marathon distance run"
   *                       points:
   *                         type: integer
   *                         example: 500
   *                       earnedDate:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-15T10:30:00.000Z"
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
   *                   example: "Unauthorized access"
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
   *                   example: "Erreur lors de la vérification des achievements"
   */
  .post("/check", authorize, ctr.checkAchievements) //POST /api/achievements/check - Automatically checks and unlocks achievements based on user statistics and activity data

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
   *                   example: "Statistiques récupérées avec succès"
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
   *                       example: ["running", "distance", "consistency"]
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
   *                             example: "streak_7_days"
   *                           title:
   *                             type: string
   *                             example: "7-Day Streak"
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
   *                   example: "Unauthorized access"
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
   *                   example: "Erreur lors de la récupération des statistiques"
   */
  .get("/stats", authorize, ctr.getAchievementStats) // GET /api/achievements/stats - Retrieves comprehensive statistics about the user's achievements

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
   *                   example: "Achievements disponibles récupérés avec succès"
   *                 data:
   *                   type: object
   *                   additionalProperties:
   *                     type: object
   *                     properties:
   *                       title:
   *                         type: string
   *                         example: "First 5K"
   *                       description:
   *                         type: string
   *                         example: "Complete your first 5K run"
   *                       icon:
   *                         type: string
   *                         example: "🏃‍♂️"
   *                       category:
   *                         type: string
   *                         example: "running"
   *                       points:
   *                         type: integer
   *                         example: 100
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
   *                           totalDistance:
   *                             type: number
   *                             example: 5.0
   *                           singleRunDistance:
   *                             type: number
   *                             example: 5.0
   *                           consecutiveDays:
   *                             type: integer
   *                             example: 7
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
   *                   example: "Unauthorized access"
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
   *                   example: "Erreur lors de la récupération des achievements disponibles"
   */
  .get("/available", authorize, ctr.getAvailableAchievements); // GET /api/achievements/available - Retrieves all available achievements

module.exports = router;
