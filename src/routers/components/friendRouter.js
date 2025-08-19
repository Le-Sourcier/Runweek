const express = require('express');
const router = express.Router();
const {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getFriends,
  getFriendRequests,
} = require('../../controllers/components/friendController');
const { authorize } = require("../../middlewares/authMiddleware");

/**
 * @openapi
 * tags:
 *   - name: Friends
 *     description: Endpoints for managing friend requests and friendships.
 */

/**
 * @openapi
 * /api/friends/request:
 *   post:
 *     tags:
 *       - Friends
 *     summary: Send a friend request
 *     description: Sends a friend request to another user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *             properties:
 *               receiverId:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the user to send the friend request to.
 *                 example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *     responses:
 *       201:
 *         description: Friend request sent successfully.
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
 *                   example: "Friend request sent successfully"
 *                 data:
 *                   $ref: '#/components/schemas/FriendRequest'
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error400'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error500'
 */
router.post('/request', authorize, sendFriendRequest);

/**
 * @openapi
 * /api/friends/request/{requestId}/accept:
 *   post:
 *     tags:
 *       - Friends
 *     summary: Accept a friend request
 *     description: Accepts a pending friend request.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The ID of the friend request to accept.
 *     responses:
 *       200:
 *         description: Friend request accepted successfully.
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
 *                   example: "Friend request accepted successfully"
 *       400:
 *         description: Bad request (e.g., request not pending).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error400'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       404:
 *         description: Friend request not found or you are not the receiver.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error500'
 */
router.post('/request/:requestId/accept', authorize, acceptFriendRequest);

/**
 * @openapi
 * /api/friends/request/{requestId}/decline:
 *   post:
 *     tags:
 *       - Friends
 *     summary: Decline a friend request
 *     description: Declines a pending friend request.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The ID of the friend request to decline.
 *     responses:
 *       200:
 *         description: Friend request declined successfully.
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
 *                   example: "Friend request declined successfully"
 *       400:
 *         description: Bad request (e.g., request not pending).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error400'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       404:
 *         description: Friend request not found or you are not the receiver.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error500'
 */
router.post('/request/:requestId/decline', authorize, declineFriendRequest);

/**
 * @openapi
 * /api/friends:
 *   get:
 *     tags:
 *       - Friends
 *     summary: Get user's friends list
 *     description: Retrieves a list of all accepted friends for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of friends.
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
 *                   example: "Friends list retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserMeResponseData' # Assuming a simplified user object for friends
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error500'
 */
router.get('/', authorize, getFriends);

/**
 * @openapi
 * /api/friends/requests:
 *   get:
 *     tags:
 *       - Friends
 *     summary: Get pending friend requests
 *     description: Retrieves a list of pending friend requests for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of pending friend requests.
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
 *                   example: "Friend requests retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FriendRequest'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error500'
 */
router.get('/requests', authorize, getFriendRequests);

module.exports = router;