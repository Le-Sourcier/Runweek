const express = require("express");
const router = express.Router();
const goalsController = require("../../controllers/components/goalsController");
const { authorize } = require("../../middlewares/authMiddleware");

// Routes pour les objectifs
router

  // GET /api/goals - Récupérer tous les objectifs de l'utilisateur
  .get("/", authorize, goalsController.getAllGoals)

  // GET /api/goals/stats - Statistiques des objectifs
  .get("/stats", authorize, goalsController.getGoalsStats)

  // GET /api/goals/:id - Récupérer un objectif spécifique
  .get("/:id", authorize, goalsController.getGoalById)

  // POST /api/goals - Créer un nouvel objectif
  .post("/", authorize, goalsController.createGoal)

  // PUT /api/goals/:id - Mettre à jour un objectif
  .put("/:id", authorize, goalsController.updateGoal)

  // DELETE /api/goals/:id - Supprimer un objectif
  .post("/:id/progress", authorize, goalsController.addProgress)

  // DELETE /api/goals/:id - Supprimer un objectif
  .delete("/:id", authorize, goalsController.deleteGoal);

module.exports = router;
