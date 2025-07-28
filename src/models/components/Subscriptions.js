// models/Subscriptions.js
const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize) => {
    const Subscriptions = sequelize.define("Subscriptions", {
        id: {
            type: DataTypes.UUID,
            defaultValue: uuidv4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        plan_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        is_annual: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        start_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("ACTIVE", "PAUSED", "CANCELED", "EXPIRED"),
            defaultValue: "ACTIVE",
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        credit_allocated: {
            type: DataTypes.INTEGER,
            defaultValue: 1000,
        },
        auto_renew: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        billing_type: {
            type: DataTypes.ENUM("MONTHLY", "ANNUAL", "FREE"),
            defaultValue: "FREE",
        },
    });

    Subscriptions.associate = (models) => {
        Subscriptions.belongsTo(models.Users, {
            foreignKey: "user_id",
            as: "user",
        });
        Subscriptions.belongsTo(models.Plans, {
            foreignKey: "plan_id",
            as: "plan",
        });
    };

    return Subscriptions;
};
