// Notifications
// models/Notifications.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Notifications = sequelize.define("Notifications", {
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
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        metadata: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        is_read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    });

    Notifications.associate = (models) => {
        Notifications.belongsTo(models.Users, {
            foreignKey: "user_id",
            as: "user",
        });
    };

    return Notifications;
};
