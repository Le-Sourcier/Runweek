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
const { Sequelize, Op } = require("sequelize");

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

      // Formater les activités pour correspondre à l'interface frontend
      const formattedActivities = recentActivities.map((activity) => ({
        id: activity.id,
        type: "Run", // Valeur par défaut ou déduire du type d'activité
        distance: activity.distance || 0,
        time: formatTimeFromMinutes(activity.activeMinutes || 0),
        date: activity.date,
        location: "Unknown", // À adapter si vous avez cette info
        heartRate: activity.rawData?.heartRate || null,
        elevation: activity.rawData?.elevation || null,
        pace: calculatePace(activity.distance, activity.activeMinutes),
      }));

      // Récupérer les objectifs actifs
      const goals = await Goal.findAll({
        where: { user_id: userId, isActive: true },
      });

      // Formater les objectifs
      const formattedGoals = goals.map((goal) => ({
        id: goal.id,
        title: goal.title,
        category: goal.category,
        target: goal.target,
        current: goal.current,
        progressPercentage: goal.progressPercentage,
        deadline: goal.deadline,
      }));

      // Récupérer les réalisations
      const achievements = await Achievement.findAll({
        where: { user_id: userId, earnedDate: { [Op.ne]: null } },
        order: [["earnedDate", "DESC"]],
        limit: 10,
      });

      // Formater les achievements
      const formattedAchievements = achievements.map((achievement) => ({
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        earnedDate: achievement.earnedDate,
        points: achievement.points,
        rarity: achievement.rarity,
      }));

      // Récupérer les données de sommeil récentes
      const sleepData = await SleepData.findAll({
        where: { user_id: userId },
        order: [["date", "DESC"]],
        limit: 7,
      });

      // Formater les données de sommeil
      const formattedSleepData = sleepData.map((sleep) => ({
        id: sleep.id,
        date: sleep.date,
        totalSleepMinutes: sleep.totalSleepMinutes,
        deepSleepMinutes: sleep.deepSleepMinutes,
        lightSleepMinutes: sleep.lightSleepMinutes,
        sleepQuality: sleep.sleepQuality,
      }));

      // Récupérer les records personnels
      const personalRecords = await PersonalRecord.findAll({
        where: { user_id: userId },
        order: [["date", "DESC"]],
        limit: 10,
      });

      // Formater les records personnels
      const formattedPersonalRecords = personalRecords.map((record) => ({
        id: record.id,
        distance: record.distance,
        time: record.time,
        date: record.date,
        pace: record.pace,
        location: record.location,
        isVerified: record.isVerified,
      }));

      // Calculer les données pour les graphiques
      const weeklyData = await calculateWeeklyData(userId);
      const monthlyData = await calculateMonthlyData(userId);
      const paceData = await calculatePaceData(userId);
      const runTypeData = await calculateRunTypeData(userId); // Renommer activityTypeData en runTypeData

      const statistics = {
        userStats: userStats || {
          points: 0,
          level: 1,
          experience: 0,
          weekly_distance: 0,
          streak_days: 0,
          average_pace: "0:00",
        },
        recentActivities: formattedActivities,
        goals: formattedGoals,
        achievements: formattedAchievements,
        sleepData: formattedSleepData,
        personalRecords: formattedPersonalRecords,
        charts: {
          weeklyData,
          monthlyData,
          paceData,
          runTypeData, // Utiliser le nom correct
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
  // Version encore plus robuste avec gestion d'erreur
  getPerformanceMetrics: async (req, res) => {
    try {
      const userId = req.user.id;

      const userStats = await UserStats.findOne({
        where: { user_id: userId },
      });

      let heartRateValue = 0;

      try {
        // Essayer d'abord de récupérer la moyenne
        const heartRateAvg = await HeartRateData.findOne({
          where: { user_id: userId },
          attributes: [
            [Sequelize.fn("AVG", Sequelize.col("heartRate")), "avgHeartRate"],
          ],
          raw: true,
        });
        heartRateValue = heartRateAvg?.avgHeartRate || 0;
      } catch (heartRateError) {
        console.warn(
          "Erreur calcul moyenne fréquence cardiaque:",
          heartRateError
        );

        // Fallback: dernière mesure
        const latestHeartRate = await HeartRateData.findOne({
          where: { user_id: userId },
          order: [["timestamp", "DESC"]],
          attributes: ["heartRate"],
          raw: true,
        });
        heartRateValue = latestHeartRate?.heartRate || 0;
      }

      const metrics = {
        totalDistance: {
          value: userStats?.weekly_distance || 0,
          trend: 12,
          unit: "km",
        },
        averagePace: {
          value: userStats?.average_pace || "0:00",
          trend: -5,
          unit: "/km",
        },
        totalActivities: {
          value: userStats?.points || 0,
          trend: 8,
          unit: "",
        },
        averageHeartRate: {
          value: heartRateValue,
          trend: 3,
          unit: "bpm",
        },
      };

      return serverMessage(res, "PERFORMANCE_METRICS_RETRIEVED", metrics);
    } catch (error) {
      console.error("Erreur contrôleur métriques de performance:", error);
      return serverMessage(res, "ERROR_GETTING_PERFORMANCE_METRICS");
    }
  },
  getPerformanceMetrics2: async (req, res) => {
    try {
      const userId = req.user.id;

      const userStats = await UserStats.findOne({
        where: { user_id: userId },
      });

      // CORRECTION : Requête corrigée pour la fréquence cardiaque moyenne
      const heartRateData = await HeartRateData.findOne({
        where: { user_id: userId },
        attributes: [
          [Sequelize.fn("AVG", Sequelize.col("heartRate")), "avgHeartRate"],
        ],
        raw: true,
      });

      // Alternative : Dernière mesure de fréquence cardiaque
      const latestHeartRate = await HeartRateData.findOne({
        where: { user_id: userId },
        order: [["timestamp", "DESC"]],
        attributes: ["heartRate"],
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
          value: heartRateData?.avgHeartRate || latestHeartRate?.heartRate || 0,
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

  const daysOfWeek = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const weeklyData = daysOfWeek.map((day) => ({
    day,
    distance: 0,
    time: 0,
    pace: 0,
  }));

  // Grouper les activités par jour
  const activitiesByDay = {};
  activities.forEach((activity) => {
    const dayIndex = new Date(activity.date).getDay();
    // Ajuster l'index pour commencer par Lundi (0 = Dimanche -> 6 = Samedi)
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;

    if (!activitiesByDay[adjustedIndex]) {
      activitiesByDay[adjustedIndex] = [];
    }
    activitiesByDay[adjustedIndex].push(activity);
  });

  // Calculer les totaux pour chaque jour
  Object.keys(activitiesByDay).forEach((dayIndex) => {
    const dayActivities = activitiesByDay[dayIndex];
    const totalDistance = dayActivities.reduce(
      (sum, activity) => sum + (activity.distance || 0),
      0
    );
    const totalTime = dayActivities.reduce(
      (sum, activity) => sum + (activity.activeMinutes || 0),
      0
    );

    weeklyData[dayIndex].distance = parseFloat(totalDistance.toFixed(2));
    weeklyData[dayIndex].time = totalTime;
    weeklyData[dayIndex].pace =
      totalDistance > 0
        ? parseFloat((totalTime / totalDistance).toFixed(2))
        : 0;
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

  // Grouper par semaine
  const weeklyData = {};

  activities.forEach((activity) => {
    const activityDate = new Date(activity.date);
    const weekNumber = Math.floor((activityDate.getDate() - 1) / 7) + 1;
    const weekKey = `Week ${weekNumber}`;

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { distance: 0 };
    }

    weeklyData[weekKey].distance += activity.distance || 0;
  });

  // Convertir en tableau formaté pour le frontend
  const monthlyData = Object.keys(weeklyData).map((weekName) => ({
    name: weekName,
    distance: parseFloat(weeklyData[weekName].distance.toFixed(2)),
  }));

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
      }
    });

    const runTypeData = [
      {
        name: "Court (<5km)",
        value: categories.short.count,
        distance: categories.short.distance,
      },
      {
        name: "Moyen (5-10km)",
        value: categories.medium.count,
        distance: categories.medium.distance,
      },
      {
        name: "Long (>10km)",
        value: categories.long.count,
        distance: categories.long.distance,
      },
    ].filter((item) => item.value > 0);

    return runTypeData.length > 0 ? runTypeData : [];
  } catch (error) {
    console.error("Erreur calcul des types de course:", error);
    return [];
  }
}
// Fonctions helper pour formater les données
function formatTimeFromMinutes(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:00`;
}

function calculatePace(distance, minutes) {
  if (!distance || !minutes || distance === 0 || minutes === 0) {
    return "0:00";
  }

  const paceMinutesPerKm = minutes / distance;
  const paceMinutes = Math.floor(paceMinutesPerKm);
  const paceSeconds = Math.round((paceMinutesPerKm - paceMinutes) * 60);

  return `${paceMinutes}:${paceSeconds.toString().padStart(2, "0")}`;
}
