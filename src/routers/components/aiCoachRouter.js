const express = require("express");
const router = express.Router();
const askAI = require("../../services/askAI");
const db = require("../../models");
const { serverMessage } = require("../../utils");

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
 *                 reply:
 *                   type: string
 *                   example: "To improve your 10k pace, let's focus on interval training. Based on your recent activity, I suggest..."
 *       400:
 *         description: Bad Request - The 'message' field is missing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Le champ 'message' est requis."
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
 *               $ref: '#/components/schemas/Error404'
 *       500:
 *         description: Internal server error while communicating with the AI service.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur interne du coach IA."
 */
router.post("/", async (req, res) => {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message) {
        return res.status(400).json({ error: "Le champ 'message' est requis." });
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
            return serverMessage(res, "PROFILE_NOT_FOUND");
        }

        // 2. Récupérer les activités récentes (via Notifications)
        const recentActivities = await db.Notifications.findAll({
            where: { user_id: userId },
            order: [["createdAt", "DESC"]],
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
                content: act.content,
                date: act.createdAt,
            })),
        };

        // 4. Appeler le service AI avec le contexte
        const aiReply = await askAI(message, userContext);
        res.json({ reply: aiReply });
    } catch (err) {
        console.error("Erreur IA coach:", err.message);
        res.status(500).json({ error: "Erreur interne du coach IA." });
    }
});

module.exports = router;
