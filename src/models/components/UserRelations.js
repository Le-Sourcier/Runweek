const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

// await UserRelations.create({
//   user_id: invitedUser.id,
//   related_by: sponsor.id,
//   type: "SPONSOR",
//   status: "PENDING",
//   custom_quota: 300,
//   message: "Voici un bonus de bienvenue 🎁"
// });

module.exports = (sequelize) => {
    const UserRelations = sequelize.define("UserRelations", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: uuidv4,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: true,
            index: true,
        },
        related_by: {
            type: DataTypes.UUID,
            allowNull: false,
            index: true,
        },
        relation_token: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        type: {
            type: DataTypes.ENUM("SPONSOR", "TEAM_INVITE"),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("PENDING", "ACCEPTED", "DECLINED", "EXPIRED"),
            defaultValue: "PENDING",
        },
        // message: {
        //     type: DataTypes.STRING,
        //     allowNull: true,
        // },
        custom_quota: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        accepted_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    });

    UserRelations.associate = (models) => {
        UserRelations.belongsTo(models.Users, {
            foreignKey: "user_id",
            as: "user",
            // as: "invitee", // 👈 changement ici
        });

        UserRelations.belongsTo(models.Users, {
            foreignKey: "related_by",
            as: "inviter",
        });
    };

    return UserRelations;
};
