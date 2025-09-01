const express = require("express");
const router = express.Router();
const calendarController = require("../../controllers/components/calendarController");
const { authorize } = require("../../middlewares/authMiddleware");

/**
 * @openapi
 * tags:
 *   name: Calendar Events
 *   description: Calendar event management and retrieval
 */
router
  /**
   * @openapi
   * /api/calendar/events:
   *   get:
   *     tags: [Calendar Events]
   *     summary: Get user events
   *     description: Retrieves calendar events for the authenticated user with optional filtering
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *           example: "2024-01-01"
   *         description: Start date for filtering events (YYYY-MM-DD)
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *           example: "2024-01-31"
   *         description: End date for filtering events (YYYY-MM-DD)
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [Run, Bike, Swim, Gym, Other, all]
   *           default: "all"
   *         description: Filter events by activity type
   *       - in: query
   *         name: completed
   *         schema:
   *           type: string
   *           enum: [true, false]
   *         description: Filter events by completion status
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 50
   *         description: Number of events per page
   *     responses:
   *       200:
   *         description: Events retrieved successfully
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
   *                   example: "EVENTS_RETRIEVED"
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
   *                       title:
   *                         type: string
   *                         example: "Morning Run"
   *                       date:
   *                         type: string
   *                         format: date
   *                         example: "2024-01-15"
   *                       time:
   *                         type: string
   *                         example: "08:30"
   *                       type:
   *                         type: string
   *                         enum: [Run, Bike, Swim, Gym, Other]
   *                         example: "Run"
   *                       distance:
   *                         type: number
   *                         format: float
   *                         example: 10.5
   *                       duration:
   *                         type: string
   *                         example: "01:15:30"
   *                       location:
   *                         type: string
   *                         example: "Central Park"
   *                       notes:
   *                         type: string
   *                         example: "Easy recovery run"
   *                       completed:
   *                         type: boolean
   *                         example: false
   *                       completedAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-15T09:30:00.000Z"
   *                       reminderSent:
   *                         type: boolean
   *                         example: false
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-10T14:30:00.000Z"
   *                       updatedAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-10T14:30:00.000Z"
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
   *                 message:
   *                   type: string
   *                   example: "INVALID_DATE_FORMAT"
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
   *       404:
   *         description: No events found
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
   *                   example: "NO_EVENTS_FOUND"
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
   *                   example: "EVENTS_RETRIEVAL_FAILED"
   */
  .get("/events", authorize, calendarController.getEvents)

  /**
   * @openapi
   * /api/calendar/events/upcoming:
   *   get:
   *     tags: [Calendar Events]
   *     summary: Get upcoming events
   *     description: Retrieves upcoming events within the specified hours
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: hours
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 168
   *           default: 24
   *         description: Number of hours to look ahead for upcoming events
   *     responses:
   *       200:
   *         description: Upcoming events retrieved successfully
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
   *                   example: "UPCOMING_EVENTS_RETRIEVED"
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/CalendarEvent'
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
   *                   example: "UPCOMING_EVENTS_RETRIEVAL_FAILED"
   */
  .get("/events/upcoming", authorize, calendarController.getUpcomingEvents)

  /**
   * @openapi
   * /api/calendar/events/{id}:
   *   get:
   *     tags: [Calendar Events]
   *     summary: Get specific event
   *     description: Retrieves a specific calendar event by ID
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Event ID
   *     responses:
   *       200:
   *         description: Event retrieved successfully
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
   *                   example: "EVENT_RETRIEVED"
   *                 data:
   *                   $ref: '#/components/schemas/CalendarEvent'
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
   *       404:
   *         description: Event not found
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
   *                   example: "EVENT_NOT_FOUND"
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
   *                   example: "EVENT_RETRIEVAL_FAILED"
   */
  .get("/events/:id", authorize, calendarController.getEvent)

  /**
   * @openapi
   * /api/calendar/events:
   *   post:
   *     tags: [Calendar Events]
   *     summary: Create new event
   *     description: Creates a new calendar event for the authenticated user
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
   *               - date
   *               - type
   *             properties:
   *               title:
   *                 type: string
   *                 maxLength: 100
   *                 example: "Morning Run"
   *               date:
   *                 type: string
   *                 format: date
   *                 example: "2024-01-20"
   *               time:
   *                 type: string
   *                 pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
   *                 example: "08:30"
   *               type:
   *                 type: string
   *                 enum: [Run, Bike, Swim, Gym, Other]
   *                 example: "Run"
   *               distance:
   *                 type: number
   *                 minimum: 0
   *                 maximum: 1000
   *                 example: 10.5
   *               duration:
   *                 type: string
   *                 pattern: "^([0-9]{1,2}:)?[0-5][0-9]:[0-5][0-9]$"
   *                 example: "01:15:30"
   *               location:
   *                 type: string
   *                 maxLength: 200
   *                 example: "Central Park"
   *               notes:
   *                 type: string
   *                 maxLength: 500
   *                 example: "Easy recovery run"
   *     responses:
   *       201:
   *         description: Event created successfully
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
   *                   example: "EVENT_CREATED"
   *                 data:
   *                   $ref: '#/components/schemas/CalendarEvent'
   *       400:
   *         description: Invalid event data
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
   *                   example: "TITLE_REQUIRED"
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
   *                   example: "EVENT_CREATION_FAILED"
   */
  .post("/events", authorize, calendarController.createEvent)

  /**
   * @openapi
   * /api/calendar/events/{id}:
   *   put:
   *     tags: [Calendar Events]
   *     summary: Update event
   *     description: Updates an existing calendar event
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Event ID
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
   *                 example: "Updated Run"
   *               date:
   *                 type: string
   *                 format: date
   *                 example: "2024-01-21"
   *               time:
   *                 type: string
   *                 pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
   *                 example: "09:00"
   *               type:
   *                 type: string
   *                 enum: [Run, Bike, Swim, Gym, Other]
   *                 example: "Run"
   *               distance:
   *                 type: number
   *                 minimum: 0
   *                 maximum: 1000
   *                 example: 12.0
   *               duration:
   *                 type: string
   *                 pattern: "^([0-9]{1,2}:)?[0-5][0-9]:[0-5][0-9]$"
   *                 example: "01:20:00"
   *               location:
   *                 type: string
   *                 maxLength: 200
   *                 example: "Riverside Park"
   *               notes:
   *                 type: string
   *                 maxLength: 500
   *                 example: "Updated notes"
   *     responses:
   *       200:
   *         description: Event updated successfully
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
   *                   example: "EVENT_UPDATED"
   *                 data:
   *                   $ref: '#/components/schemas/CalendarEvent'
   *       400:
   *         description: Invalid event data
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
   *                   example: "DATE_CANNOT_BE_PAST"
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
   *       404:
   *         description: Event not found
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
   *                   example: "EVENT_NOT_FOUND"
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
   *                   example: "EVENT_UPDATE_FAILED"
   */
  .put("/events/:id", authorize, calendarController.updateEvent)

  /**
   * @openapi
   * /api/calendar/events/{id}:
   *   delete:
   *     tags: [Calendar Events]
   *     summary: Delete event
   *     description: Deletes a calendar event
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Event ID
   *     responses:
   *       200:
   *         description: Event deleted successfully
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
   *                   example: "EVENT_DELETED"
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
   *       404:
   *         description: Event not found
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
   *                   example: "EVENT_NOT_FOUND"
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
   *                   example: "EVENT_DELETION_FAILED"
   */
  .delete("/events/:id", authorize, calendarController.deleteEvent)

  /**
   * @openapi
   * /api/calendar/events/{id}/complete:
   *   put:
   *     tags: [Calendar Events]
   *     summary: Mark event as completed
   *     description: Marks a calendar event as completed
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Event ID
   *     responses:
   *       200:
   *         description: Event marked as completed successfully
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
   *                   example: "EVENT_COMPLETED"
   *                 data:
   *                   $ref: '#/components/schemas/CalendarEvent'
   *       400:
   *         description: Event already completed
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
   *                   example: "EVENT_ALREADY_COMPLETED"
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
   *       404:
   *         description: Event not found
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
   *                   example: "EVENT_NOT_FOUND"
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
   *                   example: "EVENT_COMPLETION_FAILED"
   */
  .put("/events/:id/complete", authorize, calendarController.completeEvent);

/**
 * @openapi
 * components:
 *   schemas:
 *     CalendarEvent:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *         user_id:
 *           type: string
 *           format: uuid
 *           example: "507f1f77bcf86cd799439012"
 *         title:
 *           type: string
 *           example: "Morning Run"
 *         date:
 *           type: string
 *           format: date
 *           example: "2024-01-15"
 *         time:
 *           type: string
 *           example: "08:30"
 *         type:
 *           type: string
 *           enum: [Run, Bike, Swim, Gym, Other]
 *           example: "Run"
 *         distance:
 *           type: number
 *           format: float
 *           example: 10.5
 *         duration:
 *           type: string
 *           example: "01:15:30"
 *         location:
 *           type: string
 *           example: "Central Park"
 *         notes:
 *           type: string
 *           example: "Easy recovery run"
 *         completed:
 *           type: boolean
 *           example: false
 *         completedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T09:30:00.000Z"
 *         reminderSent:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-10T14:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-10T14:30:00.000Z"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

module.exports = router;
