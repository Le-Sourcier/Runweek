const express = require("express");
const router = express.Router();
const ctr = require("../../controllers/components/personalRecordsController");
const { authorize } = require("../../middlewares/authMiddleware");

/**
 * @openapi
 * tags:
 *   name: Personal Records
 *   description: Personal running records and performance tracking
 */
router
  /**
   * @openapi
   * /api/personal-records:
   *   get:
   *     tags: [Personal Records]
   *     summary: Get all personal records
   *     description: Retrieves all personal records for the authenticated user with optional filtering and sorting.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: distance
   *         schema:
   *           type: number
   *           format: float
   *         description: Filter by specific distance (e.g., 5, 10, 21.1, 42.2). Use "all" or omit for all distances.
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *           enum: [date, distance, time, pace]
   *           default: date
   *         description: Field to sort records by.
   *       - in: query
   *         name: order
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: desc
   *         description: Sort order (ascending or descending).
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 50
   *           maximum: 100
   *         description: Maximum number of records to return.
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
   *                   example: SUCCESS
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         format: uuid
   *                         example: "507f1f77bcf86cd799439011"
   *                       distance:
   *                         type: number
   *                         format: float
   *                         example: 10.0
   *                       time:
   *                         type: string
   *                         example: "00:45:30"
   *                       timeInSeconds:
   *                         type: integer
   *                         example: 2730
   *                       date:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-15T10:30:00.000Z"
   *                       location:
   *                         type: string
   *                         nullable: true
   *                         example: "Central Park, NYC"
   *                       notes:
   *                         type: string
   *                         nullable: true
   *                         example: "Great pace despite windy conditions"
   *                       weather:
   *                         type: object
   *                         nullable: true
   *                         properties:
   *                           temperature:
   *                             type: number
   *                             example: 18.5
   *                           conditions:
   *                             type: string
   *                             example: "Partly Cloudy"
   *                           humidity:
   *                             type: number
   *                             example: 65
   *                           windSpeed:
   *                             type: number
   *                             example: 15
   *                       heartRate:
   *                         type: object
   *                         nullable: true
   *                         properties:
   *                           average:
   *                             type: number
   *                             example: 165
   *                           max:
   *                             type: number
   *                             example: 182
   *                           min:
   *                             type: number
   *                             example: 120
   *                       elevation:
   *                         type: object
   *                         nullable: true
   *                         properties:
   *                           gain:
   *                             type: number
   *                             example: 150
   *                           loss:
   *                             type: number
   *                             example: 120
   *                           maxAltitude:
   *                             type: number
   *                             example: 250
   *                       splits:
   *                         type: array
   *                         items:
   *                           type: object
   *                           properties:
   *                             distance:
   *                               type: number
   *                               example: 5.0
   *                             time:
   *                               type: string
   *                               example: "00:22:15"
   *                             pace:
   *                               type: string
   *                               example: "04:27 min/km"
   *                       tags:
   *                         type: array
   *                         items:
   *                           type: string
   *                         example: ["race", "personal-best", "hilly"]
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-15T12:00:00.000Z"
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
   *                   example: UNAUTHORIZED_ACCESS
   *       404:
   *         description: No records found
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
   *                   example: NO_RECORDS_FOUND
   *
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
   *                   example: INTERNAL_SERVER_ERROR
   */
  .get("/", authorize, ctr.getAllRecords)

  /**
   * @openapi
   * /api/personal-records/stats:
   *   get:
   *     tags: [Personal Records]
   *     summary: Get records statistics
   *     description: Retrieves comprehensive statistics and analytics about the user's personal records.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Statistics retrieved successfully
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
   *                   example: SUCCESS
   *                 data:
   *                   type: object
   *                   properties:
   *                     totalRecords:
   *                       type: integer
   *                       example: 25
   *                     bestOverallPace:
   *                       type: integer
   *                       example: 1620
   *                     longestDistance:
   *                       type: number
   *                       format: float
   *                       example: 42.2
   *                     recentRecords:
   *                       type: array
   *                       items:
   *                         type: object
   *                     distanceBreakdown:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           distance:
   *                             type: number
   *                             example: 10.0
   *                           time:
   *                             type: integer
   *                             example: 2700
   *                           date:
   *                             type: string
   *                             format: date-time
   *                     recordsByDistance:
   *                       type: object
   *                       additionalProperties:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             format: uuid
   *                           distance:
   *                             type: number
   *                           time:
   *                             type: string
   *                           timeInSeconds:
   *                             type: integer
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
   *                   example: INTERNAL_SERVER_ERROR
   */
  .get("/stats", authorize, ctr.getRecordsStats)

  /**
   * @openapi
   * /api/personal-records/best/{distance}:
   *   get:
   *     tags: [Personal Records]
   *     summary: Get best record by distance
   *     description: Retrieves the personal best record for a specific distance.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: distance
   *         required: true
   *         schema:
   *           type: number
   *           format: float
   *         description: Distance in kilometers (e.g., 5, 10, 21.1, 42.2)
   *     responses:
   *       200:
   *         description: Best record retrieved successfully
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
   *                   example: SUCCESS
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
   *                     distance:
   *                       type: number
   *                       format: float
   *                       example: 10.0
   *                     time:
   *                       type: string
   *                       example: "00:45:30"
   *                     timeInSeconds:
   *                       type: integer
   *                       example: 2730
   *                     date:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T10:30:00.000Z"
   *                     location:
   *                       type: string
   *                       nullable: true
   *                       example: "Central Park, NYC"
   *                     notes:
   *                       type: string
   *                       nullable: true
   *                       example: "Great pace despite windy conditions"
   *                     weather:
   *                       type: object
   *                       nullable: true
   *                       properties:
   *                         temperature:
   *                           type: number
   *                           example: 18.5
   *                         conditions:
   *                           type: string
   *                           example: "Partly Cloudy"
   *                         humidity:
   *                           type: number
   *                           example: 65
   *                         windSpeed:
   *                           type: number
   *                           example: 15
   *                     heartRate:
   *                       type: object
   *                       nullable: true
   *                       properties:
   *                         average:
   *                           type: number
   *                           example: 165
   *                         max:
   *                           type: number
   *                           example: 182
   *                         min:
   *                           type: number
   *                           example: 120
   *                     elevation:
   *                       type: object
   *                       nullable: true
   *                       properties:
   *                         gain:
   *                           type: number
   *                           example: 150
   *                         loss:
   *                           type: number
   *                           example: 120
   *                         maxAltitude:
   *                           type: number
   *                           example: 250
   *                     splits:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           distance:
   *                             type: number
   *                             example: 5.0
   *                           time:
   *                             type: string
   *                             example: "00:22:15"
   *                           pace:
   *                             type: string
   *                             example: "04:27 min/km"
   *                     tags:
   *                       type: array
   *                       items:
   *                         type: string
   *                       example: ["race", "personal-best", "hilly"]
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T12:00:00.000Z"
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T12:00:00.000Z"
   *       400:
   *         description: Invalid distance parameter
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
   *                   example: INVALID_DISTANCE_FOR_RECORD_DATA
   *       404:
   *         description: No record found for this distance
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
   *                   example: NO_RECORD_FOUND_FOR_DISTANCE
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
   *                   example: INTERNAL_SERVER_ERROR
   */
  .get("/best/:distance", authorize, ctr.getBestRecordByDistance)

  /**
   * @openapi
   * /api/personal-records/{id}:
   *   get:
   *     tags: [Personal Records]
   *     summary: Get specific record
   *     description: Retrieves a specific personal record by its ID.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The ID of the personal record to retrieve
   *     responses:
   *       200:
   *         description: Record retrieved successfully
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
   *                   example: SUCCESS
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
   *                     distance:
   *                       type: number
   *                       format: float
   *                       example: 10.0
   *                     time:
   *                       type: string
   *                       example: "00:45:30"
   *                     timeInSeconds:
   *                       type: integer
   *                       example: 2730
   *                     date:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T10:30:00.000Z"
   *                     location:
   *                       type: string
   *                       nullable: true
   *                       example: "Central Park, NYC"
   *                     notes:
   *                       type: string
   *                       nullable: true
   *                       example: "Great pace despite windy conditions"
   *                     weather:
   *                       type: object
   *                       nullable: true
   *                       properties:
   *                         temperature:
   *                           type: number
   *                           example: 18.5
   *                         conditions:
   *                           type: string
   *                           example: "Partly Cloudy"
   *                         humidity:
   *                           type: number
   *                           example: 65
   *                         windSpeed:
   *                           type: number
   *                           example: 15
   *                     heartRate:
   *                       type: object
   *                       nullable: true
   *                       properties:
   *                         average:
   *                           type: number
   *                           example: 165
   *                         max:
   *                           type: number
   *                           example: 182
   *                         min:
   *                           type: number
   *                           example: 120
   *                     elevation:
   *                       type: object
   *                       nullable: true
   *                       properties:
   *                         gain:
   *                           type: number
   *                           example: 150
   *                         loss:
   *                           type: number
   *                           example: 120
   *                         maxAltitude:
   *                           type: number
   *                           example: 250
   *                     splits:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           distance:
   *                             type: number
   *                             example: 5.0
   *                           time:
   *                             type: string
   *                             example: "00:22:15"
   *                           pace:
   *                             type: string
   *                             example: "04:27 min/km"
   *                     tags:
   *                       type: array
   *                       items:
   *                         type: string
   *                       example: ["race", "personal-best", "hilly"]
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T12:00:00.000Z"
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T12:00:00.000Z"
   *       404:
   *         description: Record not found
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
   *                   example: RECORD_NOT_FOUND
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
   *                   example: INTERNAL_SERVER_ERROR
   */
  .get("/:id", authorize, ctr.getRecordById)

  /**
   * @openapi
   * /api/personal-records:
   *   post:
   *     tags: [Personal Records]
   *     summary: Create a new personal record
   *     description: Creates a new personal running record. The system verifies if it's actually a personal best for the given distance.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - distance
   *               - time
   *               - date
   *             properties:
   *               distance:
   *                 type: number
   *                 format: float
   *                 minimum: 0.1
   *                 example: 10.0
   *                 description: Distance in kilometers
   *               time:
   *                 type: string
   *                 pattern: "^([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{2}$"
   *                 example: "00:45:30"
   *                 description: Time in format HH:MM:SS or MM:SS
   *               date:
   *                 type: string
   *                 format: date-time
   *                 example: "2024-01-15T10:30:00.000Z"
   *               notes:
   *                 type: string
   *                 maxLength: 500
   *                 example: "Great pace despite windy conditions"
   *               location:
   *                 type: string
   *                 maxLength: 100
   *                 example: "Central Park, NYC"
   *               weather:
   *                 type: object
   *                 properties:
   *                   temperature:
   *                     type: number
   *                     example: 18.5
   *                   conditions:
   *                     type: string
   *                     example: "Partly Cloudy"
   *                   humidity:
   *                     type: number
   *                     minimum: 0
   *                     maximum: 100
   *                     example: 65
   *                   windSpeed:
   *                     type: number
   *                     minimum: 0
   *                     example: 15
   *               heartRate:
   *                 type: object
   *                 properties:
   *                   average:
   *                     type: number
   *                     minimum: 40
   *                     maximum: 220
   *                     example: 165
   *                   max:
   *                     type: number
   *                     minimum: 40
   *                     maximum: 220
   *                     example: 182
   *                   min:
   *                     type: number
   *                     minimum: 40
   *                     maximum: 220
   *                     example: 120
   *               elevation:
   *                 type: object
   *                 properties:
   *                   gain:
   *                     type: number
   *                     minimum: 0
   *                     example: 150
   *                   loss:
   *                     type: number
   *                     minimum: 0
   *                     example: 120
   *                   maxAltitude:
   *                     type: number
   *                     example: 250
   *               splits:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     distance:
   *                       type: number
   *                       minimum: 0.1
   *                       example: 5.0
   *                     time:
   *                       type: string
   *                       example: "00:22:15"
   *                     pace:
   *                       type: string
   *                       example: "04:27 min/km"
   *               tags:
   *                 type: array
   *                 items:
   *                   type: string
   *                 example: ["race", "personal-best", "hilly"]
   *     responses:
   *       201:
   *         description: Personal record created successfully
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
   *                   example: RECORD_CREATED
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
   *                     distance:
   *                       type: number
   *                       format: float
   *                       example: 10.0
   *                     time:
   *                       type: string
   *                       example: "00:45:30"
   *                     timeInSeconds:
   *                       type: integer
   *                       example: 2730
   *                     date:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T10:30:00.000Z"
   *                     location:
   *                       type: string
   *                       nullable: true
   *                       example: "Central Park, NYC"
   *                     notes:
   *                       type: string
   *                       nullable: true
   *                       example: "Great pace despite windy conditions"
   *                     weather:
   *                       type: object
   *                       nullable: true
   *                       properties:
   *                         temperature:
   *                           type: number
   *                           example: 18.5
   *                         conditions:
   *                           type: string
   *                           example: "Partly Cloudy"
   *                         humidity:
   *                           type: number
   *                           example: 65
   *                         windSpeed:
   *                           type: number
   *                           example: 15
   *                     heartRate:
   *                       type: object
   *                       nullable: true
   *                       properties:
   *                         average:
   *                           type: number
   *                           example: 165
   *                         max:
   *                           type: number
   *                           example: 182
   *                         min:
   *                           type: number
   *                           example: 120
   *                     elevation:
   *                       type: object
   *                       nullable: true
   *                       properties:
   *                         gain:
   *                           type: number
   *                           example: 150
   *                         loss:
   *                           type: number
   *                           example: 120
   *                         maxAltitude:
   *                           type: number
   *                           example: 250
   *                     splits:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           distance:
   *                             type: number
   *                             example: 5.0
   *                           time:
   *                             type: string
   *                             example: "00:22:15"
   *                           pace:
   *                             type: string
   *                             example: "04:27 min/km"
   *                     tags:
   *                       type: array
   *                       items:
   *                         type: string
   *                       example: ["race", "personal-best", "hilly"]
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T12:00:00.000Z"
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T12:00:00.000Z"
   *       400:
   *         description: Invalid input data or not a personal best
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
   *                   example: INTERNAL_SERVER_ERROR
   */
  .post("/", authorize, ctr.createRecord)

  /**
   * @openapi
   * /api/personal-records/{id}:
   *   put:
   *     tags: [Personal Records]
   *     summary: Update a personal record
   *     description: Updates an existing personal record.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The ID of the personal record to update
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               distance:
   *                 type: number
   *                 format: float
   *                 minimum: 0.1
   *                 example: 10.0
   *               time:
   *                 type: string
   *                 pattern: "^([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{2}$"
   *                 example: "00:45:30"
   *               date:
   *                 type: string
   *                 format: date-time
   *                 example: "2024-01-15T10:30:00.000Z"
   *               notes:
   *                 type: string
   *                 maxLength: 500
   *                 example: "Updated notes"
   *               location:
   *                 type: string
   *                 maxLength: 100
   *                 example: "Updated location"
   *               weather:
   *                 type: object
   *                 properties:
   *                   temperature:
   *                     type: number
   *                     example: 20.0
   *                   conditions:
   *                     type: string
   *                     example: "Sunny"
   *               tags:
   *                 type: array
   *                 items:
   *                   type: string
   *                 example: ["updated", "race"]
   *     responses:
   *       200:
   *         description: Record updated successfully
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
   *                   example: RECORD_UPDATED
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
   *                     distance:
   *                       type: number
   *                       format: float
   *                       example: 10.0
   *                     time:
   *                       type: string
   *                       example: "00:45:30"
   *                     timeInSeconds:
   *                       type: integer
   *                       example: 2730
   *                     date:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T10:30:00.000Z"
   *                     location:
   *                       type: string
   *                       nullable: true
   *                       example: "Updated location"
   *                     notes:
   *                       type: string
   *                       nullable: true
   *                       example: "Updated notes"
   *                     weather:
   *                       type: object
   *                       nullable: true
   *                       properties:
   *                         temperature:
   *                           type: number
   *                           example: 20.0
   *                         conditions:
   *                           type: string
   *                           example: "Sunny"
   *                     tags:
   *                       type: array
   *                       items:
   *                         type: string
   *                       example: ["updated", "race"]
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-16T12:00:00.000Z"
   *       400:
   *         description: Invalid input data
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
   *         description: Record not found
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
   *                   example: RECORD_NOT_FOUND
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
   *                   example: INTERNAL_SERVER_ERROR
   */
  .put("/:id", authorize, ctr.updateRecord)

  /**
   * @openapi
   * /api/personal-records/{id}:
   *   delete:
   *     tags: [Personal Records]
   *     summary: Delete a personal record
   *     description: Deletes a specific personal record.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The ID of the personal record to delete
   *     responses:
   *       200:
   *         description: Record deleted successfully
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
   *                   example: RECORD_DELETED
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       format: uuid
   *                       example: "507f1f77bcf86cd799439011"
   *       404:
   *         description: Record not found
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
   *                   example: RECORD_NOT_FOUND
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
   *                   example: INTERNAL_SERVER_ERROR
   */
  .delete("/:id", authorize, ctr.deleteRecord);

module.exports = router;
