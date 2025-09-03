// utils/suggestionGenerator.js
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG,
});

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
      - Nom : ${profile.fname || ""} ${profile.lname || ""}
      - Objectifs : ${profile.bio || "Non spécifié"}
      - Niveau : ${profile.level || "Non spécifié"}
      - Points : ${stats.points || 0}
      - Niveau : ${stats.level || 1}
      - Expérience : ${stats.experience || 0}
      - Distance hebdomadaire : ${stats.weekly_distance || 0} km
      - Jours de suite : ${stats.streak_days || 0}
      - Allure moyenne : ${stats.average_pace || "0:00"}
      
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
          
          Tâche : Créez un message de motivation personnalisé pour cet athlète en vous basant sur ses activités récentes, objectifs et performances.
          
          Caractéristiques :
          - Ton : Energique, positif et personnalisé
          - Longueur : 2-3 phrases maximum
          - Faites référence à ses activités récentes, objectifs ou réalisations
          - Inclure 1-2 emojis pertinents
          - Proposez une petite action concrète pour la journée
          
          Contexte :
          ${contextString}
        `;
        maxTokens = 150;
        break;

      case "workout":
        systemPrompt = `
          Vous êtes Coach RunWeek, un expert en entraînement sportif.
          
          Tâche : Proposez 2-3 suggestions d'entraînement personnalisées pour cet athlète.
          
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
      model: "gpt-3.5-turbo-0125",
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
async function getUserData(userId, models) {
  try {
    const user = await models.Users.findByPk(userId, {
      include: [
        {
          model: models.Profiles,
          as: "profile",
          attributes: ["fname", "lname", "bio", "level"],
        },
        {
          model: models.UserStats,
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
          model: models.Goal,
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
          model: models.Achievement,
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
          model: models.ActivityData,
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
          model: models.SleepData,
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
          model: models.HeartRateData,
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

// const { OpenAI } = require("openai");
// require("dotenv").config();

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
//   organization: process.env.OPENAI_ORG,
// });

// let lastCall = 0;

// // Icônes de sports (déjà définies dans votre code)
// const sportIcons = {
//   running: "🏃‍♂️",
//   // ... autres icônes
// };

// // Fonction pour générer des suggestions personnalisées
// async function generateAthleteSuggestions(userContext, suggestionType) {
//   const now = Date.now();

//   if (now - lastCall < 1000) {
//     await new Promise((res) => setTimeout(res, 1000 - (now - lastCall)));
//   }
//   lastCall = Date.now();

//   const activities = userContext.activities || [];
//   const profile = userContext.profile || {};

//   // Formater les activités récentes
//   const activityLines = activities
//     .map((act) => {
//       const icon = sportIcons[act.type] || "🏅";
//       let line = `${icon} ${new Date(act.date).toISOString().split("T")[0]} : ${
//         act.title
//       } (${act.type})`;
//       if (act.duration) line += `, Durée: ${act.duration} min`;
//       if (act.distance) line += `, Distance: ${act.distance} km`;
//       return line;
//     })
//     .join("\n");

//   const contextString = `
//     Informations sur l'athlète :
//     - Nom complet : ${profile.fname || ""} ${profile.lname || ""}
//     - Objectifs : ${profile.bio || "Non spécifié"}
//     - Niveau : ${profile.level || "Non spécifié"}

//     Activités récentes (10 dernières) :
//     ${activityLines || "Aucune activité enregistrée récemment."}
//   `;

//   // Définir le prompt en fonction du type de suggestion
//   let systemPrompt = "";
//   let maxTokens = 300;

//   switch (suggestionType) {
//     case "motivation":
//       systemPrompt = `
//         Vous êtes Coach RunWeek, un assistant de coaching sportif motivant.

//         Tâche : Créez un message de motivation personnalisé pour cet athlète en vous basant sur ses activités récentes et ses objectifs.

//         Caractéristiques :
//         - Ton : Energique et positif
//         - Longueur : 2-3 phrases maximum
//         - Personnalisé : Faites référence à ses activités récentes
//         - Inclure un emoji pertinent (max 2)

//         Contexte :
//         ${contextString}
//       `;
//       maxTokens = 150;
//       break;

//     case "workout":
//       systemPrompt = `
//         Vous êtes Coach RunWeek, un expert en entraînement sportif.

//         Tâche : Proposez 2-3 suggestions d'entraînement personnalisées pour cet athlète.

//         Format de réponse :
//         Pour chaque suggestion :
//         - Titre accrocheur
//         - Description concise (1-2 phrases)
//         - Type d'entraînement (cardio, force, récupération, etc.)
//         - Durée estimée
//         - Niveau de difficulté

//         Règles :
//         - Basé sur les activités récentes et objectifs de l'athlète
//         - Proposer des variétés (pas toujours le même type)
//         - Inclure une icône d'emoji pertinente pour chaque suggestion
//         - Maximum 3 suggestions

//         Contexte :
//         ${contextString}
//       `;
//       maxTokens = 350;
//       break;

//     case "plan":
//       systemPrompt = `
//         Vous êtes Coach RunWeek, un créateur de plans d'entraînement.

//         Tâche : Proposez 2-3 plans d'entraînement personnalisés pour cet athlète.

//         Format de réponse pour chaque plan :
//         - Titre du plan
//         - Durée (ex: "4 semaines")
//         - Niveau (débutant, intermédiaire, avancé)
//         - Description concise (2-3 phrases)
//         - Objectif principal du plan
//         - Fréquence hebdomadaire recommandée

//         Règles :
//         - Adapter aux activités récentes et objectifs de l'athlète
//         - Proposer différents types de plans (performance, récupération, préparation d'événement)
//         - Inclure une icône d'emoji pertinente pour chaque plan
//         - Maximum 3 plans

//         Contexte :
//         ${contextString}
//       `;
//       maxTokens = 400;
//       break;

//     default:
//       throw new Error("Type de suggestion non reconnu");
//   }

//   try {
//     const messages = [
//       {
//         role: "system",
//         content: systemPrompt.trim(),
//       },
//     ];

//     const chatCompletion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo-0125",
//       messages: messages,
//       temperature: 0.7,
//       max_tokens: maxTokens,
//     });

//     let response = chatCompletion.choices[0].message.content;
//     response = response.replace(/\*\*/g, "").trim();

//     return response;
//   } catch (error) {
//     if (error.status === 429) {
//       console.error("Erreur IA : limite de quota atteinte");
//       return "Notre service connaît une forte demande. Pourriez-vous réessayer dans quelques instants ?";
//     }

//     console.error("Erreur technique du coach :", error);
//     return "Un problème technique empêche la génération de suggestions. L'équipe technique a été alertée.";
//   }
// }

// // Fonction pour parser les suggestions d'entraînement
// function parseWorkoutSuggestions(aiResponse) {
//   const suggestions = [];
//   const lines = aiResponse.split("\n");

//   let currentSuggestion = {};
//   for (const line of lines) {
//     if (line.trim() === "") continue;

//     if (line.match(/^[^a-z]*$/i) || line.includes(":")) {
//       // C'est probablement un titre ou une nouvelle suggestion
//       if (Object.keys(currentSuggestion).length > 0) {
//         suggestions.push(currentSuggestion);
//         currentSuggestion = {};
//       }

//       if (line.includes(":")) {
//         const [key, value] = line.split(":").map((part) => part.trim());
//         currentSuggestion[key.toLowerCase()] = value;
//       } else {
//         currentSuggestion["title"] = line.trim();
//       }
//     } else {
//       // C'est une description ou détail supplémentaire
//       if (currentSuggestion["description"]) {
//         currentSuggestion["description"] += " " + line.trim();
//       } else {
//         currentSuggestion["description"] = line.trim();
//       }
//     }
//   }

//   if (Object.keys(currentSuggestion).length > 0) {
//     suggestions.push(currentSuggestion);
//   }

//   // Ajouter des IDs et formater
//   return suggestions.map((suggestion, index) => ({
//     id: `s${index + 1}`,
//     title: suggestion.title || `Suggestion ${index + 1}`,
//     description: suggestion.description || "",
//     type: suggestion.type || "Entraînement",
//     duration: suggestion.duration || "Non spécifié",
//     level: suggestion.level || "Tous niveaux",
//     icon: getIconForSuggestion(suggestion.title || ""),
//   }));
// }

// // Fonction pour parser les plans d'entraînement
// function parseTrainingPlans(aiResponse) {
//   const plans = [];
//   const lines = aiResponse.split("\n");

//   let currentPlan = {};
//   for (const line of lines) {
//     if (line.trim() === "") continue;

//     if (line.match(/^[^a-z]*$/i) || line.includes(":")) {
//       // Nouveau plan ou propriété
//       if (
//         Object.keys(currentPlan).length > 0 &&
//         (line.match(/^[^a-z]*$/i) || line.includes("titre"))
//       ) {
//         plans.push(currentPlan);
//         currentPlan = {};
//       }

//       if (line.includes(":")) {
//         const [key, value] = line.split(":").map((part) => part.trim());
//         currentPlan[key.toLowerCase()] = value;
//       } else {
//         currentPlan["title"] = line.trim();
//       }
//     } else {
//       // Description ou détail supplémentaire
//       if (currentPlan["description"]) {
//         currentPlan["description"] += " " + line.trim();
//       } else {
//         currentPlan["description"] = line.trim();
//       }
//     }
//   }

//   if (Object.keys(currentPlan).length > 0) {
//     plans.push(currentPlan);
//   }

//   // Ajouter des IDs et formater
//   return plans.map((plan, index) => ({
//     id: `p${index + 1}`,
//     title: plan.title || `Plan ${index + 1}`,
//     duration: plan.duration || "Non spécifié",
//     level: plan.level || "Tous niveaux",
//     description: plan.description || "",
//     goal: plan.objectif || plan.goal || "Amélioration générale",
//     frequency: plan.fréquence || plan.frequency || "3-4 fois/semaine",
//   }));
// }

// // Helper function pour obtenir une icône basée sur le titre
// function getIconForSuggestion(title) {
//   const titleLower = title.toLowerCase();

//   if (titleLower.includes("course") || titleLower.includes("running"))
//     return "Zap";
//   if (titleLower.includes("récupération") || titleLower.includes("recovery"))
//     return "ShieldCheck";
//   if (titleLower.includes("force") || titleLower.includes("strength"))
//     return "TrendingUp";
//   if (titleLower.includes("interval") || titleLower.includes("hiit"))
//     return "Activity";
//   if (titleLower.includes("endurance")) return "Award";
//   if (titleLower.includes("yoga") || titleLower.includes("stretch"))
//     return "Heart";

//   return "Award"; // Icône par défaut
// }

// // Exporter les fonctions
// module.exports = {
//   generateAthleteSuggestions,
//   parseWorkoutSuggestions,
//   parseTrainingPlans,
// };
