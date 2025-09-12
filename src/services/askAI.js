require("dotenv").config();

const openai = require("../config/openaiConfig");

let lastCall = 0;

const sportIcons = {
  running: "🏃‍♂️", // Course à pied
  walking: "🚶‍♀️", // Marche
  cycling: "🚴‍♂️", // Vélo
  swimming: "🏊‍♂️", // Natation
  gym: "🏋️‍♀️", // Musculation
  yoga: "🧘‍♂️", // Yoga
  boxing: "🥊", // Boxe
  martialArts: "🥋", // Arts martiaux
  football: "⚽", // Football
  basketball: "🏀", // Basket
  tennis: "🎾", // Tennis
  badminton: "🏸", // Badminton
  tableTennis: "🏓", // Ping-pong
  rugby: "🏉", // Rugby
  volleyball: "🏐", // Volley-ball
  golf: "⛳", // Golf
  archery: "🏹", // Tir à l’arc
  skiing: "⛷️", // Ski
  snowboard: "🏂", // Snowboard
  skating: "⛸️", // Patinage
  hiking: "🥾", // Randonnée
  rowing: "🚣‍♂️", // Aviron
  diving: "🤿", // Plongée
  skatingBoard: "🛹", // Skateboard
  climbing: "🧗‍♂️", // Escalade
  handball: "🤾‍♂️", // Handball
  fencing: "🤺", // Escrime
  lacrosse: "🥍", // Lacrosse
  hockey: "🏒", // Hockey sur glace
  billiards: "🎱", // Billard
};

async function askAI(userMessage, userContext, messagesHistory = []) {
  const now = Date.now();

  if (now - lastCall < 1000) {
    await new Promise((res) => setTimeout(res, 1000 - (now - lastCall)));
  }
  lastCall = Date.now();

  const activities = userContext.activities || [];
  const profile = userContext.profile || {};
  const stats = userContext.stats || {};
  const goals = userContext.goals || [];
  const achievements = userContext.achievements || [];
  const personalRecords = userContext.personalRecords || [];

  const activityLines = activities
    .map((act) => {
      const icon = sportIcons[act.type] || "🏅";
      let line = `${icon} ${new Date(act.date).toISOString().split("T")[0]} : ${
        act.title
      } (${act.type})`;
      if (act.duration) line += `, Durée: ${act.duration} min`;
      if (act.distance) line += `, Distance: ${act.distance} km`;
      return line;
    })
    .join("\n");

  const contextString = `
        Informations sur l'athlète que vous coachez :
        - Langue de preference : ${profile.lang || "Non spécifié"}
        - Nom complet : ${profile.fname || ""} ${profile.lname || ""}
        - Objectifs déclarés : ${profile.bio || "Non spécifié"}
        
        Activités récentes (5 dernières) :
        ${activityLines || "Aucune activité enregistrée récemment."}
    `;

  try {
    const systemPrompt = `
Vous êtes Coach RunWeek, un assistant de coaching sportif authentique et engageant.

INFORMATIONS COMPLÈTES SUR L'ATHLÈTE :
${contextString}

STATISTIQUES DE L'UTILISATEUR :
- Niveau: ${stats.level || 1}
- Points: ${stats.points || 0}
- Série actuelle: ${stats.streak_days || 0} jours
- Distance hebdomadaire: ${stats.weekly_distance || 0} km
- Allure moyenne: ${stats.average_pace || "0:00"}

OBJECTIFS EN COURS :
${goals
  .map(
    (goal) => `
- ${goal.title}: ${goal.current || 0}/${goal.target} ${goal.unit || ""} (${
      goal.progressPercentage || 0
    }% complété)
  Échéance: ${
    goal.deadline ? new Date(goal.deadline).toLocaleDateString() : "Non définie"
  }
`
  )
  .join("")}

DERNIERS SUCCÈS :
${
  achievements
    .map((ach) => `- ${ach.title} (${ach.points} points)`)
    .join("\n") || "Aucun succès récent"
}

RECORDS PERSONNELS :
${
  personalRecords
    .map((pr) => `- ${pr.distance}km en ${pr.time} (allure: ${pr.pace}/km)`)
    .join("\n") || "Aucun record personnel"
}

Style de conversation :
- Ton naturel et professionnel
- Réponses personnalisées selon le niveau et les objectifs
- Encouragements sincères
- Conseils techniques adaptés

Règles importantes :
- Vouvoiement par défaut
- Humour occasionnel et bienveillant
- Langage accessible
- Maximum 2 emojis par message
`;

    const messages = [
      {
        role: "system",
        content: systemPrompt.trim(),
      },
      ...messagesHistory,
      {
        role: "user",
        content: userMessage,
      },
    ];

    const chatCompletion = await openai.chat.completions.create({
      model:
        process.env.isChatGPT === "true"
          ? "gpt-3.5-turbo-0125"
          : "deepseek-chat",
      messages: messages,
      temperature: 0.6,
      max_tokens: 250,
    });

    let response = chatCompletion.choices[0].message.content;
    response = response.replace(/\*\*/g, "").trim();

    return response;
  } catch (error) {
    if (error.status === 429) {
      console.error("Erreur IA : limite de quota atteinte");
      return "Notre service connaît une forte demande. Pourriez-vous réessayer dans quelques instants ?";
    }

    console.error("Erreur technique du coach :", error);
    return "Un problème technique empêche notre échange. L'équipe technique a été alertée. Pourriez-vous reformuler votre demande ?";
  }
}
// async function askAI(userMessage, userContext, messagesHistory = []) {
//   // console.log("userContext: ", userContext);
//   const now = Date.now();

//   if (now - lastCall < 1000) {
//     await new Promise((res) => setTimeout(res, 1000 - (now - lastCall)));
//   }
//   lastCall = Date.now();

//   const activities = userContext.activities || [];
//   const profile = userContext.profile || {};

//   // const activityLines = activities
//   //   .map((act) => {
//   //     let line = `- ${new Date(act.date).toISOString().split("T")[0]} : ${
//   //       act.title
//   //     } (${act.type})`;
//   //     if (act.duration) line += `, Durée: ${act.duration} min`;
//   //     if (act.distance) line += `, Distance: ${act.distance} km`;
//   //     return line;
//   //   })
//   //   .join("\n");

//   const activityLines = activities
//     .map((act) => {
//       const icon = sportIcons[act.type] || "🏅"; // 🏅 fallback si pas trouvé
//       let line = `${icon} ${new Date(act.date).toISOString().split("T")[0]} : ${
//         act.title
//       } (${act.type})`;
//       if (act.duration) line += `, Durée: ${act.duration} min`;
//       if (act.distance) line += `, Distance: ${act.distance} km`;
//       return line;
//     })
//     .join("\n");

//   const contextString = `
//         Informations sur l'athlète que vous coachez :
//         - Langue de preference : ${profile.lang}
//         - Nom complet : ${profile.fname || ""} ${profile.lname || ""}
//         - Objectifs déclarés : ${profile.bio || "Non spécifié"}

//         Activités récentes (5 dernières) :
//         ${activityLines || "Aucune activité enregistrée récemment."}
//     `;

//   console.log("profile: ", profile);
//   try {
//     //     const systemPrompt = `
//     //       Vous êtes Coach RunWeek, un assistant de coaching sportif avec une touche d'humour bienveillant.

//     //       Personnalité :
//     //       - Ton : Professionnel mais décontracté
//     //       - Humour : Léger et pertinent (1 fois toutes les 5-6 réponses max)
//     //       - Empathie : Encourageant et positif
//     //       - Expertise : Technique quand nécessaire

//     //       Style de réponse :
//     //       1. Questions basiques :
//     //       "Je suis Coach RunWeek, prêt à vous faire transpirer ! 💪"

//     //       2. Calculs simples/hors-sujet :
//     //       "1+2=3... mais je suis plus fort pour compter les répétitions d'exercices ! 😉
//     //       Parlons plutôt de votre dernière séance ?"

//     //       3. Salutations :
//     //       "Bonjour ${
//     //         profile.fname || profile.lname || "athlète"
//     //       } ! Prêt(e) à repousser vos limites aujourd'hui ? 🏃‍♂️"
//     //        NB:  Eviter les salutation repétive dans la meme journée
//     // , donc a la place tu peux relancer la discussion avec un ton naturel et humain. Celà permettra d'eviter les redondance.
//     //       4. Hors-sujet flagrant :
//     //      (exemple:  "*tousse sportivement* (une emojie correspondante) Désolé, je suis un peu obsédé par le fitness...
//     //       Et si on parlait plutôt de votre programme d'entraînement ?")//cette partie n'est qu'un exemple donc tu peux dans le meme context generer un message relatif

//     //       5. Questions sportives :
//     //       - Commencez par un bref encouragement
//     //       - Analyse personnalisée
//     //       - Conseil technique clair
//     //       - Proposition d'action

//     //       Règles strictes :
//     //       - Vouvoiement sauf demande contraire
//     //       - Humour toujours professionnel
//     //       - Max 2 emoji par message
//     //       - Jamais de moquerie
//     //       - Recadrage en douceur des hors-sujets

//     //       Contexte utilisateur :
//     //       ${contextString}
//     //     `;

//     //     const systemPrompt = `
//     // Vous êtes Coach RunWeek, un assistant de coaching sportif authentique et engageant.

//     // Personnalité :
//     // - Ton : Naturel et professionnel, comme un coach bienveillant
//     // - Échanges : Conversationnels et fluides, sans formalité excessive
//     // - Empathie : Encouragements sincères et pertinents
//     // - Expertise : Conseils techniques vulgarisés quand nécessaire

//     // Style de conversation :
//     // 1. Accueil personnalisé :
//     // "Bonjour ${
//     //       profile.fname || "athlète"
//     //     } ! Comment s'est passée votre dernière séance ? 🏃‍♂️"
//     // (Éviter les salutations répétitives - préférer relancer naturellement la conversation)

//     // 2. Réponses naturelles :
//     // - Phrases courtes et structurées
//     // - Questions ouvertes pour maintenir l'échange
//     // - Adaptez le vocabulaire au niveau sportif de l'utilisateur

//     // 3. Hors-sujet :
//     // "Intéressant ! Mais je suis surtout spécialiste pour vous accompagner dans vos défis sportifs.
//     // Où en êtes-vous dans votre préparation en ce moment ?"

//     // 4. Conseils sportifs :
//     // - Validation des efforts : "Excellent travail sur..."
//     // - Suggestions pratiques : "Pour progresser, vous pourriez..."
//     // - Propositions concrètes : "Et si on planifiait..."

//     // Approche humaine :
//     // - Variations dans les formulations
//     // - Réactions adaptées au contexte (félicitations, encouragements, conseils)
//     // - Utilisation modérée des emojis (1-2 max) pour ponctuer naturellement

//     // Règles importantes :
//     // - Vouvoiement par défaut (tutoiement si demandé)
//     // - Humour occasionnel et toujours bienveillant
//     // - Recadrage doux des hors-sujets vers le sport
//     // - Langage accessible mais technique quand nécessaire

//     // Contexte utilisateur :
//     // ${contextString}
//     // `;

//     // Dans le service askAI, améliorez le prompt système :
//     const systemPrompt = `
// Vous êtes Coach RunWeek, un assistant de coaching sportif authentique et engageant.

// Personnalité :
// - Ton : Naturel et professionnel, comme un coach bienveillant
// - Échanges : Conversationnels et fluides, sans formalité excessive
// - Empathie : Encouragements sincères et pertinents
// - Expertise : Conseils techniques vulgarisés quand nécessaire

// INFORMATIONS COMPLÈTES SUR L'ATHLÈTE :
// ${contextString}

// STATISTIQUES DE L'UTILISATEUR :
// - Niveau: ${userContext.stats.level || 1}
// - Points: ${userContext.stats.points || 0}
// - Série actuelle: ${userContext.stats.streak_days || 0} jours
// - Distance hebdomadaire: ${userContext.stats.weekly_distance || 0} km
// - Allure moyenne: ${userContext.stats.average_pace || "0:00"}

// OBJECTIFS EN COURS :
// ${userContext.goals
//   .map(
//     (goal) => `
// - ${goal.title}: ${goal.current}/${goal.target} ${goal.unit} (${
//       goal.progressPercentage
//     }% complété)
//   Échéance: ${new Date(goal.deadline).toLocaleDateString()}
// `
//   )
//   .join("")}

// DERNIERS SUCCÈS :
// ${userContext.achievements
//   .map((ach) => `- ${ach.title} (${ach.points} points)`)
//   .join("\n")}

// RECORDS PERSONNELS :
// ${userContext.personalRecords
//   .map((pr) => `- ${pr.distance}km en ${pr.time} (allure: ${pr.pace}/km)`)
//   .join("\n")}

// Style de conversation :
// 1. Accueil personnalisé :
// "Bonjour ${
//       userContext.profile.fname || "athlète"
//     } ! Comment s'est passée votre dernière séance ? 🏃‍♂️"
// (Éviter les salutations répétitives - préférer relancer naturellement la conversation)

// 2. Réponses contextuelles :
// - Tenir compte du niveau et de l'expérience de l'utilisateur
// - Faire référence à ses objectifs et réalisations
// - Proposer des conseils adaptés à sa progression

// 3. Conseils sportifs :
// - Validation des efforts : "Excellent travail sur..."
// - Suggestions pratiques : "Pour progresser vers votre objectif de ${
//       userContext.goals[0]?.title || "..."
//     }, vous pourriez..."
// - Propositions concrètes : "Et si on planifiait..."

// Approche humaine :
// - Variations dans les formulations
// - Réactions adaptées au contexte (félicitations, encouragements, conseils)
// - Utilisation modérée des emojis (1-2 max) pour ponctuer naturellement

// Règles importantes :
// - Vouvoiement par défaut (tutoiement si demandé)
// - Humour occasionnel et toujours bienveillant
// - Recadrage doux des hors-sujets vers le sport
// - Langage accessible mais technique quand nécessaire
// `;
//     const messages = [
//       {
//         role: "system",
//         content: systemPrompt.trim(),
//       },
//       ...messagesHistory,
//       {
//         role: "user",
//         content: userMessage,
//       },
//     ];

//     const chatCompletion = await openai.chat.completions.create({
//       model:
//         process.env.isChatGPT === "true"
//           ? "gpt-3.5-turbo-0125"
//           : "deepseek-chat",
//       messages: messages,
//       temperature: 0.6, // Un peu plus de créativité
//       max_tokens: 250,
//     });

//     let response = chatCompletion.choices[0].message.content;

//     // Nettoyage des artefacts
//     response = response.replace(/\*\*/g, "").trim();

//     return response;
//   } catch (error) {
//     if (error.status === 429) {
//       console.error("Erreur IA : limite de quota atteinte");
//       return "Notre service connaît une forte demande. Pourriez-vous réessayer dans quelques instants ?";
//     }

//     console.error("Erreur technique du coach :", error);
//     return "Un problème technique empêche notre échange. L'équipe technique a été alertée. Pourriez-vous reformuler votre demande ?";
//   }
// }

module.exports = askAI;
