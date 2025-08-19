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
 *     description: >
 *       Creates a new activity record for the authenticated user.  
 *       Also creates a notification for the user upon successful creation.
 *       The request must be sent with `Content-Type: application/json` and include all required fields.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActivityInput'
 *           example:
 *             type: "Course à pied"
 *             title: "Jogging du matin"
 *             description: "Petit footing avant le travail"
 *             distance: 5
 *             duration: 45
 *             date: "2025-08-14T06:30:00Z"
 *             metadata:
 *               terrain: "asphalte"
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
 *         description: Bad request (e.g., missing required fields or invalid body format).
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
 * /api/activities/{id}:
 *   put:
 *     tags:
 *       - Activities
 *     summary: Update an existing activity
 *     description: Updates an activity record for the authenticated user by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the activity to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActivityInput'
 *           example:
 *             type: "Course à pied"
 *             title: "Jogging du soir"
 *             description: "Course après le travail"
 *             distance: 7
 *             duration: 60
 *             date: "2025-08-14T18:00:00Z"
 *             scheduledAt: "2025-08-15T07:00:00Z"
 *             metadata:
 *               terrain: "parc"
 *     responses:
 *       200:
 *         description: Activity updated successfully.
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
 *                   example: "Activité mise à jour avec succès."
 *                 data:
 *                   $ref: '#/components/schemas/Activity'
 *       400:
 *         description: Bad request (e.g., invalid ID, missing fields).
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
 *                   example: "La date de planification fournie est invalide."
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       404:
 *         description: Activity not found or not authorized.
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
 *                   example: "Activité non trouvée ou non autorisée."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error500'
 */
router.put("/:id", authorize, activityController.updateActivity);



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

/**
 * @openapi
 * /api/activities/scheduled:
 *   get:
 *     tags:
 *       - Activities
 *     summary: Get scheduled activities by date range
 *     description: Retrieves a list of scheduled activities for the authenticated user within a specified date range.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: The start date of the range (YYYY-MM-DD).
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: The end date of the range (YYYY-MM-DD).
 *     responses:
 *       200:
 *         description: A list of scheduled activities.
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
 *                   example: "Activités planifiées récupérées avec succès."
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Activity'
 *       400:
 *         description: Bad request (e.g., missing or invalid date parameters).
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
 *                   example: "Les dates de début et de fin sont requises."
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
router.get("/scheduled", authorize, activityController.getActivitiesByDateRange);

/**
 * @openapi
 * /api/activities/upcoming:
 *   get:
 *     tags:
 *       - Activities
 *     summary: Get upcoming scheduled activities
 *     description: Retrieves a list of all activities for the authenticated user that are scheduled from today onwards.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of upcoming scheduled activities.
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
 *                   example: "Activités à venir récupérées avec succès."
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
router.get("/upcoming", authorize, activityController.getUpcomingActivities);

module.exports = router;
