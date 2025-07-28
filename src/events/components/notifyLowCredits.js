const { Op } = require("sequelize");
const db = require("../../models");
const notifyLowCredits = require("../../../lib/notifyLowCredits");
const sendMail = require("../../functions/components/sendMail");

const notifyLowCreditsEvent = async () => {
    try {
        const lowCreditUsers = await db.Subscriptions.findAll({
            where: {
                credit_allocated: {
                    [Op.lte]: 1000,
                },
                is_active: true,
            },
            include: [
                {
                    model: db.Users,
                    as: "user",
                    attributes: ["id", "email", "role"],
                    include: [
                        {
                            model: db.Profiles,
                            as: "profile",
                            attributes: ["fname", "lname"],
                        },
                    ],
                },
                {
                    model: db.Plans,
                    as: "plan",
                    attributes: ["name"],
                },
            ],
        });

        for (const sub of lowCreditUsers) {
            const isFree = sub.billing_type === "FREE";

            const message = isFree
                ? `Votre crédit (${sub.credit_allocated}) est presque épuisé. Passez à un plan premium pour débloquer plus de fonctionnalités.`
                : `Votre crédit est bas (${sub.credit_allocated}). Pensez à le recharger ou à ajuster votre plan.`;

            // création de notification en BDD
            await db.Notifications.create({
                user_id: sub.user.id,
                type: "CREDIT_LOW",
                content: message,
                metadata: {
                    credit_allocated: sub.credit_allocated,
                    plan: sub.plan?.name,
                },
            });

            const html = notifyLowCredits({
                userName: `${sub.user.profile.fname} ${sub.user.profile.lname}`,
                currentCredits: sub.credit_allocated,
            });

            // Send notification mail
            await sendMail({
                to: sub.user.email,
                subject: `Prospectpro - Crédits Faibles`,
                html,
            });
        }

        console.log(
            `✅ ${lowCreditUsers.length} utilisateur(s) notifié(s) pour crédits faibles.`
        );
    } catch (error) {
        console.error(
            "❌ Erreur lors de la notification de crédits faibles :",
            error
        );
    }
};

module.exports = notifyLowCreditsEvent;
