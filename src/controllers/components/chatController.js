const { serverMessage } = require("../../utils");
const { Users, Profiles, Activities, ChatMessages } = require("./../../models");
const askAI = require("../../services/askAI");

module.exports = {
  sendMessage: async (req, res) => {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message) {
      return serverMessage(res, "BAD_REQUEST");
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
      return serverMessage(res, "SUCCESS", data);
    } catch (err) {
      console.error("Erreur IA coach:", err);
      return serverMessage(res, "INTERNAL_SERVER_ERROR");
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

      return serverMessage(res, "SUCCESS", formattedHistory);
    } catch (err) {
      console.error(
        "Erreur lors de la récupération de l'historique du chat:",
        err.message
      );
      return serverMessage(res, "INTERNAL_SERVER_ERROR");
    }
  },
  workOut: async (req, res) => {
    const userId = req.user.id;

    try {
      const user = await Users.findByPk(userId, {
        include: [
          {
            model: Profiles,
            as: "profile",
            attributes: ["fname", "lname", "bio"],
          },
          {
            model: Subscriptions,
            as: "subscriptions",
            where: { is_active: true },
            required: false,
            include: [
              {
                model: Plans,
                as: "plan",
                attributes: ["name"],
              },
            ],
          },
        ],
      });

      if (!user) {
        return res.status(404).json({
          error: true,
          status: 404,
          message: "PROFILE_NOT_FOUND",
          data: {},
        });
      }

      const recentActivities = await Activities.findAll({
        where: { user_id: userId },
        order: [["date", "DESC"]],
        limit: 5,
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

      const aiPrompt = `
Tu es un coach de course et fitness.  
En te basant sur ces données utilisateur :  
${JSON.stringify(userContext, null, 2)}  

Suggère **3 à 5 workouts personnalisés** au format JSON suivant :  
- title : nom court en français
- description : distance/intensité brève
- icon : mot-clé pour l'icône ("footsteps", "heart", "dumbbell", etc.)
Réponds UNIQUEMENT avec le JSON valide, sans texte autour.
        `;

      const aiResponse = await askAI(aiPrompt, userContext);

      let workouts;
      try {
        workouts = JSON.parse(aiResponse);
      } catch (err) {
        console.error("Erreur parsing JSON IA:", err.message);
        return res.status(500).json({
          error: true,
          status: 500,
          message: "INTERNAL_SERVER_ERROR",
          data: { error: "Réponse IA invalide." },
        });
      }

      const standardizedWorkouts = Array.isArray(workouts)
        ? workouts
        : [workouts];

      for (const workout of standardizedWorkouts) {
        await ChatMessages.create({
          user_id: userId,
          message_content: `${workout.title}: ${workout.description}`,
          sender: "bot",
          message_type: "recommandation",
          metadata: {
            icon: workout.icon,
            originalData: workout,
          },
        });
      }

      return res.status(200).json({
        error: false,
        status: 200,
        message: "SUCCESS",
        data: standardizedWorkouts.map((workout) => ({
          id: generateId(),
          type: "recommandation",
          message: `${workout.title}: ${workout.description}`,
          sender: "bot",
          metadata: {
            icon: workout.icon,
            originalData: workout,
          },
        })),
      });
    } catch (err) {
      console.error("Erreur IA coach workouts:", err.message);
      return res.status(500).json({
        error: true,
        status: 500,
        message: "INTERNAL_SERVER_ERROR",
        data: { error: "Erreur interne du coach IA." },
      });
    }
  },

  runningPlan: async (req, res) => {
    const { goal, level } = req.body;
    const userId = req.user.id;

    if (!goal || !level) {
      return res.status(400).json({
        error: true,
        status: 400,
        message: "BAD_REQUEST",
        data: { error: "Le but et le niveau sont requis." },
      });
    }

    try {
      const user = await Users.findByPk(userId, {
        include: [{ model: Profiles, as: "profile", attributes: ["fname"] }],
      });

      const aiPrompt = `
        Tu es un coach de course expert.
        Crée un plan de course hebdomadaire (7 jours) pour un utilisateur avec les caractéristiques suivantes :
        - Nom: ${user.profile?.fname || "Utilisateur"}
        - Objectif: ${goal}
        - Niveau: ${level}

        Le plan doit inclure une variété de séances : sorties longues, fractionnés, courses de récupération et jours de repos.

        Réponds UNIQUEMENT avec un objet JSON valide contenant une clé "weekly_plan".
        "weekly_plan" doit être un tableau de 7 objets, un pour chaque jour.
        Chaque objet doit avoir les champs suivants :
        - day: (e.g., "Lundi")
        - title: (e.g., "Course de récupération", "Fractionné", "Repos")
        - description: (e.g., "30 min à allure lente", "2x10 min à allure 10km", "Étirements légers")
        - icon: (e.g., "footsteps", "heart", "dumbbell", "rest")
        `;

      const aiResponse = await askAI(aiPrompt, {});

      let plan;
      try {
        plan = JSON.parse(aiResponse);
      } catch (err) {
        console.error("Erreur parsing JSON IA pour le plan:", err.message);
        return res.status(500).json({
          error: true,
          status: 500,
          message: "INVALID_AI_RESPONSE",
          data: { error: "Réponse IA invalide." },
        });
      }

      const weeklyPlan = Array.isArray(plan.weekly_plan)
        ? plan.weekly_plan
        : [];

      for (const dayPlan of weeklyPlan) {
        await ChatMessages.create({
          user_id: userId,
          message_content: `${dayPlan.day} - ${dayPlan.title}: ${dayPlan.description}`,
          sender: "bot",
          message_type: "advices",
          metadata: {
            icon: dayPlan.icon,
            day: dayPlan.day,
          },
        });
      }

      return res.status(200).json({
        error: false,
        status: 200,
        message: "SUCCESS",
        data: weeklyPlan.map((dayPlan) => ({
          id: generateId(),
          type: "advices",
          message: `${dayPlan.day} - ${dayPlan.title}: ${dayPlan.description}`,
          sender: "bot",
          metadata: {
            icon: dayPlan.icon,
            day: dayPlan.day,
          },
        })),
      });
    } catch (err) {
      console.error("Erreur IA coach running plan:", err.message);
      return res.status(500).json({
        error: true,
        status: 500,
        message: "INTERNAL_SERVER_ERROR",
        data: { error: "Erreur interne du coach IA." },
      });
    }
  },
  recommandation: async (req, res) => {
    const userId = req.user.id;

    try {
      const user = await Users.findByPk(userId, {
        include: [
          {
            model: Profiles,
            as: "profile",
            attributes: ["fname", "lname", "bio"],
          },
          {
            model: Subscriptions,
            as: "subscriptions",
            where: { is_active: true },
            required: false,
            include: [{ model: Plans, as: "plan", attributes: ["name"] }],
          },
        ],
      });

      const recentActivities = await Activities.findAll({
        where: { user_id: userId },
        order: [["date", "DESC"]],
        limit: 5,
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

      const aiPrompt = `
        Tu es un coach de fitness et de bien-être holistique.
        En te basant sur le profil et les activités récentes de l'utilisateur suivant:
        ${JSON.stringify(userContext, null, 2)}

        Génère 3 à 5 recommandations personnalisées et actionnables.
        Les recommandations peuvent porter sur la nutrition, la récupération, l'équipement, la motivation, ou d'autres aspects pertinents.

        Réponds UNIQUEMENT avec un objet JSON valide contenant une clé "recommendations".
        "recommendations" doit être un tableau d'objets.
        Chaque objet doit avoir les champs suivants :
        - title: Titre court et accrocheur
        - description: Conseil détaillé (2-3 phrases)
        - category: (e.g., "Nutrition", "Récupération", "Équipement", "Motivation")
        `;

      const aiResponse = await askAI(aiPrompt, userContext);

      let recommendations;
      try {
        recommendations = JSON.parse(aiResponse);
      } catch (err) {
        console.error(
          "Erreur parsing JSON IA pour les recommandations:",
          err.message
        );
        return res.status(500).json({
          error: true,
          status: 500,
          message: "Réponse IA invalide.",
        });
      }

      const recs = Array.isArray(recommendations.recommendations)
        ? recommendations.recommendations
        : [];

      for (const rec of recs) {
        await db.ChatMessages.create({
          user_id: userId,
          message_content: `${rec.title} (${rec.category}): ${rec.description}`,
          sender: "bot",
          message_type: "recommandation",
          metadata: {
            category: rec.category,
          },
        });
      }

      return res.status(200).json({
        error: false,
        status: 200,
        message: "SUCCESS",
        data: recs.map((rec) => ({
          id: generateId(),
          type: "recommandation",
          message: `${rec.title} (${rec.category}): ${rec.description}`,
          sender: "bot",
          metadata: {
            category: rec.category,
          },
        })),
      });
    } catch (err) {
      console.error("Erreur IA coach recommendations:", err.message);
      return res.status(500).json({
        error: true,
        status: 500,
        message: "INTERNAL_SERVER_ERROR",
        data: { error: "Erreur interne du coach IA." },
      });
    }
  },
};
