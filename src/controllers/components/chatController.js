const { serverMessage } = require("../../utils");
const {
  Users,
  Profiles,
  ActivityData,
  ChatMessages,
} = require("./../../models");
const askAI = require("../../services/askAI");
const {
  getUserData,
  generateAthleteSuggestions,
} = require("../../services/coach");

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

      // Récupérer les derniers messages de la conversation (plus récents d'abord)
      const previousMessages = await ChatMessages.findAll({
        where: { user_id: userId },
        order: [["created_at", "DESC"]], // DESC pour avoir les plus récents en premier
        limit: 20,
      });

      // Inverser l'ordre pour avoir la conversation dans l'ordre chronologique
      const orderedMessages = [...previousMessages].reverse();

      const user = await Users.findByPk(userId, {
        include: [
          {
            model: Profiles,
            as: "profile",
            attributes: ["fname", "lname", "bio"],
          },
        ],
      });

      if (!user) {
        return serverMessage(res, "PROFILE_NOT_FOUND");
      }

      const recentActivities = await ActivityData.findAll({
        where: { user_id: userId },
        order: [["date", "DESC"]],
        limit: 10,
      });

      const userContext = {
        profile: {
          firstName: user.profile?.fname,
          lastName: user.profile?.lname,
          bio: user.profile?.bio,
          plan: user.subscriptions?.[0]?.plan?.name || "FREE",
        },
        activities: recentActivities.map((act) => ({
          title: act.title,
          type: act.type,
          distance: act.distance,
          duration: act.duration,
          date: act.date,
        })),
      };

      // Construire l'historique des messages pour OpenAI
      const messagesHistory = orderedMessages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.message_content,
      }));

      const aiReply = await askAI(message, userContext, messagesHistory);

      // console.log("aiReply: ", aiReply);

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
      const userData = await getUserData(userId, req.app.get("models"));

      const motivation = await generateAthleteSuggestions(
        userData,
        "motivation"
      );

      if (motivation.error) {
        console.log({ error: motivation.error });

        return serverMessage(res, "ERROR_GETTING_MOTIVATION");
      }

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
      const userData = await getUserData(userId, req.app.get("models"));

      const workouts = await generateAthleteSuggestions(userData, "workout");

      if (workouts.error) {
        res.status(500).json({ error: workouts.error });
        return serverMessage(res, "ERROR_GETTING_WORKOUT");
      }

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
      const userData = await getUserData(userId, req.app.get("models"));

      const plans = await generateAthleteSuggestions(userData, "plan");

      if (plans.error) {
        return serverMessage(res, "ERROR_GETTING_TRAINING_PLANT");
      }

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
      const userData = await getUserData(userId, req.app.get("models"));

      const nutrition = await generateAthleteSuggestions(userData, "nutrition");

      if (nutrition.error) {
        return serverMessage(res, "GETTING_NUTRITION_FAILED");
      }

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
      const userData = await getUserData(userId, req.app.get("models"));

      const [motivation, workouts, plans, nutrition] = await Promise.all([
        generateAthleteSuggestions(userData, "motivation"),
        generateAthleteSuggestions(userData, "workout"),
        generateAthleteSuggestions(userData, "plan"),
        generateAthleteSuggestions(userData, "nutrition"),
      ]);

      if (!motivation && !workouts && !plans && !nutrition) {
        return serverMessage(res, "NO_SUGGESTIONS_FOUND");
      }
      return serverMessage(res, "SUCCESS", {
        motivation,
        workouts,
        plans,
        nutrition,
      });
    } catch (error) {
      console.error("Erreur contrôleur toutes suggestions:", error);
      return serverMessage(res, "GETTTING_ALL_SUGGESTION_FAILED");
    }
  },
};
