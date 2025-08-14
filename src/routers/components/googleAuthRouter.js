const express = require("express");
const router = express.Router();
const authController = require("../../controllers/components/authController");

/**
 * @openapi
 * /api/auth/google/login:
 *   get:
 *     tags: [Authentification Google]
 *     summary: Rediriger vers la page de connexion Google
 *     description: >
 *       Ce endpoint construit l'URL d'autorisation Google et redirige l'utilisateur vers cette URL pour démarrer le flux OAuth2.
 *     responses:
 *       302:
 *         description: Redirection vers l'URL d'authentification Google.
 */
router.get("/login", authController.googleLogin);

/**
 * @openapi
 * /api/auth/google/callback:
 *   post:
 *     tags: [Authentification Google]
 *     summary: Gérer le callback OAuth de Google
 *     description: >
 *       Ce endpoint gère la réponse du flux d'authentification OAuth 2.0 de Google.
 *       Il échange le code d'autorisation contre des jetons d'accès et de rafraîchissement,
 *       puis les stocke en base de données pour les appels futurs à l'API Google Fit. Une notification est envoyée à l'utilisateur en cas de succès.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, userId]
 *             properties:
 *               code:
 *                 type: string
 *                 description: Code d'autorisation fourni par Google
 *                 example: "4/0AX4XfWg..."
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: ID utilisateur de notre système
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Authentification Google réussie
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
 *                   example: "Authentification Google réussie"
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Paramètres manquants ou invalides
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
 *                   example: "Paramètres requis manquants : code et userId"
 *       500:
 *         description: Erreur d'authentification Google
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
 *                   example: "Échec de l'authentification Google"
 *                 data:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: "invalid_grant"
 */
router.post("/callback", authController.googleCallback);

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     googleOAuth:
 *       type: oauth2
 *       flows:
 *         authorizationCode:
 *           authorizationUrl: https://accounts.google.com/o/oauth2/v2/auth
 *           tokenUrl: https://oauth2.googleapis.com/token
 *           scopes:
 *             https://www.googleapis.com/auth/fitness.activity.read: "Lire les données d'activité"
 *             https://www.googleapis.com/auth/fitness.body.read: "Lire les mesures corporelles"
 *             https://www.googleapis.com/auth/fitness.location.read: "Lire les données de localisation"
 *             https://www.googleapis.com/auth/fitness.sleep.read: "Lire les données de sommeil"
 */

module.exports = router;