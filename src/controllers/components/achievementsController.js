const Joi = require("joi");
const { Achievement, User } = require("../../models");

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
      const filter = { userId: req.user.id };

      if (category && category !== "all") {
        filter.category = category;
      }

      let achievements = await Achievement.find(filter)
        .sort({ earnedDate: -1 })
        .lean();

      // Récupérer tous les achievements disponibles
      const availableAchievements = Achievement.getAvailableAchievements();

      // Créer une liste complète avec les achievements non débloqués
      const allAchievements = Object.entries(availableAchievements).map(
        ([id, data]) => {
          const userAchievement = achievements.find(
            (a) => a.achievement_id === id
          );

          if (userAchievement) {
            return userAchievement;
          } else {
            return {
              achievement_id: id,
              title: data.title,
              description: data.description,
              icon: data.icon,
              category: data.category,
              points: data.points,
              rarity: data.rarity,
              earnedDate: null,
              isLocked: true,
            };
          }
        }
      );

      // Filtrer par statut si demandé
      let filteredAchievements = allAchievements;
      if (earned === "true") {
        filteredAchievements = allAchievements.filter((a) => a.earnedDate);
      } else if (earned === "false") {
        filteredAchievements = allAchievements.filter((a) => !a.earnedDate);
      }

      res.json({
        error: false,
        message: "Achievements récupérés avec succès",
        data: filteredAchievements,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des achievements:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de la récupération des achievements",
      });
    }
  },

  // POST /api/achievements/unlock - Débloquer un achievement
  unlockAchievement: async (req, res) => {
    try {
      const { error, value } = unlockAchievementSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          error: true,
          message: "Données invalides",
          details: error.details[0].message,
        });
      }

      const { achievement_id, activityData } = value;

      // Vérifier si l'achievement existe dans les achievements disponibles
      const availableAchievements = Achievement.getAvailableAchievements();
      const achievementData = availableAchievements[achievement_id];

      if (!achievementData) {
        return res.status(404).json({
          error: true,
          message: "Achievement non trouvé",
        });
      }

      // Vérifier si l'utilisateur a déjà cet achievement
      const existingAchievement = await Achievement.findOne({
        userId: req.user.id,
        achievement_id: achievement_id,
      });

      if (existingAchievement) {
        return res.status(409).json({
          error: true,
          message: "Achievement déjà débloqué",
        });
      }

      // Créer le nouvel achievement
      const newAchievement = new Achievement({
        userId: req.user.id,
        achievement_id: achievement_id,
        title: achievementData.title,
        description: achievementData.description,
        icon: achievementData.icon,
        category: achievementData.category,
        points: achievementData.points,
        rarity: achievementData.rarity,
        requirements: achievementData.requirements,
      });

      await newAchievement.save();

      // Mettre à jour les points de l'utilisateur
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { "stats.points": achievementData.points },
      });

      res.status(201).json({
        error: false,
        message: "Achievement débloqué avec succès",
        data: newAchievement,
      });
    } catch (error) {
      console.error("Erreur lors du déblocage de l'achievement:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors du déblocage de l'achievement",
      });
    }
  },

  // POST /api/achievements/check - Vérifier les achievements automatiquement
  checkAchievements: async (req, res) => {
    try {
      const { userStats, activityData } = req.body;

      const availableAchievements = Achievement.getAvailableAchievements();
      const userAchievements = await Achievement.find({ userId: req.user.id });
      const unlockedIds = userAchievements.map((a) => a.achievement_id);

      const newlyUnlocked = [];

      // Vérifier chaque achievement disponible
      for (const [achievement_id, data] of Object.entries(
        availableAchievements
      )) {
        if (unlockedIds.includes(achievement_id)) continue;

        let shouldUnlock = false;
        const requirements = data.requirements;

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

        if (shouldUnlock) {
          const newAchievement = new Achievement({
            userId: req.user.id,
            achievement_id: achievement_id,
            title: data.title,
            description: data.description,
            icon: data.icon,
            category: data.category,
            points: data.points,
            rarity: data.rarity,
            requirements: data.requirements,
          });

          await newAchievement.save();
          newlyUnlocked.push(newAchievement);

          // Mettre à jour les points
          await User.findByIdAndUpdate(req.user.id, {
            $inc: { "stats.points": data.points },
          });
        }
      }

      res.json({
        error: false,
        message: `${newlyUnlocked.length} nouveaux achievements débloqués`,
        data: newlyUnlocked,
      });
    } catch (error) {
      console.error("Erreur lors de la vérification des achievements:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de la vérification des achievements",
      });
    }
  },

  // GET /api/achievements/stats - Statistiques des achievements
  getAchievementStats: async (req, res) => {
    try {
      const userId = req.user.id;
      const availableAchievements = Achievement.getAvailableAchievements();
      const totalAvailable = Object.keys(availableAchievements).length;

      const stats = await Achievement.aggregate([
        { $match: { userId: userId } },
        {
          $group: {
            id: null,
            totalEarned: { $sum: 1 },
            totalPoints: { $sum: "$points" },
            categoriesEarned: { $addToSet: "$category" },
            raritiesEarned: { $addToSet: "$rarity" },
            recentAchievements: {
              $push: {
                $cond: [
                  {
                    $gte: [
                      "$earnedDate",
                      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    ],
                  },
                  "$$ROOT",
                  null,
                ],
              },
            },
          },
        },
      ]);

      const result = stats[0] || {
        totalEarned: 0,
        totalPoints: 0,
        categoriesEarned: [],
        raritiesEarned: [],
        recentAchievements: [],
      };

      result.totalAvailable = totalAvailable;
      result.completionRate =
        totalAvailable > 0 ? (result.totalEarned / totalAvailable) * 100 : 0;
      result.recentAchievements = result.recentAchievements.filter(
        (a) => a !== null
      );

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

  // GET /api/achievements/available - Récupérer tous les achievements disponibles
  getAvailableAchievements: async (req, res) => {
    try {
      const availableAchievements = Achievement.getAvailableAchievements();

      res.json({
        error: false,
        message: "Achievements disponibles récupérés avec succès",
        data: availableAchievements,
      });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des achievements disponibles:",
        error
      );
      res.status(500).json({
        error: true,
        message: "Erreur lors de la récupération des achievements disponibles",
      });
    }
  },
};
