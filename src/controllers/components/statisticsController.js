// controllers/statisticsController.js
const { serverMessage } = require("../../utils");
const {
  ActivityData,
  UserStats,
  Goal,
  Achievement,
  SleepData,
  HeartRateData,
  PersonalRecord,
} = require("../../models");
const { Op } = require("sequelize");

module.exports = {
  // Récupérer les statistiques globales
  getStatistics: async (req, res) => {
    try {
      const userId = req.user.id;

      // Récupérer les statistiques utilisateur
      const userStats = await UserStats.findOne({
        where: { user_id: userId },
      });

      // Récupérer les données d'activité récentes (ActivityData)
      const recentActivities = await ActivityData.findAll({
        where: { user_id: userId },
        order: [["date", "DESC"]],
        limit: 20,
      });

      // Récupérer les objectifs actifs
      const goals = await Goal.findAll({
        where: { user_id: userId, isActive: true },
      });

      // Récupérer les réalisations
      const achievements = await Achievement.findAll({
        where: { user_id: userId },
        order: [["earnedDate", "DESC"]],
        limit: 10,
      });

      // Récupérer les données de sommeil récentes
      const sleepData = await SleepData.findAll({
        where: { user_id: userId },
        order: [["date", "DESC"]],
        limit: 7,
      });

      // Récupérer les records personnels
      const personalRecords = await PersonalRecord.findAll({
        where: { user_id: userId },
        order: [["date", "DESC"]],
        limit: 10,
      });

      // Calculer les données pour les graphiques
      const weeklyData = await calculateWeeklyData(userId);
      const monthlyData = await calculateMonthlyData(userId);
      const paceData = await calculatePaceData(userId);
      const activityTypeData = await calculateActivityTypeData(userId);

      const statistics = {
        userStats: userStats || {
          points: 0,
          level: 1,
          experience: 0,
          weekly_distance: 0,
          streak_days: 0,
          average_pace: "0:00",
        },
        recentActivities,
        goals,
        achievements,
        sleepData,
        personalRecords,
        charts: {
          weeklyData,
          monthlyData,
          paceData,
          activityTypeData,
        },
      };

      return serverMessage(res, "STATISTICS_RETRIEVED", statistics);
    } catch (error) {
      console.error("Erreur contrôleur statistiques:", error);
      return serverMessage(res, "ERROR_GETTING_STATISTICS");
    }
  },

  // Récupérer les données hebdomadaires
  getWeeklyData: async (req, res) => {
    try {
      const userId = req.user.id;
      const weeklyData = await calculateWeeklyData(userId);
      return serverMessage(res, "WEEKLY_DATA_RETRIEVED", weeklyData);
    } catch (error) {
      console.error("Erreur contrôleur données hebdomadaires:", error);
      return serverMessage(res, "ERROR_GETTING_WEEKLY_DATA");
    }
  },

  // Récupérer les données mensuelles
  getMonthlyData: async (req, res) => {
    try {
      const userId = req.user.id;
      const monthlyData = await calculateMonthlyData(userId);
      return serverMessage(res, "MONTHLY_DATA_RETRIEVED", monthlyData);
    } catch (error) {
      console.error("Erreur contrôleur données mensuelles:", error);
      return serverMessage(res, "ERROR_GETTING_MONTHLY_DATA");
    }
  },

  // Récupérer les données de rythme
  getPaceData: async (req, res) => {
    try {
      const userId = req.user.id;
      const paceData = await calculatePaceData(userId);
      return serverMessage(res, "PACE_DATA_RETRIEVED", paceData);
    } catch (error) {
      console.error("Erreur contrôleur données de rythme:", error);
      return serverMessage(res, "ERROR_GETTING_PACE_DATA");
    }
  },

  // Récupérer les données par type d'activité
  getActivityTypeData: async (req, res) => {
    try {
      const userId = req.user.id;
      const activityTypeData = await calculateActivityTypeData(userId);
      return serverMessage(
        res,
        "ACTIVITY_TYPE_DATA_RETRIEVED",
        activityTypeData
      );
    } catch (error) {
      console.error("Erreur contrôleur données type activité:", error);
      return serverMessage(res, "ERROR_GETTING_ACTIVITY_TYPE_DATA");
    }
  },

  // Récupérer les activités récentes
  getRecentActivities: async (req, res) => {
    try {
      const userId = req.user.id;
      const { limit = 20, offset = 0 } = req.query;

      // Utiliser ActivityData au lieu de ExerciseSession
      const activities = await ActivityData.findAll({
        where: { user_id: userId },
        order: [["date", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return serverMessage(res, "RECENT_ACTIVITIES_RETRIEVED", activities);
    } catch (error) {
      console.error("Erreur contrôleur activités récentes:", error);
      return serverMessage(res, "ERROR_GETTING_RECENT_ACTIVITIES");
    }
  },

  // Récupérer les records personnels
  getPersonalRecords: async (req, res) => {
    try {
      const userId = req.user.id;
      const personalRecords = await PersonalRecord.findAll({
        where: { user_id: userId },
        order: [["date", "DESC"]],
      });

      return serverMessage(res, "PERSONAL_RECORDS_RETRIEVED", personalRecords);
    } catch (error) {
      console.error("Erreur contrôleur records personnels:", error);
      return serverMessage(res, "ERROR_GETTING_PERSONAL_RECORDS");
    }
  },

  // Récupérer les données de sommeil
  getSleepData: async (req, res) => {
    try {
      const userId = req.user.id;
      const { days = 7 } = req.query;

      const sleepData = await SleepData.findAll({
        where: {
          user_id: userId,
          date: {
            [Op.gte]: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
          },
        },
        order: [["date", "DESC"]],
      });

      return serverMessage(res, "SLEEP_DATA_RETRIEVED", sleepData);
    } catch (error) {
      console.error("Erreur contrôleur données de sommeil:", error);
      return serverMessage(res, "ERROR_GETTING_SLEEP_DATA");
    }
  },

  // Récupérer les métriques de performance
  getPerformanceMetrics: async (req, res) => {
    try {
      const userId = req.user.id;

      const userStats = await UserStats.findOne({
        where: { user_id: userId },
      });

      // Récupérer les données de fréquence cardiaque moyenne
      const heartRateData = await HeartRateData.findOne({
        where: { user_id: userId },
        order: [["timestamp", "DESC"]],
        attributes: [
          [Sequelize.fn("AVG", Sequelize.col("heartRate")), "avgHeartRate"],
        ],
        raw: true,
      });

      const metrics = {
        totalDistance: {
          value: userStats?.weekly_distance || 0,
          trend: 12, // Valeur simulée
          unit: "km",
        },
        averagePace: {
          value: userStats?.average_pace || "0:00",
          trend: -5, // Valeur simulée
          unit: "/km",
        },
        totalActivities: {
          value: userStats?.points || 0,
          trend: 8, // Valeur simulée
          unit: "",
        },
        averageHeartRate: {
          value: heartRateData?.avgHeartRate || 0,
          trend: 3, // Valeur simulée
          unit: "bpm",
        },
      };

      return serverMessage(res, "PERFORMANCE_METRICS_RETRIEVED", metrics);
    } catch (error) {
      console.error("Erreur contrôleur métriques de performance:", error);
      return serverMessage(res, "ERROR_GETTING_PERFORMANCE_METRICS");
    }
  },
  // Récupérer les données par type de course pour le graphique circulaire
  getRunTypeData: async (req, res) => {
    try {
      const userId = req.user.id;
      const runTypeData = await calculateRunTypeData(userId);
      return serverMessage(res, "RUN_TYPE_DATA_RETRIEVED", runTypeData);
    } catch (error) {
      console.error("Erreur contrôleur données type de course:", error);
      return serverMessage(res, "ERROR_GETTING_RUN_TYPE_DATA");
    }
  },
};

// Fonctions helper pour calculer les données
async function calculateWeeklyData(userId) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const activities = await ActivityData.findAll({
    where: {
      user_id: userId,
      date: {
        [Op.gte]: sevenDaysAgo.toISOString().split("T")[0],
      },
    },
    order: [["date", "ASC"]],
  });

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyData = daysOfWeek.map((day) => ({
    day,
    distance: 0,
    steps: 0,
    calories: 0,
  }));

  activities.forEach((activity) => {
    const dayIndex = new Date(activity.date).getDay();
    weeklyData[dayIndex].distance = activity.distance || 0;
    weeklyData[dayIndex].steps = activity.steps || 0;
    weeklyData[dayIndex].calories = activity.calories || 0;
  });

  return weeklyData;
}

async function calculateMonthlyData(userId) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activities = await ActivityData.findAll({
    where: {
      user_id: userId,
      date: {
        [Op.gte]: thirtyDaysAgo.toISOString().split("T")[0],
      },
    },
    order: [["date", "ASC"]],
  });

  const monthlyData = [];
  let currentWeek = { name: "Week 1", distance: 0, steps: 0 };

  activities.forEach((activity) => {
    const activityDate = new Date(activity.date);
    const weekNumber = Math.ceil(activityDate.getDate() / 7);

    if (currentWeek.name !== `Week ${weekNumber}`) {
      if (currentWeek.distance > 0) {
        monthlyData.push(currentWeek);
      }
      currentWeek = { name: `Week ${weekNumber}`, distance: 0, steps: 0 };
    }

    currentWeek.distance += activity.distance || 0;
    currentWeek.steps += activity.steps || 0;
  });

  if (currentWeek.distance > 0) {
    monthlyData.push(currentWeek);
  }

  return monthlyData;
}

async function calculatePaceData(userId) {
  // Pour ActivityData, on ne peut pas calculer le pace directement
  // On retourne des données basées sur la distance et les minutes actives
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activities = await ActivityData.findAll({
    where: {
      user_id: userId,
      date: {
        [Op.gte]: thirtyDaysAgo.toISOString().split("T")[0],
      },
      distance: { [Op.gt]: 0 },
      activeMinutes: { [Op.gt]: 0 },
    },
    order: [["date", "ASC"]],
  });

  const paceData = [];
  let currentWeek = { name: "Week 1", totalPace: 0, count: 0 };

  activities.forEach((activity) => {
    const activityDate = new Date(activity.date);
    const weekNumber = Math.ceil(activityDate.getDate() / 7);

    // Calcul approximatif du pace (min/km)
    const pace = activity.activeMinutes / activity.distance;

    if (currentWeek.name !== `Week ${weekNumber}`) {
      if (currentWeek.count > 0) {
        paceData.push({
          name: currentWeek.name,
          value: parseFloat(
            (currentWeek.totalPace / currentWeek.count).toFixed(1)
          ),
        });
      }
      currentWeek = { name: `Week ${weekNumber}`, totalPace: 0, count: 0 };
    }

    currentWeek.totalPace += pace;
    currentWeek.count++;
  });

  if (currentWeek.count > 0) {
    paceData.push({
      name: currentWeek.name,
      value: parseFloat((currentWeek.totalPace / currentWeek.count).toFixed(1)),
    });
  }

  return paceData;
}

async function calculateActivityTypeData(userId) {
  // Pour ActivityData, on catégorise basé sur la distance
  const activities = await ActivityData.findAll({
    where: { user_id: userId },
    attributes: ["distance"],
  });

  const categories = {
    short: { count: 0, distance: 0 }, // < 3km
    medium: { count: 0, distance: 0 }, // 3-10km
    long: { count: 0, distance: 0 }, // > 10km
  };

  activities.forEach((activity) => {
    const distance = activity.distance || 0;

    if (distance < 3) {
      categories.short.count++;
      categories.short.distance += distance;
    } else if (distance <= 10) {
      categories.medium.count++;
      categories.medium.distance += distance;
    } else if (distance > 10) {
      categories.long.count++;
      categories.long.distance += distance;
    }
  });

  return [
    {
      name: "Court (<3km)",
      value: categories.short.count,
      distance: categories.short.distance,
    },
    {
      name: "Moyen (3-10km)",
      value: categories.medium.count,
      distance: categories.medium.distance,
    },
    {
      name: "Long (>10km)",
      value: categories.long.count,
      distance: categories.long.distance,
    },
  ].filter((item) => item.value > 0);
}
async function calculateRunTypeData(userId) {
  try {
    const activities = await ActivityData.findAll({
      where: { user_id: userId },
      attributes: ["id", "distance", "activeMinutes"],
    });

    // Catégoriser les activités basé sur la distance
    const categories = {
      short: { count: 0, distance: 0 }, // < 5km
      medium: { count: 0, distance: 0 }, // 5-10km
      long: { count: 0, distance: 0 }, // > 10km
      other: { count: 0, distance: 0 },
    };

    activities.forEach((activity) => {
      const distance = activity.distance || 0;

      if (distance < 5) {
        categories.short.count++;
        categories.short.distance += distance;
      } else if (distance <= 10) {
        categories.medium.count++;
        categories.medium.distance += distance;
      } else if (distance > 10) {
        categories.long.count++;
        categories.long.distance += distance;
      } else {
        categories.other.count++;
        categories.other.distance += distance;
      }
    });

    const runTypeData = [
      {
        name: "Short Run (<5km)",
        value: categories.short.count,
        distance: categories.short.distance,
      },
      {
        name: "Medium Run (5-10km)",
        value: categories.medium.count,
        distance: categories.medium.distance,
      },
      {
        name: "Long Run (>10km)",
        value: categories.long.count,
        distance: categories.long.distance,
      },
      {
        name: "Other",
        value: categories.other.count,
        distance: categories.other.distance,
      },
    ].filter((item) => item.value > 0);

    return runTypeData.length > 0
      ? runTypeData
      : [
          { name: "Short Run", value: 42 },
          { name: "Medium Run", value: 25 },
          { name: "Long Run", value: 18 },
        ];
  } catch (error) {
    console.error("Erreur calcul des types de course:", error);
    return [
      { name: "Short Run", value: 42 },
      { name: "Medium Run", value: 25 },
      { name: "Long Run", value: 18 },
    ];
  }
}

// // controllers/statisticsController.js
// const { serverMessage } = require("../../utils");
// const {
//   ActivityData,
//   UserStats,
//   Goal,
//   Achievement,
//   SleepData,
//   HeartRateData,
//   PersonalRecord,
//   ExerciseSession,
// } = require("../../models");
// const { Op, Sequelize } = require("sequelize");

// module.exports = {
//   // Récupérer les statistiques globales
//   getStatistics: async (req, res) => {
//     try {
//       const userId = req.user.id;

//       // Récupérer les statistiques utilisateur
//       const userStats = await UserStats.findOne({
//         where: { user_id: userId },
//         attributes: [
//           "points",
//           "level",
//           "experience",
//           "weekly_distance",
//           "streak_days",
//           "average_pace",
//         ],
//       });

//       // Récupérer les activités récentes (20 dernières)
//       const recentActivities = await ActivityData.findAll({
//         where: { user_id: userId },
//         order: [["date", "DESC"]],
//         limit: 20,
//         attributes: [
//           "id",
//           "date",
//           "steps",
//           "distance",
//           "calories",
//           "activeMinutes",
//         ],
//       });

//       // Récupérer les objectifs actifs
//       const goals = await Goal.findAll({
//         where: {
//           user_id: userId,
//           isActive: true,
//         },
//         attributes: [
//           "id",
//           "title",
//           "category",
//           "target",
//           "current",
//           "progressPercentage",
//           "deadline",
//         ],
//       });

//       // Récupérer les réalisations
//       const achievements = await Achievement.findAll({
//         where: { user_id: userId },
//         order: [["earnedDate", "DESC"]],
//         limit: 10,
//         attributes: [
//           "id",
//           "title",
//           "description",
//           "earnedDate",
//           "points",
//           "rarity",
//         ],
//       });

//       // Récupérer les données de sommeil récentes
//       const sleepData = await SleepData.findAll({
//         where: { user_id: userId },
//         order: [["date", "DESC"]],
//         limit: 7,
//         attributes: [
//           "id",
//           "date",
//           "totalSleepMinutes",
//           "deepSleepMinutes",
//           "sleepQuality",
//         ],
//       });

//       // Récupérer les records personnels
//       const personalRecords = await PersonalRecord.findAll({
//         where: { user_id: userId },
//         order: [["date", "DESC"]],
//         limit: 10,
//         attributes: ["id", "distance", "time", "date", "pace", "location"],
//       });

//       // Calculer les données pour les graphiques
//       const weeklyData = await calculateWeeklyData(userId);
//       const monthlyData = await calculateMonthlyData(userId);
//       const paceData = await calculatePaceData(userId);
//       const runTypeData = await calculateRunTypeData(userId);

//       const statistics = {
//         userStats: userStats || {
//           points: 0,
//           level: 1,
//           experience: 0,
//           weekly_distance: 0,
//           streak_days: 0,
//           average_pace: "0:00",
//         },
//         recentActivities,
//         goals,
//         achievements,
//         sleepData,
//         personalRecords,
//         charts: {
//           weeklyData,
//           monthlyData,
//           paceData,
//           runTypeData,
//         },
//       };

//       return serverMessage(res, "STATISTICS_RETRIEVED", statistics);
//     } catch (error) {
//       console.error("Erreur contrôleur statistiques:", error);
//       return serverMessage(res, "ERROR_GETTING_STATISTICS");
//     }
//   },

//   // Récupérer les données hebdomadaires pour le graphique à barres
//   getWeeklyData: async (req, res) => {
//     try {
//       const userId = req.user.id;
//       const weeklyData = await calculateWeeklyData(userId);
//       return serverMessage(res, "WEEKLY_DATA_RETRIEVED", weeklyData);
//     } catch (error) {
//       console.error("Erreur contrôleur données hebdomadaires:", error);
//       return serverMessage(res, "ERROR_GETTING_WEEKLY_DATA");
//     }
//   },

//   // Récupérer les données mensuelles pour le graphique en aires
//   getMonthlyData: async (req, res) => {
//     try {
//       const userId = req.user.id;
//       const monthlyData = await calculateMonthlyData(userId);
//       return serverMessage(res, "MONTHLY_DATA_RETRIEVED", monthlyData);
//     } catch (error) {
//       console.error("Erreur contrôleur données mensuelles:", error);
//       return serverMessage(res, "ERROR_GETTING_MONTHLY_DATA");
//     }
//   },

//   // Récupérer les données de rythme pour le graphique linéaire
//   getPaceData: async (req, res) => {
//     try {
//       const userId = req.user.id;
//       const paceData = await calculatePaceData(userId);
//       return serverMessage(res, "PACE_DATA_RETRIEVED", paceData);
//     } catch (error) {
//       console.error("Erreur contrôleur données de rythme:", error);
//       return serverMessage(res, "ERROR_GETTING_PACE_DATA");
//     }
//   },

//   // Récupérer les données par type de course pour le graphique circulaire
//   getRunTypeData: async (req, res) => {
//     try {
//       const userId = req.user.id;
//       const runTypeData = await calculateRunTypeData(userId);
//       return serverMessage(res, "RUN_TYPE_DATA_RETRIEVED", runTypeData);
//     } catch (error) {
//       console.error("Erreur contrôleur données type de course:", error);
//       return serverMessage(res, "ERROR_GETTING_RUN_TYPE_DATA");
//     }
//   },

//   // Récupérer les activités récentes pour le tableau
//   getRecentActivities: async (req, res) => {
//     try {
//       const userId = req.user.id;
//       const { limit = 20, offset = 0 } = req.query;

//       // Utiliser ExerciseSession pour récupérer les activités détaillées
//       const activities = await ExerciseSession.findAll({
//         where: { user_id: userId },
//         order: [["date", "DESC"]],
//         limit: parseInt(limit),
//         offset: parseInt(offset),
//         attributes: [
//           "id",
//           "type",
//           "distance",
//           "duration",
//           "date",
//           "location",
//           "avg_heart_rate",
//           "elevation_gain",
//           "pace",
//         ],
//       });

//       // Formater les données pour correspondre à l'interface frontend
//       const formattedActivities = activities.map((activity) => ({
//         id: activity.id,
//         type: activity.type,
//         distance: activity.distance,
//         time: activity.duration,
//         date: activity.date,
//         location: activity.location,
//         heartRate: activity.avg_heart_rate,
//         elevation: activity.elevation_gain,
//         pace: activity.pace,
//       }));

//       return serverMessage(
//         res,
//         "RECENT_ACTIVITIES_RETRIEVED",
//         formattedActivities
//       );
//     } catch (error) {
//       console.error("Erreur contrôleur activités récentes:", error);
//       return serverMessage(res, "ERROR_GETTING_RECENT_ACTIVITIES");
//     }
//   },

//   // Récupérer les records personnels
//   getPersonalRecords: async (req, res) => {
//     try {
//       const userId = req.user.id;
//       const personalRecords = await PersonalRecord.findAll({
//         where: { user_id: userId },
//         order: [["date", "DESC"]],
//         attributes: [
//           "id",
//           "distance",
//           "time",
//           "date",
//           "pace",
//           "location",
//           "isVerified",
//         ],
//       });

//       return serverMessage(res, "PERSONAL_RECORDS_RETRIEVED", personalRecords);
//     } catch (error) {
//       console.error("Erreur contrôleur records personnels:", error);
//       return serverMessage(res, "ERROR_GETTING_PERSONAL_RECORDS");
//     }
//   },

//   // Récupérer les données de sommeil
//   getSleepData: async (req, res) => {
//     try {
//       const userId = req.user.id;
//       const { days = 7 } = req.query;

//       const sleepData = await SleepData.findAll({
//         where: {
//           user_id: userId,
//           date: {
//             [Op.gte]: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
//           },
//         },
//         order: [["date", "DESC"]],
//         attributes: [
//           "id",
//           "date",
//           "totalSleepMinutes",
//           "deepSleepMinutes",
//           "lightSleepMinutes",
//           "sleepQuality",
//         ],
//       });

//       return serverMessage(res, "SLEEP_DATA_RETRIEVED", sleepData);
//     } catch (error) {
//       console.error("Erreur contrôleur données de sommeil:", error);
//       return serverMessage(res, "ERROR_GETTING_SLEEP_DATA");
//     }
//   },

//   // Récupérer les métriques de performance (pour les cartes en haut de page)
//   getPerformanceMetrics: async (req, res) => {
//     try {
//       const userId = req.user.id;

//       // Récupérer les statistiques utilisateur
//       const userStats = await UserStats.findOne({
//         where: { user_id: userId },
//         attributes: [
//           "weekly_distance",
//           "average_pace",
//           "points",
//           "level",
//           "streak_days",
//         ],
//       });

//       // Calculer les tendances (augmentation/ diminution)
//       // Pour cet exemple, nous allons simuler des tendances
//       const weeklyDistanceTrend = 12; // +12%
//       const averagePaceTrend = -5; // -5% (amélioration)
//       const totalActivitiesTrend = 8; // +8%
//       const heartRateTrend = 3; // +3%

//       const metrics = {
//         totalDistance: {
//           value: userStats?.weekly_distance || 0,
//           trend: weeklyDistanceTrend,
//           unit: "km",
//         },
//         averagePace: {
//           value: userStats?.average_pace || "0:00",
//           trend: averagePaceTrend,
//           unit: "/km",
//         },
//         totalActivities: {
//           value: userStats?.points || 0, // Utilisation temporaire des points comme proxy
//           trend: totalActivitiesTrend,
//           unit: "",
//         },
//         averageHeartRate: {
//           value: 156, // Valeur par défaut, à remplacer par des données réelles
//           trend: heartRateTrend,
//           unit: "bpm",
//         },
//       };

//       return serverMessage(res, "PERFORMANCE_METRICS_RETRIEVED", metrics);
//     } catch (error) {
//       console.error("Erreur contrôleur métriques de performance:", error);
//       return serverMessage(res, "ERROR_GETTING_PERFORMANCE_METRICS");
//     }
//   },
// };

// // Fonctions helper pour calculer les données
// async function calculateWeeklyData(userId) {
//   const sevenDaysAgo = new Date();
//   sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

//   const activities = await ActivityData.findAll({
//     where: {
//       user_id: userId,
//       date: {
//         [Op.gte]: sevenDaysAgo.toISOString().split("T")[0],
//       },
//     },
//     order: [["date", "ASC"]],
//   });

//   // Créer un objet pour chaque jour de la semaine
//   const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
//   const weeklyData = daysOfWeek.map((day) => ({
//     day,
//     distance: 0,
//     time: 0,
//     pace: 0,
//   }));

//   // Remplir avec les données réelles
//   activities.forEach((activity) => {
//     const dayIndex = new Date(activity.date).getDay();
//     weeklyData[dayIndex].distance = activity.distance || 0;
//     weeklyData[dayIndex].time = activity.activeMinutes || 0;

//     // Calculer le pace si possible
//     if (activity.distance > 0 && activity.activeMinutes > 0) {
//       weeklyData[dayIndex].pace = (
//         activity.activeMinutes / activity.distance
//       ).toFixed(1);
//     }
//   });

//   return weeklyData;
// }

// async function calculateMonthlyData(userId) {
//   const thirtyDaysAgo = new Date();
//   thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

//   const activities = await ActivityData.findAll({
//     where: {
//       user_id: userId,
//       date: {
//         [Op.gte]: thirtyDaysAgo.toISOString().split("T")[0],
//       },
//     },
//     order: [["date", "ASC"]],
//   });

//   // Grouper par semaine
//   const monthlyData = [];
//   let currentWeek = { name: "Week 1", distance: 0 };

//   activities.forEach((activity) => {
//     const activityDate = new Date(activity.date);
//     const weekNumber = Math.ceil(activityDate.getDate() / 7);

//     if (currentWeek.name !== `Week ${weekNumber}`) {
//       if (currentWeek.distance > 0) {
//         monthlyData.push(currentWeek);
//       }
//       currentWeek = { name: `Week ${weekNumber}`, distance: 0 };
//     }

//     currentWeek.distance += activity.distance || 0;
//   });

//   if (currentWeek.distance > 0) {
//     monthlyData.push(currentWeek);
//   }

//   return monthlyData;
// }

// async function calculatePaceData(userId) {
//   const thirtyDaysAgo = new Date();
//   thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

//   const activities = await ActivityData.findAll({
//     where: {
//       user_id: userId,
//       date: {
//         [Op.gte]: thirtyDaysAgo.toISOString().split("T")[0],
//       },
//       distance: { [Op.gt]: 0 },
//       activeMinutes: { [Op.gt]: 0 },
//     },
//     order: [["date", "ASC"]],
//   });

//   // Calculer le pace moyen par semaine
//   const paceData = [];
//   let currentWeek = { name: "Week 1", totalPace: 0, count: 0 };

//   activities.forEach((activity) => {
//     const activityDate = new Date(activity.date);
//     const weekNumber = Math.ceil(activityDate.getDate() / 7);
//     const pace = activity.activeMinutes / activity.distance;

//     if (currentWeek.name !== `Week ${weekNumber}`) {
//       if (currentWeek.count > 0) {
//         paceData.push({
//           name: currentWeek.name,
//           value: parseFloat(
//             (currentWeek.totalPace / currentWeek.count).toFixed(1)
//           ),
//         });
//       }
//       currentWeek = { name: `Week ${weekNumber}`, totalPace: 0, count: 0 };
//     }

//     currentWeek.totalPace += pace;
//     currentWeek.count++;
//   });

//   if (currentWeek.count > 0) {
//     paceData.push({
//       name: currentWeek.name,
//       value: parseFloat((currentWeek.totalPace / currentWeek.count).toFixed(1)),
//     });
//   }

//   return paceData;
// }

// async function calculateRunTypeData(userId) {
//   try {
//     const activities = await ActivityData.findAll({
//       where: { user_id: userId },
//       attributes: ["id", "distance", "activeMinutes"],
//     });

//     // Catégoriser les activités basé sur la distance
//     const categories = {
//       short: { count: 0, distance: 0 }, // < 5km
//       medium: { count: 0, distance: 0 }, // 5-10km
//       long: { count: 0, distance: 0 }, // > 10km
//       other: { count: 0, distance: 0 },
//     };

//     activities.forEach((activity) => {
//       const distance = activity.distance || 0;

//       if (distance < 5) {
//         categories.short.count++;
//         categories.short.distance += distance;
//       } else if (distance <= 10) {
//         categories.medium.count++;
//         categories.medium.distance += distance;
//       } else if (distance > 10) {
//         categories.long.count++;
//         categories.long.distance += distance;
//       } else {
//         categories.other.count++;
//         categories.other.distance += distance;
//       }
//     });

//     const runTypeData = [
//       {
//         name: "Short Run (<5km)",
//         value: categories.short.count,
//         distance: categories.short.distance,
//       },
//       {
//         name: "Medium Run (5-10km)",
//         value: categories.medium.count,
//         distance: categories.medium.distance,
//       },
//       {
//         name: "Long Run (>10km)",
//         value: categories.long.count,
//         distance: categories.long.distance,
//       },
//       {
//         name: "Other",
//         value: categories.other.count,
//         distance: categories.other.distance,
//       },
//     ].filter((item) => item.value > 0);

//     return runTypeData.length > 0
//       ? runTypeData
//       :

//       [
//           { name: "Short Run", value: 42 },
//           { name: "Medium Run", value: 25 },
//           { name: "Long Run", value: 18 },
//         ];
//   } catch (error) {
//     console.error("Erreur calcul des types de course:", error);
//     return [
//       { name: "Short Run", value: 42 },
//       { name: "Medium Run", value: 25 },
//       { name: "Long Run", value: 18 },
//     ];
//   }
// }

// // // controllers/statisticsController.js
// // const { serverMessage } = require("../../utils");
// // const {
// //   ActivityData,
// //   UserStats,
// //   Goal,
// //   Achievement,
// //   SleepData,
// //   HeartRateData,
// //   PersonalRecord,
// // } = require("../../models");
// // const { Op } = require("sequelize");

// // module.exports = {
// //   // Récupérer les statistiques globales
// //   getStatistics: async (req, res) => {
// //     try {
// //       const userId = req.user.id;

// //       // Récupérer les statistiques utilisateur
// //       const userStats = await UserStats.findOne({
// //         where: { user_id: userId },
// //         attributes: [
// //           "points",
// //           "level",
// //           "experience",
// //           "weekly_distance",
// //           "streak_days",
// //           "average_pace",
// //         ],
// //       });

// //       // Récupérer les activités récentes (20 dernières)
// //       const recentActivities = await ActivityData.findAll({
// //         where: { user_id: userId },
// //         order: [["date", "DESC"]],
// //         limit: 20,
// //         attributes: [
// //           "id",
// //           "date",
// //           "steps",
// //           "distance",
// //           "calories",
// //           "activeMinutes",
// //         ],
// //       });

// //       // Récupérer les objectifs actifs
// //       const goals = await Goal.findAll({
// //         where: {
// //           user_id: userId,
// //           isActive: true,
// //         },
// //         attributes: [
// //           "id",
// //           "title",
// //           "category",
// //           "target",
// //           "current",
// //           "progressPercentage",
// //           "deadline",
// //         ],
// //       });

// //       // Récupérer les réalisations
// //       const achievements = await Achievement.findAll({
// //         where: { user_id: userId },
// //         order: [["earnedDate", "DESC"]],
// //         limit: 10,
// //         attributes: [
// //           "id",
// //           "title",
// //           "description",
// //           "earnedDate",
// //           "points",
// //           "rarity",
// //         ],
// //       });

// //       // Récupérer les données de sommeil récentes
// //       const sleepData = await SleepData.findAll({
// //         where: { user_id: userId },
// //         order: [["date", "DESC"]],
// //         limit: 7,
// //         attributes: [
// //           "id",
// //           "date",
// //           "totalSleepMinutes",
// //           "deepSleepMinutes",
// //           "sleepQuality",
// //         ],
// //       });

// //       // Récupérer les records personnels
// //       const personalRecords = await PersonalRecord.findAll({
// //         where: { user_id: userId },
// //         order: [["date", "DESC"]],
// //         limit: 10,
// //         attributes: ["id", "distance", "time", "date", "pace", "location"],
// //       });

// //       // Calculer les données pour les graphiques
// //       const weeklyData = await calculateWeeklyData(userId);
// //       const monthlyData = await calculateMonthlyData(userId);
// //       const paceData = await calculatePaceData(userId);
// //       const activityTypeData = await calculateActivityTypeData(userId);

// //       const statistics = {
// //         userStats: userStats || {
// //           points: 0,
// //           level: 1,
// //           experience: 0,
// //           weekly_distance: 0,
// //           streak_days: 0,
// //           average_pace: "0:00",
// //         },
// //         recentActivities,
// //         goals,
// //         achievements,
// //         sleepData,
// //         personalRecords,
// //         charts: {
// //           weeklyData,
// //           monthlyData,
// //           paceData,
// //           activityTypeData,
// //         },
// //       };

// //       return serverMessage(res, "STATISTICS_RETRIEVED", statistics);
// //     } catch (error) {
// //       console.error("Erreur contrôleur statistiques:", error);
// //       return serverMessage(res, "ERROR_GETTING_STATISTICS");
// //     }
// //   },

// //   // Récupérer les données hebdomadaires
// //   getWeeklyData: async (req, res) => {
// //     try {
// //       const userId = req.user.id;
// //       const weeklyData = await calculateWeeklyData(userId);
// //       return serverMessage(res, "WEEKLY_DATA_RETRIEVED", weeklyData);
// //     } catch (error) {
// //       console.error("Erreur contrôleur données hebdomadaires:", error);
// //       return serverMessage(res, "ERROR_GETTING_WEEKLY_DATA");
// //     }
// //   },

// //   // Récupérer les données mensuelles
// //   getMonthlyData: async (req, res) => {
// //     try {
// //       const userId = req.user.id;
// //       const monthlyData = await calculateMonthlyData(userId);
// //       return serverMessage(res, "MONTHLY_DATA_RETRIEVED", monthlyData);
// //     } catch (error) {
// //       console.error("Erreur contrôleur données mensuelles:", error);
// //       return serverMessage(res, "ERROR_GETTING_MONTHLY_DATA");
// //     }
// //   },

// //   // Récupérer les données de rythme
// //   getPaceData: async (req, res) => {
// //     try {
// //       const userId = req.user.id;
// //       const paceData = await calculatePaceData(userId);
// //       return serverMessage(res, "PACE_DATA_RETRIEVED", paceData);
// //     } catch (error) {
// //       console.error("Erreur contrôleur données de rythme:", error);
// //       return serverMessage(res, "ERROR_GETTING_PACE_DATA");
// //     }
// //   },

// //   // Récupérer les données par type d'activité
// //   getActivityTypeData: async (req, res) => {
// //     try {
// //       const userId = req.user.id;
// //       const activityTypeData = await calculateActivityTypeData(userId);
// //       return serverMessage(
// //         res,
// //         "ACTIVITY_TYPE_DATA_RETRIEVED",
// //         activityTypeData
// //       );
// //     } catch (error) {
// //       console.error("Erreur contrôleur données type activité:", error);
// //       return serverMessage(res, "ERROR_GETTING_ACTIVITY_TYPE_DATA");
// //     }
// //   },

// //   // Récupérer les records personnels
// //   getPersonalRecords: async (req, res) => {
// //     try {
// //       const userId = req.user.id;
// //       const personalRecords = await PersonalRecord.findAll({
// //         where: { user_id: userId },
// //         order: [["date", "DESC"]],
// //         attributes: [
// //           "id",
// //           "distance",
// //           "time",
// //           "date",
// //           "pace",
// //           "location",
// //           "isVerified",
// //         ],
// //       });

// //       return serverMessage(res, "PERSONAL_RECORDS_RETRIEVED", personalRecords);
// //     } catch (error) {
// //       console.error("Erreur contrôleur records personnels:", error);
// //       return serverMessage(res, "ERROR_GETTING_PERSONAL_RECORDS");
// //     }
// //   },

// //   // Récupérer les données de sommeil
// //   getSleepData: async (req, res) => {
// //     try {
// //       const userId = req.user.id;
// //       const { days = 7 } = req.query;

// //       const sleepData = await SleepData.findAll({
// //         where: {
// //           user_id: userId,
// //           date: {
// //             [Op.gte]: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
// //           },
// //         },
// //         order: [["date", "DESC"]],
// //         attributes: [
// //           "id",
// //           "date",
// //           "totalSleepMinutes",
// //           "deepSleepMinutes",
// //           "lightSleepMinutes",
// //           "sleepQuality",
// //         ],
// //       });

// //       return serverMessage(res, "SLEEP_DATA_RETRIEVED", sleepData);
// //     } catch (error) {
// //       console.error("Erreur contrôleur données de sommeil:", error);
// //       return serverMessage(res, "ERROR_GETTING_SLEEP_DATA");
// //     }
// //   },
// // };

// // // Fonctions helper pour calculer les données
// // async function calculateWeeklyData(userId) {
// //   const sevenDaysAgo = new Date();
// //   sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

// //   const activities = await ActivityData.findAll({
// //     where: {
// //       user_id: userId,
// //       date: {
// //         [Op.gte]: sevenDaysAgo.toISOString().split("T")[0],
// //       },
// //     },
// //     order: [["date", "ASC"]],
// //   });

// //   // Créer un objet pour chaque jour de la semaine
// //   const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// //   const weeklyData = daysOfWeek.map((day) => ({
// //     day,
// //     distance: 0,
// //     time: 0,
// //     pace: 0,
// //   }));

// //   // Remplir avec les données réelles
// //   activities.forEach((activity) => {
// //     const dayIndex = new Date(activity.date).getDay();
// //     weeklyData[dayIndex].distance = activity.distance || 0;
// //     weeklyData[dayIndex].time = activity.activeMinutes || 0;

// //     // Calculer le pace si possible
// //     if (activity.distance > 0 && activity.activeMinutes > 0) {
// //       weeklyData[dayIndex].pace = (
// //         activity.activeMinutes / activity.distance
// //       ).toFixed(1);
// //     }
// //   });

// //   return weeklyData;
// // }

// // async function calculateMonthlyData(userId) {
// //   const thirtyDaysAgo = new Date();
// //   thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

// //   const activities = await ActivityData.findAll({
// //     where: {
// //       user_id: userId,
// //       date: {
// //         [Op.gte]: thirtyDaysAgo.toISOString().split("T")[0],
// //       },
// //     },
// //     order: [["date", "ASC"]],
// //   });

// //   // Grouper par semaine
// //   const monthlyData = [];
// //   let currentWeek = { name: "Week 1", distance: 0 };

// //   activities.forEach((activity) => {
// //     const activityDate = new Date(activity.date);
// //     const weekNumber = Math.ceil(activityDate.getDate() / 7);

// //     if (currentWeek.name !== `Week ${weekNumber}`) {
// //       if (currentWeek.distance > 0) {
// //         monthlyData.push(currentWeek);
// //       }
// //       currentWeek = { name: `Week ${weekNumber}`, distance: 0 };
// //     }

// //     currentWeek.distance += activity.distance || 0;
// //   });

// //   if (currentWeek.distance > 0) {
// //     monthlyData.push(currentWeek);
// //   }

// //   return monthlyData;
// // }

// // async function calculatePaceData(userId) {
// //   const thirtyDaysAgo = new Date();
// //   thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

// //   const activities = await ActivityData.findAll({
// //     where: {
// //       user_id: userId,
// //       date: {
// //         [Op.gte]: thirtyDaysAgo.toISOString().split("T")[0],
// //       },
// //       distance: { [Op.gt]: 0 },
// //       activeMinutes: { [Op.gt]: 0 },
// //     },
// //     order: [["date", "ASC"]],
// //   });

// //   // Calculer le pace moyen par semaine
// //   const paceData = [];
// //   let currentWeek = { name: "Week 1", totalPace: 0, count: 0 };

// //   activities.forEach((activity) => {
// //     const activityDate = new Date(activity.date);
// //     const weekNumber = Math.ceil(activityDate.getDate() / 7);
// //     const pace = activity.activeMinutes / activity.distance;

// //     if (currentWeek.name !== `Week ${weekNumber}`) {
// //       if (currentWeek.count > 0) {
// //         paceData.push({
// //           name: currentWeek.name,
// //           value: parseFloat(
// //             (currentWeek.totalPace / currentWeek.count).toFixed(1)
// //           ),
// //         });
// //       }
// //       currentWeek = { name: `Week ${weekNumber}`, totalPace: 0, count: 0 };
// //     }

// //     currentWeek.totalPace += pace;
// //     currentWeek.count++;
// //   });

// //   if (currentWeek.count > 0) {
// //     paceData.push({
// //       name: currentWeek.name,
// //       value: parseFloat((currentWeek.totalPace / currentWeek.count).toFixed(1)),
// //     });
// //   }

// //   return paceData;
// // }

// // async function calculateActivityTypeData(userId) {
// //   // Cette fonction serait normalement basée sur le type d'activité
// //   // Pour l'instant, nous retournons des données mockées
// //   return [
// //     { name: "Long Run", value: 42 },
// //     { name: "Recovery", value: 25 },
// //     { name: "Tempo", value: 18 },
// //     { name: "Intervals", value: 15 },
// //   ];
// // }
