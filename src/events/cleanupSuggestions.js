// jobs/cleanupSuggestions.js
const cron = require("node-cron");
const suggestionService = require("../services/components/SuggestionService");

// Nettoyer les suggestions expirées tous les jours à minuit
cron.schedule("0 0 * * *", () => {
  console.log("Nettoyage des suggestions expirées...");
  suggestionService.cleanupExpiredSuggestions();
});

module.exports = cron;
