const express = require("express");
const router = express.Router();
const dataSharingPreferencesController = require("../../controllers/components/dataSharingPreferencesController");
const { authorize } = require("../../middlewares/authMiddleware");

/**
 * @openapi
 * tags:
 *   name: Data Sharing Preferences
 *   description: User data sharing preferences management
 */
router
  /**
   * @openapi
   * /api/data-sharing/preferences:
   *   get:
   *     tags: [Data Sharing Preferences]
   *     summary: Get user's data sharing preferences
   *     description: Retrieve the authenticated user's data sharing preferences
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Data sharing preferences retrieved successfully
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
   *                   example: DATA_SHARING_PREFERENCES_RETRIEVED
   *                 data:
   *                   type: object
   *                   properties:
   *                     enabled:
   *                       type: boolean
   *                       example: true
   *                     shareNutrition:
   *                       type: boolean
   *                       example: false
   *                     shareActivities:
   *                       type: boolean
   *                       example: true
   *                     shareGoals:
   *                       type: boolean
   *                       example: true
   *                     shareAchievements:
   *                       type: boolean
   *                       example: true
   *                     allowFriendRequests:
   *                       type: boolean
   *                       example: true
   *                     showInSearch:
   *                       type: boolean
   *                       example: true
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T10:30:00.000Z"
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-20T14:45:00.000Z"
   *                     user:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: string
   *                           format: uuid
   *                           example: "b2c3d4e5-f6g7-8901-bcde-f23456789012"
   *                         fname:
   *                           type: string
   *                           example: "John"
   *                         lname:
   *                           type: string
   *                           example: "Doe"
   *                         email:
   *                           type: string
   *                           format: email
   *                           example: "john.doe@example.com"
   *       404:
   *         description: Data sharing preferences not found
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
   *                   example: DATA_SHARING_PREFERENCES_NOT_FOUND
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
   *                   example: DATA_SHARING_PREFERENCES_RETRIEVAL_FAILED
   */
  .get(
    "/",
    authorize,
    dataSharingPreferencesController.getMyDataSharingPreferences
  )

  /**
   * @openapi
   * /api/data-sharing/preferences:
   *   put:
   *     tags: [Data Sharing Preferences]
   *     summary: Update user's data sharing preferences
   *     description: Update the authenticated user's data sharing preferences
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               enabled:
   *                 type: boolean
   *                 example: true
   *                 description: Global toggle for data sharing
   *               shareNutrition:
   *                 type: boolean
   *                 example: false
   *                 description: Share nutrition data with friends
   *               shareActivities:
   *                 type: boolean
   *                 example: true
   *                 description: Share activity data with friends
   *               shareGoals:
   *                 type: boolean
   *                 example: true
   *                 description: Share goals with friends
   *               shareAchievements:
   *                 type: boolean
   *                 example: true
   *                 description: Share achievements with friends
   *               allowFriendRequests:
   *                 type: boolean
   *                 example: true
   *                 description: Allow other users to send friend requests
   *               showInSearch:
   *                 type: boolean
   *                 example: true
   *                 description: Show profile in user search results
   *     responses:
   *       200:
   *         description: Data sharing preferences updated successfully
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
   *                   example: DATA_SHARING_PREFERENCES_UPDATED
   *                 data:
   *                   type: object
   *                   properties:
   *                     enabled:
   *                       type: boolean
   *                       example: true
   *                     shareNutrition:
   *                       type: boolean
   *                       example: false
   *                     shareActivities:
   *                       type: boolean
   *                       example: true
   *                     shareGoals:
   *                       type: boolean
   *                       example: true
   *                     shareAchievements:
   *                       type: boolean
   *                       example: true
   *                     allowFriendRequests:
   *                       type: boolean
   *                       example: true
   *                     showInSearch:
   *                       type: boolean
   *                       example: true
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T10:30:00.000Z"
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-20T14:45:00.000Z"
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
   *                 status:
   *                   type: integer
   *                   example: 400
   *                 message:
   *                   type: string
   *                   example: BAD_REQUEST
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
   *                   example: DATA_SHARING_PREFERENCES_UPDATE_FAILED
   */
  .put(
    "/",
    authorize,
    dataSharingPreferencesController.updateMyDataSharingPreferences
  )

  /**
   * @openapi
   * /api/data-sharing/preferences/reset:
   *   post:
   *     tags: [Data Sharing Preferences]
   *     summary: Reset data sharing preferences to default
   *     description: Reset the authenticated user's data sharing preferences to default values
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Data sharing preferences reset successfully
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
   *                   example: DATA_SHARING_PREFERENCES_RESET
   *                 data:
   *                   type: object
   *                   properties:
   *                     enabled:
   *                       type: boolean
   *                       example: true
   *                     shareNutrition:
   *                       type: boolean
   *                       example: false
   *                     shareActivities:
   *                       type: boolean
   *                       example: true
   *                     shareGoals:
   *                       type: boolean
   *                       example: true
   *                     shareAchievements:
   *                       type: boolean
   *                       example: true
   *                     allowFriendRequests:
   *                       type: boolean
   *                       example: true
   *                     showInSearch:
   *                       type: boolean
   *                       example: true
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T10:30:00.000Z"
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-20T14:45:00.000Z"
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
   *                   example: DATA_SHARING_PREFERENCES_RESET_FAILED
   */
  .post("/reset", authorize, dataSharingPreferencesController.resetToDefault)

  /**
   * @openapi
   * /api/data-sharing/preferences/{userId}:
   *   get:
   *     tags: [Data Sharing Preferences]
   *     summary: Get user data sharing preferences (Admin only)
   *     description: Retrieve data sharing preferences for a specific user (Administrator access required)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID of the user to retrieve preferences for
   *     responses:
   *       200:
   *         description: Data sharing preferences retrieved successfully
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
   *                   example: DATA_SHARING_PREFERENCES_RETRIEVED
   *                 data:
   *                   type: object
   *                   properties:
   *                     enabled:
   *                       type: boolean
   *                       example: true
   *                     shareNutrition:
   *                       type: boolean
   *                       example: false
   *                     shareActivities:
   *                       type: boolean
   *                       example: true
   *                     shareGoals:
   *                       type: boolean
   *                       example: true
   *                     shareAchievements:
   *                       type: boolean
   *                       example: true
   *                     allowFriendRequests:
   *                       type: boolean
   *                       example: true
   *                     showInSearch:
   *                       type: boolean
   *                       example: true
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T10:30:00.000Z"
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-20T14:45:00.000Z"
   *       403:
   *         description: Forbidden - Administrator access required
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
   *                   example: 403
   *                 message:
   *                   type: string
   *                   example: FORBIDDEN_RESOURCE
   *       404:
   *         description: Data sharing preferences not found
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
   *                   example: DATA_SHARING_PREFERENCES_NOT_FOUND
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
   *                   example: DATA_SHARING_PREFERENCES_RETRIEVAL_FAILED
   */
  .get(
    "/:userId",
    authorize,
    dataSharingPreferencesController.getUserDataSharingPreferences
  );

module.exports = router;
