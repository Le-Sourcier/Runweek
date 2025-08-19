const express = require("express");
const router = express.Router();
const healthController = require("../../controllers/components/healthController");
const { authorize } = require("../../middlewares/authMiddleware");

// Routes pour la synchronisation des données de santé
router
  // POST /api/health/sync - Synchroniser les données Google Fit
  .post("/sync", authorize, healthController.syncHealthData)

  // GET /api/health/sync/status/:syncId - Vérifier le statut d'une synchronisation
  .get("/sync/status/:syncId", authorize, healthController.getSyncStatus)

  // GET /api/health/sync/history - Historique des synchronisations
  .get("/sync/history", authorize, healthController.getSyncHistory)

  // GET /api/health/activity - Récupérer les données d'activité
  .get("/activity", authorize, healthController.getActivityData)

  // GET /api/health/heart-rate - Récupérer les données de fréquence cardiaque
  .get("/heart-rate", authorize, healthController.getHeartRateData)

  // GET /api/health/sleep - Récupérer les données de sommeil
  .get("/sleep", authorize, healthController.getSleepData)

  // GET /api/health/exercise - Récupérer les sessions d'exercice
  .get("/exercise", authorize, healthController.getExerciseData)

  // GET /api/health/dashboard - Récupérer un résumé pour le dashboard
  .get("/dashboard", authorize, healthController.getDashboard)

  // GET /api/health/connection/status - Vérifier le statut de connexion Google
  .get("/connection/status", authorize, healthController.getConnectionStatus)

  // DELETE /api/health/disconnect - Déconnecter Google Fit
  .delete("/disconnect", authorize, healthController.disconnectGoogleFit);

module.exports = router;
