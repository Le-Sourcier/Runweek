const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function askAI(userMessage, userContext) {
    // Formater le contexte utilisateur en une chaîne de caractères lisible
    const contextString = `
        Voici les informations sur l'utilisateur que tu coaches :
        - Nom : ${userContext.profile.firstName} ${userContext.profile.lastName}
        - Biographie/Objectifs : ${userContext.profile.bio || 'Non spécifié'}
        - Forfait actuel : ${userContext.profile.plan}
        
        Voici ses 5 activités les plus récentes :
        ${userContext.activities.map((act) => `- ${act.date.toISOString().split('T')[0]}: ${act.content}`).join("\n") || "Aucune activité récente."}
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
                content: `${contextString}\n\nQuestion de l'utilisateur : "${userMessage}"`,
            },
        ],
    });

    return chatCompletion.choices[0].message.content;
}

module.exports = askAI;
