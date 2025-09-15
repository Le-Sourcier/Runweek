// utils/suggestionGenerator.js
require("dotenv").config();
const openai = require("../config/openaiConfig");
const {
  Users,
  UserStats,
  Achievement,
  Goal,
  Profiles,
  ActivityData,
  SleepData,
  HeartRateData,
} = require("../models");

let lastCall = 0;

// Icônes de sports
const sportIcons = {
  running: "🏃‍♂️",
  walking: "🚶‍♀️",
  cycling: "🚴‍♂️",
  swimming: "🏊‍♂️",
  gym: "🏋️‍♀️",
  yoga: "🧘‍♂️",
  boxing: "🥊",
  martialArts: "🥋",
  football: "⚽",
  basketball: "🏀",
  tennis: "🎾",
  badminton: "🏸",
  tableTennis: "🏓",
  rugby: "🏉",
  volleyball: "🏐",
  golf: "⛳",
  archery: "🏹",
  skiing: "⛷️",
  snowboard: "🏂",
  skating: "⛸️",
  hiking: "🥾",
  rowing: "🚣‍♂️",
  diving: "🤿",
  skatingBoard: "🛹",
  climbing: "🧗‍♂️",
  handball: "🤾‍♂️",
  fencing: "🤺",
  lacrosse: "🥍",
  hockey: "🏒",
  billiards: "🎱",
};

// Fonction pour générer des suggestions personnalisées
async function generateAthleteSuggestions(userContext, suggestionType) {
  const now = Date.now();

  if (now - lastCall < 1000) {
    await new Promise((res) => setTimeout(res, 1000 - (now - lastCall)));
  }
  lastCall = Date.now();

  try {
    const activities = userContext.activities || [];
    const profile = userContext.profile || {};
    const goals = userContext.goals || [];
    const achievements = userContext.achievements || [];
    const stats = userContext.stats || {};
    const sleepData = userContext.sleepData || [];
    const heartRateData = userContext.heartRateData || [];

    // Formater les activités récentes
    const activityLines = activities
      .slice(0, 10)
      .map((act) => {
        const icon = sportIcons[act.type] || "🏅";
        let line = `${icon} ${
          new Date(act.date).toISOString().split("T")[0]
        } : ${act.title || act.type}`;
        if (act.duration) line += `, Durée: ${act.duration} min`;
        if (act.distance) line += `, Distance: ${act.distance} km`;
        if (act.calories) line += `, Calories: ${act.calories}`;
        return line;
      })
      .join("\n");

    // Formater les objectifs
    const goalLines = goals
      .slice(0, 5)
      .map((goal) => {
        const progress =
          goal.current && goal.target
            ? Math.round((goal.current / goal.target) * 100)
            : 0;
        return `- ${goal.title}: ${progress}% complété (${goal.current || 0}/${
          goal.target
        } ${goal.unit})`;
      })
      .join("\n");

    // Formater les réalisations
    const achievementLines = achievements
      .slice(0, 5)
      .map(
        (ach) =>
          `- ${ach.title}: ${new Date(ach.earnedDate).toLocaleDateString()}`
      )
      .join("\n");

    // Analyser les données de sommeil
    const recentSleep = sleepData.slice(0, 7);
    const avgSleep =
      recentSleep.length > 0
        ? Math.round(
            recentSleep.reduce(
              (sum, sleep) => sum + sleep.totalSleepMinutes,
              0
            ) / recentSleep.length
          )
        : 0;

    // Analyser la fréquence cardiaque
    const recentHR = heartRateData.slice(0, 20);
    const avgRestingHR =
      recentHR.length > 0
        ? Math.round(
            recentHR
              .filter((hr) => hr.context === "resting")
              .reduce((sum, hr) => sum + hr.heartRate, 0) /
              recentHR.filter((hr) => hr.context === "resting").length
          )
        : 0;

    const contextString = `
      Informations sur l'athlète :
      - Langue de preference : ${profile.lang}
      - Nom : ${profile.fname || ""} ${profile.lname || ""}
      - Objectifs : ${profile.bio || "Non spécifié"}
      - Niveau : ${profile.level || "Non spécifié"}
      - Points : ${stats.points || 0}
      - Niveau : ${stats.level || 1}
      - Expérience : ${stats.experience || 0}
      - Distance hebdomadaire : ${stats.weekly_distance || 0} km
      - Jours de suite : ${stats.streak_days || 0}
      - Allure moyenne : ${stats.average_pace || "0:00"}
      NB: Utilise le language par defaut (celui choisis par l'athlète sauf dans le cas ou il ecrit dans un autre language specifique ou il decide que la conversation ai lieu dans un language de son choix).
      
      Sommeil récent (moyenne) : ${Math.floor(avgSleep / 60)}h${
      avgSleep % 60
    }min
      Fréquence cardiaque au repos : ${avgRestingHR || "N/A"} bpm
      
      Objectifs actuels :
      ${goalLines || "Aucun objectif en cours"}
      
      Réalisations récentes :
      ${achievementLines || "Aucune réalisation récente"}
      
      Activités récentes (10 dernières) :
      ${activityLines || "Aucune activité enregistrée récemment."}
    `;

    // Définir le prompt en fonction du type de suggestion
    let systemPrompt = "";
    let maxTokens = 300;

    switch (suggestionType) {
      case "motivation":
        systemPrompt = `
    Vous êtes Coach RunWeek, un assistant de coaching sportif motivant.
    
    Tâche : Créez un message de motivation personnalisé pour cet athlète.
    
    Format de réponse JSON :
    {
      "message": "Votre message de motivation ici avec des emojis"
    }
    
    Règles :
    - Ton : Energique, positif et personnalisé
    - 2-3 phrases maximum
    - Référence aux activités récentes, objectifs ou réalisations
    - 1-2 emojis pertinents
    - Proposition d'une action concrète pour la journée
  `;
        userPrompt = `Génère un message de motivation en format JSON basé sur ce contexte: ${contextString}`;
        maxTokens = 150;
        break;

      case "workout":
        systemPrompt = `
          Vous êtes Coach RunWeek, un expert en entraînement sportif.
          
          Tâche : Proposez 2-3 suggestions d'entraînement personnalisées pour cet athlète.
          
          IMPORTANT : Vous DEVEZ répondre en format JSON valide uniquement.

          Format de réponse JSON :
          {
            "suggestions": [
              {
                "title": "Titre accrocheur",
                "description": "Description concise",
                "type": "cardio/force/récupération/endurance",
                "duration": "Durée estimée",
                "intensity": "faible/moyen/élevé",
                "icon": "emoji pertinent"
              }
            ]
          }
          
          Règles :
          - Basé sur les activités récentes, objectifs et niveau de l'athlète
          - Varier les types d'entraînement
          - Adapter à la condition physique (sommeil, fréquence cardiaque)
          - Maximum 3 suggestions
          
          Contexte :
          ${contextString}
        `;
        maxTokens = 400;
        break;

      case "plan":
        systemPrompt = `
          Vous êtes Coach RunWeek, un créateur de plans d'entraînement.
          
          Tâche : Proposez 2-3 plans d'entraînement personnalisés pour cet athlète.
          
          Format de réponse JSON :
          {
            "plans": [
              {
                "title": "Titre du plan",
                "duration": "4 semaines",
                "level": "débutant/intermédiaire/avancé",
                "description": "Description concise",
                "goal": "Objectif principal",
                "frequency": "3-4 fois/semaine",
                "icon": "emoji pertinent"
              }
            ]
          }
          
          Règles :
          - Adapter aux objectifs et niveau de l'athlète
          - Proposer différents types de plans
          - Tenir compte des réalisations et activités passées
          - Maximum 3 plans
          
          Contexte :
          ${contextString}
        `;
        maxTokens = 450;
        break;
      case "advices":
        systemPrompt = `
    Vous êtes Coach RunWeek, un expert en conseils sportifs personnalisés.
    
    Tâche : Donnez 2-3 conseils personnalisés pour améliorer la performance de cet athlète.
    
    IMPORTANT : Vous DEVEZ répondre en format JSON valide uniquement.

    Format de réponse JSON :
    {
      "advices": [
        {
          "title": "Titre du conseil",
          "description": "Description détaillée du conseil",
          "category":"technique"|"training"|"recovery"|"mental"|"equipment",
          "priority": "low"|"medium"|"high",
          "icon": "emoji pertinent",
          "actionSteps": ["étape 1", "étape 2", "étape 3"]
        }
      ]
    }
    
    Règles :
    - Basé sur l'analyse des activités récentes, objectifs et données physiologiques
    - Proposer des conseils pratiques et actionnables
    - Adapter au niveau et à l'expérience de l'athlète
    - Tenir compte des données de sommeil et fréquence cardiaque
    - Maximum 3 conseils avec priorités variées
    - Inclure des étapes d'action concrètes
    
    Catégories possibles :
    - technique : amélioration de la forme, posture, technique
    - entraînement : planification, variété, intensité
    - récupération : sommeil, nutrition, hydratation
    - mental : motivation, concentration, gestion du stress
    - équipement : choix des chaussures, vêtements, accessoires
    
    Contexte :
    ${contextString}
  `;
        maxTokens = 500;
        break;

      case "nutrition":
        systemPrompt = `
          Vous êtes Coach RunWeek, un expert en nutrition sportive.
          
          Tâche : Proposez 2-3 conseils nutritionnels personnalisés pour cet athlète.
          
          Format de réponse JSON :
          {
            "tips": [
              {
                "title": "Titre du conseil",
                "description": "Description détaillée",
                "category": "hydration/alimentation/récupération",
                "icon": "emoji pertinent"
              }
            ]
          }
          
          Règles :
          - Basé sur les activités récentes et objectifs
          - Tenir compte des dépenses énergétiques
          - Conseils pratiques et réalisables
          - Maximum 3 conseils
          
          Contexte :
          ${contextString}
        `;
        maxTokens = 350;
        break;

      default:
        throw new Error("Type de suggestion non reconnu");
    }

    const messages = [
      {
        role: "system",
        content: systemPrompt.trim(),
      },
    ];

    const chatCompletion = await openai.chat.completions.create({
      model:
        process.env.isChatGPT === "true"
          ? "gpt-3.5-turbo-0125"
          : "deepseek-chat",
      messages: messages,
      temperature: 0.7,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
    });

    let response = chatCompletion.choices[0].message.content;

    try {
      return JSON.parse(response);
    } catch (e) {
      console.error("Erreur de parsing JSON:", e);
      return { error: "Erreur de format de réponse" };
    }
  } catch (error) {
    if (error.status === 429) {
      console.error("Erreur IA : limite de quota atteinte");
      return { error: "Service temporairement indisponible" };
    }

    console.error("Erreur technique du coach :", error);
    return { error: "Erreur de génération de suggestions" };
  }
}

// Fonction pour obtenir les données utilisateur complètes
async function getUserData(userId) {
  try {
    const user = await Users.findByPk(userId, {
      include: [
        {
          model: Profiles,
          as: "profile",
          attributes: ["fname", "lname", "bio"],
        },
        {
          model: UserStats,
          as: "stats",
          attributes: [
            "points",
            "level",
            "experience",
            "weekly_distance",
            "streak_days",
            "average_pace",
          ],
        },
        {
          model: Goal,
          as: "goals",
          where: { isActive: true },
          required: false,
          attributes: [
            "id",
            "title",
            "description",
            "category",
            "target",
            "current",
            "unit",
            "deadline",
            "progressPercentage",
          ],
        },
        {
          model: Achievement,
          as: "achievements",
          order: [["earnedDate", "DESC"]],
          limit: 10,
          required: false,
          attributes: [
            "id",
            "title",
            "description",
            "earnedDate",
            "points",
            "rarity",
          ],
        },
        {
          model: ActivityData,
          as: "activity_data",
          order: [["date", "DESC"]],
          limit: 10,
          required: false,
          attributes: [
            "id",
            "date",
            "steps",
            "distance",
            "calories",
            "activeMinutes",
          ],
        },
        {
          model: SleepData,
          as: "sleepData",
          order: [["date", "DESC"]],
          limit: 7,
          required: false,
          attributes: [
            "id",
            "date",
            "totalSleepMinutes",
            "deepSleepMinutes",
            "sleepQuality",
          ],
        },
        {
          model: HeartRateData,
          as: "heartRateData",
          order: [["timestamp", "DESC"]],
          limit: 20,
          required: false,
          attributes: ["id", "timestamp", "heartRate", "context"],
        },
      ],
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    return {
      profile: user.profile,
      activities: user.activity_data,
      goals: user.goals,
      achievements: user.achievements,
      stats: user.stats,
      sleepData: user.sleepData,
      heartRateData: user.heartRateData,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    throw error;
  }
}

module.exports = {
  generateAthleteSuggestions,
  getUserData,
};
