const { DataTypes, Op } = require("sequelize");
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
      type: {
        type: DataTypes.VIRTUAL, // Champ virtuel pour déterminer le type
        get() {
          // Cette logique peut être adaptée selon le contexte
          if (this.requester_id && this.recipient_id) {
            return this.requester_id === this.userContext ? "sent" : "received";
          }
          return null;
        },
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

  // Méthode pour définir le contexte utilisateur
  Friendship.prototype.setUserContext = function (userId) {
    this.userContext = userId;
    return this;
  };

  // Méthodes statiques pour les amitiés
  Friendship.findFriendship = function (user_id_1, user_id_2) {
    return this.findOne({
      where: {
        [Op.or]: [
          { requester_id: user_id_1, recipient_id: user_id_2 },
          { requester_id: user_id_2, recipient_id: user_id_1 },
        ],
      },
    });
  };

  // Friendship.getFriends = function (user_id) {
  //   return this.findAll({
  //     where: {
  //       [Op.or]: [
  //         { requester_id: user_id, status: "accepted" },
  //         { recipient_id: user_id, status: "accepted" },
  //       ],
  //     },
  //     include: [
  //       {
  //         association: "requester",
  //         attributes: ["id", "email"],
  //         include: [
  //           {
  //             model: sequelize.models.Profiles,
  //             as: "profile",
  //             attributes: ["fname", "lname", "image"],
  //           },
  //         ],
  //       },
  //       {
  //         association: "recipient",
  //         attributes: ["id", "email"],
  //         include: [
  //           {
  //             model: sequelize.models.Profiles,
  //             as: "profile",
  //             attributes: ["fname", "lname", "image"],
  //           },
  //         ],
  //       },
  //     ],
  //   }).then((friendships) => {
  //     return friendships.map((friendship) => {
  //       // Déterminer qui est l'ami (l'autre utilisateur)
  //       const friend =
  //         friendship.requester.id === user_id
  //           ? friendship.recipient
  //           : friendship.requester;

  //       return {
  //         id: friendship.id,
  //         friend: {
  //           id: friend.id,
  //           fname: friend.profile?.fname,
  //           lname: friend.profile?.lname,
  //           email: friend.email,
  //           profile_image: friend.profile?.image,
  //           // Ajouter les stats si nécessaire
  //         },
  //         status: friendship.status,
  //         createdAt: friendship.createdAt,
  //       };
  //     });
  //   });
  // };

  // Méthode spécifique pour les demandes d'amis - CORRIGÉE
  Friendship.getFriends = function (user_id) {
    return this.findAll({
      where: {
        [Op.or]: [
          { requester_id: user_id, status: "accepted" },
          { recipient_id: user_id, status: "accepted" },
        ],
      },
      include: [
        {
          association: "requester",
          attributes: ["id", "email", "createdAt"],
          include: [
            {
              model: sequelize.models.Profiles,
              as: "profile",
              attributes: ["fname", "lname", "image"],
            },
            {
              model: sequelize.models.UserStats,
              as: "stats",
              attributes: ["level", "experience"],
            },
          ],
        },
        {
          association: "recipient",
          attributes: ["id", "email", "createdAt"],
          include: [
            {
              model: sequelize.models.Profiles,
              as: "profile",
              attributes: ["fname", "lname", "image"],
            },
            {
              model: sequelize.models.UserStats,
              as: "stats",
              attributes: ["level", "experience"],
            },
          ],
        },
      ],
    });
  };

  Friendship.getFriendRequests = function (user_id, requestType = "received") {
    let whereCondition = { status: "pending" };

    if (requestType === "received") {
      whereCondition.recipient_id = user_id;
    } else if (requestType === "sent") {
      whereCondition.requester_id = user_id;
    }

    // Déterminer l'association à inclure selon le type
    const includeAssociation =
      requestType === "received" ? "requester" : "recipient";

    return this.findAll({
      where: whereCondition,
      include: [
        {
          association: includeAssociation, // Utiliser 'association' au lieu de 'model'
          attributes: ["id", "email"],
          include: [
            {
              model: sequelize.models.Profiles,
              as: "profile",
              attributes: ["fname", "lname", "image"],
            },
            // {
            //   model: sequelize.models.UserStats,
            //   as: "stats",
            //   attributes: ["level"],
            // },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    }).then((requests) => {
      return requests.map((request) => {
        const otherUser = request[includeAssociation];

        return {
          type: otherUser.type || requestType,
          id: request.id,
          user_id: otherUser.id,
          fname: otherUser.profile?.fname || "",
          lname: otherUser.profile?.lname || "",
          email: otherUser.email,
          image: otherUser.profile?.image || null,
          stats: otherUser.stats
            ? { level: otherUser.stats.level }
            : { level: 0 },
          status: request.status,
          requestMessage: request.requestMessage,
          createdAt: request.createdAt,
        };
      });
    });
  };
  // Méthode pour compter les amis communs entre deux utilisateurs
  Friendship.countMutualFriendsAlt = function (user_id_1, user_id_2) {
    return this.sequelize
      .query(
        `
      SELECT COUNT(*) AS mutual_count
      FROM friendships f1
      INNER JOIN friendships f2 ON
        (f1.requester_id = :user_id_1 OR f1.recipient_id = :user_id_1)
        AND (f2.requester_id = :user_id_2 OR f2.recipient_id = :user_id_2)
        AND (
          (f1.requester_id = f2.requester_id AND f1.recipient_id = f2.recipient_id)
          OR (f1.requester_id = f2.recipient_id AND f1.recipient_id = f2.requester_id)
        )
      WHERE f1.status = 'accepted' AND f2.status = 'accepted'
    `,
        {
          replacements: { user_id_1, user_id_2 },
          type: this.sequelize.QueryTypes.SELECT,
        }
      )
      .then((result) => {
        return result[0]?.mutual_count || 0;
      });
  };

  // Alternative plus simple si la méthode ci-dessus ne fonctionne pas
  Friendship.countMutualFriends = function (user_id_1, user_id_2) {
    return this.findAll({
      where: {
        status: "accepted",
        [Op.or]: [{ requester_id: user_id_1 }, { recipient_id: user_id_1 }],
      },
    }).then((friendshipsA) => {
      const friendIdsA = friendshipsA.map((friendship) =>
        friendship.requester_id === user_id_1
          ? friendship.recipient_id
          : friendship.requester_id
      );

      return this.findAll({
        where: {
          status: "accepted",
          [Op.or]: [{ requester_id: user_id_2 }, { recipient_id: user_id_2 }],
        },
      }).then((friendshipsB) => {
        const friendIdsB = friendshipsB.map((friendship) =>
          friendship.requester_id === user_id_2
            ? friendship.recipient_id
            : friendship.requester_id
        );

        // Compter les amis communs
        const mutualFriends = friendIdsA.filter((id) =>
          friendIdsB.includes(id)
        );
        return mutualFriends.length;
      });
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
