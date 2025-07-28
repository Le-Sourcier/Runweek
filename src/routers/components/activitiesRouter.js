const router = require("express").Router();
const activitiesController = require("../../controllers/components/activitiesController");
const { authorize } = require("../../middlewares/authMiddleware");

/**
 * @openapi
 * tags:
 *   - name: Activities & Notifications
 *     description: Retrieve user activity feeds and performance metrics.
 */
router
  /**
   * @openapi
   * /api/notif/get/all:
   *   get:
   *     tags:
   *       - Activities & Notifications
   *     summary: Get all recent notifications/activities for a user
   *     description: Fetches a combined list of recent notifications for the authenticated user.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved recent activities.
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
   *                       type:
   *                         type: string
   *                         enum: [ENRICH_JOB, SCRAPING_JOB,CREDIT_LOW,FREEMIUM_ACCOUNT_DEACTIVATED,SUBSCRIPTION_EXPIRED]
   *                       label:
   *                         type: string
   *                         description: A descriptive label for the activity
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                         description: Formatted creation date
   *       404:
   *         description: Notification not found or does not belong to user.
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
   *                   example: NOTIF_NOT_FOUND
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
   *                   example: Unauthorized
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
   *                   example: Internal Server Error
   */
  .get("/get/all", authorize, activitiesController.getAllNotif)
  /**
   * @openapi
   * /api/notif/notif/{id}:
   *   get:
   *     tags:
   *       - Activities & Notifications
   *     summary: Get details of a specific notification
   *     description: Retrieves detailed information of a specific notification, only if it belongs to the authenticated user.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Unique ID of the notification.
   *     responses:
   *       200:
   *         description: Successfully retrieved notification details.
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
   *                     type:
   *                       type: string
   *                       enum: [ENRICH_JOB, SCRAPING_JOB,CREDIT_LOW,FREEMIUM_ACCOUNT_DEACTIVATED,SUBSCRIPTION_EXPIRED]
   *                     label:
   *                       type: string
   *                     user_id:
   *                       type: string
   *                       format: uuid
   *                     status:
   *                       type: string
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *       404:
   *         description: Notification not found or does not belong to user.
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
   *                   example: NOTIF_NOT_FOUND
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
   *                   example: Unauthorized
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
   *                   example: Internal Server Error
   */
  .get("/notif/:id", authorize, activitiesController.readNotifDetails)
  /**
   * @openapi
   * /api/notif/activities:
   *   post:
   *     tags:
   *       - Activities & Notifications
   *     summary: Get recent activities for the user (placeholder)
   *     description: Currently returns notifications list similar to `/get/all`.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - id
   *             properties:
   *               id:
   *                 type: string
   *                 format: uuid
   *                 description: User ID
   *     responses:
   *       200:
   *         description: Returns a list of activities.
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
   *                       type:
   *                         type: string
   *                       label:
   *                         type: string
   *                       is_read:
   *                         type: boolean
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                       metadata:
   *                         type: object
   *                         description: Optional metadata related to the notification
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
   *                   example: Unauthorized
   *       500:
   *         description: Server error.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error500'
   */
  .post("/activities", authorize, activitiesController.getRecentActivities)
  /**
   * @openapi
   * /api/notif/update-notif/{id}:
   *   put:
   *     tags:
   *       - Activities & Notifications
   *     summary: Mark a notification as read or unread
   *     description: Marks a specific notification as read or unread for the authenticated user.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID of the notification to update
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               is_read:
   *                 type: boolean
   *                 default: true
   *                 description: Set to true to mark as read (default), or false to mark as unread
   *     responses:
   *       200:
   *         description: Notification status updated successfully
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
   *                   example: MARKED_AS_READ
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       format: uuid
   *                     is_read:
   *                       type: boolean
   *                       example: true
   *       200_alt:
   *         description: No change needed — the notification already had the specified status
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
   *                   example: NO_CHANGE
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       format: uuid
   *                     is_read:
   *                       type: boolean
   *                       example: true
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
   *                   example: TOKEN_EXPIRED
   *       404:
   *         description: Notification not found
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
   *                   example: NOTIF_NOT_FOUND
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
  .put("/update-notif/:id", authorize, activitiesController.markAsRead);

module.exports = router;
