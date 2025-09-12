const { serverMessage } = require("../../utils");
const {
  Users,
  Profiles,
  ActivityData,
  ChatMessages,
  Suggestion,
  UserStats,
  Goal,
  PersonalRecord,
  Achievement,
  NutritionGoals,
  DailyNutrition,
} = require("./../../models");
const askAI = require("../../services/askAI");

const { Op } = require("sequelize");

const suggestionService = require("../../services/components/SuggestionService");

module.exports = {
  sendMessage: async (req, res) => {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message) {
      return serverMessage(res, "MESSAGE_TEXT_REQUIRED");
    }

    try {
      // Sauvegarder d'abord le nouveau message utilisateur
      const userMessage = await ChatMessages.create({
        user_id: userId,
        message_content: message,
        sender: "user",
        message_type: "text",
      });

      // Récupérer les derniers messages de la conversation
      const previousMessages = await ChatMessages.findAll({
        where: { user_id: userId },
        order: [["created_at", "DESC"]],
        limit: 20,
      });

      const orderedMessages = [...previousMessages].reverse();

      // Récupérer les données utilisateur complètes
      const userContext = await getUserData(userId);

      // Construire l'historique des messages pour OpenAI
      const messagesHistory = orderedMessages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.message_content,
      }));

      const aiReply = await askAI(message, userContext, messagesHistory);

      const botMessage = await ChatMessages.create({
        user_id: userId,
        message_content: aiReply,
        sender: "bot",
        message_type: "text",
      });

      const data = {
        id: botMessage.id,
        type: botMessage.message_type,
        message: aiReply,
        sender: botMessage.sender,
      };
      return serverMessage(res, "MESSAGE_SEND_SUCCESS", data);
    } catch (err) {
      console.error("Erreur IA coach:", err);
      return serverMessage(res, "ERROR_SENDING_MESSAGE");
    }
  },
  getChatMessage: async (req, res) => {
    try {
      const userId = req.user.id;

      const chatHistory = await ChatMessages.findAll({
        where: { user_id: userId },
        order: [["created_at", "ASC"]],
      });

      // Map to MessageCoachIA schema if needed, or return raw data
      const formattedHistory = chatHistory.map((msg) => ({
        id: msg.id,
        type: msg.message_type,
        message: msg.message_content,
        sender: msg.sender,
        metadata: msg.metadata, // Include metadata if present
        createdAt: msg.created_at,
      }));

      return serverMessage(res, "MESSAGES_RETRIEVED", formattedHistory);
    } catch (err) {
      console.error(
        "Erreur lors de la récupération de l'historique du chat:",
        err.message
      );
      return serverMessage(res, "ERROR_RETRIEVING_MESSAGES");
    }
  },
  // Obtenir des suggestions de motivation
  getMotivation: async (req, res) => {
    try {
      const userId = req.user.id;
      // const userData = await getUserData(userId);

      // const motivation = await generateAthleteSuggestions(
      //   userData,
      //   "motivation"
      // );

      const { frequency = "daily" } = req.query;

      const motivation = await suggestionService.getSuggestion(
        userId,
        "motivation",
        frequency
      );

      // if (motivation.error) {
      //   console.log({ error: motivation.error });

      //   return serverMessage(res, "ERROR_GETTING_MOTIVATION");
      // }

      if (!motivation) {
        return serverMessage(res, "NO_MOTIVATION_FOUND");
      }
      return serverMessage(res, "SUCCESS", motivation);
    } catch (error) {
      console.error("Erreur contrôleur motivation:", error);
      return serverMessage(res, "ERROR_GETTING_MOTIVATION");
    }
  },

  // Obtenir des suggestions d'entraînement
  getWorkoutSuggestions: async (req, res) => {
    try {
      const userId = req.user.id;
      // const userData = await getUserData(userId);

      // const workouts = await generateAthleteSuggestions(userData, "workout");

      const { frequency = "daily" } = req.query;

      const workouts = await suggestionService.getSuggestion(
        userId,
        "workout",
        frequency
      );
      // if (workouts.error) {
      //   res.status(500).json({ error: workouts.error });
      //   return serverMessage(res, "ERROR_GETTING_WORKOUT");
      // }

      if (!workouts || workouts.lenght === 0) {
        return serverMessage(res, "NO_WORKOUTS_FOUND");
      }

      return serverMessage(res, "SUCCESS", workouts);
    } catch (error) {
      console.error("Erreur contrôleur workouts:", error.message);
      return serverMessage(res, "ERROR_GETTING_WORKOUT");
    }
  },

  // Obtenir des plans d'entraînement
  getTrainingPlans: async (req, res) => {
    try {
      const userId = req.user.id;
      // const userData = await getUserData(userId);

      // const plans = await generateAthleteSuggestions(userData, "plan");

      // if (plans.error) {
      //   return serverMessage(res, "ERROR_GETTING_TRAINING_PLANT");
      // }

      const { frequency = "daily" } = req.query;

      const plans = await suggestionService.getSuggestion(
        userId,
        "plan",
        frequency
      );

      if (!plans || plans.lenght === 0) {
        return serverMessage(res, "NO_PLANTS_FOUND");
      }

      return serverMessage(res, "SUCCESS", plans);
    } catch (error) {
      console.error("Erreur contrôleur plans:", error.message);
      return serverMessage(res, "ERROR_GETTING_TRAINING_PLANT");
    }
  },

  // Obtenir des conseils nutritionnels
  getNutritionTips: async (req, res) => {
    try {
      const userId = req.user.id;
      // const userData = await getUserData(userId);

      // const nutrition = await generateAthleteSuggestions(userData, "nutrition");

      // if (nutrition.error) {
      //   return serverMessage(res, "GETTING_NUTRITION_FAILED");
      // }

      const { frequency = "daily" } = req.query;

      const nutrition = await suggestionService.getSuggestion(
        userId,
        "nutrition",
        frequency
      );

      if (!nutrition) {
        return serverMessage(res, "NO_NUTRITION_FOUND");
      }

      return serverMessage(res, "SUCCESS", nutrition);
    } catch (error) {
      console.error("Erreur contrôleur nutrition:", error.message);
      return serverMessage(res, "GETTING_NUTRITION_FAILED");
    }
  },

  // Obtenir toutes les suggestions
  getAllSuggestions: async (req, res) => {
    try {
      const userId = req.user.id;
      // const userData = await getUserData(userId);

      // const [motivation, workouts, plans, nutrition] = await Promise.all([
      //   generateAthleteSuggestions(userData, "motivation"),
      //   generateAthleteSuggestions(userData, "workout"),
      //   generateAthleteSuggestions(userData, "plan"),
      //   generateAthleteSuggestions(userData, "nutrition"),
      // ]);

      // if (!motivation && !workouts && !plans && !nutrition) {
      //   return serverMessage(res, "NO_SUGGESTIONS_FOUND");
      // }

      const { frequency = "daily" } = req.query;

      const suggestions = await suggestionService.getSuggestion(
        userId,
        "motivation",
        frequency
      );

      if (!suggestions || Object.keys(suggestions).length === 0) {
        return serverMessage(res, "NO_SUGGESTIONS_FOUND");
      }
      return serverMessage(res, "SUCCESS", {
        suggestions,
      });
    } catch (error) {
      console.error("Erreur contrôleur toutes suggestions:", error);
      return serverMessage(res, "GETTTING_ALL_SUGGESTION_FAILED");
    }
  },
  regenerateSuggestions: async (req, res) => {
    try {
      const userId = req.user.id;
      const { type, frequency = "daily" } = req.body;

      // Désactiver les anciennes suggestions
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

      // Générer de nouvelles suggestions
      const newSuggestion = await suggestionService.generateAndSaveSuggestion(
        userId,
        type,
        frequency
      );

      return serverMessage(res, "SUCCESS", newSuggestion.content);
    } catch (error) {
      console.error("Erreur régénération suggestions:", error);
      return serverMessage(res, "REGENERATION_FAILED");
    }
  },
};

// Fonction pour récupérer les données utilisateur complètes
// Fonction pour récupérer les données utilisateur complètes
async function getUserData(userId) {
  try {
    // Récupérer les données de base de l'utilisateur
    const user = await Users.findByPk(userId, {
      include: [
        {
          model: Profiles,
          as: "profile",
          attributes: ["fname", "lname", "bio", "lang", "image"],
        },
      ],
    });

    if (!user) {
      console.error("Utilisateur non trouvé:", userId);
      return {};
    }

    // Récupérer les autres données séparément avec des vérifications
    let stats,
      goals,
      achievements,
      recentActivities,
      personalRecords,
      nutritionGoals,
      todayNutrition;

    try {
      stats = await UserStats.findOne({ where: { user_id: userId } });
    } catch (error) {
      console.error("Erreur récupération UserStats:", error.message);
      stats = null;
    }

    try {
      goals = await Goal.findAll({
        where: { user_id: userId, isActive: true },
        attributes: [
          "title",
          "category",
          "target",
          "current",
          "progressPercentage",
          "deadline",
          "unit",
        ],
      });
    } catch (error) {
      console.error("Erreur récupération Goals:", error.message);
      goals = [];
    }

    try {
      achievements = await Achievement.findAll({
        where: { user_id: userId, earnedDate: { [Op.not]: null } },
        attributes: ["title", "category", "points", "earnedDate"],
        order: [["earnedDate", "DESC"]],
        limit: 5,
      });
    } catch (error) {
      console.error("Erreur récupération Achievement:", error.message);
      achievements = [];
    }

    try {
      recentActivities = await ActivityData.findAll({
        where: { user_id: userId },
        order: [["date", "DESC"]],
        limit: 10,
      });
    } catch (error) {
      console.error("Erreur récupération ActivityData:", error.message);
      recentActivities = [];
    }

    try {
      personalRecords = await PersonalRecord.findAll({
        where: { user_id: userId },
        order: [["date", "DESC"]],
        limit: 5,
      });
    } catch (error) {
      console.error("Erreur récupération PersonalRecord:", error.message);
      personalRecords = [];
    }

    try {
      nutritionGoals = await NutritionGoals.findOne({
        where: { user_id: userId },
      });
    } catch (error) {
      console.error("Erreur récupération NutritionGoals:", error.message);
      nutritionGoals = null;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      todayNutrition = await DailyNutrition.findOne({
        where: {
          user_id: userId,
          date: today,
        },
      });
    } catch (error) {
      console.error("Erreur récupération DailyNutrition:", error.message);
      todayNutrition = null;
    }

    return {
      profile: user.profile
        ? {
            lang: user.profile.lang,
            fname: user.profile.fname,
            lname: user.profile.lname,
            bio: user.profile.bio,
            image: user.profile.image,
          }
        : {},
      stats: stats
        ? {
            level: stats.level || 1,
            experience: stats.experience || 0,
            points: stats.points || 0,
            streak_days: stats.streak_days || 0,
            weekly_distance: stats.weekly_distance || 0,
            average_pace: stats.average_pace || "0:00",
          }
        : {
            level: 1,
            experience: 0,
            points: 0,
            streak_days: 0,
            weekly_distance: 0,
            average_pace: "0:00",
          },
      goals: goals || [],
      achievements: achievements || [],
      activities: recentActivities.map((act) => ({
        title: act.title,
        type: act.type,
        distance: act.distance,
        duration: act.duration,
        date: act.date,
        metadata: act.metadata,
      })),
      personalRecords: personalRecords.map((pr) => ({
        distance: pr.distance,
        time: pr.time,
        date: pr.date,
        pace: pr.pace,
      })),
      nutrition: {
        goals: nutritionGoals || {},
        today: todayNutrition || {},
      },
    };
  } catch (error) {
    console.error("Erreur récupération données utilisateur:", error.message);
    return {};
  }
}
