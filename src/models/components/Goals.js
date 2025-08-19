// models/components/Goals.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Goals = sequelize.define("Goals", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING, // e.g., "Running", "Consistency", "Nutrition"
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        target: {
            type: DataTypes.JSONB, // e.g., { value: 5, unit: "days/week" }
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("active", "completed", "suggested", "archived"),
            defaultValue: "active",
            allowNull: false,
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        progress: {
            type: DataTypes.JSONB, // e.g., { current: 3, unit: "days/week" }
            allowNull: true,
        },
    });

    Goals.associate = (models) => {
        Goals.belongsTo(models.Users, {
            foreignKey: "user_id",
            as: "user",
        });
    };

    return Goals;
};
