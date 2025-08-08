// routers/components/activityRouter.js
const express = require("express");
const router = express.Router();
const activityController = require("../../controllers/components/activityController");
const { authorize } = require("../../middlewares/authMiddleware");

/**
 * @openapi
 * tags:
 *   - name: Activities
 *     description: Endpoints for managing user activities.
 */

/**
 * @openapi
 * /api/activities:
 *   post:
 *     tags:
 *       - Activities
 *     summary: Log a new activity
 *     description: Creates a new activity record for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActivityInput'
 *     responses:
 *       201:
 *         description: Activity created successfully.
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
 *                   example: "Activité enregistrée avec succès."
 *                 data:
 *                   $ref: '#/components/schemas/Activity'
 *       400:
 *         description: Bad request (e.g., missing required fields).
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
 *                   example: "Le type et le titre de l'activité sont requis."
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
router.post("/", authorize, activityController.createActivity);

/**
 * @openapi
 * /api/activities:
 *   get:
 *     tags:
 *       - Activities
 *     summary: Get user activities
 *     description: Retrieves a list of all activities for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of activities.
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
 *                   example: "Activités récupérées avec succès."
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Activity'
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
router.get("/", authorize, activityController.getActivities);

module.exports = router;
