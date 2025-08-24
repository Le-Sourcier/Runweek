const Joi = require("joi");
const { Goal } = require("../../models");
const { serverMessage } = require("../../utils");
const { Op } = require("sequelize");

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
      const {
        completed,
        category,
        sort = "deadline",
        page = 1,
        limit = 10,
        search,
      } = req.query;

      // Filtre de base
      const where = {
        user_id: req.user.id,
        isActive: true,
      };

      // Filtre par statut de complétion
      if (completed !== undefined) {
        where.completed = completed === "true";
      }

      // Filtre par catégorie
      if (category && category !== "all") {
        where.category = category;
      }

      // Filtre de recherche par titre
      if (search && search.trim() !== "") {
        where.title = {
          [Op.like]: `%${search.trim()}%`,
        };
      }

      // Options de tri
      const orderOptions = {
        deadline: [["deadline", "ASC"]],
        created: [["createdAt", "DESC"]],
        updated: [["updatedAt", "DESC"]],
        progress: [
          ["progressPercentage", "DESC"],
          ["deadline", "ASC"],
        ],
        priority: [
          ["priority", "DESC"],
          ["deadline", "ASC"],
        ],
        title: [["title", "ASC"]],
        category: [
          ["category", "ASC"],
          ["deadline", "ASC"],
        ],
      };

      // Configuration de la pagination
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const offset = (pageNumber - 1) * limitNumber;

      // Récupération des objectifs avec pagination
      const { count, rows: goals } = await Goal.findAndCountAll({
        where,
        order: orderOptions[sort] || orderOptions.deadline,
        limit: limitNumber,
        offset: offset,
      });

      // Calcul du total pour la pagination
      const totalPages = Math.ceil(count / limitNumber);

      // Calcul des statistiques
      const stats = {
        total: count,
        completed: await Goal.count({
          where: { ...where, completed: true },
        }),
        inProgress: await Goal.count({
          where: {
            ...where,
            completed: false,
            progressPercentage: { [Op.gt]: 0, [Op.lt]: 100 },
          },
        }),
        notStarted: await Goal.count({
          where: {
            ...where,
            completed: false,
            progressPercentage: 0,
          },
        }),
        overdue: await Goal.count({
          where: {
            ...where,
            completed: false,
            deadline: { [Op.lt]: new Date() },
          },
        }),
      };

      // Formatage de la réponse
      const response = {
        goals,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalGoals: count,
          hasNext: pageNumber < totalPages,
          hasPrev: pageNumber > 1,
          limit: limitNumber,
        },
        stats,
      };

      return serverMessage(res, "GOALS_RETRIEVED", response);
    } catch (error) {
      console.error("Erreur lors de la récupération des objectifs:", error);
      return serverMessage(res, "GOALS_RETRIEVAL_FAILED", error.message);
    }
  },

  // GET /api/goals/:id - Récupérer un objectif spécifique
  getGoalById: async (req, res) => {
    try {
      const goal = await Goal.findOne({
        id: req.params.id,
        user_id: req.user.id,
        isActive: true,
      });

      if (!goal) {
        return serverMessage(res, "GOAL_NOT_FOUND");
      }

      return serverMessage(res, "GOAL_RETRIEVED", goal);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'objectif:", error);
      return serverMessage(res, "GOAL_RETRIEVAL_FAILED");
    }
  },

  // POST /api/goals - Créer un nouvel objectif
  createGoal: async (req, res) => {
    try {
      const { error, value } = createGoalSchema.validate(req.body);

      if (error) {
        console.log("INVALID_GOAL_DATA", error.details[0].message);
        return serverMessage(res, "INVALID_GOAL_DATA");
      }

      const goal = new Goal({
        ...value,
        user_id: req.user.id,
      });

      await goal.save();

      return serverMessage(res, "GOAL_CREATED", goal);
    } catch (error) {
      console.error("Erreur lors de la création de l'objectif:", error);
      return serverMessage(res, "GOAL_CREATION_FAILED");
    }
  },

  // PUT /api/goals/:id - Mettre à jour un objectif
  updateGoal: async (req, res) => {
    try {
      const { error, value } = updateGoalSchema.validate(req.body);

      if (error) {
        res.status(400).json({
          error: true,
          message: "Données invalides",
          details: error.details[0].message,
        });

        return serverMessage(res, "INVALID_GOAL_DATA");
      }

      const goal = await Goal.findOne({
        id: req.params.id,
        user_id: req.user.id,
        isActive: true,
      });

      if (!goal) {
        return serverMessage(res, "GOAL_NOT_FOUND");
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

      return serverMessage(res, "GOAL_UPDATED", goal);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'objectif:", error);
      return serverMessage(res, "GOAL_UPDATE_FAILED");
    }
  },

  // POST /api/goals/:id/progress - Ajouter une progression à un objectif
  addProgress: async (req, res) => {
    try {
      const { error, value } = progressSchema.validate(req.body);

      if (error) {
        console.log("Données invalides details: ", error.details[0].message);
        return serverMessage(res, "INVALID_RECORD_DATA");
      }

      const goal = await Goal.findOne({
        id: req.params.id,
        user_id: req.user.id,
        isActive: true,
      });

      if (!goal) {
        return serverMessage(res, "GOAL_NOT_FOUND");
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

      return serverMessage(res, "GOAL_UPDATED", goal);
    } catch (error) {
      console.error("Erreur lors de l'ajout de progression:", error);
      return serverMessage(res, "GOAL_UPDATE_FAILED", error.message);
    }
  },

  // DELETE /api/goals/:id - Supprimer un objectif
  deleteGoal: async (req, res) => {
    try {
      const goal = await Goal.findOne({
        id: req.params.id,
        user_id: req.user.id,
        isActive: true,
      });

      if (!goal) {
        return serverMessage(res, "GOAL_NOT_FOUND");
      }

      goal.isActive = false;
      await goal.save();

      return serverMessage(res, "GOAL_DELETED");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'objectif:", error);
      return serverMessage(res, "GOAL_DELETION_FAILED", error.message);
    }
  },

  // GET /api/goals/stats - Statistiques des objectifs
  getGoalsStats: async (req, res) => {
    try {
      const user_id = req.user.id;

      const stats = await Goal.aggregate([
        { $match: { user_id: user_id, isActive: true } },
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

      if (!result) {
        return serverMessage(res, "NO_STATS_FOR_GOALS_FOUND");
      }

      return serverMessage(res, "GOALS_STATS_RETRIEVED", result);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      return serverMessage(res, "GOALS_STATS_RETRIEVAL_FAILED");
    }
  },
};
