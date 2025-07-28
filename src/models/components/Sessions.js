const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize) => {
    const Sessions = sequelize.define("Sessions", {
        id: {
            type: DataTypes.UUID,
            defaultValue: uuidv4,
            primaryKey: true,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        ip_address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        user_agent: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    });

    Sessions.associate = (models) => {
        Sessions.belongsTo(models.Users, {
            foreignKey: "user_id",
            as: "user",
            onDelete: "CASCADE",
        });
    };

    return Sessions;
};
