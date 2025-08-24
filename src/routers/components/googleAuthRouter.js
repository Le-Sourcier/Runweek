const express = require("express");
const router = express.Router();
const authController = require("../../controllers/components/userController");
const { authorize } = require("../../middlewares/authMiddleware");

/**
 * @openapi
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization endpoints
 */
router
  /**
   * @openapi
   * /api/auth/google:
   *   get:
   *     tags: [Authentication]
   *     summary: Initiate Google authentication
   *     description: Redirects user to Google OAuth2 authentication page
   *     responses:
   *       302:
   *         description: Redirect to Google authentication page
   *         headers:
   *           Location:
   *             description: URL of Google OAuth2 authentication page
   *             schema:
   *               type: string
   *               example: https://accounts.google.com/o/oauth2/v2/auth?response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fgoogle%2Fcallback&scope=profile%20email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Ffitness.activity.read%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Ffitness.heart_rate.read%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Ffitness.sleep.read%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Ffitness.location.read&client_id=your_google_client_id
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
   *                   example: GOOGLE_AUTH_INITIATION_FAILED
   */
  .get("/google", authController.initiateGoogleAuth)

  /**
   * @openapi
   * /api/auth/google/callback:
   *   get:
   *     tags: [Authentication]
   *     summary: Google authentication callback
   *     description: Handles the callback from Google OAuth2 authentication and redirects to frontend with tokens
   *     parameters:
   *       - in: query
   *         name: code
   *         schema:
   *           type: string
   *         description: Authorization code from Google
   *       - in: query
   *         name: error
   *         schema:
   *           type: string
   *         description: Error code from Google OAuth2
   *       - in: query
   *         name: state
   *         schema:
   *           type: string
   *         description: State parameter for CSRF protection
   *     responses:
   *       302:
   *         description: Redirect to frontend with authentication tokens
   *         headers:
   *           Location:
   *             description: URL of frontend with authentication tokens as query parameters
   *             schema:
   *               type: string
   *               example: http://localhost:5173/auth/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwiaWF0IjoxNjk5ODIyNjQyLCJleHAiOjE3MDA0Mjc0NDJ9.abc123def456&refresh=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE2OTk4MjI2NDIsImV4cCI6MTcwMjQxNDY0Mn0.xyz789uvw012&userId=507f1f77bcf86cd799439011&firstLogin=true
   *       400:
   *         description: Bad request or authentication error
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
   *                   example: INVALID_GOOGLE_AUTH_CODE
   *       401:
   *         description: Authentication failed
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
   *                   example: GOOGLE_AUTHENTICATION_FAILED
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
   *                   example: GOOGLE_AUTH_CALLBACK_FAILED
   */
  .get("/google/callback", authController.handleGoogleCallback)

  /**
   * @openapi
   * /api/auth/link-google:
   *   post:
   *     tags: [Authentication]
   *     summary: Link Google account to existing account
   *     description: Links a Google account to an existing user account for future authentication
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - code
   *             properties:
   *               code:
   *                 type: string
   *                 description: Google ID token received from client-side Google authentication
   *                 example: "4/0AVMBsJhwrH6g4g9bWpm7bfttuEd............................"
   *     responses:
   *       200:
   *         description: Google account linked successfully
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
   *                   example: GOOGLE_ACCOUNT_LINKED
   *                 data:
   *                   type: object
   *                   properties:
   *                     googleLinked:
   *                       type: boolean
   *                       example: true
   *                     email:
   *                       type: string
   *                       format: email
   *                       example: "john.doe@example.com"
   *       400:
   *         description: Bad request or email mismatch
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
   *                   example: GOOGLE_EMAIL_MISMATCH
   *       401:
   *         description: Unauthorized or invalid token
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
   *       409:
   *         description: Google account already linked
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
   *                   example: GOOGLE_ACCOUNT_ALREADY_LINKED
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
   *                   example: GOOGLE_LINK_FAILED
   */
  .post("/link-google", authorize, authController.linkGoogleAccount)

  /**
   * @openapi
   * /api/auth/google/unlink:
   *   post:
   *     tags: [Authentication]
   *     summary: Unlink Google account
   *     description: Unlinks Google account from user profile without revoking access (soft unlink)
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Google account unlinked successfully
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
   *                   example: GOOGLE_ACCOUNT_UNLINKED
   *                 data:
   *                   type: object
   *                   properties:
   *                     googleLinked:
   *                       type: boolean
   *                       example: false
   *                     email:
   *                       type: string
   *                       format: email
   *                       example: "user@example.com"
   *       404:
   *         description: User not found or Google account not linked
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
   *                   oneOf:
   *                     - example: USER_NOT_FOUND
   *                     - example: GOOGLE_ACCOUNT_NOT_LINKED
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
   *                   example: GOOGLE_UNLINK_FAILED
   */
  .post("/google/unlink", authorize, authController.unlinkGoogleAccount)

  /**
   * @openapi
   * /api/auth/google/disconnect:
   *   post:
   *     tags: [Authentication]
   *     summary: Disconnect Google account
   *     description: Revokes Google OAuth access and completely disconnects the Google account (hard disconnect)
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Google account disconnected successfully
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
   *                   example: GOOGLE_ACCOUNT_DISCONNECTED
   *       404:
   *         description: No Google account linked
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
   *                   example: NO_GOOGLE_ACCOUNT_LINKED
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
   *                   example: GOOGLE_DISCONNECT_FAILED
   */
  .post("/google/disconnect", authorize, authController.disconnectGoogle);

module.exports = router;
