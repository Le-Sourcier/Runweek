const { OpenAI } = require("openai");
require("dotenv").config();


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Pour limiter la fréquence des appels
let lastCall = 0;

async function askAI(userMessage, userContext) {

    console.log("Clé utilisée :", process.env.OPENAI_API_KEY);
console.log("Message envoyé :", userMessage);
console.log("Contexte utilisateur :", userContext);

    // Throttle : attendre au moins 1 seconde entre les appels
    const now = Date.now();
    if (now - lastCall < 1000) {
        await new Promise(res => setTimeout(res, 1000 - (now - lastCall)));
    }
    lastCall = Date.now();

    const activities = userContext.activities || [];
    const profile = userContext.profile || {};

    // Contexte utilisateur formaté
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

    try {
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

    // } catch (error) {
    //     if (error.status === 429) {
    //         // Erreur de quota ou trop de requêtes
    //         console.error("Erreur IA coach : Quota dépassé ou trop de requêtes envoyées.");
    //         return "Le service IA a atteint sa limite d'utilisation pour le moment. Merci de réessayer plus tard.";
    //     }

    //     // Autres erreurs API
    //     console.error("Erreur IA coach :", error);
    //     return " Une erreur est survenue lors de la génération de la réponse du coach.";
    // }
    } catch (error) {
    // console.error("Erreur IA coach (code):", error.status);
    // console.error("Erreur IA coach (message):", error.message);
    // console.error("Détails complets:", error);

    // if (error.status === 429) {
    //     return `Limite atteinte : ${error.message || "Quota ou fréquence dépassé."}`;
    // }
    console.error("Erreur IA coach:", error.response?.data || error.message || error);
    throw error;

    return "Une erreur est survenue lors de la génération de la réponse du coach.";
}
}

module.exports = askAI;
