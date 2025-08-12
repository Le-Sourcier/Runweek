const express = require("express");
const router = express.Router();
const askAI = require("../../services/askAI");
const db = require("../../models");

/**
 * @openapi
 * components:
 *   schemas:
 *     MessageCoachIA:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Identifiant unique du message
 *         type:
 *           type: string
 *           enum: [text, recommandation, conseil]
 *           description: |
 *             Type de message :
 *             - text : Échange texte simple
 *             - recommandation : Recommandation personnalisée
 *             - conseil : Conseil d'entraînement
 *         message:
 *           type: string
 *           description: Contenu du message
 *         sender:
 *           type: string
 *           enum: [bot, user]
 *           description: Expéditeur du message
 *       required:
 *         - type
 *         - message
 *         - sender
 */

// Fonction utilitaire pour générer des IDs uniques
function genererId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * @openapi
 * /api/aicoach:
 *   post:
 *     tags:
 *       - Coach IA
 *     summary: Obtenir des conseils du coach IA
 *     description: >
 *       Envoie un message au coach IA et reçoit une réponse standardisée.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: Question ou message de l'utilisateur pour le coach.
 *                 example: "Comment améliorer mon rythme de course pour un 10 km ?"
 *     responses:
 *       200:
 *         description: Réponse du coach IA au format standardisé.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "SUCCESS"
 *                 data:
 *                   $ref: '#/components/schemas/MessageCoachIA'
 */
router.post("/", async (req, res) => {
    const { message } = req.body;
    const userId = req.user.id;

    // Save user message
    await db.ChatMessages.create({
        user_id: userId,
        message_content: message,
        sender: 'user',
        message_type: 'text',
    });

    if (!message) {
        return res.status(400).json({
            error: true,
            status: 400,
            message: "BAD_REQUEST",
            data: { error: "Le champ 'message' est requis." }
        });
    }

    try {
        const user = await db.Users.findByPk(userId, {
            include: [
                {
                    model: db.Profiles,
                    as: "profile",
                    attributes: ["fname", "lname", "bio"],
                },
                {
                    model: db.Subscriptions,
                    as: "subscriptions",
                    where: { is_active: true },
                    required: false,
                    include: [
                        {
                            model: db.Plans,
                            as: "plan",
                            attributes: ["name"],
                        },
                    ],
                },
            ],
        });

        if (!user) {
            return res.status(404).json({
                error: true,
                status: 404,
                message: "PROFILE_NOT_FOUND",
                data: {}
            });
        }

        const recentActivities = await db.Activities.findAll({
            where: { user_id: userId },
            order: [["date", "DESC"]],
            limit: 5,
        });

        const userContext = {
            profile: {
                firstName: user.profile?.fname,
                lastName: user.profile?.lname,
                bio: user.profile?.bio,
                plan: user.subscriptions?.[0]?.plan?.name || "FREE",
            },
            activities: recentActivities.map((act) => ({
                title: act.title,
                type: act.type,
                distance: act.distance,
                duration: act.duration,
                date: act.date,
            })),
        };

        const aiReply = await askAI(message, userContext);

        await db.ChatMessages.create({
            user_id: userId,
            message_content: aiReply,
            sender: 'bot',
            message_type: 'text',
        });

        return res.status(200).json({
            error: false,
            status: 200,
            message: "SUCCESS",
            data: {
                id: generateId(),
                type: "text",
                message: aiReply,
                sender: "bot"
            }
        });

    } catch (err) {
        console.error("Erreur IA coach:", err.message);
        return res.status(500).json({
            error: true,
            status: 500,
            message: "INTERNAL_SERVER_ERROR",
            data: { error: "Erreur interne du coach IA." }
        });
    }
});

/**
 * @openapi
 * /api/aicoach/workouts:
 *   post:
 *     tags:
 *       - Coach IA
 *     summary: Obtenir des suggestions d'entraînement personnalisées
 *     description: >
 *       Retourne des suggestions d'entraînement au format message standardisé.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de suggestions d'entraînement sous forme de messages standardisés.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "SUCCESS"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MessageCoachIA'
 */
router.post("/workouts", async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await db.Users.findByPk(userId, {
            include: [
                {
                    model: db.Profiles,
                    as: "profile",
                    attributes: ["fname", "lname", "bio"],
                },
                {
                    model: db.Subscriptions,
                    as: "subscriptions",
                    where: { is_active: true },
                    required: false,
                    include: [
                        {
                            model: db.Plans,
                            as: "plan",
                            attributes: ["name"],
                        },
                    ],
                },
            ],
        });

        if (!user) {
            return res.status(404).json({
                error: true,
                status: 404,
                message: "PROFILE_NOT_FOUND",
                data: {}
            });
        }

        const recentActivities = await db.Activities.findAll({
            where: { user_id: userId },
            order: [["date", "DESC"]],
            limit: 5,
        });

        const userContext = {
            profile: {
                firstName: user.profile?.fname,
                lastName: user.profile?.lname,
                bio: user.profile?.bio,
                plan: user.subscriptions?.[0]?.plan?.name || "FREE",
            },
            activities: recentActivities.map((act) => ({
                title: act.title,
                type: act.type,
                distance: act.distance,
                duration: act.duration,
                date: act.date,
            })),
        };

        const aiPrompt = `
Tu es un coach de course et fitness.  
En te basant sur ces données utilisateur :  
${JSON.stringify(userContext, null, 2)}  

Suggère **3 à 5 workouts personnalisés** au format JSON suivant :  
- title : nom court en français
- description : distance/intensité brève
- icon : mot-clé pour l'icône ("footsteps", "heart", "dumbbell", etc.)
Réponds UNIQUEMENT avec le JSON valide, sans texte autour.
        `;

        const aiResponse = await askAI(aiPrompt, userContext);

        let workouts;
        try {
            workouts = JSON.parse(aiResponse);
        } catch (err) {
            console.error("Erreur parsing JSON IA:", err.message);
            return res.status(500).json({
                error: true,
                status: 500,
                message: "INTERNAL_SERVER_ERROR",
                data: { error: "Réponse IA invalide." }
            });
        }

        const standardizedWorkouts = Array.isArray(workouts) ? workouts : [workouts];
        
        for (const workout of standardizedWorkouts) {
            await db.ChatMessages.create({
                user_id: userId,
                message_content: `${workout.title}: ${workout.description}`,
                sender: 'bot',
                message_type: 'recommandation',
                metadata: {
                    icon: workout.icon,
                    originalData: workout
                }
            });
        }

        return res.status(200).json({
            error: false,
            status: 200,
            message: "SUCCESS",
            data: standardizedWorkouts.map(workout => ({
                id: generateId(),
                type: "recommandation",
                message: `${workout.title}: ${workout.description}`,
                sender: "bot",
                metadata: {
                    icon: workout.icon,
                    originalData: workout
                }
            }))
        });

    } catch (err) {
        console.error("Erreur IA coach workouts:", err.message);
        return res.status(500).json({
            error: true,
            status: 500,
            message: "INTERNAL_SERVER_ERROR",
            data: { error: "Erreur interne du coach IA." }
        });
    }
});
/**
 * @openapi
 * /api/aicoach/running-plan:
 *   post:
 *     tags:
 *       - Coach IA
 *     summary: Générer un plan de course hebdomadaire
 *     description: >
 *       Retourne un plan de course sous forme de messages conseils standardisés.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - goal
 *               - level
 *             properties:
 *               goal:
 *                 type: string
 *                 example: "Préparer un 10km"
 *               level:
 *                 type: string
 *                 enum: [débutant, intermédiaire, avancé]
 *                 example: "intermédiaire"
 *     responses:
 *       200:
 *         description: Plan de course généré sous forme de messages standardisés.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "SUCCESS"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MessageCoachIA'
 */
router.post("/running-plan", async (req, res) => {
    const { goal, level } = req.body;
    const userId = req.user.id;

    if (!goal || !level) {
        return res.status(400).json({
            error: true,
            status: 400,
            message: "BAD_REQUEST",
            data: { error: "Le but et le niveau sont requis." },
        });
    }

    try {
        const user = await db.Users.findByPk(userId, {
            include: [{ model: db.Profiles, as: "profile", attributes: ["fname"] }],
        });

        const aiPrompt = `
        Tu es un coach de course expert.
        Crée un plan de course hebdomadaire (7 jours) pour un utilisateur avec les caractéristiques suivantes :
        - Nom: ${user.profile?.fname || 'Utilisateur'}
        - Objectif: ${goal}
        - Niveau: ${level}

        Le plan doit inclure une variété de séances : sorties longues, fractionnés, courses de récupération et jours de repos.

        Réponds UNIQUEMENT avec un objet JSON valide contenant une clé "weekly_plan".
        "weekly_plan" doit être un tableau de 7 objets, un pour chaque jour.
        Chaque objet doit avoir les champs suivants :
        - day: (e.g., "Lundi")
        - title: (e.g., "Course de récupération", "Fractionné", "Repos")
        - description: (e.g., "30 min à allure lente", "2x10 min à allure 10km", "Étirements légers")
        - icon: (e.g., "footsteps", "heart", "dumbbell", "rest")
        `;

        const aiResponse = await askAI(aiPrompt, {});

        let plan;
        try {
            plan = JSON.parse(aiResponse);
        } catch (err) {
            console.error("Erreur parsing JSON IA pour le plan:", err.message);
            return res.status(500).json({
                error: true,
                status: 500,
                message: "INVALID_AI_RESPONSE",
                data: { error: "Réponse IA invalide." },
            });
        }

        const weeklyPlan = Array.isArray(plan.weekly_plan) ? plan.weekly_plan : [];

        for (const dayPlan of weeklyPlan) {
            await db.ChatMessages.create({
                user_id: userId,
                message_content: `${dayPlan.day} - ${dayPlan.title}: ${dayPlan.description}`,
                sender: 'bot',
                message_type: 'advices',
                metadata: {
                    icon: dayPlan.icon,
                    day: dayPlan.day
                }
            });
        }

        return res.status(200).json({
            error: false,
            status: 200,
            message: "SUCCESS",
            data: weeklyPlan.map(dayPlan => ({
                id: generateId(),
                type: "advices",
                message: `${dayPlan.day} - ${dayPlan.title}: ${dayPlan.description}`,
                sender: "bot",
                metadata: {
                    icon: dayPlan.icon,
                    day: dayPlan.day
                }
            }))
        });

    } catch (err) {
        console.error("Erreur IA coach running plan:", err.message);
        return res.status(500).json({
            error: true,
            status: 500,
            message: "INTERNAL_SERVER_ERROR",
            data: { error: "Erreur interne du coach IA." },
        });
    }
});


/**
 * @openapi
 * /api/aicoach/recommendations:
 *   post:
 *     tags:
 *       - Coach IA
 *     summary: Obtenir des recommandations personnalisées
 *     description: >
 *       Retourne des recommandations au format message standardisé.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de recommandations sous forme de messages standardisés.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "SUCCESS"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MessageCoachIA'
 */
router.post("/recommendations", async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await db.Users.findByPk(userId, {
            include: [
                { model: db.Profiles, as: "profile", attributes: ["fname", "lname", "bio"] },
                { model: db.Subscriptions, as: "subscriptions", where: { is_active: true }, required: false, include: [{ model: db.Plans, as: "plan", attributes: ["name"] }] },
            ],
        });

        const recentActivities = await db.Activities.findAll({
            where: { user_id: userId },
            order: [["date", "DESC"]],
            limit: 5,
        });

        const userContext = {
            profile: {
                firstName: user.profile?.fname,
                lastName: user.profile?.lname,
                bio: user.profile?.bio,
                plan: user.subscriptions?.[0]?.plan?.name || "FREE",
            },
            activities: recentActivities.map(act => ({
                title: act.title,
                type: act.type,
                distance: act.distance,
                duration: act.duration,
                date: act.date,
            })),
        };

        const aiPrompt = `
        Tu es un coach de fitness et de bien-être holistique.
        En te basant sur le profil et les activités récentes de l'utilisateur suivant:
        ${JSON.stringify(userContext, null, 2)}

        Génère 3 à 5 recommandations personnalisées et actionnables.
        Les recommandations peuvent porter sur la nutrition, la récupération, l'équipement, la motivation, ou d'autres aspects pertinents.

        Réponds UNIQUEMENT avec un objet JSON valide contenant une clé "recommendations".
        "recommendations" doit être un tableau d'objets.
        Chaque objet doit avoir les champs suivants :
        - title: Titre court et accrocheur
        - description: Conseil détaillé (2-3 phrases)
        - category: (e.g., "Nutrition", "Récupération", "Équipement", "Motivation")
        `;

        const aiResponse = await askAI(aiPrompt, userContext);

        let recommendations;
        try {
            recommendations = JSON.parse(aiResponse);
        } catch (err) {
            console.error("Erreur parsing JSON IA pour les recommandations:", err.message);
            return res.status(500).json({
                error: true,
                status: 500,
                message: "Réponse IA invalide.",
            });
        }

        const recs = Array.isArray(recommendations.recommendations) ? recommendations.recommendations : [];

        for (const rec of recs) {
            await db.ChatMessages.create({
                user_id: userId,
                message_content: `${rec.title} (${rec.category}): ${rec.description}`,
                sender: 'bot',
                message_type: 'recommandation',
                metadata: {
                    category: rec.category
                }
            });
        }

        return res.status(200).json({
            error: false,
            status: 200,
            message: "SUCCESS",
            data: recs.map(rec => ({
                id: generateId(),
                type: "recommandation",
                message: `${rec.title} (${rec.category}): ${rec.description}`,
                sender: "bot",
                metadata: {
                    category: rec.category
                }
            }))
        });

    } catch (err) {
        console.error("Erreur IA coach recommendations:", err.message);
        return res.status(500).json({
            error: true,
            status: 500,
            message: "INTERNAL_SERVER_ERROR",
            data: { error: "Erreur interne du coach IA." }
        });
    }
});

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     MessageCoachIA:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 12
 *         type:
 *           type: string
 *           description: Type de message (texte, image, audio, etc.)
 *           example: "text"
 *         message:
 *           type: string
 *           description: Contenu du message
 *           example: "Bonjour, comment puis-je vous aider aujourd'hui ?"
 *         sender:
 *           type: string
 *           description: Expéditeur du message (user ou coach)
 *           example: "bot"
 *         metadata:
 *           type: object
 *           description: Métadonnées associées au message
 *           example:
 *             sentiment: "positif"
 *             confidence: 0.92
 *
 * /api/aicoach/history:
 *   get:
 *     tags:
 *       - Coach IA
 *     summary: Récupérer l'historique des chats avec le coach IA
 *     description: >
 *       Retourne l'historique complet des messages échangés avec le coach IA pour l'utilisateur authentifié.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historique des messages du coach IA.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "SUCCESS"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MessageCoachIA'
 *       401:
 *         description: Non autorisé. L'utilisateur doit fournir un token JWT valide.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "UNAUTHORIZED"
 *       500:
 *         description: Erreur interne du serveur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "INTERNAL_SERVER_ERROR"
 *                 data:
 *                   type: object
 *                   example:
 *                     error: "Erreur interne lors de la récupération de l'historique du chat."
 */
router.get("/history", async (req, res) => {
    try {
        const userId = req.user.id;

        const chatHistory = await db.ChatMessages.findAll({
            where: { user_id: userId },
            order: [['created_at', 'ASC']],
        });

        // Map to MessageCoachIA schema if needed, or return raw data
        const formattedHistory = chatHistory.map(msg => ({
            id: msg.id,
            type: msg.message_type,
            message: msg.message_content,
            sender: msg.sender,
            metadata: msg.metadata, // Include metadata if present
        }));

        return res.status(200).json({
            error: false,
            status: 200,
            message: "SUCCESS",
            data: formattedHistory,
        });

    } catch (err) {
        console.error("Erreur lors de la récupération de l'historique du chat:", err.message);
        return res.status(500).json({
            error: true,
            status: 500,
            message: "INTERNAL_SERVER_ERROR",
            data: { error: "Erreur interne lors de la récupération de l'historique du chat." }
        });
    }
});

module.exports = router;