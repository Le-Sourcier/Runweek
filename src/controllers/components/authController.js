const axios = require("axios");
const db = require("../../models");

const CLIENT_ID = process.env.GOOGLE_FIT_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_FIT_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_FIT_REDIRECT_URI;
const PROVIDER_NAME = "google_fit";

const googleLogin = (req, res) => {
  const scopes = [
    "https://www.googleapis.com/auth/fitness.activity.read",
    "https://www.googleapis.com/auth/fitness.location.read",
    "https://www.googleapis.com/auth/fitness.body.read",
    "https://www.googleapis.com/auth/fitness.sleep.read",
  ];

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scopes.join(" ")}&access_type=offline&prompt=consent`;

  res.redirect(url);
};

const googleCallback = async (req, res) => {
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
          userId: !userId ? "manquant" : "fourni",
        },
      },
    });
  }

  // Valider le format UUID si nécessaire
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    return res.status(400).json({
      error: true,
      status: 400,
      message: "Format userId invalide, doit être un UUID valide",
      data: {
        champInvalide: "userId",
        formatAttendu: "UUIDv4",
      },
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
      provider: PROVIDER_NAME,
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
        data: { error: error.response.data },
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
};

module.exports = {
  googleLogin,
  googleCallback,
};
