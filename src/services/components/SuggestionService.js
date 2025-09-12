// services/suggestionService.js
const { Suggestion } = require("../../models");
const { generateAthleteSuggestions, getUserData } = require("../coach");
const { Op } = require("sequelize");

class SuggestionService {
  // Générer et sauvegarder une suggestion
  async generateAndSaveSuggestion(userId, type, frequency = "daily") {
    try {
      // Calculer la date d'expiration
      const expiresAt = this.calculateExpirationDate(frequency);

      // Vérifier si une suggestion valide existe déjà
      const existingSuggestion = await Suggestion.findOne({
        where: {
          user_id: userId,
          type: type,
          frequency: frequency,
          is_active: true,
          expires_at: { [Op.gt]: new Date() },
        },
      });

      if (existingSuggestion) {
        return existingSuggestion;
      }

      // Récupérer les données utilisateur
      const userData = await getUserData(userId);

      // Générer la nouvelle suggestion
      const suggestionContent = await generateAthleteSuggestions(
        userData,
        type
      );

      if (suggestionContent.error) {
        throw new Error(suggestionContent.error);
      }

      // Désactiver les anciennes suggestions du même type et fréquence
      await Suggestion.update(
        { is_active: false },
        {
          where: {
            user_id: userId,
            type: type,
            frequency: frequency,
          },
        }
      );

      // Sauvegarder la nouvelle suggestion
      const newSuggestion = await Suggestion.create({
        user_id: userId,
        type: type,
        frequency: frequency,
        content: suggestionContent,
        expires_at: expiresAt,
        generated_at: new Date(),
      });

      return newSuggestion;
    } catch (error) {
      console.error("Erreur génération suggestion:", error);
      throw error;
    }
  }

  // Récupérer une suggestion (génère si nécessaire)
  async getSuggestion(userId, type, frequency = "daily") {
    try {
      // Vérifier si une suggestion valide existe
      const existingSuggestion = await Suggestion.findOne({
        where: {
          user_id: userId,
          type: type,
          frequency: frequency,
          is_active: true,
          expires_at: { [Op.gt]: new Date() },
        },
      });

      if (existingSuggestion) {
        return existingSuggestion.content;
      }

      // Générer une nouvelle suggestion si aucune n'existe ou si elle est expirée
      const newSuggestion = await this.generateAndSaveSuggestion(
        userId,
        type,
        frequency
      );
      return newSuggestion.content;
    } catch (error) {
      console.error("Erreur récupération suggestion:", error);
      throw error;
    }
  }

  // Calculer la date d'expiration
  calculateExpirationDate(frequency) {
    const now = new Date();
    switch (frequency) {
      case "daily":
        return new Date(now.setDate(now.getDate() + 1));
      case "3days":
        return new Date(now.setDate(now.getDate() + 3));
      case "weekly":
        return new Date(now.setDate(now.getDate() + 7));
      default:
        return new Date(now.setDate(now.getDate() + 1));
    }
  }

  // Récupérer toutes les suggestions pour un utilisateur
  async getUserSuggestions(userId, frequency = "daily") {
    try {
      const suggestions = await Suggestion.findAll({
        where: {
          user_id: userId,
          frequency: frequency,
          is_active: true,
          expires_at: { [Op.gt]: new Date() },
        },
        order: [["generated_at", "DESC"]],
      });

      // Organiser par type
      const result = {
        motivation: null,
        workout: null,
        plan: null,
        nutrition: null,
      };

      suggestions.forEach((suggestion) => {
        result[suggestion.type] = suggestion.content;
      });

      // Générer les suggestions manquantes
      const types = ["motivation", "workout", "plan", "nutrition"];
      const generationPromises = [];

      for (const type of types) {
        if (!result[type]) {
          generationPromises.push(
            this.getSuggestion(userId, type, frequency)
              .then((content) => {
                result[type] = content;
              })
              .catch((error) => {
                console.error(`Erreur génération ${type}:`, error);
              })
          );
        }
      }

      await Promise.all(generationPromises);

      return result;
    } catch (error) {
      console.error("Erreur récupération suggestions utilisateur:", error);
      throw error;
    }
  }

  // Nettoyer les suggestions expirées
  async cleanupExpiredSuggestions() {
    try {
      await Suggestion.update(
        { is_active: false },
        {
          where: {
            expires_at: { [Op.lte]: new Date() },
            is_active: true,
          },
        }
      );
    } catch (error) {
      console.error("Erreur nettoyage suggestions:", error);
    }
  }
}

module.exports = new SuggestionService();
