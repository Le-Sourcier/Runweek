const { Op } = require("sequelize");
const db = require("../../models");
const deactivateExpiredFree = require("../../../lib/deactivateExpiredFree");
const sendMail = require("../../functions/components/sendMail");
const checkFreeSubscriptions = require("../../../lib/checkFreeSubscriptions");

const checkFreeSubscriptionsEvent = async () => {
    try {
        const now = new Date();

        const expiredFreeSubs = await db.Subscriptions.findAll({
            where: {
                billing_type: "FREE",
                is_active: true,
                end_date: {
                    [Op.lte]: now,
                },
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

        if (expiredFreeSubs.length === 0) {
            console.log(
                `[${now.toISOString()}] ✅ Aucun abonnement FREE expiré.`
            );
            return;
        }

        for (const sub of expiredFreeSubs) {
            sub.is_active = false;
            sub.status = "EXPIRED";
            sub.credit_allocated = 0;
            await sub.save();

            const message = `Votre période d’essai gratuite a expiré. Mettez à jour votre abonnement pour continuer à utiliser ProspectPro sans interruption.`;

            // création de notification en BDD
            await db.Notifications.create({
                user_id: sub.user.id,
                type: "SUBSCRIPTION_EXPIRED",
                content: message,
                metadata: {
                    credit_allocated: sub.credit_allocated,
                    plan: sub.plan?.name,
                },
            });

            const name = `${sub.user.profile.fname} ${sub.user.profile.lname}`;

            const html = checkFreeSubscriptions(name);

            await sendMail({
                to: sub.user.email,
                subject: `Prospectpro - FREE Subscription expirée`,
                html,
            });
        }

        console.log(
            `[${now.toISOString()}] ✅ Vérification terminée. ${
                expiredFreeSubs.length
            } abonnement(s) mis à jour.`
        );
    } catch (error) {
        console.error("Erreur dans le cron job freePlanCheck:", error);
    }
};

const deactivateExpiredFreeAccounts = async () => {
    try {
        const now = new Date();
        const trialLimit = new Date();
        trialLimit.setDate(now.getDate() - 14); // 14 jours d’essai

        const usersToDeactivate = await db.Subscriptions.findAll({
            where: {
                billing_type: "FREE",
                is_active: true,
                credit_allocated: {
                    [Op.lte]: 1000, // Seuil de base
                },
                start_date: {
                    [Op.lte]: trialLimit,
                },
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
            ],
        });

        if (usersToDeactivate.length === 0) {
            console.log(
                `[${now.toISOString()}] ✅ Aucun utilisateur à désactiver.`
            );
            return;
        }

        for (const sub of usersToDeactivate) {
            const user = sub.user;
            if (!user) continue;

            // // Mise à jour du statut utilisateur
            // user.status = "ARCHIVED";
            // await user.save();

            // Optionnel : désactivation de l’abonnement
            sub.is_active = false;
            sub.status = "EXPIRED";
            sub.credit_allocated = 0;
            await sub.save();

            const message = `Votre compte gratuit a été désactivé après 14 jours d’essai. Passez à un plan premium pour continuer à profiter de nos services.`;

            // création de notification en BDD
            await db.Notifications.create({
                user_id: sub.user.id,
                type: "FREEMIUM_ACCOUNT_DEACTIVATED",
                content: message,
                metadata: {
                    credit_allocated: sub.credit_allocated,
                    plan: sub.plan?.name,
                },
            });

            const name = `${sub.user.profile.fname} ${sub.user.profile.lname}`;
            const html = deactivateExpiredFree(name);

            await sendMail({
                to: sub.user.email,
                subject: `Prospectpro - Compte FREE désactivé`,
                html,
            });
        }

        console.log(
            `[${now.toISOString()}] ✅ ${
                usersToDeactivate.length
            } compte(s) désactivé(s).`
        );
    } catch (error) {
        console.error(
            "❌ Erreur lors de la désactivation des comptes FREE :",
            error
        );
    }
};

module.exports = { checkFreeSubscriptionsEvent, deactivateExpiredFreeAccounts };
