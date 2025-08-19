const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Friendship = sequelize.define(
    "Friendship",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      requester_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      recipient_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      status: {
        type: DataTypes.ENUM("pending", "accepted", "declined", "blocked"),
        defaultValue: "pending",
      },
      requestMessage: {
        type: DataTypes.TEXT,
        validate: {
          len: [0, 300],
        },
      },
      acceptedAt: {
        type: DataTypes.DATE,
      },
      declinedAt: {
        type: DataTypes.DATE,
      },
      blockedAt: {
        type: DataTypes.DATE,
      },
      blockedBy: {
        type: DataTypes.UUID,
        references: {
          model: "Users",
          key: "id",
        },
      },
    },
    {
      tableName: "friendships",
      indexes: [
        {
          unique: true,
          fields: ["requester_id", "recipient_id"],
        },
        {
          fields: ["recipient_id", "status"],
        },
        {
          fields: ["requester_id", "status"],
        },
      ],
    }
  );

  // Méthodes statiques pour les amitiés
  Friendship.findFriendship = function (user_id_1, user_id_2) {
    return this.findOne({
      where: {
        [sequelize.Op.or]: [
          { requester_id: user_id_1, recipient_id: user_id_2 },
          { requester_id: user_id_2, recipient_id: user_id_1 },
        ],
      },
    });
  };

  Friendship.getFriends = function (user_id) {
    return this.findAll({
      where: {
        [sequelize.Op.or]: [
          { requester_id: user_id, status: "accepted" },
          { recipient_id: user_id, status: "accepted" },
        ],
      },
      include: [
        {
          association: "requester",
          attributes: [
            "id",
            "fname",
            "lname",
            "email",
            "profile_image",
            "stats",
            "preferences",
          ],
        },
        {
          association: "recipient",
          attributes: [
            "id",
            "fname",
            "lname",
            "email",
            "profile_image",
            "stats",
            "preferences",
          ],
        },
      ],
    });
  };

  Friendship.associate = (models) => {
    Friendship.belongsTo(models.Users, {
      foreignKey: "requester_id",
      as: "requester",
    });

    Friendship.belongsTo(models.Users, {
      foreignKey: "recipient_id",
      as: "recipient",
    });

    Friendship.belongsTo(models.Users, {
      foreignKey: "blockedBy",
      as: "blockedByUser",
    });
  };

  return Friendship;
};
