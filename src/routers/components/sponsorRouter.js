const router = require("express").Router();
const ctr = require("../../controllers/components/sponsorController");
const { authorize } = require("../../middlewares/authMiddleware");

/**
 * @openapi
 * tags:
 *   name: Sponsor & referral
 *   description: User Sponsorship, referral management
 */
router
  /**
   * @openapi
   * /api/sponsor/generate-code:
   *   post:
   *     tags: [Sponsor & referral]
   *     summary: Generate a personal referral code
   *     description: >
   *       Allows an authenticated user to generate a personal referral code (relation_token)
   *       that can be shared with others to receive sponsorship benefits.
   *       If a code already exists and is still pending, it will be returned.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       '200':
   *         description: Referral code successfully generated or reused.
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
   *                   example: REFERRAL_CODE_CREATED
   *                 data:
   *                   type: object
   *                   properties:
   *                     referralCode:
   *                       type: string
   *                       example: x2Vr9QZAYUeB6oKf
   *       '401':
   *         description: Unauthorized, bearer token missing or invalid.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error401'
   *       '500':
   *         description: Internal server error or failure during code generation.
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
   *                   example: REFERRAL_CODE_GENERATION_FAILED
   */
  .post("/generate-code", authorize, ctr.generateReferralCode) // Generate referral code
  /**
   * @openapi
   * /api/sponsor/check-code/{referral_code}:
   *   get:
   *     tags: [Sponsor & referral]
   *     summary: Check the validity of a referral code
   *     description: Checks if a referral code is valid and returns information about the inviter (sponsor). This route will be disabled in production
   *     parameters:
   *       - in: path
   *         name: referral_code
   *         required: true
   *         description: The referral code to validate
   *         schema:
   *           type: string
   *     responses:
   *       '200':
   *         description: Referral code is valid
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
   *                   example: REFERRAL_CODE_VALID
   *                 data:
   *                   type: object
   *                   properties:
   *                     inviter:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: string
   *                           format: uuid
   *                           example: "123e4567-e89b-12d3-a456-426614174000"
   *                         email:
   *                           type: string
   *                           format: email
   *                           example: sponsor@example.com
   *                     referral_code:
   *                       type: string
   *                       example: "ABCD1234"
   *                     invitees:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             format: uuid
   *                             example: "987e6543-e21b-34c1-a789-426614174111"
   *                           email:
   *                             type: string
   *                             format: email
   *                             example: invitee@example.com
   *       '400':
   *         description: Invalid or missing referral code
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
   *                   example: INVALID_REFERRAL_CODE
   *       '404':
   *         description: Referral code not found
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
   *                   example: REFERRAL_CODE_NOT_FOUND
   *       '500':
   *         description: Internal server error while checking referral code
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
   *                   example: CHECK_REFERRAL_CODE_ERROR
   */

  .get("/check-code/:referral_code", ctr.checkReferralCode);

module.exports = router;