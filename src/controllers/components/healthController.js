const Joi = require("joi");
const {
  ActivityData,
  HeartRateData,
  SleepData,
  ExerciseSession,
  DataSync,
} = require("../../models");
const googleFitService = require("../../services/googleFitService");
const axios = require("axios");
const { Op } = require("sequelize");

// Validation schemas
const syncRequestSchema = Joi.object({
  days: Joi.number().min(1).max(90).default(7),
  dataTypes: Joi.array()
    .items(Joi.string().valid("activity", "heartRate", "sleep", "exercise"))
    .default(["activity", "heartRate", "sleep", "exercise"]),
  force: Joi.boolean().default(false),
});

const dateRangeSchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().required().greater(Joi.ref("startDate")),
});

module.exports = {
  // POST /api/health/sync - Synchroniser les données Google Fit
  syncHealthData: async (req, res) => {
    try {
      const { error, value } = syncRequestSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          error: true,
          message: "Données invalides",
          details: error.details[0].message,
        });
      }

      const { days, dataTypes, force } = value;

      // Vérifier que l'utilisateur a connecté Google
      if (!req.user.googleAuth || !req.user.googleAuth.googleAccessToken) {
        return res.status(400).json({
          error: true,
          message:
            "Compte Google non connecté. Veuillez vous connecter avec Google d'abord.",
        });
      }

      // Vérifier s'il y a déjà une synchronisation en cours
      const ongoingSync = await DataSync.findOne({
        where: {
          userId: req.user.id,
          status: ["pending", "in_progress"],
        },
      });

      if (ongoingSync && !force) {
        return res.status(409).json({
          error: true,
          message: "Une synchronisation est déjà en cours",
          data: ongoingSync,
        });
      }

      const endDate = new Date();
      const startDate = new Date(
        endDate.getTime() - days * 24 * 60 * 60 * 1000
      );

      // Créer un enregistrement de synchronisation
      const syncRecord = await DataSync.create({
        userId: req.user.id,
        syncType: "manual",
        dataTypes: dataTypes,
        startDate: startDate,
        endDate: endDate,
        status: "in_progress",
      });

      // Lancer la synchronisation en arrière-plan
      setImmediate(async () => {
        try {
          await googleFitService.refreshTokenIfNeeded(req.user);
          const syncedData = await googleFitService.syncAllData(req.user, days);

          let recordsProcessed = 0;

          // Traiter les données d'activité
          if (dataTypes.includes("activity") && syncedData.activity) {
            for (const dayData of syncedData.activity.steps) {
              await ActivityData.upsert({
                userId: req.user.id,
                date: dayData.date,
                steps: dayData.steps,
                distance:
                  syncedData.activity.distance.find(
                    (d) => d.date.toDateString() === dayData.date.toDateString()
                  )?.distance || 0,
                calories:
                  syncedData.activity.calories.find(
                    (c) => c.date.toDateString() === dayData.date.toDateString()
                  )?.calories || 0,
              });
              recordsProcessed++;
            }
          }

          // Traiter les données de fréquence cardiaque
          if (dataTypes.includes("heartRate") && syncedData.heartRate) {
            for (const hrData of syncedData.heartRate) {
              if (hrData.average > 0) {
                await HeartRateData.create({
                  userId: req.user.id,
                  timestamp: hrData.timestamp,
                  heartRate: Math.round(hrData.average),
                  context: "active",
                });
                recordsProcessed++;
              }
            }
          }

          // Traiter les données de sommeil
          if (dataTypes.includes("sleep") && syncedData.sleep) {
            for (const sleepSession of syncedData.sleep) {
              await SleepData.upsert({
                userId: req.user.id,
                date: sleepSession.date,
                bedTime: sleepSession.startTime,
                wakeTime: sleepSession.endTime,
                totalSleepMinutes: sleepSession.duration,
                sleepQuality:
                  sleepSession.quality === "unknown"
                    ? "good"
                    : sleepSession.quality,
              });
              recordsProcessed++;
            }
          }

          // Traiter les sessions d'exercice
          if (dataTypes.includes("exercise") && syncedData.running) {
            for (const session of syncedData.running) {
              await ExerciseSession.upsert({
                userId: req.user.id,
                googleSessionId: session.id,
                name: session.name,
                activityType: session.activityType,
                activityName: "running",
                startTime: session.startTime,
                endTime: session.endTime,
                duration: session.duration,
              });
              recordsProcessed++;
            }
          }

          // Marquer la synchronisation comme terminée
          await syncRecord.update({
            status: "completed",
            recordsProcessed: recordsProcessed,
            completedAt: new Date(),
          });
        } catch (syncError) {
          console.error("Erreur lors de la synchronisation:", syncError);
          await syncRecord.update({
            status: "failed",
            errors: [syncError.message],
          });
        }
      });

      res.status(202).json({
        error: false,
        message: "Synchronisation démarrée",
        data: {
          syncId: syncRecord.id,
          status: "in_progress",
          estimatedDuration: `${days * 2} secondes`,
        },
      });
    } catch (error) {
      console.error("Erreur lors du démarrage de la synchronisation:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors du démarrage de la synchronisation",
      });
    }
  },

  // GET /api/health/sync/status/:syncId - Vérifier le statut d'une synchronisation
  getSyncStatus: async (req, res) => {
    try {
      const syncRecord = await DataSync.findOne({
        where: {
          id: req.params.syncId,
          userId: req.user.id,
        },
      });

      if (!syncRecord) {
        return res.status(404).json({
          error: true,
          message: "Synchronisation non trouvée",
        });
      }

      res.json({
        error: false,
        message: "Statut de synchronisation récupéré",
        data: syncRecord,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération du statut:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de la récupération du statut",
      });
    }
  },

  // GET /api/health/activity - Récupérer les données d'activité
  getActivityData: async (req, res) => {
    try {
      const { error, value } = dateRangeSchema.validate(req.query);

      if (error) {
        return res.status(400).json({
          error: true,
          message: "Paramètres de date invalides",
          details: error.details[0].message,
        });
      }

      const { startDate, endDate } = value;

      const activityData = await ActivityData.findAll({
        where: {
          userId: req.user.id,
          date: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [["date", "ASC"]],
      });

      res.json({
        error: false,
        message: "Données d'activité récupérées avec succès",
        data: activityData,
      });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données d'activité:",
        error
      );
      res.status(500).json({
        error: true,
        message: "Erreur lors de la récupération des données d'activité",
      });
    }
  },

  // GET /api/health/heart-rate - Récupérer les données de fréquence cardiaque
  getHeartRateData: async (req, res) => {
    try {
      const { error, value } = dateRangeSchema.validate(req.query);

      if (error) {
        return res.status(400).json({
          error: true,
          message: "Paramètres de date invalides",
          details: error.details[0].message,
        });
      }

      const { startDate, endDate } = value;

      const heartRateData = await HeartRateData.findAll({
        where: {
          userId: req.user.id,
          timestamp: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [["timestamp", "ASC"]],
      });

      // Calculer les statistiques
      const stats = {
        average: 0,
        min: 0,
        max: 0,
        readings: heartRateData.length,
      };

      if (heartRateData.length > 0) {
        const rates = heartRateData.map((hr) => hr.heartRate);
        stats.average = Math.round(
          rates.reduce((a, b) => a + b) / rates.length
        );
        stats.min = Math.min(...rates);
        stats.max = Math.max(...rates);
      }

      res.json({
        error: false,
        message: "Données de fréquence cardiaque récupérées avec succès",
        data: {
          readings: heartRateData,
          stats: stats,
        },
      });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de la fréquence cardiaque:",
        error
      );
      res.status(500).json({
        error: true,
        message: "Erreur lors de la récupération de la fréquence cardiaque",
      });
    }
  },

  // GET /api/health/sleep - Récupérer les données de sommeil
  getSleepData: async (req, res) => {
    try {
      const { error, value } = dateRangeSchema.validate(req.query);

      if (error) {
        return res.status(400).json({
          error: true,
          message: "Paramètres de date invalides",
          details: error.details[0].message,
        });
      }

      const { startDate, endDate } = value;

      const sleepData = await SleepData.findAll({
        where: {
          userId: req.user.id,
          date: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [["date", "ASC"]],
      });

      // Calculer les statistiques de sommeil
      const stats = {
        averageSleepHours: 0,
        totalNights: sleepData.length,
        averageBedTime: null,
        averageWakeTime: null,
        sleepQualityDistribution: {
          poor: 0,
          fair: 0,
          good: 0,
          excellent: 0,
        },
      };

      if (sleepData.length > 0) {
        stats.averageSleepHours =
          sleepData.reduce((sum, sleep) => sum + sleep.totalSleepMinutes, 0) /
          sleepData.length /
          60;

        // Distribution de la qualité du sommeil
        sleepData.forEach((sleep) => {
          stats.sleepQualityDistribution[sleep.sleepQuality]++;
        });
      }

      res.json({
        error: false,
        message: "Données de sommeil récupérées avec succès",
        data: {
          sleepSessions: sleepData,
          stats: stats,
        },
      });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données de sommeil:",
        error
      );
      res.status(500).json({
        error: true,
        message: "Erreur lors de la récupération des données de sommeil",
      });
    }
  },

  // GET /api/health/exercise - Récupérer les sessions d'exercice
  getExerciseData: async (req, res) => {
    try {
      const { error, value } = dateRangeSchema.validate(req.query);

      if (error) {
        return res.status(400).json({
          error: true,
          message: "Paramètres de date invalides",
          details: error.details[0].message,
        });
      }

      const { startDate, endDate } = value;
      const { activityType } = req.query;

      const filter = {
        userId: req.user.id,
        startTime: {
          [Op.between]: [startDate, endDate],
        },
      };

      if (activityType) {
        filter.activityType = parseInt(activityType);
      }

      const exercises = await ExerciseSession.findAll({
        where: filter,
        order: [["startTime", "DESC"]],
      });

      // Calculer les statistiques
      const stats = {
        totalSessions: exercises.length,
        totalDistance: exercises.reduce(
          (sum, ex) => sum + parseFloat(ex.distance || 0),
          0
        ),
        totalDuration: exercises.reduce((sum, ex) => sum + ex.duration, 0),
        totalCalories: exercises.reduce(
          (sum, ex) => sum + parseFloat(ex.calories || 0),
          0
        ),
        averageHeartRate: 0,
      };

      const sessionsWithHR = exercises.filter((ex) => ex.averageHeartRate);
      if (sessionsWithHR.length > 0) {
        stats.averageHeartRate = Math.round(
          sessionsWithHR.reduce((sum, ex) => sum + ex.averageHeartRate, 0) /
            sessionsWithHR.length
        );
      }

      res.json({
        error: false,
        message: "Sessions d'exercice récupérées avec succès",
        data: {
          sessions: exercises,
          stats: stats,
        },
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des exercices:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de la récupération des exercices",
      });
    }
  },

  // GET /api/health/dashboard - Récupérer un résumé pour le dashboard
  getDashboard: async (req, res) => {
    try {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Données d'aujourd'hui
      const todayActivity = await ActivityData.findOne({
        where: {
          userId: req.user.id,
          date: today.toISOString().split("T")[0],
        },
      });

      // Données de la semaine
      const weeklyActivity = await ActivityData.findAll({
        where: {
          userId: req.user.id,
          date: {
            [Op.gte]: weekAgo.toISOString().split("T")[0],
          },
        },
      });

      // Dernière session d'exercice
      const lastExercise = await ExerciseSession.findOne({
        where: { userId: req.user.id },
        order: [["startTime", "DESC"]],
      });

      // Données de sommeil récentes
      const recentSleep = await SleepData.findOne({
        where: {
          userId: req.user.id,
          date: {
            [Op.gte]: yesterday.toISOString().split("T")[0],
          },
        },
        order: [["date", "DESC"]],
      });

      // Fréquence cardiaque récente
      const recentHeartRate = await HeartRateData.findAll({
        where: {
          userId: req.user.id,
          timestamp: {
            [Op.gte]: yesterday,
          },
        },
        order: [["timestamp", "DESC"]],
        limit: 10,
      });

      const dashboard = {
        today: {
          steps: todayActivity?.steps || 0,
          distance: todayActivity?.distance || 0,
          calories: todayActivity?.calories || 0,
          activeMinutes: todayActivity?.activeMinutes || 0,
        },
        weekly: {
          totalSteps: weeklyActivity.reduce((sum, day) => sum + day.steps, 0),
          totalDistance: weeklyActivity.reduce(
            (sum, day) => sum + parseFloat(day.distance),
            0
          ),
          totalCalories: weeklyActivity.reduce(
            (sum, day) => sum + parseFloat(day.calories),
            0
          ),
          activeDays: weeklyActivity.filter((day) => day.steps > 1000).length,
        },
        lastExercise: lastExercise
          ? {
              name: lastExercise.name,
              duration: lastExercise.duration,
              distance: lastExercise.distance,
              calories: lastExercise.calories,
              date: lastExercise.startTime,
            }
          : null,
        sleep: recentSleep
          ? {
              duration: recentSleep.totalSleepMinutes,
              quality: recentSleep.sleepQuality,
              bedTime: recentSleep.bedTime,
              wakeTime: recentSleep.wakeTime,
            }
          : null,
        heartRate:
          recentHeartRate.length > 0
            ? {
                current: recentHeartRate[0].heartRate,
                average: Math.round(
                  recentHeartRate.reduce((sum, hr) => sum + hr.heartRate, 0) /
                    recentHeartRate.length
                ),
                trend:
                  recentHeartRate.length > 1
                    ? recentHeartRate[0].heartRate >
                      recentHeartRate[1].heartRate
                      ? "up"
                      : "down"
                    : "stable",
              }
            : null,
      };

      res.json({
        error: false,
        message: "Dashboard santé récupéré avec succès",
        data: dashboard,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération du dashboard:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de la récupération du dashboard",
      });
    }
  },

  // GET /api/health/sync/history - Historique des synchronisations
  getSyncHistory: async (req, res) => {
    try {
      const { limit = 10 } = req.query;

      const syncHistory = await DataSync.findAll({
        where: { userId: req.user.id },
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit),
      });

      res.json({
        error: false,
        message: "Historique de synchronisation récupéré",
        data: syncHistory,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de la récupération de l'historique",
      });
    }
  },

  // DELETE /api/health/disconnect - Déconnecter Google Fit
  disconnectGoogleFit: async (req, res) => {
    try {
      // Révoquer les tokens Google
      if (req.user.googleAuth && req.user.googleAuth.googleAccessToken) {
        try {
          await axios.post(
            `https://oauth2.googleapis.com/revoke?token=${req.user.googleAuth.googleAccessToken}`
          );
        } catch (revokeError) {
          console.warn(
            "Erreur lors de la révocation du token Google:",
            revokeError.message
          );
        }
      }

      // Supprimer les données Google de l'utilisateur
      await req.user.update({
        googleAuth: null,
      });

      res.json({
        error: false,
        message: "Google Fit déconnecté avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de la déconnexion",
      });
    }
  },

  // GET /api/health/connection/status - Vérifier le statut de connexion Google
  getConnectionStatus: async (req, res) => {
    try {
      const isConnected = !!(
        req.user.googleAuth && req.user.googleAuth.googleAccessToken
      );

      let lastSync = null;
      if (isConnected) {
        const recentSync = await DataSync.findOne({
          where: { userId: req.user.id },
          order: [["createdAt", "DESC"]],
        });
        lastSync = recentSync ? recentSync.createdAt : null;
      }

      res.json({
        error: false,
        message: "Statut de connexion récupéré",
        data: {
          isConnected: isConnected,
          connectedAt: req.user.googleAuth?.connectedAt || null,
          lastSync: lastSync,
          scopes: isConnected
            ? [
                "fitness.activity.read",
                "fitness.heart_rate.read",
                "fitness.sleep.read",
                "fitness.location.read",
              ]
            : [],
        },
      });
    } catch (error) {
      console.error("Erreur lors de la vérification du statut:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de la vérification du statut",
      });
    }
  },
};
