const { google } = require("googleapis");
const axios = require("axios");

class GoogleFitService {
  constructor() {
    this.fitness = google.fitness("v1");
  }

  // Créer un client OAuth2 avec les tokens de l'utilisateur
  createOAuth2Client(accessToken, refreshToken) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    return oauth2Client;
  }

  // Récupérer les données d'activité (steps, distance, calories)
  async getActivityData(user, startDate, endDate) {
    try {
      const oauth2Client = this.createOAuth2Client(
        user.googleAuth.access_token,
        user.googleAuth.refresh_token
      );

      const startTimeMillis = new Date(startDate).getTime();
      const endTimeMillis = new Date(endDate).getTime();

      // Utiliser dataset.aggregate avec la bonne structure
      const stepsResponse = await this.fitness.users.dataset.aggregate({
        auth: oauth2Client,
        userId: "me",
        requestBody: {
          aggregateBy: [
            {
              dataTypeName: "com.google.step_count.delta",
            },
          ],
          bucketByTime: { durationMillis: 86400000 },
          startTimeMillis: startTimeMillis,
          endTimeMillis: endTimeMillis,
        },
      });

      const distanceResponse = await this.fitness.users.dataset.aggregate({
        auth: oauth2Client,
        userId: "me",
        requestBody: {
          aggregateBy: [
            {
              dataTypeName: "com.google.distance.delta",
            },
          ],
          bucketByTime: { durationMillis: 86400000 },
          startTimeMillis: startTimeMillis,
          endTimeMillis: endTimeMillis,
        },
      });

      const caloriesResponse = await this.fitness.users.dataset.aggregate({
        auth: oauth2Client,
        userId: "me",
        requestBody: {
          aggregateBy: [
            {
              dataTypeName: "com.google.calories.expended",
            },
          ],
          bucketByTime: { durationMillis: 86400000 },
          startTimeMillis: startTimeMillis,
          endTimeMillis: endTimeMillis,
        },
      });

      return {
        steps: this.processStepsData(stepsResponse.data),
        distance: this.processDistanceData(distanceResponse.data),
        calories: this.processCaloriesData(caloriesResponse.data),
      };
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données d'activité:",
        error
      );
      throw new Error(
        "Impossible de récupérer les données d'activité Google Fit"
      );
    }
  }

  // Récupérer les données de fréquence cardiaque
  async getHeartRateData(user, startDate, endDate) {
    try {
      const oauth2Client = this.createOAuth2Client(
        user.googleAuth.access_token,
        user.googleAuth.refresh_token
      );

      const startTimeMillis = new Date(startDate).getTime();
      const endTimeMillis = new Date(endDate).getTime();

      const heartRateResponse = await this.fitness.users.dataset.aggregate({
        auth: oauth2Client,
        userId: "me",
        requestBody: {
          aggregateBy: [
            {
              dataTypeName: "com.google.heart_rate.bpm",
            },
          ],
          bucketByTime: { durationMillis: 3600000 },
          startTimeMillis: startTimeMillis,
          endTimeMillis: endTimeMillis,
        },
      });

      return this.processHeartRateData(heartRateResponse.data);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de la fréquence cardiaque:",
        error
      );
      throw new Error(
        "Impossible de récupérer les données de fréquence cardiaque"
      );
    }
  }

  // Récupérer les données de sommeil
  async getSleepData(user, startDate, endDate) {
    try {
      const oauth2Client = this.createOAuth2Client(
        user.googleAuth.access_token,
        user.googleAuth.refresh_token
      );

      const sleepResponse = await this.fitness.users.sessions.list({
        auth: oauth2Client,
        userId: "me",
        startTime: new Date(startDate).toISOString(),
        endTime: new Date(endDate).toISOString(),
        activityType: 72,
      });

      return this.processSleepData(sleepResponse.data);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données de sommeil:",
        error
      );
      throw new Error("Impossible de récupérer les données de sommeil");
    }
  }

  // Récupérer les activités de course
  async getRunningActivities(user, startDate, endDate) {
    try {
      const oauth2Client = this.createOAuth2Client(
        user.googleAuth.access_token,
        user.googleAuth.refresh_token
      );

      const runningResponse = await this.fitness.users.sessions.list({
        auth: oauth2Client,
        userId: "me",
        startTime: new Date(startDate).toISOString(),
        endTime: new Date(endDate).toISOString(),
        activityType: 8,
      });

      return this.processRunningActivities(runningResponse.data);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des activités de course:",
        error
      );
      throw new Error("Impossible de récupérer les activités de course");
    }
  }

  // Traitement des données de pas
  processStepsData(data) {
    if (!data.bucket) return [];

    return data.bucket.map((bucket) => ({
      date: new Date(parseInt(bucket.startTimeMillis)),
      steps: bucket.dataset[0]?.point[0]?.value[0]?.intVal || 0,
    }));
  }

  // Traitement des données de distance
  processDistanceData(data) {
    if (!data.bucket) return [];

    return data.bucket.map((bucket) => ({
      date: new Date(parseInt(bucket.startTimeMillis)),
      distance: (bucket.dataset[0]?.point[0]?.value[0]?.fpVal || 0) / 1000,
    }));
  }

  // Traitement des données de calories
  processCaloriesData(data) {
    if (!data.bucket) return [];

    return data.bucket.map((bucket) => ({
      date: new Date(parseInt(bucket.startTimeMillis)),
      calories: bucket.dataset[0]?.point[0]?.value[0]?.fpVal || 0,
    }));
  }

  // Traitement des données de fréquence cardiaque
  processHeartRateData(data) {
    if (!data.bucket) return [];

    const heartRates = [];

    data.bucket.forEach((bucket) => {
      if (bucket.dataset && bucket.dataset[0] && bucket.dataset[0].point) {
        bucket.dataset[0].point.forEach((point) => {
          if (
            point.value &&
            point.value[0] &&
            point.value[0].fpVal !== undefined
          ) {
            heartRates.push({
              timestamp: new Date(parseInt(point.startTimeNanos / 1000000)),
              bpm: point.value[0].fpVal,
            });
          }
        });
      }
    });

    // Grouper par heure pour les statistiques
    const hourlyStats = {};
    heartRates.forEach((hr) => {
      const hour = new Date(hr.timestamp).toISOString().slice(0, 13) + ":00:00";
      if (!hourlyStats[hour]) {
        hourlyStats[hour] = {
          values: [],
          timestamp: new Date(hour),
        };
      }
      hourlyStats[hour].values.push(hr.bpm);
    });

    return Object.values(hourlyStats).map((stats) => ({
      timestamp: stats.timestamp,
      average:
        stats.values.length > 0
          ? stats.values.reduce((a, b) => a + b) / stats.values.length
          : 0,
      min: stats.values.length > 0 ? Math.min(...stats.values) : 0,
      max: stats.values.length > 0 ? Math.max(...stats.values) : 0,
      readings: stats.values.length,
    }));
  }

  // Traitement des données de sommeil
  processSleepData(data) {
    if (!data.session) return [];

    return data.session.map((session) => ({
      date: new Date(parseInt(session.startTimeMillis)),
      startTime: new Date(parseInt(session.startTimeMillis)),
      endTime: new Date(parseInt(session.endTimeMillis)),
      duration:
        (parseInt(session.endTimeMillis) - parseInt(session.startTimeMillis)) /
        (1000 * 60),
      quality: session.description || "unknown",
    }));
  }

  // Traitement des activités de course
  processRunningActivities(data) {
    if (!data.session) return [];

    return data.session.map((session) => ({
      id: session.id,
      name: session.name || "Course",
      startTime: new Date(parseInt(session.startTimeMillis)),
      endTime: new Date(parseInt(session.endTimeMillis)),
      duration:
        (parseInt(session.endTimeMillis) - parseInt(session.startTimeMillis)) /
        (1000 * 60),
      activityType: session.activityType,
      description: session.description,
    }));
  }

  // Synchroniser toutes les données pour un utilisateur
  async syncAllData(user, days = 7) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    try {
      console.log("Début de la synchronisation Google Fit...");

      // Rafraîchir le token d'abord
      const refreshedToken = await this.refreshTokenIfNeeded(user);
      if (refreshedToken) {
        user.googleAuth.access_token = refreshedToken;
      }

      const [activityData, heartRateData, sleepData, runningActivities] =
        await Promise.all([
          this.getActivityData(user, startDate, endDate),
          this.getHeartRateData(user, startDate, endDate),
          this.getSleepData(user, startDate, endDate),
          this.getRunningActivities(user, startDate, endDate),
        ]);

      console.log("Synchronisation réussie:", {
        steps: activityData.steps.length,
        heartRate: heartRateData.length,
        sleep: sleepData.length,
        running: runningActivities.length,
      });

      return {
        activity: activityData,
        heartRate: heartRateData,
        sleep: sleepData,
        running: runningActivities,
        syncedAt: new Date(),
        period: { startDate, endDate },
      };
    } catch (error) {
      console.error("Erreur lors de la synchronisation complète:", error);
      throw error;
    }
  }

  // Vérifier et rafraîchir les tokens si nécessaire - VERSION AMÉLIORÉE
  async refreshTokenIfNeeded(user) {
    try {
      const oauth2Client = this.createOAuth2Client(
        user.googleAuth.access_token,
        user.googleAuth.refresh_token
      );

      // Vérifier si le token est expiré ou va bientôt expirer
      const tokenInfo = await oauth2Client.getTokenInfo(
        user.googleAuth.access_token
      );
      const expirationTime = tokenInfo.expiry_date;
      const currentTime = Date.now();

      // Si le token expire dans moins de 5 minutes, on le rafraîchit
      if (expirationTime - currentTime < 300000) {
        console.log("Token expirant bientôt, rafraîchissement...");
        const { credentials } = await oauth2Client.refreshAccessToken();

        // Mettre à jour les tokens
        await user.update({
          "googleAuth.access_token": credentials.access_token,
          "googleAuth.refresh_token":
            credentials.refresh_token || user.googleAuth.refresh_token,
          "googleAuth.token_expiry": new Date(
            credentials.expiry_date || Date.now() + 3600 * 1000
          ),
        });

        console.log("Token rafraîchi avec succès");
        return credentials.access_token;
      }

      return null;
    } catch (error) {
      if (error.code === 401) {
        console.log("Token expiré, tentative de rafraîchissement...");
        try {
          const oauth2Client = this.createOAuth2Client(
            user.googleAuth.access_token,
            user.googleAuth.refresh_token
          );

          const { credentials } = await oauth2Client.refreshAccessToken();

          await user.update({
            "googleAuth.access_token": credentials.access_token,
            "googleAuth.refresh_token":
              credentials.refresh_token || user.googleAuth.refresh_token,
            "googleAuth.token_expiry": new Date(
              credentials.expiry_date || Date.now() + 3600 * 1000
            ),
          });

          console.log("Token rafraîchi après expiration");
          return credentials.access_token;
        } catch (refreshError) {
          console.error("Erreur lors du rafraîchissement:", refreshError);
          throw new Error("Token Google expiré et impossible à rafraîchir");
        }
      }

      console.error("Erreur de vérification du token:", error);
      throw error;
    }
  }

  // NOUVELLE MÉTHODE: Vérifier la connexion Google Fit
  async checkConnection(user) {
    try {
      const oauth2Client = this.createOAuth2Client(
        user.googleAuth.access_token,
        user.googleAuth.refresh_token
      );

      // Test simple pour vérifier la connexion
      await this.fitness.users.dataSources.list({
        auth: oauth2Client,
        userId: "me",
      });

      return true;
    } catch (error) {
      console.error("Erreur de connexion Google Fit:", error);
      return false;
    }
  }

  // NOUVELLE MÉTHODE: Obtenir les données sources disponibles
  async getAvailableDataSources(user) {
    try {
      const oauth2Client = this.createOAuth2Client(
        user.googleAuth.access_token,
        user.googleAuth.refresh_token
      );

      const response = await this.fitness.users.dataSources.list({
        auth: oauth2Client,
        userId: "me",
      });

      return response.data.dataSource || [];
    } catch (error) {
      console.error("Erreur lors de la récupération des data sources:", error);
      return [];
    }
  }
}

module.exports = new GoogleFitService();
