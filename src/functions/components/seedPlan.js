// // scripts/seedPlans.js
// const db = require("../../models");
// const { Plans } = db;

// const defaultFeatures = {
//     FREE: [
//         "search_basic",
//         "basic_data",
//         "1_csv_export_daily",
//         "email_support",
//         "history_3_days",
//         "basic_integrations",
//     ],
//     STARTER: [
//         "search_basic",
//         "basic_data",
//         "csv_export",
//         "email_support",
//         "history_30_days",
//         "basic_integrations",
//     ],
//     PRO: [
//         "search_advanced",
//         "premium_data",
//         "prospecting_ai",
//         "crm_integration",
//         "email_campaigns",
//         "priority_support",
//         "unlimited_history",
//         "api_access",
//         "dashboard_advanced",
//         "multi_format_export",
//     ],
//     EXPERT: [
//         "8000_credits",
//         "multi_users",
//         "predictive_ai",
//         "exclusive_data",
//         "unlimited_integrations",
//         "automated_campaigns",
//         "dedicated_support",
//         "custom_training",
//         "white_label",
//         "custom_reports",
//         "account_manager",
//         "sla_999",
//     ],
// };

// const seedPlans = async () => {
//     await db.sequelize.sync({ alter: true }); // ou force: true

//     const existing = await Plans.count();
//     if (existing > 0) {
//         console.log("✅ Plans already exist");
//         return;
//     }

//     console.log("🚀 Seeding plans...");
//     const plansData = [
//         {
//             name: "FREE",
//             description: "Basic access with limited features",
//             price_monthly: 0,
//             price_annual: 0,
//             features: defaultFeatures.FREE,
//         },
//         {
//             name: "STARTER",
//             description: "Perfect for small businesses",
//             price_monthly: 19,
//             price_annual: 190,
//             monthly_credits: 500,
//             features: defaultFeatures.STARTER,
//         },
//         {
//             name: "PRO",
//             description: "Advanced features for teams",
//             price_monthly: 49,
//             price_annual: 490,
//             monthly_credits: 2000,
//             features: defaultFeatures.PRO,
//         },
//         {
//             name: "EXPERT",
//             description: "All-in-one for agencies",
//             price_monthly: 99,
//             price_annual: 990,
//             monthly_credits: 8000,
//             features: defaultFeatures.EXPERT,
//         },
//     ];

//     await Plans.bulkCreate(plansData);
//     console.log("✅ Plans created");
// };

// module.exports = seedPlans;

// // seedPlans().then(() => process.exit());

const db = require("../../models");
const { Plans } = db;
const { v4: uuidv4 } = require("uuid");

const defaultFeatures = {
    FREE: [
        "search_basic",
        "basic_data",
        "1_csv_export_daily",
        "email_support",
        "history_3_days",
        "basic_integrations",
    ],
    STARTER: [
        "search_basic",
        "basic_data",
        "csv_export",
        "email_support",
        "history_30_days",
        "basic_integrations",
    ],
    PRO: [
        "search_advanced",
        "premium_data",
        "prospecting_ai",
        "crm_integration",
        "email_campaigns",
        "priority_support",
        "unlimited_history",
        "api_access",
        "dashboard_advanced",
        "multi_format_export",
    ],
    EXPERT: [
        "8000_credits",
        "multi_users",
        "predictive_ai",
        "exclusive_data",
        "unlimited_integrations",
        "automated_campaigns",
        "dedicated_support",
        "custom_training",
        "white_label",
        "custom_reports",
        "account_manager",
        "sla_999",
    ],
};

const defaultCredits = {
    FREE: 1000,
    STARTER: 5000,
    PRO: 20000,
    EXPERT: 80000,
};

const seedPlans = async () => {

    // Vérifier si des plans existent déjà
    const existingCount = await Plans.count();
    if (existingCount > 0) {
        console.log("✅ Plans already exist in database");
        return;
    }

    console.log("🚀 Seeding plans...");

    const plansToCreate = [
        {
            name: "FREE",
            description: "Basic access with limited features",
            is_free: true,
            credit_allocated: defaultCredits.FREE,
            features: defaultFeatures.FREE,
            price_monthly: 0,
            annual_discount: 0,
        },
    ];

    for (const planData of plansToCreate) {
        try {
            console.log(`Creating ${planData.name} plan...`);

            let monthlyPrice, yearlyPrice;

            // 3. Créer l'entrée dans la base de données
            const pricesData = {};
            if (monthlyPrice) {
                pricesData.month = {
                    id: monthlyPrice.id,
                    amount: monthlyPrice.unit_amount / 100,
                    currency: monthlyPrice.currency,
                    interval_count: 1,
                };
            }
            if (yearlyPrice) {
                pricesData.year = {
                    id: yearlyPrice.id,
                    amount: yearlyPrice.unit_amount / 100,
                    currency: yearlyPrice.currency,
                    interval_count: 1,
                };
            }

            await Plans.create({
                product_id: `free_${uuidv4()}`,
                name: planData.name,
                description: planData.description,
                prices: pricesData,
                credit_allocated: planData.credit_allocated,
                features: planData.features,
                active: true,
                is_free: planData.is_free,
            });

            console.log(`✅ ${planData.name} plan created successfully`);
        } catch (error) {
            console.error(`❌ Error creating ${planData.name} plan:`, error);
            throw error;
        }
    }

    console.log("✅ All plans created successfully");
};

module.exports = seedPlans;

// seedPlans().then(() => process.exit());
