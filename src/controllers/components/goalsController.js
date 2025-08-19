const Joi = require("joi");
const { Goal } = require("../models");

// Schémas de validation
const createGoalSchema = Joi.object({
  title: Joi.string().required().max(100).trim(),
  description: Joi.string().max(500).trim().allow(""),
  category: Joi.string()
    .valid("distance", "speed", "consistency", "event", "other")
    .required(),
  target: Joi.number().positive().required(),
  unit: Joi.string().required().trim(),
  deadline: Joi.date().iso().required(),
  priority: Joi.string().valid("low", "medium", "high").default("medium"),
});

const updateGoalSchema = Joi.object({
  title: Joi.string().max(100).trim(),
  description: Joi.string().max(500).trim().allow(""),
  category: Joi.string().valid(
    "distance",
    "speed",
    "consistency",
    "event",
    "other"
  ),
  target: Joi.number().positive(),
  current: Joi.number().min(0),
  unit: Joi.string().trim(),
  deadline: Joi.date().iso(),
  completed: Joi.boolean(),
  priority: Joi.string().valid("low", "medium", "high"),
});

const progressSchema = Joi.object({
  value: Joi.number().min(0).required(),
  notes: Joi.string().max(200).trim().allow(""),
});

// Contrôleurs
module.exports = {
  // GET /api/goals - Récupérer tous les objectifs de l'utilisateur
  getAllGoals: async (req, res) => {
    try {
      const { completed, category, sort = "deadline" } = req.query;

      const filter = { userId: req.user._id, isActive: true };

      if (completed !== undefined) {
        filter.completed = completed === "true";
      }

      if (category && category !== "all") {
        filter.category = category;
      }

      const sortOptions = {
        deadline: { deadline: 1 },
        created: { createdAt: -1 },
        progress: { current: -1 },
        priority: { priority: -1, deadline: 1 },
      };

      const goals = await Goal.find(filter)
        .sort(sortOptions[sort] || sortOptions.deadline)
        .lean();

      res.json({
        error: false,
        message: "Objectifs récupérés avec succès",
        data: goals,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des objectifs:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de la récupération des objectifs",
      });
    }
  },

  // GET /api/goals/:id - Récupérer un objectif spécifique
  getGoalById: async (req, res) => {
    try {
      const goal = await Goal.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isActive: true,
      });

      if (!goal) {
        return res.status(404).json({
          error: true,
          message: "Objectif non trouvé",
        });
      }

      res.json({
        error: false,
        message: "Objectif récupéré avec succès",
        data: goal,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération de l'objectif:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de la récupération de l'objectif",
      });
    }
  },

  // POST /api/goals - Créer un nouvel objectif
  createGoal: async (req, res) => {
    try {
      const { error, value } = createGoalSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          error: true,
          message: "Données invalides",
          details: error.details[0].message,
        });
      }

      const goal = new Goal({
        ...value,
        userId: req.user._id,
      });

      await goal.save();

      res.status(201).json({
        error: false,
        message: "Objectif créé avec succès",
        data: goal,
      });
    } catch (error) {
      console.error("Erreur lors de la création de l'objectif:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de la création de l'objectif",
      });
    }
  },

  // PUT /api/goals/:id - Mettre à jour un objectif
  updateGoal: async (req, res) => {
    try {
      const { error, value } = updateGoalSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          error: true,
          message: "Données invalides",
          details: error.details[0].message,
        });
      }

      const goal = await Goal.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isActive: true,
      });

      if (!goal) {
        return res.status(404).json({
          error: true,
          message: "Objectif non trouvé",
        });
      }

      // Vérifier si l'objectif est complété automatiquement
      if (
        value.current !== undefined &&
        value.current >= goal.target &&
        !goal.completed
      ) {
        value.completed = true;
        value.completedAt = new Date();
      }

      Object.assign(goal, value);
      await goal.save();

      res.json({
        error: false,
        message: "Objectif mis à jour avec succès",
        data: goal,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'objectif:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de la mise à jour de l'objectif",
      });
    }
  },

  // POST /api/goals/:id/progress - Ajouter une progression à un objectif
  addProgress: async (req, res) => {
    try {
      const { error, value } = progressSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          error: true,
          message: "Données invalides",
          details: error.details[0].message,
        });
      }

      const goal = await Goal.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isActive: true,
      });

      if (!goal) {
        return res.status(404).json({
          error: true,
          message: "Objectif non trouvé",
        });
      }

      // Ajouter la progression
      goal.progress.push(value);
      goal.current = value.value;

      // Vérifier si l'objectif est complété
      if (goal.current >= goal.target && !goal.completed) {
        goal.completed = true;
        goal.completedAt = new Date();
      }

      await goal.save();

      res.json({
        error: false,
        message: "Progression ajoutée avec succès",
        data: goal,
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de progression:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de l'ajout de progression",
      });
    }
  },

  // DELETE /api/goals/:id - Supprimer un objectif
  deleteGoal: async (req, res) => {
    try {
      const goal = await Goal.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isActive: true,
      });

      if (!goal) {
        return res.status(404).json({
          error: true,
          message: "Objectif non trouvé",
        });
      }

      goal.isActive = false;
      await goal.save();

      res.json({
        error: false,
        message: "Objectif supprimé avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'objectif:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de la suppression de l'objectif",
      });
    }
  },

  // GET /api/goals/stats - Statistiques des objectifs
  getGoalsStats: async (req, res) => {
    try {
      const userId = req.user._id;

      const stats = await Goal.aggregate([
        { $match: { userId: userId, isActive: true } },
        {
          $group: {
            _id: null,
            totalGoals: { $sum: 1 },
            completedGoals: {
              $sum: { $cond: [{ $eq: ["$completed", true] }, 1, 0] },
            },
            activeGoals: {
              $sum: { $cond: [{ $eq: ["$completed", false] }, 1, 0] },
            },
            overdueGoals: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$completed", false] },
                      { $lt: ["$deadline", new Date()] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            averageProgress: {
              $avg: {
                $cond: [
                  { $gt: ["$target", 0] },
                  { $multiply: [{ $divide: ["$current", "$target"] }, 100] },
                  0,
                ],
              },
            },
          },
        },
      ]);

      const result = stats[0] || {
        totalGoals: 0,
        completedGoals: 0,
        activeGoals: 0,
        overdueGoals: 0,
        averageProgress: 0,
      };

      res.json({
        error: false,
        message: "Statistiques récupérées avec succès",
        data: result,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de la récupération des statistiques",
      });
    }
  },
};
