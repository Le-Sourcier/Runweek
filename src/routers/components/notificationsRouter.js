const router = require("express").Router();
const notificationsController = require("../../controllers/components/notificationsController");
const { authorize } = require("../../middlewares/authMiddleware");

/**
 * @openapi
 * tags:
 *   - name: Notifications
 *     description: Retrieve and manage user notifications.
 */
router
  /**
   * @openapi
   * /api/notif/all:
   *   get:
   *     tags:
   *       - Notifications
   *     summary: Get all notifications for a user
   *     description: Fetches a list of all notifications for the authenticated user.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved notifications.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralSuccessResponse'
   *       404:
   *         description: Notifications not found.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error404'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error401'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error500'
   */
  .get("/all", authorize, notificationsController.getAllNotif)
  /**
   * @openapi
   * /api/notif/recent:
   *   get:
   *     tags:
   *       - Notifications
   *     summary: Get recent notifications for the user
   *     description: Fetches a list of the 50 most recent notifications for the authenticated user.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Returns a list of recent notifications.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralSuccessResponse'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error401'
   *       500:
   *         description: Server error.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error500'
   */
  .get("/recent", authorize, notificationsController.getRecentNotifications)
  /**
   * @openapi
   * /api/notif/{id}:
   *   get:
   *     tags:
   *       - Notifications
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
   *               $ref: '#/components/schemas/GeneralSuccessResponse'
   *       404:
   *         description: Notification not found or does not belong to user.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error404'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error401'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error500'
   */
  .get("/:id", authorize, notificationsController.readNotifDetails)
  /**
   * @openapi
   * /api/notif/{id}/read:
   *   put:
   *     tags:
   *       - Notifications
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
   *               $ref: '#/components/schemas/GeneralSuccessResponse'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error401'
   *       404:
   *         description: Notification not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error404'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error500'
   */
  .put("/:id/read", authorize, notificationsController.markAsRead);

module.exports = router;
