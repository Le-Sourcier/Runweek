// controllers/components/activityController.js
const db = require("../../models");
const { createNotification } = require("../../utils");

exports.createActivity = async (req, res) => {
    const { type, title, description, distance, duration, date, metadata } = req.body;
    const userId = req.user.id;

    if (!req.body) {
    return res.status(400).json({
        error: true,
        message: "Le corps de la requête est vide ou invalide.",
    });
}

    if (!type || !title) {
        return res.status(400).json({
            error: true,
            message: "Le type et le titre de l'activité sont requis.",
        });
    }

    // Validation des types de données
    if (distance && typeof distance !== 'number') {
        return res.status(400).json({
            error: true,
            message: 'La distance doit être un nombre.',
        });
    }

    if (duration && typeof duration !== 'number') {
        return res.status(400).json({
            error: true,
            message: 'La durée doit être un nombre.',
        });
    }

    if (date && isNaN(Date.parse(date))) {
        return res.status(400).json({
            error: true,
            message: 'La date fournie est invalide.',
        });
    }

    try {
        const activity = await db.Activities.create({
            user_id: userId,
            type,
            title,
            description,
            distance,
            duration,
            date,
            metadata,
        });

        // Créer une notification
        await createNotification({
            user_id: userId,
            type: "NEW_ACTIVITY",
            content: `Votre activité '${title}' a bien été enregistrée.`,
            metadata: {
                activity_id: activity.id,
            },
        });

        return res.status(201).json({
            error: false,
            message: "Activité enregistrée avec succès.",
            data: activity,
        });
    } catch (error) {
        console.error("Erreur lors de la création de l'activité:", error);
        return res.status(500).json({
            error: true,
            message: "Erreur interne du serveur.",
        });
    }
};

exports.getActivities = async (req, res) => {
    const userId = req.user.id;

    try {
        const activities = await db.Activities.findAll({
            where: { user_id: userId },
            order: [["date", "DESC"]],
        });

        return res.status(200).json({
            error: false,
            data: activities,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des activités:", error);
        return res.status(500).json({
            error: true,
            message: "Erreur interne du serveur.",
        });
    }
};
