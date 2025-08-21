const express = require("express");
const router = express.Router();
const healthController = require("../../controllers/components/healthController");
const { authorize } = require("../../middlewares/authMiddleware");

/**
 * @openapi
 * tags:
 *   name: Health Data
 *   description: Health data synchronization and retrieval from Google Fit
 */
router
  /**
   * @openapi
   * /api/health/sync:
   *   post:
   *     tags: [Health Data]
   *     summary: Sync health data from Google Fit
   *     description: Initiates synchronization of health data from Google Fit for the authenticated user.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               days:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 90
   *                 default: 7
   *                 description: Number of days of data to sync
   *               dataTypes:
   *                 type: array
   *                 items:
   *                   type: string
   *                   enum: [activity, heartRate, sleep, exercise]
   *                 default: ["activity", "heartRate", "sleep", "exercise"]
   *                 description: Types of health data to synchronize
   *               force:
   *                 type: boolean
   *                 default: false
   *                 description: Force sync even if another sync is in progress
   *     responses:
   *       200:
   *         description: Sync started successfully
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
   *                   example: "Synchronisation démarrée"
   *                 data:
   *                   type: object
   *                   properties:
   *                     syncId:
   *                       type: string
   *                       format: uuid
   *                       example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
   *                     status:
   *                       type: string
   *                       example: "in_progress"
   *                     estimatedDuration:
   *                       type: string
   *                       example: "14 secondes"
   *       400:
   *         description: Invalid request or Google account not connected
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
   *                   example: "Compte Google non connecté"
   *       409:
   *         description: Sync already in progress
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
   *                   example: "Une synchronisation est déjà en cours"
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       format: uuid
   *                     status:
   *                       type: string
   *                     startedAt:
   *                       type: string
   *                       format: date-time
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
   *                   example: "Erreur lors du démarrage de la synchronisation"
   */
  .post("/sync", authorize, healthController.syncHealthData) //POST /api/health/sync - Initiates synchronization of health data from Google Fit for the authenticated user

  /**
   * @openapi
   * /api/health/sync/status/{sync_id}:
   *   get:
   *     tags: [Health Data]
   *     summary: Get sync status
   *     description: Retrieves the status of a specific synchronization process.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: sync_id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The ID of the synchronization process
   *     responses:
   *       200:
   *         description: Sync status retrieved successfully
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
   *                   example: "SYNC_STATUS_RETRIEVED"
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       format: uuid
   *                       example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
   *                     user_id:
   *                       type: string
   *                       format: uuid
   *                       example: "507f1f77bcf86cd799439012"
   *                     syncType:
   *                       type: string
   *                       enum: [manual, automatic]
   *                       example: "manual"
   *                     dataTypes:
   *                       type: array
   *                       items:
   *                         type: string
   *                       example: ["activity", "heartRate", "sleep"]
   *                     startDate:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-08T10:30:00.000Z"
   *                     endDate:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T10:30:00.000Z"
   *                     status:
   *                       type: string
   *                       enum: [pending, in_progress, completed, failed]
   *                       example: "completed"
   *                     recordsProcessed:
   *                       type: integer
   *                       example: 45
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T10:30:00.000Z"
   *                     completedAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T10:32:15.000Z"
   *       404:
   *         description: Sync not found
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
   *                   example: "SYNC_NOT_FOUND"
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
   *                   example: "SYNC_STATUS_RETRIEVAL_FAILED"
   */
  .get("/sync/status/:sync_id", authorize, healthController.getSyncStatus) //GET /api/health/sync/status/:sync_id - Retrieves the status of a specific synchronization process

  /**
   * @openapi
   * /api/health/sync/history:
   *   get:
   *     tags: [Health Data]
   *     summary: Get sync history
   *     description: Retrieves the synchronization history for the authenticated user.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Maximum number of sync records to return
   *     responses:
   *       200:
   *         description: Sync history retrieved successfully
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
   *                   example: "SYNC_HISTORY_RETRIEVED"
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         format: uuid
   *                         example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
   *                       syncType:
   *                         type: string
   *                         example: "manual"
   *                       dataTypes:
   *                         type: array
   *                         items:
   *                           type: string
   *                         example: ["activity", "heartRate"]
   *                       status:
   *                         type: string
   *                         example: "completed"
   *                       recordsProcessed:
   *                         type: integer
   *                         example: 23
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-15T10:30:00.000Z"
   *                       completedAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-15T10:32:15.000Z"
   *       404:
   *         description: No sync history found
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
   *                   example: "NO_SYNC_HISTORY_FOUND"
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
   *                   example: "SYNC_HISTORY_RETRIEVAL_FAILED"
   */
  .get("/sync/history", authorize, healthController.getSyncHistory) //GET /api/health/sync/history - Retrieves the synchronization history for the authenticated user

  /**
   * @openapi
   * /api/health/activity:
   *   get:
   *     tags: [Health Data]
   *     summary: Get activity data
   *     description: Retrieves activity data (steps, distance, calories) for a specific date range.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: startDate
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *           example: "2024-01-08"
   *         description: Start date of the range (YYYY-MM-DD)
   *       - in: query
   *         name: endDate
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *           example: "2024-01-15"
   *         description: End date of the range (YYYY-MM-DD)
   *     responses:
   *       200:
   *         description: Activity data retrieved successfully
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
   *                   example: "ACTIVITY_DATA_RETRIEVED"
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         format: uuid
   *                         example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
   *                       user_id:
   *                         type: string
   *                         format: uuid
   *                         example: "507f1f77bcf86cd799439012"
   *                       date:
   *                         type: string
   *                         format: date
   *                         example: "2024-01-15"
   *                       steps:
   *                         type: integer
   *                         example: 12543
   *                       distance:
   *                         type: number
   *                         format: float
   *                         example: 8.75
   *                       calories:
   *                         type: number
   *                         format: float
   *                         example: 345.2
   *                       activeMinutes:
   *                         type: integer
   *                         example: 65
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-15T10:30:00.000Z"
   *                       updatedAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-15T10:30:00.000Z"
   *       400:
   *         description: Invalid date range
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
   *                   example: "INVALID_DATE_RANGE"
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
   *                   example: "ACTIVITY_DATA_RETRIEVAL_FAILED"
   */
  .get("/activity", authorize, healthController.getActivityData) //GET /api/health/activity - Retrieves activity data (steps, distance, calories) for a specific date range

  /**
   * @openapi
   * /api/health/heart-rate:
   *   get:
   *     tags: [Health Data]
   *     summary: Get heart rate data
   *     description: Retrieves heart rate data for a specific date range with statistics.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: startDate
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *           example: "2024-01-08"
   *         description: Start date of the range (YYYY-MM-DD)
   *       - in: query
   *         name: endDate
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *           example: "2024-01-15"
   *         description: End date of the range (YYYY-MM-DD)
   *     responses:
   *       200:
   *         description: Heart rate data retrieved successfully
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
   *                   example: "HEART_RATE_DATA_RETRIEVED"
   *                 data:
   *                   type: object
   *                   properties:
   *                     readings:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             format: uuid
   *                             example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
   *                           user_id:
   *                             type: string
   *                             format: uuid
   *                             example: "507f1f77bcf86cd799439012"
   *                           timestamp:
   *                             type: string
   *                             format: date-time
   *                             example: "2024-01-15T10:30:00.000Z"
   *                           heartRate:
   *                             type: integer
   *                             example: 72
   *                           context:
   *                             type: string
   *                             example: "active"
   *                           createdAt:
   *                             type: string
   *                             format: date-time
   *                             example: "2024-01-15T10:30:00.000Z"
   *                     stats:
   *                       type: object
   *                       properties:
   *                         average:
   *                           type: integer
   *                           example: 68
   *                         min:
   *                           type: integer
   *                           example: 55
   *                         max:
   *                           type: integer
   *                           example: 165
   *                         readings:
   *                           type: integer
   *                           example: 245
   *       400:
   *         description: Invalid date range
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
   *                   example: "INVALID_DATE_RANGE"
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
   *                   example: "HEART_RATE_DATA_RETRIEVAL_FAILED"
   */
  .get("/heart-rate", authorize, healthController.getHeartRateData) //GET /api/health/heart-rate - Retrieves heart rate data for a specific date range with statistics

  /**
   * @openapi
   * /api/health/sleep:
   *   get:
   *     tags: [Health Data]
   *     summary: Get sleep data
   *     description: Retrieves sleep data for a specific date range with statistics.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: startDate
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *           example: "2024-01-08"
   *         description: Start date of the range (YYYY-MM-DD)
   *       - in: query
   *         name: endDate
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *           example: "2024-01-15"
   *         description: End date of the range (YYYY-MM-DD)
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
   *                 message:
   *                   type: string
   *                   example: "SLEEP_DATA_RETRIEVED"
   *                 data:
   *                   type: object
   *                   properties:
   *                     sleepSessions:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             format: uuid
   *                             example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
   *                           user_id:
   *                             type: string
   *                             format: uuid
   *                             example: "507f1f77bcf86cd799439012"
   *                           date:
   *                             type: string
   *                             format: date
   *                             example: "2024-01-15"
   *                           bedTime:
   *                             type: string
   *                             format: date-time
   *                             example: "2024-01-14T22:30:00.000Z"
   *                           wakeTime:
   *                             type: string
   *                             format: date-time
   *                             example: "2024-01-15T06:45:00.000Z"
   *                           totalSleepMinutes:
   *                             type: integer
   *                             example: 495
   *                           sleepQuality:
   *                             type: string
   *                             enum: [poor, fair, good, excellent]
   *                             example: "good"
   *                           createdAt:
   *                             type: string
   *                             format: date-time
   *                             example: "2024-01-15T06:45:00.000Z"
   *                     stats:
   *                       type: object
   *                       properties:
   *                         averageSleepHours:
   *                           type: number
   *                           format: float
   *                           example: 7.5
   *                         totalNights:
   *                           type: integer
   *                           example: 7
   *                         sleepQualityDistribution:
   *                           type: object
   *                           properties:
   *                             poor:
   *                               type: integer
   *                               example: 1
   *                             fair:
   *                               type: integer
   *                               example: 2
   *                             good:
   *                               type: integer
   *                               example: 3
   *                             excellent:
   *                               type: integer
   *                               example: 1
   *       400:
   *         description: Invalid date range
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
   *                   example: "INVALID_DATE_RANGE"
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
   *                   example: "SLEEP_DATA_RETRIEVAL_FAILED"
   */
  .get("/sleep", authorize, healthController.getSleepData) //GET /api/health/sleep - Retrieves sleep data for a specific date range with statistics

  /**
   * @openapi
   * /api/health/exercise:
   *   get:
   *     tags: [Health Data]
   *     summary: Get exercise data
   *     description: Retrieves exercise session data for a specific date range with statistics.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: startDate
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *           example: "2024-01-08"
   *         description: Start date of the range (YYYY-MM-DD)
   *       - in: query
   *         name: endDate
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *           example: "2024-01-15"
   *         description: End date of the range (YYYY-MM-DD)
   *       - in: query
   *         name: activityType
   *         schema:
   *           type: integer
   *           example: 8
   *         description: Filter by specific activity type (Google Fit activity codes)
   *     responses:
   *       200:
   *         description: Exercise data retrieved successfully
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
   *                   example: "EXERCISE_DATA_RETRIEVED"
   *                 data:
   *                   type: object
   *                   properties:
   *                     sessions:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             format: uuid
   *                             example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
   *                           user_id:
   *                             type: string
   *                             format: uuid
   *                             example: "507f1f77bcf86cd799439012"
   *                           googleSessionId:
   *                             type: string
   *                             example: "session_12345"
   *                           name:
   *                             type: string
   *                             example: "Morning Run"
   *                           activityType:
   *                             type: integer
   *                             example: 8
   *                           activityName:
   *                             type: string
   *                             example: "running"
   *                           startTime:
   *                             type: string
   *                             format: date-time
   *                             example: "2024-01-15T08:30:00.000Z"
   *                           endTime:
   *                             type: string
   *                             format: date-time
   *                             example: "2024-01-15T09:30:00.000Z"
   *                           duration:
   *                             type: integer
   *                             example: 3600
   *                           distance:
   *                             type: number
   *                             format: float
   *                             example: 10.5
   *                           calories:
   *                             type: number
   *                             format: float
   *                             example: 750.5
   *                           averageHeartRate:
   *                             type: integer
   *                             example: 165
   *                           createdAt:
   *                             type: string
   *                             format: date-time
   *                             example: "2024-01-15T09:30:00.000Z"
   *                     stats:
   *                       type: object
   *                       properties:
   *                         totalSessions:
   *                           type: integer
   *                           example: 5
   *                         totalDistance:
   *                           type: number
   *                           format: float
   *                           example: 42.5
   *                         totalDuration:
   *                           type: integer
   *                           example: 18000
   *                         totalCalories:
   *                           type: number
   *                           format: float
   *                           example: 3250.5
   *                         averageHeartRate:
   *                           type: integer
   *                           example: 158
   *       400:
   *         description: Invalid date range
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
   *                   example: "INVALID_DATE_RANGE"
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
   *                   example: "EXERCISE_DATA_RETRIEVAL_FAILED"
   */
  .get("/exercise", authorize, healthController.getExerciseData) // GET /api/health/exercise - retrieves exercise data for a specific date range

  /**
   * @openapi
   * /api/health/dashboard:
   *   get:
   *     tags: [Health Data]
   *     summary: Get health dashboard
   *     description: Retrieves a comprehensive health dashboard with today's data, weekly summaries, and recent activities.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Dashboard data retrieved successfully
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
   *                   example: "DASHBOARD_RETRIEVED"
   *                 data:
   *                   type: object
   *                   properties:
   *                     today:
   *                       type: object
   *                       properties:
   *                         steps:
   *                           type: integer
   *                           example: 8432
   *                         distance:
   *                           type: number
   *                           format: float
   *                           example: 6.2
   *                         calories:
   *                           type: number
   *                           format: float
   *                           example: 285.7
   *                         activeMinutes:
   *                           type: integer
   *                           example: 45
   *                     weekly:
   *                       type: object
   *                       properties:
   *                         totalSteps:
   *                           type: integer
   *                           example: 58764
   *                         totalDistance:
   *                           type: number
   *                           format: float
   *                           example: 42.8
   *                         totalCalories:
   *                           type: number
   *                           format: float
   *                           example: 1985.3
   *                         activeDays:
   *                           type: integer
   *                           example: 6
   *                     lastExercise:
   *                       type: object
   *                       nullable: true
   *                       properties:
   *                         name:
   *                           type: string
   *                           example: "Evening Run"
   *                         duration:
   *                           type: integer
   *                           example: 2700
   *                         distance:
   *                           type: number
   *                           format: float
   *                           example: 8.5
   *                         calories:
   *                           type: number
   *                           format: float
   *                           example: 625.0
   *                         date:
   *                           type: string
   *                           format: date-time
   *                           example: "2024-01-15T18:30:00.000Z"
   *                     sleep:
   *                       type: object
   *                       nullable: true
   *                       properties:
   *                         duration:
   *                           type: integer
   *                           example: 465
   *                         quality:
   *                           type: string
   *                           example: "good"
   *                         bedTime:
   *                           type: string
   *                           format: date-time
   *                           example: "2024-01-14T22:45:00.000Z"
   *                         wakeTime:
   *                           type: string
   *                           format: date-time
   *                           example: "2024-01-15T06:30:00.000Z"
   *                     heartRate:
   *                       type: object
   *                       nullable: true
   *                       properties:
   *                         current:
   *                           type: integer
   *                           example: 68
   *                         average:
   *                           type: integer
   *                           example: 72
   *                         trend:
   *                           type: string
   *                           enum: [up, down, stable]
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
   *                   example: "DASHBOARD_RETRIEVAL_FAILED"
   */
  .get("/dashboard", authorize, healthController.getDashboard) // GET /api/health/dashboard - retrieves health dashboard data

  /**
   * @openapi
   * /api/health/connection/status:
   *   get:
   *     tags: [Health Data]
   *     summary: Get Google Fit connection status
   *     description: Checks if the user's Google Fit account is connected and provides connection details.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Connection status retrieved successfully
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
   *                       example: "GOOGLE_FIT_CONNECTION_STATUS_RETRIEVED"
   *                     data:
   *                       type: object
   *                       properties:
   *                         isConnected:
   *                           type: boolean
   *                           example: true
   *                         connectedAt:
   *                           type: string
   *                           format: date-time
   *                           example: "2024-01-10T14:30:00.000Z"
   *                         lastSync:
   *                           type: string
   *                           format: date-time
   *                           example: "2024-01-15T10:30:00.000Z"
   *                         scopes:
   *                           type: array
   *                           items:
   *                             type: string
   *                           example: ["fitness.activity.read", "fitness.heart_rate.read"]
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: boolean
   *                       example: false
   *                     message:
   *                       type: string
   *                       example: "GOOGLE_FIT_NOT_CONNECTED"
   *                     data:
   *                       type: object
   *                       properties:
   *                         isConnected:
   *                           type: boolean
   *                           example: false
   *                         scopes:
   *                           type: array
   *                           items: []
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
   *                   example: "GOOGLE_FIT_CONNECTION_STATUS_RETRIEVAL_FAILED"
   */
  .get("/connection/status", authorize, healthController.getConnectionStatus) // GET /api/health/connection/status - retrieves Google Fit connection status
  /**
   * @openapi
   * /api/health/disconnect:
   *   delete:
   *     tags: [Health Data]
   *     summary: Disconnect Google Fit
   *     description: Disconnects the user's Google Fit account and revokes access tokens.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Google Fit disconnected successfully
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
   *                   example: "GOOGLE_FIT_DISCONNECTED"
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
   *                   example: "GOOGLE_FIT_DISCONNECT_FAILED"
   */
  .delete("/disconnect", authorize, healthController.disconnectGoogleFit); // GET /api/health/disconnect - disconnects Google Fit

module.exports = router;
