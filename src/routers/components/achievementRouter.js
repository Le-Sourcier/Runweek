const router = require("express").Router();
const { authorize } = require("../../middlewares/authMiddleware");
const ctr = require("../../controllers/components/achievementsController");

// GET /api/achievements - Récupérer tous les achievements de l'utilisateur
router
  .get("/", authorize, ctr.getUserAchievements)

  // POST /api/achievements/unlock - Débloquer un achievement
  .post("/unlock", authorize, ctr.unlockAchievement)

  // POST /api/achievements/check - Vérifier les achievements automatiquement
  .post("/check", authorize, ctr.checkAchievements)

  // GET /api/achievements/stats - Statistiques des achievements
  .get("/stats", authorize, ctr.getAchievementStats)

  // GET /api/achievements/available - Récupérer tous les achievements disponibles
  .get("/available", authorize, ctr.getAvailableAchievements);

module.exports = router;
