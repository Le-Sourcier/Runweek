const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function askAI(userMessage, userContext) {
    // Handle cases where there might not be a user context (like for generic plans)
    const activities = userContext.activities || [];
    const profile = userContext.profile || {};

    // Formater le contexte utilisateur en une chaîne de caractères lisible
    const activityLines = activities.map(act => {
        let line = `- ${new Date(act.date).toISOString().split('T')[0]} : ${act.title} (${act.type})`;
        if (act.duration) line += `, Durée: ${act.duration} min`;
        if (act.distance) line += `, Distance: ${act.distance} km`;
        return line;
    }).join("\n");

    const contextString = `
        Voici les informations sur l'utilisateur que tu coaches :
        - Nom : ${profile.firstName || ''} ${profile.lastName || ''}
        - Biographie/Objectifs : ${profile.bio || 'Non spécifié'}
        - Forfait actuel : ${profile.plan || 'Non spécifié'}
        
        Voici ses 5 activités les plus récentes :
        ${activityLines || "Aucune activité récente."}
    `;

    const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content:
                    "Tu es un coach personnel bienveillant et expert. Analyse le contexte fourni sur l'utilisateur (profil, activités récentes) pour donner des conseils personnalisés, encourageants et actionnables. Réponds ensuite à sa question spécifique.",
            },
            {
                role: "user",
                content: `${contextString}\n\nQuestion de l'utilisateur : \"${userMessage}\"`,
            },
        ],
    });

    return chatCompletion.choices[0].message.content;
}

module.exports = askAI;