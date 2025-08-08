const express = require("express");
const axios = require("axios");
const router = express.Router();
const db = require("../../models");

const CLIENT_ID = process.env.GOOGLE_FIT_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_FIT_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_FIT_REDIRECT_URI;

/**
 * @openapi
 * /api/google/callback:
 *   post:
 *     tags: [Authentification Google]
 *     summary: Gérer le callback OAuth de Google
 *     description: >
 *       Ce endpoint gère la réponse du flux d'authentification OAuth 2.0 de Google.
 *       Il échange le code d'autorisation contre des jetons d'accès et de rafraîchissement,
 *       puis les stocke en base de données pour les appels futurs à l'API Google Fit.
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
router.post("/google/callback", async (req, res) => {
  const { code, userId } = req.body;

  // Valider les paramètres requis
  if (!code || !userId) {
    return res.status(400).json({
      error: true,
      status: 400,
      message: "Paramètres requis manquants : code et userId",
      data: {
        champsManquants: {
          code: !code ? "manquant" : "fourni",
          userId: !userId ? "manquant" : "fourni"
        }
      }
    });
  }

  // Valider le format UUID si nécessaire
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    return res.status(400).json({
      error: true,
      status: 400,
      message: "Format userId invalide, doit être un UUID valide",
      data: {
        champInvalide: "userId",
        formatAttendu: "UUIDv4"
      }
    });
  }

  try {
    // Échanger le code d'autorisation contre des jetons
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000, // Timeout de 10 secondes
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Calculer la date d'expiration
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Stocker les jetons en base de données
    await db.UserTokens.upsert({
      userId,
      provider: "google_fit",
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt,
    });

    // Retourner une réponse de succès
    return res.status(200).json({
      error: false,
      status: 200,
      message: "Authentification Google réussie",
      data: { success: true },
    });

  } catch (error) {
    console.error("Erreur OAuth Google:", error.response?.data || error.message);

    // Gérer spécifiquement les erreurs 400 de Google
    if (error.response?.status === 400) {
      return res.status(400).json({
        error: true,
        status: 400,
        message: "Code d'autorisation invalide",
        data: { error: error.response.data }
      });
    }

    // Déterminer si l'erreur vient de Google ou de notre système
    const errorData = error.response?.data || { error: error.message };
    const statusCode = error.response?.status || 500;

    return res.status(statusCode).json({
      error: true,
      status: statusCode,
      message: "Échec de l'authentification Google",
      data: { error: errorData },
    });
  }
});

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
 */

module.exports = router;