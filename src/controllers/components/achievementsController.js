const Joi = require("joi");
const { Op } = require("sequelize");
const {
  Achievement,
  AchievementDefinition,
  UserStats,
} = require("../../models");
const { serverMessage } = require("../../utils");

// Validation schemas
const unlockAchievementSchema = Joi.object({
  achievement_id: Joi.string().required(),
  activityData: Joi.object().optional(),
});

module.exports = {
  // GET /api/achievements - Récupérer tous les achievements de l'utilisateur
  getUserAchievements: async (req, res) => {
    try {
      const { category, earned } = req.query;
      const whereClause = { user_id: req.user.id };

      if (category && category !== "all") {
        whereClause.category = category;
      }

      // Récupérer les achievements de l'utilisateur
      const userAchievements = await Achievement.findAll({
        where: whereClause,
        order: [["earnedDate", "DESC"]],
        raw: true,
      });

      // Récupérer tous les achievements disponibles
      const availableAchievements = await AchievementDefinition.findAll({
        where: { isActive: true },
        raw: true,
      });

      // Créer une liste complète avec les achievements non débloqués
      const allAchievements = availableAchievements.map((definition) => {
        const userAchievement = userAchievements.find(
          (a) => a.achievement_id === definition.id
        );

        if (userAchievement) {
          return userAchievement;
        } else {
          return {
            achievement_id: definition.id,
            title: definition.title,
            description: definition.description,
            icon: definition.icon,
            category: definition.category,
            points: definition.points,
            rarity: definition.rarity,
            earnedDate: null,
            isLocked: true,
            requirements: definition.requirements,
          };
        }
      });

      // Filtrer par statut si demandé
      let filteredAchievements = allAchievements;
      if (earned === "true") {
        filteredAchievements = allAchievements.filter((a) => a.earnedDate);
      } else if (earned === "false") {
        filteredAchievements = allAchievements.filter((a) => !a.earnedDate);
      }

      return serverMessage(res, "ACHIEVEMENTS_RETRIEVED", filteredAchievements);
    } catch (error) {
      console.error("Erreur lors de la récupération des achievements:", error);
      return serverMessage(res, "ACHIEVEMENTS_RETRIEVE_FAILED");
    }
  },

  // POST /api/achievements/unlock - Débloquer un achievement
  unlockAchievement: async (req, res) => {
    try {
      const { error, value } = unlockAchievementSchema.validate(req.body);

      if (error) {
        return serverMessage(res, "INVALID_DATA", {
          details: error.details[0].message,
        });
      }

      const { achievement_id, activityData } = value;

      // Vérifier si l'achievement existe dans les définitions
      const achievementDefinition = await AchievementDefinition.findOne({
        where: { id: achievement_id, isActive: true },
      });

      if (!achievementDefinition) {
        return serverMessage(res, "ACHIEVEMENT_NOT_FOUND");
      }

      // Vérifier si l'utilisateur a déjà cet achievement
      const existingAchievement = await Achievement.findOne({
        where: {
          user_id: req.user.id,
          achievement_id: achievement_id,
        },
      });

      if (existingAchievement) {
        return serverMessage(res, "ACHIEVEMENT_ALREADY_UNLOCKED");
      }

      // Créer le nouvel achievement
      const newAchievement = await Achievement.create({
        user_id: req.user.id,
        achievement_id: achievement_id,
        title: achievementDefinition.title,
        description: achievementDefinition.description,
        icon: achievementDefinition.icon,
        category: achievementDefinition.category,
        points: achievementDefinition.points,
        rarity: achievementDefinition.rarity,
        requirements: achievementDefinition.requirements,
        earnedDate: new Date(),
      });

      // Mettre à jour les points dans UserStats
      await UserStats.increment("points", {
        by: achievementDefinition.points,
        where: { user_id: req.user.id },
      });

      return serverMessage(res, "ACHIEVEMENT_UNLOCKED", newAchievement);
    } catch (error) {
      console.error("Erreur lors du déblocage de l'achievement:", error);
      return serverMessage(res, "ACHIEVEMENT_UNLOCK_FAILED");
    }
  },

  // POST /api/achievements/check - Vérifier les achievements automatiquement
  checkAchievements: async (req, res) => {
    try {
      const { userStats, activityData } = req.body;

      // Récupérer toutes les définitions d'achievements
      const availableAchievements = await AchievementDefinition.findAll({
        where: { isActive: true },
        raw: true,
      });

      const userAchievements = await Achievement.findAll({
        where: { user_id: req.user.id },
        raw: true,
      });

      const unlockedIds = userAchievements.map((a) => a.achievement_id);
      const newlyUnlocked = [];

      // Vérifier chaque achievement disponible
      for (const definition of availableAchievements) {
        if (unlockedIds.includes(definition.id)) continue;

        let shouldUnlock = false;
        const requirements = definition.requirements;

        // Logique de vérification des requirements
        if (
          requirements.totalRuns &&
          userStats.totalRuns >= requirements.totalRuns
        ) {
          shouldUnlock = true;
        }

        if (
          requirements.totalDistance &&
          userStats.totalDistance >= requirements.totalDistance
        ) {
          shouldUnlock = true;
        }

        if (
          requirements.singleRunDistance &&
          activityData?.distance >= requirements.singleRunDistance
        ) {
          shouldUnlock = true;
        }

        if (
          requirements.consecutiveDays &&
          userStats.streakDays >= requirements.consecutiveDays
        ) {
          shouldUnlock = true;
        }

        // Ajoutez d'autres conditions selon vos requirements

        if (shouldUnlock) {
          const newAchievement = await Achievement.create({
            user_id: req.user.id,
            achievement_id: definition.id,
            title: definition.title,
            description: definition.description,
            icon: definition.icon,
            category: definition.category,
            points: definition.points,
            rarity: definition.rarity,
            requirements: definition.requirements,
            earnedDate: new Date(),
          });

          newlyUnlocked.push(newAchievement);

          // Mettre à jour les points dans UserStats
          await UserStats.increment("points", {
            by: definition.points,
            where: { user_id: req.user.id },
          });
        }
      }

      const data = {
        count: newlyUnlocked.length,
        newlyUnlocked,
      };

      return serverMessage(res, "ACHIEVEMENTS_CHECKED", data);
    } catch (error) {
      console.error("Erreur lors de la vérification des achievements:", error);
      return serverMessage(res, "ACHIEVEMENTS_CHECK_FAILED");
    }
  },

  // GET /api/achievements/stats - Statistiques des achievements
  getAchievementStats: async (req, res) => {
    try {
      const userId = req.user.id;

      // Récupérer le nombre total d'achievements disponibles
      const totalAvailable = await AchievementDefinition.count({
        where: { isActive: true },
      });

      // Récupérer les statistiques de l'utilisateur
      const userStats = await Achievement.findAll({
        where: { user_id: userId },
        attributes: [
          [
            Achievement.sequelize.fn("COUNT", Achievement.sequelize.col("id")),
            "totalEarned",
          ],
          [
            Achievement.sequelize.fn(
              "SUM",
              Achievement.sequelize.col("points")
            ),
            "totalPoints",
          ],
        ],
        raw: true,
      });

      // Récupérer les catégories et rarités uniques
      const categories = await Achievement.findAll({
        where: { user_id: userId },
        attributes: ["category"],
        group: ["category"],
        raw: true,
      });

      const rarities = await Achievement.findAll({
        where: { user_id: userId },
        attributes: ["rarity"],
        group: ["rarity"],
        raw: true,
      });

      // Récupérer les achievements récents (7 derniers jours)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentAchievements = await Achievement.findAll({
        where: {
          user_id: userId,
          earnedDate: {
            [Op.gte]: sevenDaysAgo,
          },
        },
        order: [["earnedDate", "DESC"]],
        raw: true,
      });

      const result = {
        totalEarned: parseInt(userStats[0]?.totalEarned) || 0,
        totalPoints: parseInt(userStats[0]?.totalPoints) || 0,
        categoriesEarned: categories.map((c) => c.category),
        raritiesEarned: rarities.map((r) => r.rarity),
        recentAchievements: recentAchievements,
        totalAvailable: totalAvailable,
        completionRate:
          totalAvailable > 0
            ? (parseInt(userStats[0]?.totalEarned) || 0 / totalAvailable) * 100
            : 0,
      };

      return serverMessage(res, "ACHIEVEMENT_STATS_RETRIEVED", result);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      return serverMessage(res, "ACHIEVEMENT_STATS_RETRIEVE_FAILED");
    }
  },

  // GET /api/achievements/available - Récupérer tous les achievements disponibles
  getAvailableAchievements: async (req, res) => {
    try {
      const availableAchievements = await AchievementDefinition.findAll({
        where: { isActive: true },
        raw: true,
      });

      return serverMessage(
        res,
        "AVAILABLE_ACHIEVEMENTS_RETRIEVED",
        availableAchievements
      );
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des achievements disponibles:",
        error
      );
      return serverMessage(res, "AVAILABLE_ACHIEVEMENTS_RETRIEVE_FAILED");
    }
  },
};
