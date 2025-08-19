const db = require("../../models");
const { createNotification } = require("../../utils");

exports.createActivity = async (req, res) => {
    const { type, title, description, distance, duration, date, scheduledAt, metadata } = req.body; 
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
            message: "Le type et le titre de l\'activité sont requis.",
        });
    }


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

    // Validation for scheduledAt (NEW)
    if (scheduledAt && isNaN(Date.parse(scheduledAt))) {
        return res.status(400).json({
            error: true,
            message: 'La date de planification fournie est invalide.',
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
            scheduledAt, 
            metadata,
        });

        // Créer une notification
        await createNotification({
            user_id: userId,
            type: "NEW_ACTIVITY",
            content: `Votre activité \'${title}\' a bien été enregistrée.`,
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
        console.error("Erreur lors de la création de l\'activité:", error);
        return res.status(500).json({
            error: true,
            message: "Erreur interne du serveur.",
        });
    }
};

exports.updateActivity = async (req, res) => {
    const { id } = req.params; 
    const { type, title, description, distance, duration, date, scheduledAt, metadata } = req.body;
    const userId = req.user.id;

    try {
        const activity = await db.Activities.findOne({ where: { id, user_id: userId } });

        if (!activity) {
            return res.status(404).json({
                error: true,
                message: "Activité non trouvée ou non autorisée.",
            });
        }

        // Basic validation for scheduledAt
        if (scheduledAt && isNaN(Date.parse(scheduledAt))) {
            return res.status(400).json({
                error: true,
                message: 'La date de planification fournie est invalide.',
            });
        }

        await activity.update({
            type,
            title,
            description,
            distance,
            duration,
            date,
            scheduledAt,
            metadata,
        });

        return res.status(200).json({
            error: false,
            message: "Activité mise à jour avec succès.",
            data: activity,
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l\'activité:", error);
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

exports.getActivitiesByDateRange = async (req, res) => {
    const userId = req.user.id;
    const { startDate, endDate } = req.query; // Expecting YYYY-MM-DD format

    if (!startDate || !endDate) {
        return res.status(400).json({
            error: true,
            message: "Les dates de début et de fin sont requises.",
        });
    }

    // Validate date format
    if (isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
        return res.status(400).json({
            error: true,
            message: "Format de date invalide. Utilisez YYYY-MM-DD.",
        });
    }

    try {
        const activities = await db.Activities.findAll({
            where: {
                user_id: userId,
                scheduledAt: {
                    [db.Sequelize.Op.between]: [new Date(startDate), new Date(endDate)],
                },
            },
            order: [["scheduledAt", "ASC"]], // Order by scheduled date
        });

        return res.status(200).json({
            error: false,
            data: activities,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des activités par plage de dates:", error);
        return res.status(500).json({
            error: true,
            message: "Erreur interne du serveur.",
        });
    }
};

exports.getUpcomingActivities = async (req, res) => {
    const userId = req.user.id;
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to the beginning of today

    try {
        const activities = await db.Activities.findAll({
            where: {
                user_id: userId,
                scheduledAt: {
                    [db.Sequelize.Op.gte]: now, // Greater than or equal to today
                },
            },
            order: [["scheduledAt", "ASC"]], // Order by scheduled date
        });

        return res.status(200).json({
            error: false,
            message: "Activités à venir récupérées avec succès.",
            data: activities,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des activités à venir:", error);
        return res.status(500).json({
            error: true,
            message: "Erreur interne du serveur.",
        });
    }
};
