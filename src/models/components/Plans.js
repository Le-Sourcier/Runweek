// const { DataTypes } = require("sequelize");
// const { v4: uuidv4 } = require("uuid");

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
//         "multi_users",
//         "predictive_ai",
//         "exclusive_data",
//         // "unlimited_integrations",
//         "dedicated_support",
//         "custom_training",
//         "white_label",
//         "custom_reports",
//         "account_manager",
//         "sla_999",
//     ],
// };

// const defaultCredits = {
//     FREE: 1000,
//     STARTER: 10000,
//     PRO: 100000,
//     EXPERT: 800000,
// };

// module.exports = (sequelize) => {
//     const Plans = sequelize.define(
//         "Plans",
//         {
//             id: {
//                 type: DataTypes.UUID,
//                 defaultValue: uuidv4,
//                 primaryKey: true,
//                 allowNull: false,
//             },
//             name: {
//                 type: DataTypes.ENUM("FREE", "STARTER", "PRO", "EXPERT"),
//                 allowNull: false,
//                 defaultValue: "FREE",
//             },
//             description: {
//                 type: DataTypes.STRING,
//                 allowNull: true,
//             },
//             price_monthly: {
//                 type: DataTypes.FLOAT,
//                 allowNull: false,
//                 defaultValue: 0,
//                 validate: {
//                     min: 0,
//                 },
//             },
//             price_annual: {
//                 type: DataTypes.FLOAT,
//                 allowNull: false,
//                 defaultValue: 0,
//                 validate: {
//                     min: 0,
//                 },
//             },
//             monthly_credits: {
//                 type: DataTypes.INTEGER,
//                 allowNull: false,
//                 defaultValue: 1000,
//             },
//             features: {
//                 type: DataTypes.JSONB,
//                 allowNull: true,
//             },
//         },
//         {
//             hooks: {
//                 beforeValidate: (plan) => {
//                     if (
//                         !plan.features &&
//                         plan.name &&
//                         defaultFeatures[plan.name]
//                     ) {
//                         plan.features = defaultFeatures[plan.name];
//                     }

//                     if (
//                         !plan.monthly_credits &&
//                         plan.name &&
//                         defaultCredits[plan.name]
//                     ) {
//                         plan.monthly_credits = defaultCredits[plan.name];
//                     }
//                 },
//             },
//         }
//     );

//     Plans.associate = (models) => {
//         Plans.hasMany(models.Subscriptions, {
//             foreignKey: "plan_id",
//             as: "subscriptions",
//         });
//     };

//     return Plans;
// };

const { DataTypes } = require("sequelize");
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
};

const defaultCredits = {
    FREE: 1000,
};

module.exports = (sequelize) => {
    const Plans = sequelize.define(
        "Plans",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: uuidv4,
                primaryKey: true,
                allowNull: false,
            },
            product_id: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },

            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            prices: {
                type: DataTypes.JSONB,
                allowNull: true,
            },

            credit_allocated: {
                type: DataTypes.FLOAT,
                defaultValue: 0.0,
            },

            features: {
                type: DataTypes.JSONB,
                allowNull: true,
            },

            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },

            is_free: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            hooks: {
                beforeValidate: (plan) => {
                    if (
                        !plan.features &&
                        plan.name &&
                        defaultFeatures[plan.name]
                    ) {
                        plan.features = defaultFeatures[plan.name];
                    }

                    if (
                        !plan.monthly_credits &&
                        plan.name &&
                        defaultCredits[plan.name]
                    ) {
                        plan.monthly_credits = defaultCredits[plan.name];
                    }
                },
            },
        }
    );

    Plans.associate = (models) => {
        Plans.hasMany(models.Subscriptions, {
            foreignKey: "plan_id",
            as: "subscriptions",
        });
    };

    return Plans;
};
