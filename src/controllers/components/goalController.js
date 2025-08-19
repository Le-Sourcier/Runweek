// controllers/components/goalController.js
const db = require("../../models");

exports.createGoal = async (req, res) => {
    const { type, description, target, status, startDate, endDate } = req.body;
    const userId = req.user.id;

    if (!type || !description) {
        return res.status(400).json({
            error: true,
            message: "Le type et la description de l'objectif sont requis.",
        });
    }

    try {
        const goal = await db.Goals.create({
            user_id: userId,
            type,
            description,
            target,
            status,
            startDate,
            endDate,
        });

        return res.status(201).json({
            error: false,
            message: "Objectif créé avec succès.",
            data: goal,
        });
    } catch (error) {
        console.error("Erreur lors de la création de l'objectif:", error);
        return res.status(500).json({
            error: true,
            message: "Erreur interne du serveur.",
        });
    }
};

exports.getGoals = async (req, res) => {
    const userId = req.user.id;
    const { status } = req.query; 

    let whereClause = { user_id: userId };
    if (status) {
        whereClause.status = status;
    }

    try {
        const goals = await db.Goals.findAll({
            where: whereClause,
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({
            error: false,
            data: goals,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des objectifs:", error);
        return res.status(500).json({
            error: true,
            message: "Erreur interne du serveur.",
        });
    }
};

exports.getGoalById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const goal = await db.Goals.findOne({
            where: { id, user_id: userId },
        });

        if (!goal) {
            return res.status(404).json({
                error: true,
                message: "Objectif non trouvé ou non autorisé.",
            });
        }

        return res.status(200).json({
            error: false,
            data: goal,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération de l'objectif par ID:", error);
        return res.status(500).json({
            error: true,
            message: "Erreur interne du serveur.",
        });
    }
};

exports.updateGoal = async (req, res) => {
    const { id } = req.params;
    const { type, description, target, status, startDate, endDate, progress } = req.body;
    const userId = req.user.id;

    try {
        const goal = await db.Goals.findOne({
            where: { id, user_id: userId },
        });

        if (!goal) {
            return res.status(404).json({
                error: true,
                message: "Objectif non trouvé ou non autorisé.",
            });
        }

        await goal.update({
            type,
            description,
            target,
            status,
            startDate,
            endDate,
            progress,
        });

        return res.status(200).json({
            error: false,
            message: "Objectif mis à jour avec succès.",
            data: goal,
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'objectif:", error);
        return res.status(500).json({
            error: true,
            message: "Erreur interne du serveur.",
        });
    }
};

exports.deleteGoal = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const goal = await db.Goals.findOne({
            where: { id, user_id: userId },
        });

        if (!goal) {
            return res.status(404).json({
                error: true,
                message: "Objectif non trouvé ou non autorisé.",
            });
        }

        await goal.destroy();

        return res.status(200).json({
            error: false,
            message: "Objectif supprimé avec succès.",
        });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'objectif:", error);
        return res.status(500).json({
            error: true,
            message: "Erreur interne du serveur.",
        });
    }
};

exports.getActiveGoals = async (req, res) => {
    req.query.status = "active"; 
    return exports.getGoals(req, res);
};

exports.getCompletedGoals = async (req, res) => {
    req.query.status = "completed"; 
    return exports.getGoals(req, res);
};

exports.getSuggestedGoals = async (req, res) => {
    req.query.status = "suggested";
    return exports.getGoals(req, res);
};
