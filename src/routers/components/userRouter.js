const router = require("express").Router();
const {
  userRegisterValidator,
  userAuthValidator,
} = require("../../validators");
const ctr = require("../../controllers/components/userController");
const { loginLimiter } = require("../../middlewares/authMiddleware");

/**
 * @openapi
 * tags:
 *   name: User & Auth
 *   description: User registration, authentication, and profile management
 */
router
  /**
   * @openapi
   * /api/user/register:
   *   post:
   *     tags: [User & Auth]
   *     summary: Register a new user
   *     description: >
   *       Creates a new user account and profile, and sends a verification email.
   *       If a valid `referral_code` is provided, the user will be linked to a sponsor.
   *       Sponsors receive a reward after 5 accepted referrals or if the referred user subscribes to a paid plan.
   *     security: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - fname
   *               - lname
   *               - email
   *               - password
   *             properties:
   *               fname:
   *                 type: string
   *                 example: Jane
   *               lname:
   *                 type: string
   *                 example: Doe
   *               email:
   *                 type: string
   *                 format: email
   *                 example: jane.doe@example.com
   *               password:
   *                 type: string
   *                 format: password
   *                 example: StrongP@ssw0rd!
   *     responses:
   *       '201':
   *         description: Account created successfully. Verification email sent.
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
   *                   example: ACCOUNT_CREATED
   *       '400':
   *         description: Email or phone already exists, or validation error.
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
   *                   example: ACCOUNT_ALREADY_EXISTS
   *       '500':
   *         description: Server error (e.g., database or email error).
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
  .post("/register", loginLimiter, userRegisterValidator, ctr.register) // Register a new user
  /**
   * @openapi
   * /api/user/login:
   *   post:
   *     tags: [User & Auth]
   *     summary: Authenticate user
   *     description: Logs in a user with email and password, returns JWT access and refresh tokens.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserLoginInput'
   *     responses:
   *       '200':
   *         description: Successful login.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthSuccessResponse'
   *       '400':
   *         description: Invalid credentials (validation error from `userAuthValidator`).
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error400'
   *       '401':
   *         description: Authentication failed (e.g., account not verified, wrong password, account status issues).
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error401'
   *       '404':
   *         description: Profile not found.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error404'
   *       '429':
   *         description: Too many login attempts.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error429'
   *       '500':
   *         description: Server error.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error500'
   */
  .post("/login", userAuthValidator, ctr.login) // Authentifier un utilisateur
  /**
   * @openapi
   * /api/user/refresh:
   *   post:
   *     tags: [User & Auth]
   *     summary: Refresh access token
   *     description: Issues a new JWT access token and refresh token using a valid refresh token provided in the request body.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *                 example: "aValidRefreshTokenString"
   *     responses:
   *       '200':
   *         description: Tokens refreshed successfully.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthSuccessResponse'
   *       '401':
   *         description: Unauthorized (e.g., refresh token missing, invalid, or expired).
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error401'
   *       '404':
   *         description: Profile not found for the token.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error404'
   *       '500':
   *         description: Server error.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error500'
   */
  .post("/refresh", ctr.refresh) // Refresh token
  /**
   * @openapi
   * /api/user/verify-mail:
   *   post:
   *     tags: [User & Auth]
   *     summary: Verify user email
   *     description: Verifies a user's email address using a token sent during registration or resend.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [token]
   *             properties:
   *               token:
   *                 type: string
   *                 description: Verification token from email link
   *                 example: "userVerificationTokenString"
   *     responses:
   *       '200':
   *         description: Account validated successfully.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralSuccessResponse'
   *               properties:
   *                 message:
   *                   type: string
   *                   example: 'ACCOUNT_VALIDATED_SUCCESS'
   *       '401':
   *         description: Invalid or expired token.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error401'
   *       '500':
   *         description: Server error.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error500'
   */
  .post("/verify-mail", loginLimiter, ctr.verifyMail) // Verify user account
  /**
   * @openapi
   * /api/user/resend-mail:
   *   post:
   *     tags: [User & Auth]
   *     summary: Resend verification email
   *     description: >
   *       Resends a new account verification email to the user if the account is not yet verified.
   *       A new token is generated and embedded in the email link.
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
   *                 example: user@example.com
   *     responses:
   *       '200':
   *         description: Verification email successfully sent.
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
   *                   example: EMAIL_SENDING_SUCCESS
   *       '401':
   *         description: The account is already verified.
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
   *                   example: ACCOUNT_ALREADY_VERIFIED
   *       '404':
   *         description: Account not found or already verified.
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
   *                   example: ACCOUNT_NOT_FOUND
   *       '500':
   *         description: Server error or failed to send email.
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
   *                   example: EMAIL_SENDING_FAILED
   */
  .post("/resend-mail", loginLimiter, ctr.resendMail) // Resend verification mail
  /**
   * @openapi
   * /api/user/forget-password:
   *   post:
   *     tags: [User & Auth]
   *     summary: Initiate forgot password process
   *     description: Sends a password reset link/token to the user's email address. This endpoint is rate-limited.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [email]
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: user@example.com
   *     responses:
   *       '200':
   *         description: Password reset email successfully sent.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralSuccessResponse'
   *               properties:
   *                 message:
   *                   type: string
   *                   example: 'EMAIL_SINDING_SUCCESS'
   *       '404':
   *         description: Profile not found.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error404'
   *       '429':
   *         description: Too many attempts.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error429'
   *       '500':
   *         description: Server error or email sending failed.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error500'
   */
  .post("/forget-password", loginLimiter, ctr.forgetPassword) // Recover user password by email address
  /**
   * @openapi
   * /api/user/verify-token:
   *   post:
   *     tags: [User & Auth]
   *     summary: Verify password reset token
   *     description: Verifies the validity of a password reset token sent to the user's email.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [token]
   *             properties:
   *               token:
   *                 type: string
   *                 example: "passwordResetTokenString"
   *     responses:
   *       '200':
   *         description: Token is valid. Provides user's first name.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error: { type: 'boolean', example: false }
   *                 status: { type: 'integer', example: 200 }
   *                 message: { type: 'string', example: 'NEXT_STEP' }
   *                 data:
   *                   type: object
   *                   properties:
   *                     firstName: { type: 'string', example: 'John' }
   *       '401':
   *         description: Invalid or expired token.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error401'
   *       '500':
   *         description: Server error.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error500'
   */
  .post("/verify-token", loginLimiter, ctr.verifyPasswordToken) // Verify reset token
  /**
   * @openapi
   * /api/user/reset-password:
   *   put:
   *     tags: [User & Auth]
   *     summary: Reset user password
   *     description: |
   *       Sets a new password for the user using a valid password reset token.
   *       The token is verified for existence and expiration before applying the password change.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [token, password]
   *             properties:
   *               token:
   *                 type: string
   *                 description: Valid password reset token sent by email.
   *                 example: "a8f23a76-1dc7-4323-bc4e-06fdffec1ef9"
   *               password:
   *                 type: string
   *                 format: password
   *                 description: The new password to be set.
   *                 example: "MyNewSecurePassword2025!"
   *     responses:
   *       200:
   *         description: Password reset successfully.
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
   *                   example: PASSWORD_RECOVERED_SUCCESS
   *       401:
   *         description: Invalid or expired token.
   *         content:
   *           application/json:
   *             schema:
   *               oneOf:
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: boolean
   *                       example: true
   *                     status:
   *                       type: integer
   *                       example: 401
   *                     message:
   *                       type: string
   *                       example: INVALID_OR_EXPIRED_TOKEN
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: boolean
   *                       example: true
   *                     status:
   *                       type: integer
   *                       example: 401
   *                     message:
   *                       type: string
   *                       example: INVALID_OR_EXPIRED_TOKEN
   *                     data:
   *                       type: object
   *                       properties:
   *                         email:
   *                           type: string
   *                           example: user@example.com
   *       500:
   *         description: Internal server error.
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
  .put("/reset-password", loginLimiter, ctr.resetPassword) // Reset user password by id
  /**
   * @openapi
   * /api/user/me:
   *   get:
   *     tags: [User & Auth]
   *     summary: Get current user profile
   *     description: Retrieves the profile information of the currently authenticated user.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       '200':
   *         description: Successful operation.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserMeSuccessResponse'
   *       '401':
   *         description: Unauthorized (e.g., token missing, expired, invalid).
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error401'
   *       '404':
   *         description: Account not found.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error404'
   *       '500':
   *         description: Server error.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error500'
   */
  .get("/me", ctr.getMe) // Get current user
  /**
   * @openapi
   * /api/user/update:
   *   put:
   *     tags: [User & Auth]
   *     summary: Update user profile
   *     description: Updates the profile data of the authenticated user. Only include fields to be updated.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserProfileUpdateInput'
   *     responses:
   *       '200':
   *         description: Profile updated successfully.
   *         content:
   *           application/json:
   *             schema:
   *                $ref: '#/components/schemas/GeneralSuccessResponse'
   *                properties:
   *                  message:
   *                    type: string
   *                    example: 'PROFILE_UPDATED'
   *       '401':
   *         description: Unauthorized.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error401'
   *       '404':
   *         description: Profile not found.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error404'
   *       '500':
   *         description: Server error.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error500'
   */
  .put("/update/", loginLimiter, ctr.updateUser) //Update user profile data
  /**
   * @openapi
   * /api/user/update/password:
   *   put:
   *     tags: [User & Auth]
   *     summary: Update user password
   *     description: Updates the password of the authenticated user. Requires current password for verification.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - oldPassword
   *               - newPassword
   *             properties:
   *               oldPassword:
   *                 type: string
   *                 format: password
   *                 example: "oldPassword123!"
   *               newPassword:
   *                 type: string
   *                 format: password
   *                 example: "NewSecurePassword456!"
   *     responses:
   *       '200':
   *         description: Password updated successfully.
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
   *                   example: PASSWORD_UPDATED_SUCCESS
   *       '400':
   *         description: Bad request (e.g., missing fields, validation error).
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
   *                   example: REQUIRED_FIELDS_MISSING
   *       '401':
   *         description: Unauthorized (e.g., current password incorrect, token invalid).
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
   *                   example: INVALID_CURRENT_PASSWORD
   *       '404':
   *         description: Profile not found.
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
   *                   example: PROFILE_NOT_FOUND
   *       '500':
   *         description: Internal server error.
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
  .put("/update/password", loginLimiter, ctr.updatePassword) //Update user password
  /**
   * @openapi
   * /api/user/invite-member:
   *   post:
   *     tags: [User & Auth]
   *     summary: Invite a new team member
   *     description: >
   *       Allows an admin to invite a new team member by email, assigning them a role and a custom credit quota.
   *       The invited user inherits the admin's subscription plan.
   *       Sends an email with a verification link and temporary password.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - fname
   *               - lname
   *               - phone
   *               - email
   *               - role
   *             properties:
   *               fname:
   *                 type: string
   *                 example: John
   *               lname:
   *                 type: string
   *                 example: Doe
   *               phone:
   *                 type: string
   *                 example: "+22891234567"
   *               email:
   *                 type: string
   *                 format: email
   *                 example: johndoe@example.com
   *               role:
   *                 type: string
   *                 enum: [USER, MANAGER, ADMIN]
   *                 example: USER
   *               credit:
   *                 type: integer
   *                 minimum: 0
   *                 example: 25
   *     responses:
   *       '200':
   *         description: Team member successfully invited and email sent.
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
   *                   example: ACCOUNT_CREATED
   *                 data:
   *                   type: object
   *                   properties:
   *                     email:
   *                       type: string
   *                       example: johndoe@example.com
   *                     password:
   *                       type: string
   *                       example: j5#kT8@qW
   *       '400':
   *         description: Missing required fields or validation error.
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
   *                   example: REQUIRED_FIELDS_MISSING
   *       '401':
   *         description: Not authorized or insufficient permissions.
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
   *                   example: INSUFFICIENT_PERMISSIONS
   *       '409':
   *         description: Email or phone already in use.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                 status:
   *                   type: integer
   *                   example: 409
   *                 message:
   *                   type: string
   *                   example: ACCOUNT_ALREADY_EXISTS
   *       '402':
   *         description: Not enough credit available.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                 status:
   *                   type: integer
   *                   example: 402
   *                 message:
   *                   type: string
   *                   example: NOT_ENOUGH_CREDIT
   *                 data:
   *                   type: object
   *                   properties:
   *                     available:
   *                       type: integer
   *                       example: 15
   *       '500':
   *         description: Internal server error or failure during transaction.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   example: INVITE_MEMBER_ERROR
   */
  .post("/invite-member", ctr.inviteMember) //Inviter un utilisateur
  /**
   * @openapi
   * /api/user/sessions:
   *   get:
   *     tags: [User & Auth]
   *     summary: Get all user sessions
   *     description: >
   *       Retrieves all sessions associated with the currently authenticated user.
   *       Requires Bearer authentication.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: A list of all user sessions.
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
   *                         example: "123e4567-e89b-12d3-a456-426614174000"
   *                       ip_address:
   *                         type: string
   *                         example: "162.28.1.123"
   *                       user_agent:
   *                         type: string
   *                         example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
   *                       expires_at:
   *                         type: string
   *                         format: date-time
   *                         example: "2025-08-01T00:00:00.000Z"
   *                       updatedAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2025-07-16T15:00:00.000Z"
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2025-07-14T09:00:00.000Z"
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
   *       403:
   *         description: Forbidden
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
   *                   example: INSUFFICIENT_PERMISSIONS
   *       404:
   *         description: No sessions found
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
   *                   example: NO_SESSIONS_FOUNDED
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
  .get("/sessions", loginLimiter, ctr.getAllSessions) // Get all user sections
  /**
   * @openapi
   * /api/user/all:
   *   get:
   *     tags: [User & Auth]
   *     summary: Get all users (Admin)
   *     description: Retrieves a list of all users including profile and subscription info. Requires admin privileges. Bearer auth required.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: A list of all users.
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
   *                         example: "123e4567-e89b-12d3-a456-426614174000"
   *                       email:
   *                         type: string
   *                         example: "user@example.com"
   *                       role:
   *                         type: string
   *                         example: "USER"
   *                       fname:
   *                         type: string
   *                         example: "John"
   *                       lname:
   *                         type: string
   *                         example: "Doe"
   *                       phone:
   *                         type: string
   *                         example: "+33612345678"
   *                       address:
   *                         type: string
   *                         nullable: true
   *                         example: "123 Rue Exemple"
   *                       image:
   *                         type: string
   *                         nullable: true
   *                         example: "https://cdn.site.com/avatar.jpg"
   *                       bio:
   *                         type: string
   *                         nullable: true
   *                         example: "Tech enthusiast"
   *                       company:
   *                         type: string
   *                         example: "MyCompany"
   *                       website:
   *                         type: string
   *                         example: "https://mycompany.com"
   *                       plan:
   *                         type: string
   *                         example: "PRO"
   *                       credits:
   *                         type: integer
   *                         example: 150
   *                       updatedAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2025-07-16T15:00:00.000Z"
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2025-07-16T15:00:00.000Z"
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
   *       403:
   *         description: Forbidden
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
   *                   example: INSUFFICIENT_PERMISSIONS
   *       404:
   *         description: Users not found
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
   *                   example: RECORDED_USERS_NOT_FOUND
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
  .get("/all", loginLimiter, ctr.getAllUsers) // Get all users
  /**
   * @openapi
   * /api/user/user/{id}:
   *   get:
   *     tags: [User & Auth]
   *     summary: Get user by ID (Admin)
   *     description: Retrieves a specific user by ID with full profile and subscription info. Requires admin privileges. Bearer auth required.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The ID of the user to retrieve.
   *     responses:
   *       200:
   *         description: Successfully retrieved user details.
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
   *                       example: "123e4567-e89b-12d3-a456-426614174000"
   *                     email:
   *                       type: string
   *                       example: "user@example.com"
   *                     role:
   *                       type: string
   *                       example: "USER"
   *                     fname:
   *                       type: string
   *                       example: "John"
   *                     lname:
   *                       type: string
   *                       example: "Doe"
   *                     phone:
   *                       type: string
   *                       example: "+33612345678"
   *                     address:
   *                       type: string
   *                       nullable: true
   *                       example: "123 Rue Exemple"
   *                     image:
   *                       type: string
   *                       nullable: true
   *                       example: "https://cdn.site.com/avatar.jpg"
   *                     bio:
   *                       type: string
   *                       nullable: true
   *                       example: "Tech enthusiast"
   *                     company:
   *                       type: string
   *                       example: "MyCompany"
   *                     website:
   *                       type: string
   *                       example: "https://mycompany.com"
   *                     plan:
   *                       type: string
   *                       example: "PRO"
   *                     credits:
   *                       type: integer
   *                       example: 150
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2025-07-16T15:00:00.000Z"
   *                     createdAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2025-07-16T15:00:00.000Z"
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
   *       403:
   *         description: Forbidden
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
   *                   example: INSUFFICIENT_PERMISSIONS
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
   *                   example: PROFILE_NOT_FOUND
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
  .get("/user/:id", loginLimiter, ctr.getUserWithDetails) // Get user by id
  /**
   * @openapi
   * /api/user/delete/{id}:
   *   delete:
   *     tags: [User & Auth]
   *     summary: Delete a user
   *     description: Deletes a user account by their ID. Requires deletion confirmation.
   *     security:
   *       - bearerAuth: [] # Assuming user role is checked by authorize middleware or controller
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The ID of the user to delete.
   *     responses:
   *       '200':
   *         description: User deleted successfully.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                  message: { type: 'string', example: 'USER_DELETED.' }
   *       '401':
   *         description: Unauthorized.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       '403':
   *         description: Forbidden (e.g., not an auth or current user).
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       '404':
   *         description: User not found.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error: { type: 'string', example: 'ACCOUNT_NOT_FOUND' } # Specific error format from controller
   *       '500':
   *         description: Server error.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error: { type: 'string', example: 'UNKNOWN_ERROR' } # Specific error format from controller
   */
  .delete("/delete/:id", loginLimiter, ctr.delete); //Delete user by id

module.exports = router;
