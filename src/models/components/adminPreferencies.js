const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize) => {
    const AdminPreferencies = sequelize.define("AdminPreferencies", {
        id: {
            type: DataTypes.UUID,
            defaultValue: uuidv4,
            primaryKey: true,
        },
        permissions: {
            type: DataTypes.JSON, // Exemple : { campagnes: true, analytics: false, ... }
            allowNull: false,
        },
    });

    AdminPreferencies.associate = (models) => {
        AdminPreferencies.belongsTo(models.Roles, {
            foreignKey: "role_id",
            as: "role",
        });
    };

    return AdminPreferencies;
};
