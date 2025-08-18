const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG,
});

let lastCall = 0;

async function askAI(userMessage, userContext, messagesHistory = []) {
  const now = Date.now();

  if (now - lastCall < 1000) {
    await new Promise((res) => setTimeout(res, 1000 - (now - lastCall)));
  }
  lastCall = Date.now();

  const activities = userContext.activities || [];
  const profile = userContext.profile || {};

  const activityLines = activities
    .map((act) => {
      let line = `- ${new Date(act.date).toISOString().split("T")[0]} : ${
        act.title
      } (${act.type})`;
      if (act.duration) line += `, Durée: ${act.duration} min`;
      if (act.distance) line += `, Distance: ${act.distance} km`;
      return line;
    })
    .join("\n");

  const contextString = `
        Informations sur l'athlète que vous coachez :
        - Nom complet : ${profile.fname || ""} ${profile.lname || ""}
        - Objectifs déclarés : ${profile.bio || "Non spécifié"}
        
        Activités récentes (5 dernières) :
        ${activityLines || "Aucune activité enregistrée récemment."}
    `;

  try {
    const systemPrompt = `
      Vous êtes Coach RunWeek, un assistant de coaching sportif avec une touche d'humour bienveillant.

      Personnalité :
      - Ton : Professionnel mais décontracté
      - Humour : Léger et pertinent (1 fois toutes les 5-6 réponses max)
      - Empathie : Encourageant et positif
      - Expertise : Technique quand nécessaire

      Style de réponse :
      1. Questions basiques :
      "Je suis Coach RunWeek, prêt à vous faire transpirer ! 💪"

      2. Calculs simples/hors-sujet :
      "1+2=3... mais je suis plus fort pour compter les répétitions d'exercices ! 😉
      Parlons plutôt de votre dernière séance ?"

      3. Salutations :
      "Bonjour ${
        profile.fname || ""
      } ! Prêt(e) à repousser vos limites aujourd'hui ? 🏃‍♂️"

      4. Hors-sujet flagrant :
      "*tousse sportivement* Désolé, je suis un peu obsédé par le fitness...
      Et si on parlait plutôt de votre programme d'entraînement ?"

      5. Questions sportives :
      - Commencez par un bref encouragement
      - Analyse personnalisée
      - Conseil technique clair
      - Proposition d'action

      Règles strictes :
      - Vouvoiement sauf demande contraire
      - Humour toujours professionnel
      - Max 1 emoji par message
      - Jamais de moquerie
      - Recadrage en douceur des hors-sujets

      Contexte utilisateur :
      ${contextString}
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
      model: "gpt-3.5-turbo-0125",
      messages: messages,
      temperature: 0.6, // Un peu plus de créativité
      max_tokens: 250,
    });

    let response = chatCompletion.choices[0].message.content;

    // Nettoyage des artefacts
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

module.exports = askAI;
