const express = require("express");
const axios = require("axios");
const router = express.Router();
const db = require("../../models");

const CLIENT_ID = process.env.GOOGLE_FIT_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_FIT_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_FIT_REDIRECT_URI;

/**
 * @openapi
 * tags:
 *   - name: Google Authentication
 *     description: Endpoints for Google OAuth authentication.
 */
router.post("/google/callback", async (req, res) => {
  /**
   * @openapi
   * /api/google/callback:
   *   post:
   *     tags:
   *       - Google Authentication
   *     summary: Google OAuth Callback
   *     description: Handles the callback from Google OAuth, exchanges the authorization code for tokens, and stores them.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - code
   *               - userId
   *             properties:
   *               code:
   *                 type: string
   *                 description: The authorization code received from Google.
   *               userId:
   *                 type: string
   *                 format: uuid
   *                 description: The ID of the user initiating the OAuth flow.
   *     responses:
   *       200:
   *         description: Successfully exchanged code for tokens and stored them.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *       500:
   *         description: Internal server error during Google OAuth process.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Erreur d’authentification Google
   */
  const { code, userId } = req.body;

  try {
    const response = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const { access_token, refresh_token, expires_in } = response.data;

    // Enregistrer dans la base
    await db.UserTokens.upsert({
      userId,
      provider: "google_fit",
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: new Date(Date.now() + expires_in * 1000),
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Erreur OAuth Google:", error?.response?.data || error.message);
    res.status(500).json({ error: "Erreur d’authentification Google" });
  }
});

module.exports = router;
