// models/components/Activities.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Activities = sequelize.define("Activities", {
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
            type: DataTypes.STRING, // e.g., 'RUNNING', 'CYCLING', 'WORKOUT'
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        distance: {
            type: DataTypes.FLOAT, // in kilometers
            allowNull: true,
        },
        duration: {
            type: DataTypes.INTEGER, // in minutes
            allowNull: true,
        },
        date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        metadata: {
            type: DataTypes.JSONB, // For any extra data, e.g., heart rate, calories
            allowNull: true,
        },
    });

    Activities.associate = (models) => {
        Activities.belongsTo(models.Users, {
            foreignKey: "user_id",
            as: "user",
        });
    };

    return Activities;
};
