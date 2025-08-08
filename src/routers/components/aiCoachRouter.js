const express = require("express");
const router = express.Router();
const askAI = require("../../services/askAI");
const db = require("../../models");

/**
 * @openapi
 * tags:
 *   - name: AI Coach
 *     description: Endpoints for interacting with the personalized AI coach.
 */

/**
 * @openapi
 * /api/aicoach:
 *   post:
 *     tags:
 *       - AI Coach
 *     summary: Get advice from the AI coach
 *     description: >
 *       Sends a message to the AI coach. The service uses the user's profile,
 *       recent activities, and current subscription plan as context to provide
 *       a personalized and relevant response. Requires user authentication.
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
 *                 description: The user's question or message for the coach.
 *                 example: "How can I improve my running pace for a 10k?"
 *     responses:
 *       200:
 *         description: The AI coach's reply.
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
 *                   type: object
 *                   properties:
 *                     reply:
 *                       type: string
 *                       example: "To improve your 10k pace, let's focus on interval training. Based on your recent activity, I suggest..."
 *       400:
 *         description: Bad Request - The 'message' field is missing.
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
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "BAD_REQUEST"
 *                 data:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: "Le champ 'message' est requis."
 *       401:
 *         description: Unauthorized - User is not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       404:
 *         description: User profile not found.
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
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "PROFILE_NOT_FOUND"
 *                 data:
 *                   type: object
 *                   example: {}
 *       500:
 *         description: Internal server error while communicating with the AI service.
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
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: "Erreur interne du coach IA."
 */

router.post("/", async (req, res) => {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message) {
        return res.status(400).json({
            error: true,
            status: 400,
            message: "BAD_REQUEST",
            data: { error: "Le champ 'message' est requis." }
        });
    }

    try {
        // 1. Récupérer les données de l'utilisateur
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

        // 2. Récupérer les activités récentes
        const recentActivities = await db.Activities.findAll({
            where: { user_id: userId },
            order: [["date", "DESC"]],
            limit: 5,
        });

        // 3. Construire le contexte pour l'IA
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

        // 4. Appeler le service AI avec le contexte
        const aiReply = await askAI(message, userContext);

        return res.status(200).json({
            error: false,
            status: 200,
            message: "SUCCESS",
            data: { reply: aiReply }
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
 * tags:
 *   - name: AI Coach
 *     description: Endpoints for interacting with the personalized AI coach.
 */

/**
 * @openapi
 * /api/aicoach/workouts:
 *   post:
 *     tags:
 *       - AI Coach
 *     summary: Get personalized workout suggestions
 *     description: >
 *       Generates 3-5 personalized workout suggestions based on the user's
 *       profile, recent activities, and subscription plan.  
 *       Each suggestion contains a title, short description, and an icon keyword.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workout suggestions
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
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "Course facile"
 *                       description:
 *                         type: string
 *                         example: "5-6 km à un rythme de conversation"
 *                       icon:
 *                         type: string
 *                         example: "footsteps"
 *       401:
 *         description: Unauthorized - User not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       404:
 *         description: User profile not found.
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
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "PROFILE_NOT_FOUND"
 *                 data:
 *                   type: object
 *                   example: {}
 *       500:
 *         description: Internal server error while communicating with AI service.
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
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: "Erreur interne du coach IA."
 */

router.post("/workouts", async (req, res) => {
    const userId = req.user.id;

    try {
        // 1. Récupérer les infos utilisateur
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

        // 2. Activités récentes
        const recentActivities = await db.Activities.findAll({
            where: { user_id: userId },
            order: [["date", "DESC"]],
            limit: 5,
        });

        // 3. Contexte IA
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

        // 4. Prompt IA pour forcer format JSON
        const aiPrompt = `
Tu es un coach de course et fitness.  
En te basant sur ces données utilisateur :  
${JSON.stringify(userContext, null, 2)}  

Suggère **3 à 5 workouts personnalisés** au format JSON suivant :  
- title : nom court en français
- description : distance/intensité brève
- icon : mot-clé pour l’icône ("footsteps", "heart", "dumbbell", etc.)
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

        return res.status(200).json({
            error: false,
            status: 200,
            message: "SUCCESS",
            data: workouts
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
 *       - AI Coach
 *     summary: Generate a weekly running plan
 *     description: >
 *       Generates a personalized 7-day running plan based on the user's
 *       goal and level. Requires user authentication.
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
 *                 description: The user's primary goal (e.g., "10k race", "improve endurance").
 *                 example: "Préparer un 10km"
 *               level:
 *                 type: string
 *                 description: The user's current fitness level.
 *                 enum: [beginner, intermediate, advanced]
 *                 example: "intermediate"
 *     responses:
 *       200:
 *         description: The generated 7-day running plan.
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
 *                   example: "Plan de course généré avec succès."
 *                 data:
 *                   type: object
 *                   properties:
 *                     weekly_plan:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           day:
 *                             type: string
 *                             example: "Lundi"
 *                           title:
 *                             type: string
 *                             example: "Course de récupération"
 *                           description:
 *                             type: string
 *                             example: "30 min à allure lente"
 *                           icon:
 *                             type: string
 *                             example: "footsteps"
 *       400:
 *         description: Bad Request - Missing 'goal' or 'level'.
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
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Le but et le niveau sont requis."
 *                 data:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: "Le but et le niveau sont requis."
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       500:
 *         description: Internal server error.
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
 *                   example: "Erreur interne du coach IA."
 *                 data:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: "Erreur interne du coach IA."
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

        const aiResponse = await askAI(aiPrompt, {}); // Pas de contexte utilisateur ici

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

        return res.status(200).json({
            error: false,
            status: 200,
            message: "SUCCESS",
            data: plan,
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
 *       - AI Coach
 *     summary: Get personalized recommendations
 *     description: >
 *       Generates 3-5 personalized recommendations for the user on topics like
 *       nutrition, recovery, gear, etc., based on their profile and recent activities.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of personalized recommendations.
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
 *                   example: "Recommandations personnalisées générées avec succès."
 *                 data:
 *                   type: object
 *                   properties:
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             example: "Hydratation optimale"
 *                           description:
 *                             type: string
 *                             example: "Buvez au moins 2 litres d'eau par jour, surtout avant et après l'exercice."
 *                           category:
 *                             type: string
 *                             example: "Nutrition"
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       500:
 *         description: Internal server error.
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
 *                   example: "Erreur interne du coach IA."
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
            activities: recentActivities.map(act => ({ title: act.title, type: act.type, distance: act.distance, duration: act.duration, date: act.date })),
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

        return res.status(200).json({
            error: false,
            status: 200,
            message: "Recommandations personnalisées générées avec succès.",
            data: recommendations,
        });

    } catch (err) {
        console.error("Erreur IA coach recommendations:", err.message);
        return res.status(500).json({
            error: true,
            status: 500,
            message: "Erreur interne du coach IA.",
        });
    }
});

module.exports = router;
