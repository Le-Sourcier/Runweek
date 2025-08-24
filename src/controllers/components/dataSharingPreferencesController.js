// controllers/dataSharingPreferencesController.js
const { DataSharingPreferences, Users, Profiles } = require("../../models");
const { serverMessage } = require("../../utils");

module.exports = {
  /**
   * Récupérer les préférences de partage de l'utilisateur connecté
   */
  getMyDataSharingPreferences: async (req, res) => {
    try {
      const userId = req.user.id;

      const preferences = await DataSharingPreferences.findOne({
        where: { user_id: userId },
      });

      if (!preferences) {
        // Créer des préférences par défaut si elles n'existent pas
        const defaultPreferences = await DataSharingPreferences.create({
          user_id: userId,
        });

        // Formater les données selon le schéma souhaité
        const data = {
          enabled: defaultPreferences.enabled,
          shareNutrition: defaultPreferences.shareNutrition,
          shareActivities: defaultPreferences.shareActivities,
          shareGoals: defaultPreferences.shareGoals,
          shareAchievements: defaultPreferences.shareAchievements,
          allowFriendRequests: defaultPreferences.allowFriendRequests,
          showInSearch: defaultPreferences.showInSearch,
          createdAt: defaultPreferences.createdAt,
          updatedAt: defaultPreferences.updatedAt,
        };

        return serverMessage(res, "DATA_SHARING_PREFERENCES_RETRIEVED", data);
      }

      // Formater les données existantes selon le schéma souhaité
      const data = {
        enabled: preferences.enabled,
        shareNutrition: preferences.shareNutrition,
        shareActivities: preferences.shareActivities,
        shareGoals: preferences.shareGoals,
        shareAchievements: preferences.shareAchievements,
        allowFriendRequests: preferences.allowFriendRequests,
        showInSearch: preferences.showInSearch,
        createdAt: preferences.createdAt,
        updatedAt: preferences.updatedAt,
      };

      return serverMessage(res, "DATA_SHARING_PREFERENCES_RETRIEVED", data);
    } catch (error) {
      console.error("Error getting data sharing preferences:", error);
      return serverMessage(
        res,
        "DATA_SHARING_PREFERENCES_RETRIEVAL_FAILED",
        error.message
      );
    }
  },

  /**
   * Mettre à jour les préférences de partage de l'utilisateur connecté
   */
  updateMyDataSharingPreferences: async (req, res) => {
    try {
      const userId = req.user.id;
      const updates = req.body;

      // Validation des champs autorisés
      const allowedFields = [
        "enabled",
        "shareNutrition",
        "shareActivities",
        "shareGoals",
        "shareAchievements",
        "allowFriendRequests",
        "showInSearch",
      ];

      const validUpdates = {};
      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          validUpdates[field] = updates[field];
        }
      }

      // Trouver ou créer les préférences
      const [preferences, created] = await DataSharingPreferences.findOrCreate({
        where: { user_id: userId },
        defaults: { user_id: userId, ...validUpdates },
      });

      if (!created) {
        // Mettre à jour les préférences existantes
        await preferences.update(validUpdates);
      }

      const updatedPreferences = await DataSharingPreferences.findOne({
        where: { user_id: userId },
        include: [
          {
            model: Users,
            as: "user",
            attributes: ["id", "fname", "lname", "email"],
          },
        ],
      });

      return serverMessage(
        res,
        "DATA_SHARING_PREFERENCES_UPDATED",
        updatedPreferences
      );
    } catch (error) {
      console.error("Error updating data sharing preferences:", error);
      return serverMessage(
        res,
        "DATA_SHARING_PREFERENCES_UPDATE_FAILED",
        error.message
      );
    }
  },

  /**
   * Récupérer les préférences de partage d'un utilisateur spécifique (pour les admins)
   */
  getUserDataSharingPreferences: async (req, res) => {
    try {
      const { userId } = req.params;

      // Vérifier les permissions (seulement l'utilisateur lui-même ou un admin)
      if (
        req.user.id !== userId &&
        req.user.role !== "ADMIN" &&
        req.user.role !== "SUPER_ADMIN"
      ) {
        return serverMessage(res, "UNAUTHORIZED_ACCESS");
      }

      const preferences = await DataSharingPreferences.findOne({
        where: { user_id: userId },
        include: [
          {
            model: Users,
            as: "user",
            attributes: ["id", "fname", "lname", "email"],
          },
        ],
      });

      if (!preferences) {
        return serverMessage(res, "DATA_SHARING_PREFERENCES_NOT_FOUND");
      }

      return serverMessage(
        res,
        "DATA_SHARING_PREFERENCES_RETRIEVED",
        preferences
      );
    } catch (error) {
      console.error("Error getting user data sharing preferences:", error);
      return serverMessage(
        res,
        "DATA_SHARING_PREFERENCES_RETRIEVAL_FAILED",
        error.message
      );
    }
  },

  /**
   * Vérifier si un utilisateur autorise les demandes d'amis
   * Utilitaire pour les autres contrôleurs
   */
  //   checkIfUserAllowsFriendRequests: async (userId) => {
  //     try {
  //       const preferences = await DataSharingPreferences.findOne({
  //         where: { user_id: userId },
  //       });

  //       // Si aucune préférence n'existe, autoriser par défaut
  //       if (!preferences) {
  //         return true;
  //       }

  //       return preferences.allowFriendRequests;
  //     } catch (error) {
  //       console.error("Error checking friend requests allowance:", error);
  //       // En cas d'erreur, autoriser par défaut pour ne pas bloquer les fonctionnalités
  //       return true;
  //     }
  //   },

  /**
   * Vérifier si un utilisateur est visible dans les recherches
   */
  //   checkIfUserVisibleInSearch: async (userId) => {
  //     try {
  //       const preferences = await DataSharingPreferences.findOne({
  //         where: { user_id: userId },
  //       });

  //       if (!preferences) {
  //         return true;
  //       }

  //       return preferences.showInSearch;
  //     } catch (error) {
  //       console.error("Error checking user visibility:", error);
  //       return true;
  //     }
  //   },

  /**
   * Réinitialiser les préférences aux valeurs par défaut
   */
  resetToDefault: async (req, res) => {
    try {
      const userId = req.user.id;

      await DataSharingPreferences.destroy({
        where: { user_id: userId },
      });

      const defaultPreferences = await DataSharingPreferences.create({
        user_id: userId,
        // Les valeurs par défaut sont définies dans le modèle
      });

      const data = {
        enabled: defaultPreferences.enabled,
        shareNutrition: defaultPreferences.shareNutrition,
        shareActivities: defaultPreferences.shareActivities,
        shareGoals: defaultPreferences.shareGoals,
        shareAchievements: defaultPreferences.shareAchievements,
        allowFriendRequests: defaultPreferences.allowFriendRequests,
        showInSearch: defaultPreferences.showInSearch,
        createdAt: defaultPreferences.createdAt,
        updatedAt: defaultPreferences.updatedAt,
      };

      return serverMessage(res, "DATA_SHARING_PREFERENCES_RESET", data);
    } catch (error) {
      console.error("Error resetting data sharing preferences:", error);
      return serverMessage(
        res,
        "DATA_SHARING_PREFERENCES_RESET_FAILED",
        error.message
      );
    }
  },
};
