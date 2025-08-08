// controllers/components/activityController.js
const db = require("../../models");

exports.createActivity = async (req, res) => {
    const { type, title, description, distance, duration, date, metadata } = req.body;
    const userId = req.user.id;

    if (!type || !title) {
        return res.status(400).json({
            error: true,
            message: "Le type et le titre de l'activité sont requis.",
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
