const cron = require("node-cron");
const {
    checkFreeSubscriptionsEvent,
    deactivateExpiredFreeAccounts,
} = require("./components/freePlanCheck");
const notifyLowCreditsEvent = require("./components/notifyLowCredits");

// Chaque jour à minuit
cron.schedule("0 0 * * *", async () => {
    console.log("⏰ Lancement du cron job pour les abonnements FREE...");
    await checkFreeSubscriptionsEvent();
});

// Tous les jours à 8h du matin
cron.schedule("0 8 * * *", async () => {
    // cron.schedule("*/1 * * * *", async () => {
    console.log("📣 Cron Job: Vérification des crédits faibles...");
    await notifyLowCreditsEvent();
    await deactivateExpiredFreeAccounts();
});
