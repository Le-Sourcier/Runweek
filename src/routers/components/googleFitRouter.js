const express = require("express");
const axios = require("axios");
const router = express.Router();

const getValidAccessToken = require("../../utils/getValidAccessToken");
const authorizeGoogleFit = require("../../middlewares/googleFitAuth");

/**
 * @swagger
 * /google-fit/steps:
 *   get:
 *     summary: Récupère le nombre de pas des dernières 24 heures.
 *     description: >
 *       Ce point de terminaison interroge l'API Google Fit pour agréger le nombre total de pas effectués par l'utilisateur au cours des dernières 24 heures.
 *       Il nécessite une autorisation OAuth2 valide pour accéder aux données de fitness de l'utilisateur.
 *     tags: [Google Fit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données des pas récupérées avec succès.
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
 *                   example: "Données de pas Google Fit récupérées avec succès."
 *                 data:
 *                   $ref: '#/components/schemas/GoogleFitStepResponse'
 *       401:
 *         description: Non autorisé, token manquant ou invalide.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       500:
 *         description: Erreur interne du serveur lors de la récupération des données.
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
 *                   example: "Erreur lors de la récupération des données Google Fit."
 *                 data:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: "Erreur récupération données Google Fit."
 */
router.get("/steps", authorizeGoogleFit, async (req, res) => {
  const accessToken = await getValidAccessToken(req.user.id);
  const now = Date.now();
  const yesterday = now - 86400000;

  try {
    const fitResponse = await axios.post(
      "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
      {
        aggregateBy: [{ dataTypeName: "com.google.step_count.delta" }],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: yesterday,
        endTimeMillis: now,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({
      error: false,
      status: 200,
      message: "Données de pas Google Fit récupérées avec succès.",
      data: fitResponse.data,
    });
  } catch (error) {
    console.error("Google Fit Error:", error.response?.data || error.message);
    res.status(500).json({
      error: true,
      status: 500,
      message: "Erreur lors de la récupération des données Google Fit.",
      data: { error: error.response?.data || error.message },
    });
  }
});

/**
 * @swagger
 * /google-fit/metrics:
 *   get:
 *     summary: Récupère un ensemble de métriques de fitness des dernières 24 heures.
 *     description: >
 *       Ce point de terminaison agrège plusieurs types de données de Google Fit sur les dernières 24 heures, incluant :
 *       - Le nombre de pas (com.google.step_count.delta)
 *       - Les calories dépensées (com.google.calories.expended)
 *       - La distance parcourue (com.google.distance.delta)
 *       - Les minutes d'activité (com.google.active_minutes)
 *     tags: [Google Fit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métriques de fitness agrégées récupérées avec succès.
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
 *                   example: "Métriques Google Fit récupérées avec succès."
 *                 data:
 *                   $ref: '#/components/schemas/GoogleFitMetricResponse'
 *       401:
 *         description: Non autorisé, token manquant ou invalide.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       500:
 *         description: Erreur interne du serveur lors de la récupération des données.
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
 *                   example: "Erreur lors de la récupération des métriques Google Fit."
 *                 data:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: "Erreur récupération métriques."
 */
router.get("/metrics", authorizeGoogleFit, async (req, res) => {
  const accessToken = await getValidAccessToken(req.user.id);
  const now = Date.now();
  const yesterday = now - 86400000;

  const aggregateBody = {
    aggregateBy: [
      { dataTypeName: "com.google.step_count.delta" },
      { dataTypeName: "com.google.calories.expended" },
      { dataTypeName: "com.google.distance.delta" },
      { dataTypeName: "com.google.active_minutes" },
    ],
    bucketByTime: { durationMillis: 86400000 },
    startTimeMillis: yesterday,
    endTimeMillis: now,
  };

  try {
    const response = await axios.post(
      "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
      aggregateBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({
      error: false,
      status: 200,
      message: "Métriques Google Fit récupérées avec succès.",
      data: response.data,
    });
  } catch (error) {
    console.error("Erreur Google Fit:", error.response?.data || error.message);
    res.status(500).json({
      error: true,
      status: 500,
      message: "Erreur lors de la récupération des métriques Google Fit.",
      data: { error: error.response?.data || error.message },
    });
  }
});

/**
 * @swagger
 * /google-fit/sleep:
 *   get:
 *     summary: Récupère les données de sommeil des dernières 24 heures.
 *     description: >
 *       Ce point de terminaison récupère les segments de sommeil (par exemple, sommeil léger, profond, paradoxal) enregistrés par Google Fit au cours des dernières 24 heures.
 *       Il interroge la source de données `derived:com.google.sleep.segment:com.google.android.gms:merged`.
 *     tags: [Google Fit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données de sommeil récupérées avec succès.
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
 *                   example: "Données de sommeil Google Fit récupérées avec succès."
 *                 data:
 *                   $ref: '#/components/schemas/GoogleFitSleepResponse'
 *       401:
 *         description: Non autorisé, token manquant ou invalide.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       500:
 *         description: Erreur interne du serveur lors de la récupération des données.
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
 *                   example: "Erreur lors de la récupération des données de sommeil Google Fit."
 *                 data:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: "Erreur récupération sommeil."
 */
router.get("/sleep", authorizeGoogleFit, async (req, res) => {
  const accessToken = await getValidAccessToken(req.user.id);
  const now = Date.now();
  const yesterday = now - 86400000;

  const dataSourceId =
    "derived:com.google.sleep.segment:com.google.android.gms:merged";

  const dataset = `${yesterday * 1000}-${now * 1000}`;

  try {
    const response = await axios.get(
      `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataSourceId}/datasets/${dataset}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.status(200).json({
      error: false,
      status: 200,
      message: "Données de sommeil Google Fit récupérées avec succès.",
      data: response.data,
    });
  } catch (error) {
    console.error("Erreur sommeil Google Fit:", error.response?.data || error.message);
    res.status(500).json({
      error: true,
      status: 500,
      message: "Erreur lors de la récupération des données de sommeil Google Fit.",
      data: { error: error.response?.data || error.message },
    });
  }
});

module.exports = router;
