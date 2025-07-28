const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize) => {
    const Roles = sequelize.define("Roles", {
        id: {
            type: DataTypes.UUID,
            defaultValue: uuidv4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        account_type: {
            type: DataTypes.ENUM(
                "GUEST",
                "SPONSORED",
                "USER",
                "ADMIN",
                "MANAGER"
            ),
            defaultValue: "USER",
            allowNull: false,
        },
    });

    Roles.associate = (models) => {
        Roles.belongsTo(models.Users, {
            foreignKey: "user_id",
            as: "user",
        });
        Roles.hasOne(models.AdminPreferencies, {
            foreignKey: "role_id",
            as: "preferences",
        });
    };

    return Roles;
};
