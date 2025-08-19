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
      process.env.GOOGLE_CALLBACK_URL
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
        user.googleAuth.googleAccessToken,
        user.googleAuth.googleRefreshToken
      );

      const startTimeNanos = new Date(startDate).getTime() * 1000000;
      const endTimeNanos = new Date(endDate).getTime() * 1000000;

      // Récupérer les pas
      const stepsData =
        await this.fitness.users.dataSources.dataPointChanges.list({
          auth: oauth2Client,
          userId: "me",
          dataSourceId:
            "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
          requestBody: {
            aggregateBy: [
              {
                dataTypeName: "com.google.step_count.delta",
              },
            ],
            bucketByTime: { durationMillis: 86400000 }, // 1 jour
            startTimeMillis: startTimeNanos / 1000000,
            endTimeMillis: endTimeNanos / 1000000,
          },
        });

      // Récupérer la distance
      const distanceData =
        await this.fitness.users.dataSources.dataPointChanges.list({
          auth: oauth2Client,
          userId: "me",
          dataSourceId:
            "derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta",
          requestBody: {
            aggregateBy: [
              {
                dataTypeName: "com.google.distance.delta",
              },
            ],
            bucketByTime: { durationMillis: 86400000 },
            startTimeMillis: startTimeNanos / 1000000,
            endTimeMillis: endTimeNanos / 1000000,
          },
        });

      // Récupérer les calories
      const caloriesData =
        await this.fitness.users.dataSources.dataPointChanges.list({
          auth: oauth2Client,
          userId: "me",
          dataSourceId:
            "derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended",
          requestBody: {
            aggregateBy: [
              {
                dataTypeName: "com.google.calories.expended",
              },
            ],
            bucketByTime: { durationMillis: 86400000 },
            startTimeMillis: startTimeNanos / 1000000,
            endTimeMillis: endTimeNanos / 1000000,
          },
        });

      return {
        steps: this.processStepsData(stepsData.data),
        distance: this.processDistanceData(distanceData.data),
        calories: this.processCaloriesData(caloriesData.data),
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
        user.googleAuth.googleAccessToken,
        user.googleAuth.googleRefreshToken
      );

      const startTimeNanos = new Date(startDate).getTime() * 1000000;
      const endTimeNanos = new Date(endDate).getTime() * 1000000;

      const heartRateData =
        await this.fitness.users.dataSources.dataPointChanges.list({
          auth: oauth2Client,
          userId: "me",
          dataSourceId:
            "derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm",
          requestBody: {
            aggregateBy: [
              {
                dataTypeName: "com.google.heart_rate.bpm",
              },
            ],
            bucketByTime: { durationMillis: 3600000 }, // 1 heure
            startTimeMillis: startTimeNanos / 1000000,
            endTimeMillis: endTimeNanos / 1000000,
          },
        });

      return this.processHeartRateData(heartRateData.data);
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
        user.googleAuth.googleAccessToken,
        user.googleAuth.googleRefreshToken
      );

      const startTimeNanos = new Date(startDate).getTime() * 1000000;
      const endTimeNanos = new Date(endDate).getTime() * 1000000;

      const sleepData = await this.fitness.users.sessions.list({
        auth: oauth2Client,
        userId: "me",
        startTime: new Date(startDate).toISOString(),
        endTime: new Date(endDate).toISOString(),
        activityType: 72, // Sleep activity type
      });

      return this.processSleepData(sleepData.data);
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
        user.googleAuth.googleAccessToken,
        user.googleAuth.googleRefreshToken
      );

      const runningActivities = await this.fitness.users.sessions.list({
        auth: oauth2Client,
        userId: "me",
        startTime: new Date(startDate).toISOString(),
        endTime: new Date(endDate).toISOString(),
        activityType: 8, // Running activity type
      });

      return this.processRunningActivities(runningActivities.data);
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
      distance: (bucket.dataset[0]?.point[0]?.value[0]?.fpVal || 0) / 1000, // Convertir en km
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

    return data.bucket.map((bucket) => {
      const points = bucket.dataset[0]?.point || [];
      const heartRates = points
        .map((point) => point.value[0]?.fpVal)
        .filter((hr) => hr);

      return {
        timestamp: new Date(parseInt(bucket.startTimeMillis)),
        average:
          heartRates.length > 0
            ? heartRates.reduce((a, b) => a + b) / heartRates.length
            : 0,
        min: heartRates.length > 0 ? Math.min(...heartRates) : 0,
        max: heartRates.length > 0 ? Math.max(...heartRates) : 0,
        readings: heartRates.length,
      };
    });
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
        (1000 * 60), // en minutes
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
        (1000 * 60), // en minutes
      activityType: session.activityType,
      description: session.description,
    }));
  }

  // Synchroniser toutes les données pour un utilisateur
  async syncAllData(user, days = 7) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    try {
      const [activityData, heartRateData, sleepData, runningActivities] =
        await Promise.all([
          this.getActivityData(user, startDate, endDate),
          this.getHeartRateData(user, startDate, endDate),
          this.getSleepData(user, startDate, endDate),
          this.getRunningActivities(user, startDate, endDate),
        ]);

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

  // Vérifier et rafraîchir les tokens si nécessaire
  async refreshTokenIfNeeded(user) {
    try {
      const oauth2Client = this.createOAuth2Client(
        user.googleAuth.googleAccessToken,
        user.googleAuth.googleRefreshToken
      );

      // Tenter une requête simple pour vérifier la validité du token
      await this.fitness.users.dataSources.list({
        auth: oauth2Client,
        userId: "me",
      });

      return user.googleAuth.googleAccessToken;
    } catch (error) {
      if (error.code === 401) {
        // Token expiré, essayer de le rafraîchir
        try {
          const oauth2Client = this.createOAuth2Client(
            user.googleAuth.googleAccessToken,
            user.googleAuth.googleRefreshToken
          );

          const { credentials } = await oauth2Client.refreshAccessToken();

          // Mettre à jour les tokens dans la base de données
          await user.update({
            "googleAuth.googleAccessToken": credentials.access_token,
            "googleAuth.googleRefreshToken":
              credentials.refresh_token || user.googleAuth.googleRefreshToken,
          });

          return credentials.access_token;
        } catch (refreshError) {
          console.error(
            "Erreur lors du rafraîchissement du token:",
            refreshError
          );
          throw new Error("Token Google expiré et impossible à rafraîchir");
        }
      }
      throw error;
    }
  }
}

module.exports = new GoogleFitService();
