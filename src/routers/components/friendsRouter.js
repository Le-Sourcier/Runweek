const express = require("express");
const router = express.Router();
const { authorize } = require("../../middlewares/authMiddleware");
const ctr = require("../../controllers/components/friendsController");

/**
 * @openapi
 * tags:
 *   name: Friends
 *   description: Friends management, messaging, and social features
 */
router
  /**
   * @openapi
   * /api/friends:
   *   get:
   *     tags: [Friends]
   *     summary: Get friends list
   *     description: Retrieves the authenticated user's friends list with optional filtering and sorting
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [online, offline, all]
   *           default: all
   *         description: Filter friends by online status
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *           enum: [name, level, recent, mutual]
   *           default: name
   *         description: Sort friends by criteria
   *     responses:
   *       200:
   *         description: Friends list retrieved successfully
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
   *                   example: FRIENDS_RETRIEVED
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         format: uuid
   *                         example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
   *                       name:
   *                         type: string
   *                         example: "John Doe"
   *                       email:
   *                         type: string
   *                         format: email
   *                         example: "john.doe@example.com"
   *                       profileImage:
   *                         type: string
   *                         nullable: true
   *                         example: "https://example.com/profile.jpg"
   *                       isOnline:
   *                         type: boolean
   *                         example: true
   *                       lastActivity:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-20T10:30:00.000Z"
   *                       mutualFriends:
   *                         type: integer
   *                         example: 5
   *                       joinedDate:
   *                         type: string
   *                         format: date
   *                         example: "2024-01-15"
   *                       stats:
   *                         type: object
   *                         nullable: true
   *                         properties:
   *                           totalDistance:
   *                             type: number
   *                             example: 150.5
   *                           totalRuns:
   *                             type: integer
   *                             example: 25
   *                           averagePace:
   *                             type: string
   *                             example: "5:30"
   *                           level:
   *                             type: integer
   *                             example: 5
   *                           experience:
   *                             type: integer
   *                             example: 1250
   *                       preferences:
   *                         type: object
   *                         properties:
   *                           profileVisibility:
   *                             type: string
   *                             enum: [public, private]
   *                             example: "public"
   *                           activityVisibility:
   *                             type: string
   *                             enum: [friends, private]
   *                             example: "friends"
   *       404:
   *         description: No friends found
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
   *                   example: NO_FRIENDS_FOUND
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
   *                   example: FRIENDS_RETRIEVAL_FAILED
   */
  .get("/", authorize, ctr.getFriends) // GET /api/friends Retrieve the authenticated user's friends list with optional filtering and sorting

  /**
   * @openapi
   * /api/friends/requests:
   *   get:
   *     tags: [Friends]
   *     summary: Get friend requests
   *     description: Retrieves pending friend requests (received or sent)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [received, sent]
   *           default: received
   *         description: Type of requests to retrieve
   *     responses:
   *       200:
   *         description: Friend requests retrieved successfully
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
   *                   example: FRIENDS_RETRIEVED
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         format: uuid
   *                         example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
   *                       requester:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             format: uuid
   *                             example: "507f1f77bcf86cd799439012"
   *                           fname:
   *                             type: string
   *                             example: "John"
   *                           lname:
   *                             type: string
   *                             example: "Doe"
   *                           email:
   *                             type: string
   *                             format: email
   *                             example: "john.doe@example.com"
   *                           profile_image:
   *                             type: string
   *                             nullable: true
   *                             example: "https://example.com/profile.jpg"
   *                           stats:
   *                             type: object
   *                             properties:
   *                               level:
   *                                 type: number
   *                                 example: 5
   *                       recipient:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             format: uuid
   *                             example: "507f1f77bcf86cd799439013"
   *                           fname:
   *                             type: string
   *                             example: "Jane"
   *                           lname:
   *                             type: string
   *                             example: "Smith"
   *                           email:
   *                             type: string
   *                             format: email
   *                             example: "jane.smith@example.com"
   *                           profile_image:
   *                             type: string
   *                             nullable: true
   *                             example: "https://example.com/profile2.jpg"
   *                           stats:
   *                             type: object
   *                             properties:
   *                               level:
   *                                 type: number
   *                                 example: 7
   *                       status:
   *                         type: string
   *                         enum: [pending, accepted, declined, blocked]
   *                         example: "pending"
   *                       requestMessage:
   *                         type: string
   *                         nullable: true
   *                         example: "Hey, let's be friends!"
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-15T12:00:00.000Z"
   *       404:
   *         description: No friend requests found
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
   *                   example: NO_FRIEND_REQUESTS_FOUND
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
   *                   example: FRIEND_REQUESTS_RETRIEVAL_FAILED
   */
  .get("/requests", authorize, ctr.getFriendRequests) // GET /api/friends/requests Retrieve pending friend requests (received or sent)

  /**
   * @openapi
   * /api/friends/request:
   *   post:
   *     tags: [Friends]
   *     summary: Send friend request
   *     description: Sends a friend request to another user by email
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "jane.smith@example.com"
   *                 description: Email of the user to send friend request to
   *               message:
   *                 type: string
   *                 maxLength: 300
   *                 example: "Hey, let's connect and track our progress together!"
   *                 description: Optional message to include with the request
   *     responses:
   *       200:
   *         description: Friend request sent successfully
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
   *                   example: FRIEND_REQUEST_SENT
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       format: uuid
   *                       example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
   *                     requester:
   *                       type: string
   *                       format: uuid
   *                       example: "507f1f77bcf86cd799439012"
   *                     recipient:
   *                       type: string
   *                       format: uuid
   *                       example: "507f1f77bcf86cd799439013"
   *                     status:
   *                       type: string
   *                       example: "pending"
   *                     requestMessage:
   *                       type: string
   *                       example: "Hey, let's connect and track our progress together!"
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T12:00:00.000Z"
   *       400:
   *         description: Bad request
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
   *       404:
   *         description: User not found
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
   *                   example: USER_NOT_FOUND
   *       409:
   *         description: Friend request already exists
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
   *                   example: 409
   *                 message:
   *                   type: string
   *                   example: FRIEND_REQUEST_ALREADY_SENT
   *       403:
   *         description: Friendship not allowed
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
   *                   example: FRIENDSHIP_NOT_ALLOWED
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
   *                   example: FRIEND_REQUEST_FAILED
   */
  .post("/request", authorize, ctr.sendFriendRequest) // POST /api/friends/request Send a friend request to another user by email

  /**
   * @openapi
   * /api/friends/requests/{id}/accept:
   *   put:
   *     tags: [Friends]
   *     summary: Accept friend request
   *     description: Accepts a pending friend request
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID of the friend request to accept
   *     responses:
   *       200:
   *         description: Friend request accepted successfully
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
   *                   example: FRIEND_REQUEST_ACCEPTED
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       format: uuid
   *                       example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
   *                     requester:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: string
   *                           format: uuid
   *                           example: "507f1f77bcf86cd799439012"
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
   *                         profile_image:
   *                           type: string
   *                           nullable: true
   *                           example: "https://example.com/profile.jpg"
   *                     recipient:
   *                       type: string
   *                       format: uuid
   *                       example: "507f1f77bcf86cd799439013"
   *                     status:
   *                       type: string
   *                       example: "accepted"
   *                     acceptedAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T12:00:00.000Z"
   *       404:
   *         description: Friend request not found
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
   *                   example: FRIEND_REQUEST_NOT_FOUND
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
   *                   example: FRIEND_REQUEST_ACCEPT_FAILED
   */
  .put("/requests/:id/accept", authorize, ctr.acceptFriendRequest) // PUT /api/friends/requests/:id/accept Accept a friend request by ID

  /**
   * @openapi
   * /api/friends/requests/{id}/decline:
   *   put:
   *     tags: [Friends]
   *     summary: Decline friend request
   *     description: Declines a pending friend request
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID of the friend request to decline
   *     responses:
   *       200:
   *         description: Friend request declined successfully
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
   *                   example: FRIEND_REQUEST_DECLINED
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       format: uuid
   *                       example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
   *                     requester:
   *                       type: string
   *                       format: uuid
   *                       example: "507f1f77bcf86cd799439012"
   *                     recipient:
   *                       type: string
   *                       format: uuid
   *                       example: "507f1f77bcf86cd799439013"
   *                     status:
   *                       type: string
   *                       example: "declined"
   *                     declinedAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T12:00:00.000Z"
   *       404:
   *         description: Friend request not found
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
   *                   example: FRIEND_REQUEST_NOT_FOUND
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
   *                   example: FRIEND_REQUEST_DECLINE_FAILED
   */
  .put("/requests/:id/decline", authorize, ctr.declineFriendRequest) // PUT /api/friends/requests/:id/decline Decline a friend request by ID

  /**
   * @openapi
   * /api/friends/{id}:
   *   delete:
   *     tags: [Friends]
   *     summary: Delete friend
   *     description: Removes a friend from the user's friends list
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID of the friend to remove
   *     responses:
   *       200:
   *         description: Friend deleted successfully
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
   *                   example: FRIEND_DELETED
   *       404:
   *         description: Friendship not found
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
   *                   example: FRIENDSHIP_NOT_FOUND
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
   *                   example: FRIEND_DELETION_FAILED
   */
  .delete("/:id", authorize, ctr.deleteFriend) // DELETE /api/friends/:id Remove a friend by ID

  /**
   * @openapi
   * /api/friends/search:
   *   get:
   *     tags: [Friends]
   *     summary: Search users
   *     description: Search for users to add as friends
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: q
   *         required: true
   *         schema:
   *           type: string
   *         description: Search query (minimum 2 characters)
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Maximum number of results to return
   *     responses:
   *       200:
   *         description: Users retrieved successfully
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
   *                   example: USERS_RETRIEVED
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         format: uuid
   *                         example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
   *                       fname:
   *                         type: string
   *                         example: "John"
   *                       lname:
   *                         type: string
   *                         example: "Doe"
   *                       email:
   *                         type: string
   *                         format: email
   *                         example: "john.doe@example.com"
   *                       profile_image:
   *                         type: string
   *                         nullable: true
   *                         example: "https://example.com/profile.jpg"
   *                       stats:
   *                         type: object
   *                         properties:
   *                           level:
   *                             type: number
   *                             example: 5
   *                           experience:
   *                             type: number
   *                             example: 1250
   *                       preferences:
   *                         type: object
   *                         properties:
   *                           dataSharing:
   *                             type: object
   *                             properties:
   *                               showInSearch:
   *                                 type: boolean
   *                                 example: true
   *       400:
   *         description: Search query too short
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
   *                   example: SEARCH_QUERY_TOO_SHORT
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
   *                   example: USER_SEARCH_FAILED
   */
  .get("/search", authorize, ctr.searchUsers) // GET /api/friends/search Search for users to add as friends

  /**
   * @openapi
   * /api/friends/conversations:
   *   get:
   *     tags: [Friends]
   *     summary: Get conversations
   *     description: Retrieves the user's conversations
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Conversations retrieved successfully
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
   *                   example: CONVERSATIONS_RETRIEVED
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         format: uuid
   *                         example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
   *                       participants:
   *                         type: array
   *                         items:
   *                           type: object
   *                           properties:
   *                             id:
   *                               type: string
   *                               format: uuid
   *                               example: "507f1f77bcf86cd799439012"
   *                             fname:
   *                               type: string
   *                               example: "John"
   *                             lname:
   *                               type: string
   *                               example: "Doe"
   *                             email:
   *                               type: string
   *                               format: email
   *                               example: "john.doe@example.com"
   *                             profile_image:
   *                               type: string
   *                               nullable: true
   *                               example: "https://example.com/profile.jpg"
   *                       lastMessage:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             format: uuid
   *                             example: "507f1f77bcf86cd799439013"
   *                           content:
   *                             type: string
   *                             example: "Hey, how are you?"
   *                           messageType:
   *                             type: string
   *                             enum: [text, emoji]
   *                             example: "text"
   *                           createdAt:
   *                             type: string
   *                             format: date-time
   *                             example: "2024-01-15T12:00:00.000Z"
   *                       lastActivity:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-15T12:00:00.000Z"
   *                       isActive:
   *                         type: boolean
   *                         example: true
   *       404:
   *         description: No conversations found
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
   *                   example: NO_CONVERSATIONS_FOUND
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
   *                   example: CONVERSATIONS_RETRIEVAL_FAILED
   */
  .get("/conversations", authorize, ctr.getConversations) //GET /api/friends/conversations - Get user's conversations

  /**
   * @openapi
   * /api/friends/conversations/{id}/messages:
   *   get:
   *     tags: [Friends]
   *     summary: Get conversation messages
   *     description: Retrieves messages from a specific conversation
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID of the conversation
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 50
   *         description: Number of messages per page
   *     responses:
   *       200:
   *         description: Messages retrieved successfully
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
   *                   example: MESSAGES_RETRIEVED
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         format: uuid
   *                         example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
   *                       conversation:
   *                         type: string
   *                         format: uuid
   *                         example: "507f1f77bcf86cd799439012"
   *                       sender:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             format: uuid
   *                             example: "507f1f77bcf86cd799439013"
   *                           fname:
   *                             type: string
   *                             example: "John"
   *                           lname:
   *                             type: string
   *                             example: "Doe"
   *                           profile_image:
   *                             type: string
   *                             nullable: true
   *                             example: "https://example.com/profile.jpg"
   *                       content:
   *                         type: string
   *                         example: "Hey, how are you doing?"
   *                       messageType:
   *                         type: string
   *                         enum: [text, emoji]
   *                         example: "text"
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-15T12:00:00.000Z"
   *       404:
   *         description: Conversation not found
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
   *                   example: NO_CONVERSATION_FOUND
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
   *                   example: MESSAGES_RETRIEVAL_FAILED
   */
  .get("/conversations/:id/messages", authorize, ctr.getConversationMessages) //GET /api/friends/conversations/:id/messages - Get messages from a conversation

  /**
   * @openapi
   * /api/friends/{id}/message:
   *   post:
   *     tags: [Friends]
   *     summary: Send message to friend
   *     description: Sends a message to a friend
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID of the friend to message
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - content
   *             properties:
   *               content:
   *                 type: string
   *                 maxLength: 1000
   *                 example: "Hey, how are you doing?"
   *                 description: Message content
   *               messageType:
   *                 type: string
   *                 enum: [text, emoji]
   *                 default: text
   *                 example: "text"
   *                 description: Type of message
   *     responses:
   *       200:
   *         description: Message sent successfully
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
   *                   example: MESSAGE_SENT
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       format: uuid
   *                       example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
   *                     conversation:
   *                       type: string
   *                       format: uuid
   *                       example: "507f1f77bcf86cd799439012"
   *                     sender:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: string
   *                           format: uuid
   *                           example: "507f1f77bcf86cd799439013"
   *                         fname:
   *                           type: string
   *                           example: "John"
   *                         lname:
   *                           type: string
   *                           example: "Doe"
   *                         profile_image:
   *                           type: string
   *                           nullable: true
   *                           example: "https://example.com/profile.jpg"
   *                     content:
   *                       type: string
   *                       example: "Hey, how are you doing?"
   *                     messageType:
   *                       type: string
   *                       example: "text"
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T12:00:00.000Z"
   *       400:
   *         description: Bad request
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
   *       404:
   *         description: Friendship not found
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
   *                   example: FRIENDSHIP_NOT_FOUND
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
   *                   example: MESSAGE_SEND_FAILED
   */
  .post("/:id/message", authorize, ctr.sendMessage) //POST /api/friends/:id/message - Send message to friend

  /**
   * @openapi
   * /api/friends/activity-feed:
   *   get:
   *     tags: [Friends]
   *     summary: Get activity feed
   *     description: Retrieves the activity feed from friends
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *         description: Number of activities per page
   *     responses:
   *       200:
   *         description: Activities retrieved successfully
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
   *                   example: ACTIVITIES_RETRIEVED
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         format: uuid
   *                         example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
   *                       sharedBy:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             format: uuid
   *                             example: "507f1f77bcf86cd799439012"
   *                           fname:
   *                             type: string
   *                             example: "John"
   *                           lname:
   *                             type: string
   *                             example: "Doe"
   *                           profile_image:
   *                             type: string
   *                             nullable: true
   *                             example: "https://example.com/profile.jpg"
   *                       activityType:
   *                         type: string
   *                         enum: [run, achievement, goal_completed, personal_record, nutrition]
   *                         example: "run"
   *                       activityData:
   *                         type: object
   *                         example: {"distance": 10.5, "duration": 3600}
   *                       description:
   *                         type: string
   *                         example: "Morning run"
   *                       visibility:
   *                         type: string
   *                         enum: [friends, public]
   *                         example: "friends"
   *                       likes:
   *                         type: array
   *                         items:
   *                           type: object
   *                           properties:
   *                             user:
   *                               type: object
   *                               properties:
   *                                 id:
   *                                   type: string
   *                                   format: uuid
   *                                   example: "507f1f77bcf86cd799439013"
   *                                 fname:
   *                                   type: string
   *                                   example: "Jane"
   *                                 lname:
   *                                   type: string
   *                                   example: "Smith"
   *                                 profile_image:
   *                                   type: string
   *                                   nullable: true
   *                                   example: "https://example.com/profile2.jpg"
   *                             createdAt:
   *                               type: string
   *                               format: date-time
   *                               example: "2024-01-15T12:00:00.000Z"
   *                       comments:
   *                         type: array
   *                         items:
   *                           type: object
   *                           properties:
   *                             user:
   *                               type: object
   *                               properties:
   *                                 id:
   *                                   type: string
   *                                   format: uuid
   *                                   example: "507f1f77bcf86cd799439013"
   *                                 fname:
   *                                   type: string
   *                                   example: "Jane"
   *                                 lname:
   *                                   type: string
   *                                   example: "Smith"
   *                                 profile_image:
   *                                   type: string
   *                                   nullable: true
   *                                   example: "https://example.com/profile2.jpg"
   *                             content:
   *                               type: string
   *                               example: "Great job!"
   *                             createdAt:
   *                               type: string
   *                               format: date-time
   *                               example: "2024-01-15T12:00:00.000Z"
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-01-15T12:00:00.000Z"
   *                       isActive:
   *                         type: boolean
   *                         example: true
   *       404:
   *         description: No activities found
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
   *                   example: NO_ACTIVITIES_FOUND
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
   *                   example: ACTIVITY_FEED_RETRIEVAL_FAILED
   */
  .get("/activity-feed", authorize, ctr.getActivityFeed) //GET /api/friends/activity-feed - Get activity feed from friends

  /**
   * @openapi
   * /api/friends/share-activity:
   *   post:
   *     tags: [Friends]
   *     summary: Share activity
   *     description: Shares an activity with friends
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - activityType
   *               - activityData
   *             properties:
   *               activityType:
   *                 type: string
   *                 enum: [run, achievement, goal_completed, personal_record, nutrition]
   *                 example: "run"
   *                 description: Type of activity
   *               activityData:
   *                 type: object
   *                 example: {"distance": 10.5, "duration": 3600}
   *                 description: Activity data
   *               description:
   *                 type: string
   *                 maxLength: 500
   *                 example: "Morning run"
   *                 description: Description of the activity
   *               visibility:
   *                 type: string
   *                 enum: [friends, public]
   *                 default: friends
   *                 example: "friends"
   *                 description: Visibility of the activity
   *     responses:
   *       201:
   *         description: Activity shared successfully
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
   *                   example: ACTIVITY_SHARED
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       format: uuid
   *                       example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
   *                     sharedBy:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: string
   *                           format: uuid
   *                           example: "507f1f77bcf86cd799439012"
   *                         fname:
   *                           type: string
   *                           example: "John"
   *                         lname:
   *                           type: string
   *                           example: "Doe"
   *                         profile_image:
   *                           type: string
   *                           nullable: true
   *                           example: "https://example.com/profile.jpg"
   *                     activityType:
   *                       type: string
   *                       example: "run"
   *                     activityData:
   *                       type: object
   *                       example: {"distance": 10.5, "duration": 3600}
   *                     description:
   *                       type: string
   *                       example: "Morning run"
   *                     visibility:
   *                       type: string
   *                       example: "friends"
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T12:00:00.000Z"
   *       400:
   *         description: Bad request
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
   *                   example: ACTIVITY_SHARE_FAILED
   */
  .post("/share-activity", authorize, ctr.shareActivity) // POST /api/friends/share-activity - Share an activity with friends

  /**
   * @openapi
   * /api/friends/activity/{id}/like:
   *   post:
   *     tags: [Friends]
   *     summary: Like activity
   *     description: Likes or unlikes an activity
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID of the activity to like/unlike
   *     responses:
   *       200:
   *         description: Like action successful
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
   *                   example: LIKE_ADDED
   *                 data:
   *                   type: object
   *                   properties:
   *                     liked:
   *                       type: boolean
   *                       example: true
   *                     totalLikes:
   *                       type: integer
   *                       example: 5
   *       404:
   *         description: Activity not found
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
   *                   example: ACTIVITY_NOT_FOUND
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
   *                   example: LIKE_ACTION_FAILED
   */
  .post("/activity/:id/like", authorize, ctr.likeActivity) // POST /api/friends/activity/:id/like - Like or unlike an activity

  /**
   * @openapi
   * /api/friends/activity/{id}/comment:
   *   post:
   *     tags: [Friends]
   *     summary: Comment on activity
   *     description: Adds a comment to an activity
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID of the activity to comment on
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - content
   *             properties:
   *               content:
   *                 type: string
   *                 maxLength: 300
   *                 example: "Great job!"
   *                 description: Comment content
   *     responses:
   *       200:
   *         description: Comment added successfully
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
   *                   example: COMMENT_ADDED
   *                 data:
   *                   type: object
   *                   properties:
   *                     user:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: string
   *                           format: uuid
   *                           example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
   *                         fname:
   *                           type: string
   *                           example: "John"
   *                         lname:
   *                           type: string
   *                           example: "Doe"
   *                         profile_image:
   *                           type: string
   *                           nullable: true
   *                           example: "https://example.com/profile.jpg"
   *                     content:
   *                       type: string
   *                       example: "Great job!"
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-15T12:00:00.000Z"
   *       400:
   *         description: Bad request
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
   *                   example: COMMENT_CONTENT_REQUIRED
   *       404:
   *         description: Activity not found
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
   *                   example: ACTIVITY_NOT_FOUND
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
   *                   example: COMMENT_ADD_FAILED
   */
  .post("/activity/:id/comment", authorize, ctr.commentActivity) // POST /api/friends/activity/:id/comment - Comment on an activity

  /**
   * @openapi
   * /api/friends/report:
   *   post:
   *     tags: [Friends]
   *     summary: Report user
   *     description: Reports a user for inappropriate behavior
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - reportedUserId
   *               - reason
   *               - details
   *             properties:
   *               reportedUserId:
   *                 type: string
   *                 format: uuid
   *                 example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
   *                 description: ID of the user to report
   *               reason:
   *                 type: string
   *                 enum: [inappropriate_content, harassment, spam, fake_profile, abusive_behavior, other]
   *                 example: "harassment"
   *                 description: Reason for reporting
   *               details:
   *                 type: string
   *                 maxLength: 1000
   *                 example: "User sent inappropriate messages"
   *                 description: Detailed explanation of the report
   *               severity:
   *                 type: string
   *                 enum: [low, medium, high]
   *                 default: medium
   *                 example: "medium"
   *                 description: Severity of the reported issue
   *     responses:
   *       201:
   *         description: Report submitted successfully
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
   *                   example: REPORT_SUBMITTED
   *                 data:
   *                   type: object
   *                   properties:
   *                     report_id:
   *                       type: string
   *                       format: uuid
   *                       example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
   *       400:
   *         description: Bad request
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
   *       404:
   *         description: User not found
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
   *                   example: USER_NOT_FOUND
   *       409:
   *         description: User already reported
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
   *                   example: 409
   *                 message:
   *                   type: string
   *                   example: USER_ALREADY_REPORTED
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
   *                   example: REPORT_SUBMISSION_FAILED
   */
  .post("/report", authorize, ctr.reportUser) // POST /api/friends/report - Report a user

  /**
   * @openapi
   * /api/friends/stats:
   *   get:
   *     tags: [Friends]
   *     summary: Get friends statistics
   *     description: Retrieves statistics about the user's friends and social activity
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Friends statistics retrieved successfully
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
   *                   example: FRIENDS_STATS_RETRIEVED
   *                 data:
   *                   type: object
   *                   properties:
   *                     totalFriends:
   *                       type: integer
   *                       example: 15
   *                     pendingRequests:
   *                       type: integer
   *                       example: 3
   *                     sentRequests:
   *                       type: integer
   *                       example: 2
   *                     recentActivity:
   *                       type: integer
   *                       example: 25
   *                     onlineFriends:
   *                       type: integer
   *                       example: 5
   *                     mutualConnections:
   *                       type: integer
   *                       example: 23
   *       404:
   *         description: No friends statistics found
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
   *                   example: NO_FRIENDS_STATS_FOUND
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
   *                   example: FRIENDS_STATS_RETRIEVAL_FAILED
   */
  .get("/stats", authorize, ctr.getFriendsStats) // GET /api/friends/stats - Get friends statistics

  /**
   * @openapi
   * /api/friends/{id}/block:
   *   put:
   *     tags: [Friends]
   *     summary: Block user
   *     description: Blocks a user, preventing further interaction
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID of the user to block
   *     responses:
   *       200:
   *         description: User blocked successfully
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
   *                   example: USER_BLOCKED
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
   *                   example: BLOCK_USER_FAILED
   */
  .put("/:id/block", authorize, ctr.blockUser); //PUT /api/friends/:id/block - Block a user

module.exports = router;
