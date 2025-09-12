// routes/statisticsRouter.js
const express = require("express");
const router = express.Router();
const ctr = require("../../controllers/components/statisticsController");
const { authorize } = require("../../middlewares/authMiddleware");

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     StatisticsResponse:
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
 *           example: "STATISTICS_RETRIEVED"
 *         data:
 *           type: object
 *           properties:
 *             userStats:
 *               type: object
 *               properties:
 *                 points:
 *                   type: integer
 *                   example: 85
 *                 level:
 *                   type: integer
 *                   example: 5
 *                 experience:
 *                   type: integer
 *                   example: 1250
 *                 weekly_distance:
 *                   type: number
 *                   format: float
 *                   example: 42.5
 *                 streak_days:
 *                   type: integer
 *                   example: 12
 *                 average_pace:
 *                   type: string
 *                   example: "5:20"
 *             recentActivities:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                   date:
 *                     type: string
 *                     format: date
 *                     example: "2023-12-01"
 *                   steps:
 *                     type: integer
 *                     example: 12500
 *                   distance:
 *                     type: number
 *                     format: float
 *                     example: 8.5
 *                   calories:
 *                     type: number
 *                     format: float
 *                     example: 450
 *                   activeMinutes:
 *                     type: integer
 *                     example: 65
 *             goals:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "g1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                   title:
 *                     type: string
 *                     example: "Run 100km this month"
 *                   category:
 *                     type: string
 *                     example: "distance"
 *                   target:
 *                     type: number
 *                     example: 100
 *                   current:
 *                     type: number
 *                     example: 42.5
 *                   progressPercentage:
 *                     type: number
 *                     format: float
 *                     example: 42.5
 *                   deadline:
 *                     type: string
 *                     format: date
 *                     example: "2023-12-31"
 *             achievements:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "ach1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                   title:
 *                     type: string
 *                     example: "First 10K"
 *                   description:
 *                     type: string
 *                     example: "Completed your first 10 kilometer run"
 *                   earnedDate:
 *                     type: string
 *                     format: date-time
 *                     example: "2023-11-15T10:30:00.000Z"
 *                   points:
 *                     type: integer
 *                     example: 100
 *                   rarity:
 *                     type: string
 *                     example: "rare"
 *             sleepData:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "s1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                   date:
 *                     type: string
 *                     format: date
 *                     example: "2023-12-01"
 *                   totalSleepMinutes:
 *                     type: integer
 *                     example: 480
 *                   deepSleepMinutes:
 *                     type: integer
 *                     example: 120
 *                   sleepQuality:
 *                     type: string
 *                     example: "good"
 *             personalRecords:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "pr1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                   distance:
 *                     type: number
 *                     format: float
 *                     example: 10.0
 *                   time:
 *                     type: string
 *                     example: "45:30"
 *                   date:
 *                     type: string
 *                     format: date
 *                     example: "2023-11-20"
 *                   pace:
 *                     type: string
 *                     example: "4:33"
 *                   location:
 *                     type: string
 *                     example: "City Park"
 *             charts:
 *               type: object
 *               properties:
 *                 weeklyData:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       day:
 *                         type: string
 *                         example: "Mon"
 *                       distance:
 *                         type: number
 *                         format: float
 *                         example: 5.2
 *                       time:
 *                         type: integer
 *                         example: 28
 *                       pace:
 *                         type: number
 *                         format: float
 *                         example: 5.4
 *                 monthlyData:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Week 1"
 *                       distance:
 *                         type: number
 *                         format: float
 *                         example: 22.5
 *                 paceData:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Week 1"
 *                       value:
 *                         type: number
 *                         format: float
 *                         example: 5.8
 *                 runTypeData:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Long Run"
 *                       value:
 *                         type: integer
 *                         example: 42
 *                       distance:
 *                         type: number
 *                         format: float
 *                         example: 42.5
 *
 *     Activity:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *         type:
 *           type: string
 *           example: "Long Run"
 *         distance:
 *           type: number
 *           format: float
 *           example: 12.5
 *         time:
 *           type: string
 *           example: "1:10:22"
 *         date:
 *           type: string
 *           format: date
 *           example: "2023-12-01"
 *         location:
 *           type: string
 *           example: "City Park"
 *         heartRate:
 *           type: integer
 *           example: 162
 *         elevation:
 *           type: integer
 *           example: 125
 *         pace:
 *           type: string
 *           example: "5:38"
 *
 *     PerformanceMetrics:
 *       type: object
 *       properties:
 *         totalDistance:
 *           type: object
 *           properties:
 *             value:
 *               type: number
 *               format: float
 *               example: 42.5
 *             trend:
 *               type: integer
 *               example: 12
 *             unit:
 *               type: string
 *               example: "km"
 *         averagePace:
 *           type: object
 *           properties:
 *             value:
 *               type: string
 *               example: "5:20"
 *             trend:
 *               type: integer
 *               example: -5
 *             unit:
 *               type: string
 *               example: "/km"
 *         totalActivities:
 *           type: object
 *           properties:
 *             value:
 *               type: integer
 *               example: 25
 *             trend:
 *               type: integer
 *               example: 8
 *             unit:
 *               type: string
 *               example: ""
 *         averageHeartRate:
 *           type: object
 *           properties:
 *             value:
 *               type: integer
 *               example: 156
 *             trend:
 *               type: integer
 *               example: 3
 *             unit:
 *               type: string
 *               example: "bpm"
 */

/**
 * @openapi
 * /api/statistics:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Get comprehensive user statistics
 *     description: Returns complete statistics including user stats, activities, goals, achievements, sleep data, personal records, and chart data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatisticsResponse'
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
 *                   example: "UNAUTHORIZED_ACCESS"
 *                 data:
 *                   type: array
 *                   example: []
 *       404:
 *         description: No statistics found for user
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
 *                   example: "NO_STATISTICS_FOUND"
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
 *                   example: "ERROR_GETTING_STATISTICS"
 *                 data:
 *                   type: array
 *                   example: []
 */
router
  .get("/", authorize, ctr.getStatistics)

  /**
   * @openapi
   * /api/statistics/weekly:
   *   get:
   *     tags:
   *       - Statistics
   *     summary: Get weekly activity data
   *     description: Returns weekly activity data for charts and analytics
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Weekly data retrieved successfully
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
   *                   example: "WEEKLY_DATA_RETRIEVED"
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       day:
   *                         type: string
   *                         example: "Mon"
   *                       distance:
   *                         type: number
   *                         format: float
   *                         example: 5.2
   *                       time:
   *                         type: integer
   *                         example: 28
   *                       pace:
   *                         type: number
   *                         format: float
   *                         example: 5.4
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
   *                   example: "ERROR_GETTING_WEEKLY_DATA"
   *                 data:
   *                   type: array
   *                   example: []
   */
  .get("/weekly", authorize, ctr.getWeeklyData)

  /**
   * @openapi
   * /api/statistics/monthly:
   *   get:
   *     tags:
   *       - Statistics
   *     summary: Get monthly activity data
   *     description: Returns monthly activity data for charts and analytics
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Monthly data retrieved successfully
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
   *                   example: "MONTHLY_DATA_RETRIEVED"
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       name:
   *                         type: string
   *                         example: "Week 1"
   *                       distance:
   *                         type: number
   *                         format: float
   *                         example: 22.5
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
   *                   example: "ERROR_GETTING_MONTHLY_DATA"
   *                 data:
   *                   type: array
   *                   example: []
   */
  .get("/monthly", authorize, ctr.getMonthlyData)

  /**
   * @openapi
   * /api/statistics/pace:
   *   get:
   *     tags:
   *       - Statistics
   *     summary: Get pace improvement data
   *     description: Returns pace improvement data for charts and analytics
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Pace data retrieved successfully
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
   *                   example: "PACE_DATA_RETRIEVED"
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       name:
   *                         type: string
   *                         example: "Week 1"
   *                       value:
   *                         type: number
   *                         format: float
   *                         example: 5.8
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
   *                   example: "ERROR_GETTING_PACE_DATA"
   *                 data:
   *                   type: array
   *                   example: []
   */
  .get("/pace", authorize, ctr.getPaceData)

  /**
   * @openapi
   * /api/statistics/run-types:
   *   get:
   *     tags:
   *       - Statistics
   *     summary: Get run type distribution data
   *     description: Returns run type distribution data for pie charts and analytics
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Run type data retrieved successfully
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
   *                   example: "RUN_TYPE_DATA_RETRIEVED"
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       name:
   *                         type: string
   *                         example: "Long Run"
   *                       value:
   *                         type: integer
   *                         example: 42
   *                       distance:
   *                         type: number
   *                         format: float
   *                         example: 42.5
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
   *                   example: "ERROR_GETTING_RUN_TYPE_DATA"
   *                 data:
   *                   type: array
   *                   example: []
   */
  .get("/run-types", authorize, ctr.getRunTypeData)

  /**
   * @openapi
   * /api/statistics/activities:
   *   get:
   *     tags:
   *       - Statistics
   *     summary: Get recent activities
   *     description: Returns user's recent activities with detailed information
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *         description: Number of activities to return
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           default: 0
   *         description: Number of activities to skip
   *     responses:
   *       200:
   *         description: Recent activities retrieved successfully
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
   *                   example: "RECENT_ACTIVITIES_RETRIEVED"
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Activity'
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
   *                   example: "ERROR_GETTING_RECENT_ACTIVITIES"
   *                 data:
   *                   type: array
   *                   example: []
   */
  .get("/activities", authorize, ctr.getRecentActivities)

  /**
   * @openapi
   * /api/statistics/personal-records:
   *   get:
   *     tags:
   *       - Statistics
   *     summary: Get personal records
   *     description: Returns user's personal records for different distances
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Personal records retrieved successfully
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
   *                   example: "PERSONAL_RECORDS_RETRIEVED"
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         example: "pr1b2c3d4-e5f6-7890-abcd-ef1234567890"
   *                       distance:
   *                         type: number
   *                         format: float
   *                         example: 10.0
   *                       time:
   *                         type: string
   *                         example: "45:30"
   *                       date:
   *                         type: string
   *                         format: date
   *                         example: "2023-11-20"
   *                       pace:
   *                         type: string
   *                         example: "4:33"
   *                       location:
   *                         type: string
   *                         example: "City Park"
   *                       isVerified:
   *                         type: boolean
   *                         example: true
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
   *                   example: "ERROR_GETTING_PERSONAL_RECORDS"
   *                 data:
   *                   type: array
   *                   example: []
   */
  .get("/personal-records", authorize, ctr.getPersonalRecords)

  /**
   * @openapi
   * /api/statistics/sleep:
   *   get:
   *     tags:
   *       - Statistics
   *     summary: Get sleep data
   *     description: Returns user's sleep data for the specified period
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: days
   *         schema:
   *           type: integer
   *           default: 7
   *         description: Number of days to retrieve sleep data for
   *     responses:
   *       200:
   *         description: Sleep data retrieved successfully
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
   *                   example: "SLEEP_DATA_RETRIEVED"
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         example: "s1b2c3d4-e5f6-7890-abcd-ef1234567890"
   *                       date:
   *                         type: string
   *                         format: date
   *                         example: "2023-12-01"
   *                       totalSleepMinutes:
   *                         type: integer
   *                         example: 480
   *                       deepSleepMinutes:
   *                         type: integer
   *                         example: 120
   *                       lightSleepMinutes:
   *                         type: integer
   *                         example: 240
   *                       sleepQuality:
   *                         type: string
   *                         example: "good"
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
   *                   example: "ERROR_GETTING_SLEEP_DATA"
   *                 data:
   *                   type: array
   *                   example: []
   */
  .get("/sleep", authorize, ctr.getSleepData)

  /**
   * @openapi
   * /api/statistics/metrics:
   *   get:
   *     tags:
   *       - Statistics
   *     summary: Get performance metrics
   *     description: Returns key performance metrics for dashboard cards
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Performance metrics retrieved successfully
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
   *                   example: "PERFORMANCE_METRICS_RETRIEVED"
   *                 data:
   *                   $ref: '#/components/schemas/PerformanceMetrics'
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
   *                   example: "ERROR_GETTING_PERFORMANCE_METRICS"
   *                 data:
   *                   type: array
   *                   example: []
   */
  .get("/metrics", authorize, ctr.getPerformanceMetrics);

module.exports = router;
