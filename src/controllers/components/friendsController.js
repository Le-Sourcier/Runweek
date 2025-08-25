const Joi = require("joi");
const {
  Users,
  UserStats,
  Friendship,
  Conversation,
  Message,
  ActivityShare,
  Report,
  Profiles,
  DataSharingPreferences,
} = require("../../models");
const { serverMessage } = require("../../utils");
const { Op } = require("sequelize");
const db = require("../../models");

// Validation schemas
const sendFriendRequestSchema = Joi.object({
  email: Joi.string().email().required(),
  message: Joi.string().max(300).trim().allow(""),
});

const sendMessageSchema = Joi.object({
  content: Joi.string().required().max(1000).trim(),
  messageType: Joi.string().valid("text", "emoji").default("text"),
});

const shareActivitySchema = Joi.object({
  activityType: Joi.string()
    .valid(
      "run",
      "achievement",
      "goal_completed",
      "personal_record",
      "nutrition"
    )
    .required(),
  activityData: Joi.object().required(),
  description: Joi.string().max(500).trim().allow(""),
  visibility: Joi.string().valid("friends", "public").default("friends"),
});

const reportUserSchema = Joi.object({
  reportedUserId: Joi.string().required(),
  reason: Joi.string()
    .valid(
      "inappropriate_content",
      "harassment",
      "spam",
      "fake_profile",
      "abusive_behavior",
      "other"
    )
    .required(),
  details: Joi.string().required().max(1000).trim(),
  severity: Joi.string().valid("low", "medium", "high").default("medium"),
});

module.exports = {
  // GET /api/friends - Récupérer la liste des amis
  getFriends: async (req, res) => {
    try {
      const { status = "all", sort = "name" } = req.query;

      const friendships = await Friendship.getFriends(req.user.id);

      let friends = await Promise.all(
        friendships.map(async (friendship) => {
          const friend =
            friendship.requester.id.toString() === req.user.id.toString()
              ? friendship.recipient
              : friendship.requester;

          // Récupérer les préférences de partage de l'ami
          const sharingPreferences =
            await db.sequelize.models.DataSharingPreferences.findOne({
              where: { user_id: friend.id },
              attributes: [
                "shareActivities",
                "shareGoals",
                "shareAchievements",
                "showInSearch",
              ],
            });

          // Récupérer les stats de l'ami (si partagées)
          let stats = null;
          if (sharingPreferences?.shareActivities) {
            // Exemple de calcul des stats - à adapter selon vos modèles
            const activityData = await db.sequelize.models.ActivityData.findAll(
              {
                where: { user_id: friend.id },
                attributes: [
                  [
                    db.sequelize.fn("SUM", db.sequelize.col("distance")),
                    "totalDistance",
                  ],
                  [
                    db.sequelize.fn("COUNT", db.sequelize.col("id")),
                    "totalRuns",
                  ],
                ],
                raw: true,
              }
            );

            const userStats = await db.sequelize.models.UserStats.findOne({
              where: { user_id: friend.id },
              attributes: ["level", "experience"],
            });

            stats = {
              totalDistance: activityData[0]?.totalDistance || 0,
              totalRuns: activityData[0]?.totalRuns || 0,
              averagePace: "5:30", // À calculer selon vos données
              level: userStats?.level || 1,
              experience: userStats?.experience || 0,
            };
          }

          // Récupérer le nombre d'amis communs
          const mutualFriends = await Friendship.countMutualFriends(
            req.user.id,
            friend.id
          );

          // Déterminer le statut en ligne (simulé pour l'exemple)
          const isOnline = Math.random() > 0.6;

          const _user = await Users.findByPk(friend.id);

          return {
            id: friend.id,
            name: `${friend.profile?.fname || ""} ${
              friend.profile?.lname || ""
            }`.trim(),
            email: friend.email,
            profileImage: friend.profile?.image || null,
            isOnline,
            lastActivity: _user.updatedAt,
            mutualFriends,
            joinedDate: friend.createdAt.toISOString().split("T")[0],
            stats: sharingPreferences?.shareActivities ? stats : null,
            preferences: {
              profileVisibility: sharingPreferences?.showInSearch
                ? "public"
                : "private",
              activityVisibility: sharingPreferences?.shareActivities
                ? "friends"
                : "private",
            },
          };
        })
      );

      // Filtrer par statut si demandé
      if (status !== "all") {
        friends = friends.filter((friend) =>
          status === "online" ? friend.isOnline : !friend.isOnline
        );
      }

      // Trier
      friends.sort((a, b) => {
        switch (sort) {
          case "name":
            return a.name.localeCompare(b.name);
          case "level":
            return (b.stats?.level || 0) - (a.stats?.level || 0);
          case "recent":
            return (
              new Date(b.lastActivity).getTime() -
              new Date(a.lastActivity).getTime()
            );
          case "mutual":
            return b.mutualFriends - a.mutualFriends;
          default:
            return 0;
        }
      });

      if (!friends.length) {
        return serverMessage(res, "NO_FRIENDS_FOUND");
      }

      return serverMessage(res, "FRIENDS_RETRIEVED", friends);
    } catch (error) {
      console.error("Erreur lors de la récupération des amis:", error);
      return serverMessage(res, "FRIENDS_RETRIEVAL_FAILED", error.message);
    }
  },

  // GET /api/friends/requests - Récupérer les demandes d'amis
  getFriendRequests: async (req, res) => {
    try {
      const { type = "received" } = req.query;
      const userId = req.user.id;

      const requests = await Friendship.getFriendRequests(userId, type);

      if (!requests || requests.length === 0) {
        return serverMessage(res, "NO_FRIEND_REQUESTS_FOUND");
      }

      return serverMessage(res, "FRIENDS_RETRIEVED", requests);
    } catch (error) {
      console.error("Erreur lors de la récupération des demandes:", error);
      return serverMessage(
        res,
        "FRIEND_REQUESTS_RETRIEVAL_FAILED",
        error.message
      );
    }
  },

  // GET /api/friends/blocked - Récupérer les amis blockés
  getBlockedFriends: async (req, res) => {
    try {
      const { sort = "name", limit = 20, page = 1 } = req.query;

      // Validation des paramètres
      const allowedSorts = ["name", "mutual", "recent"];
      if (!allowedSorts.includes(sort)) {
        return serverMessage(res, "INVALID_QUERY_PARAMETERS", {
          sort: "Invalid sort parameter. Allowed values: name, mutual, recent",
        });
      }

      const numericLimit = Math.min(parseInt(limit), 100);
      const numericPage = Math.max(parseInt(page), 1);

      const friendships = await Friendship.getFriends(req.user.id, "blocked");

      let friends = await Promise.all(
        friendships.map(async (friendship) => {
          const friend =
            friendship.requester.id.toString() === req.user.id.toString()
              ? friendship.recipient
              : friendship.requester;

          // Récupérer les préférences de partage de l'ami
          const sharingPreferences =
            await db.sequelize.models.DataSharingPreferences.findOne({
              where: { user_id: friend.id },
              attributes: [
                "shareActivities",
                "shareGoals",
                "shareAchievements",
                "showInSearch",
              ],
            });

          // Récupérer le nombre d'amis communs
          const mutualFriends = await Friendship.countMutualFriends(
            req.user.id,
            friend.id
          );

          return {
            id: friend.id,
            name: `${friend.profile?.fname || ""} ${
              friend.profile?.lname || ""
            }`.trim(),
            email: friend.email,
            profileImage: friend.profile?.image || null,
            mutualFriends,
            joinedDate: friend.createdAt.toISOString().split("T")[0],
            blockedAt: friendship.updatedAt, // Date du blocage
            preferences: {
              profileVisibility: sharingPreferences?.showInSearch
                ? "public"
                : "private",
              activityVisibility: sharingPreferences?.shareActivities
                ? "friends"
                : "private",
            },
          };
        })
      );

      // Trier
      friends.sort((a, b) => {
        switch (sort) {
          case "name":
            return a.name.localeCompare(b.name);
          case "mutual":
            return b.mutualFriends - a.mutualFriends;
          case "recent":
            return (
              new Date(b.blockedAt).getTime() - new Date(a.blockedAt).getTime()
            );
          default:
            return 0;
        }
      });

      // Pagination
      const startIndex = (numericPage - 1) * numericLimit;
      const endIndex = startIndex + numericLimit;
      const paginatedFriends = friends.slice(startIndex, endIndex);

      const response = {
        friends: paginatedFriends,
        pagination: {
          total: friends.length,
          page: numericPage,
          limit: numericLimit,
          pages: Math.ceil(friends.length / numericLimit),
        },
      };

      if (!friends.length) {
        return serverMessage(res, "NO_BLOCKED_FRIENDS_FOUND", response);
      }

      return serverMessage(res, "BLOCKED_FRIENDS_RETRIEVED", response);
    } catch (error) {
      console.error("Erreur lors de la récupération des amis bloqués:", error);
      return serverMessage(
        res,
        "BLOCKED_FRIENDS_RETRIEVAL_FAILED",
        error.message
      );
    }
  },

  // POST /api/friends/request - Envoyer une demande d'ami
  sendFriendRequest: async (req, res) => {
    try {
      const { error, value } = sendFriendRequestSchema.validate(req.body);

      const { email, message } = value;
      const { email: _email } = req.user;

      if (error) {
        console.error("Validation error:", error.details[0].message);
        return serverMessage(res, "BAD_REQUEST");
      }

      // Trouver l'utilisateur destinataire
      const recipient = await Users.findOne({
        where: { email },
        include: [
          {
            model: DataSharingPreferences,
            as: "dataSharingPreferences",
            attributes: ["allowFriendRequests"],
          },
        ],
      });

      if (!recipient) {
        return serverMessage(res, "USER_NOT_FOUND");
      }

      if (email === _email.toString()) {
        console.error("Tentative d'ajout de soi-même:", req.user.id);
        return serverMessage(res, "CANNOT_ADD_SELF");
      }

      // Vérifier s'il y a déjà une relation
      const existingFriendship = await Friendship.findFriendship(
        req.user.id,
        recipient.id
      );

      // CORRECTION ICI: Vérifier si existingFriendship existe ET a un status
      if (existingFriendship && existingFriendship.status) {
        if (existingFriendship.status === "accepted") {
          return serverMessage(res, "ALREADY_FRIENDS");
        } else if (existingFriendship.status === "pending") {
          console.error("Demande d'ami déjà envoyée:", existingFriendship.id);
          return serverMessage(res, "FRIEND_REQUEST_ALREADY_SENT");
        } else if (existingFriendship.status === "blocked") {
          console.error("Amitié bloquée:", existingFriendship.id);
          return serverMessage(res, "FRIENDSHIP_NOT_ALLOWED");
        }
      }

      // Vérifier les paramètres de confidentialité du destinataire
      // CORRECTION: Vérifier si preferences existe avant d'accéder à dataSharing

      console.log(recipient.dataSharingPreferences);
      if (
        !recipient.dataSharingPreferences ||
        !recipient.dataSharingPreferences?.allowFriendRequests
      ) {
        console.error("Demande d'ami non autorisée:", recipient.id);
        return serverMessage(res, "FRIENDSHIP_NOT_ALLOWED");
      }

      // Créer la demande d'ami - CORRECTION: utiliser les bons noms de champ
      const friendship = await Friendship.create({
        requester_id: req.user.id, // Utiliser requester_id au lieu de requester
        recipient_id: recipient.id, // Utiliser recipient_id au lieu de recipient
        requestMessage: message,
      });

      const data = {
        id: friendship.id,
        requester_id: friendship.requester_id,
        recipient: friendship.recipient_id,
        status: friendship.stats,
        requestMessage: friendship.requestMessage,
        createdAt: friendship.createdAt,
      };

      return serverMessage(res, "FRIEND_REQUEST_SENT", data);
    } catch (error) {
      console.error("Erreur lors de l'envoi de la demande:", error);
      return serverMessage(res, "FRIEND_REQUEST_FAILED", error.message);
    }
  },

  // PUT /api/friends/requests/:id/accept - Accepter une demande d'ami
  acceptFriendRequest: async (req, res) => {
    try {
      const friendship = await Friendship.findOne({
        where: {
          id: req.params.id,
          recipient_id: req.user.id,
          status: "pending",
        },
        include: [
          {
            model: Users,
            as: "requester",
            attributes: ["id", "email"],
            include: [
              {
                model: Profiles,
                as: "profile",
                attributes: ["id", "fname", "lname", "image"],
              },
            ],
          },
        ],
      });

      if (!friendship) {
        return serverMessage(res, "FRIEND_REQUEST_NOT_FOUND");
      }

      friendship.status = "accepted";
      friendship.acceptedAt = new Date();
      await friendship.save();

      return serverMessage(res, "FRIEND_REQUEST_ACCEPTED", friendship);
    } catch (error) {
      console.error("Erreur lors de l'acceptation de la demande:", error);
      return serverMessage(res, "FRIEND_REQUEST_ACCEPT_FAILED", error.message);
    }
  },

  // PUT /api/friends/requests/:id/decline - Refuser une demande d'ami
  declineFriendRequest: async (req, res) => {
    try {
      const friendship = await Friendship.findOne({
        id: req.params.id,
        recipient: req.user.id,
        status: "pending",
      });

      if (!friendship) {
        return serverMessage(res, "FRIEND_REQUEST_NOT_FOUND");
      }

      friendship.status = "declined";
      friendship.declinedAt = new Date();
      await friendship.save();

      return serverMessage(res, "FRIEND_REQUEST_DECLINED", friendship);
    } catch (error) {
      console.error("Erreur lors du refus de la demande:", error);
      return serverMessage(res, "FRIEND_REQUEST_DECLINE_FAILED");
    }
  },

  // DELETE /api/friends/:id - Supprimer un ami
  deleteFriend: async (req, res) => {
    try {
      const friendship = await Friendship.findOne({
        $or: [
          { requester: req.user.id, recipient: req.params.id },
          { requester: req.params.id, recipient: req.user.id },
        ],
        status: "accepted",
      });

      if (!friendship) {
        return serverMessage(res, "FRIENDSHIP_NOT_FOUND");
      }

      await Friendship.findByIdAndDelete(friendship.id);

      return serverMessage(res, "FRIEND_DELETED");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'ami:", error);
      return serverMessage(res, "FRIEND_DELETION_FAILED", error.message);
    }
  },

  // GET /api/friends/search - Rechercher des utilisateurs
  searchUsers: async (req, res) => {
    try {
      const { q, limit = 10 } = req.query;

      if (!q || q.trim().length < 2) {
        return serverMessage(res, "SEARCH_QUERY_TOO_SHORT");
      }

      const searchQuery = q.trim();

      // Récupérer les IDs des amis existants et demandes en cours
      const friendships = await Friendship.findAll({
        where: {
          [Op.or]: [
            { requester_id: req.user.id },
            { recipient_id: req.user.id },
          ],
          status: {
            [Op.in]: ["accepted", "pending"],
          },
        },
      });

      // Exclure les utilisateurs déjà en relation
      const excludeIds = friendships.map((friendship) =>
        friendship.requester_id === req.user.id
          ? friendship.recipient_id
          : friendship.requester_id
      );
      excludeIds.push(req.user.id);

      // Vérifier d'abord s'il y a des utilisateurs avec showInSearch = true
      const usersWithSharing = await DataSharingPreferences.findAll({
        where: { showInSearch: true },
        attributes: ["user_id"],
      });

      // Recherche des utilisateurs
      const users = await Users.findAll({
        where: {
          id: {
            [Op.notIn]: excludeIds,
          },
          status: "VERIFIED",
          [Op.or]: [
            { email: { [Op.iLike]: `%${searchQuery}%` } },
            { "$profile.fname$": { [Op.iLike]: `%${searchQuery}%` } },
            { "$profile.lname$": { [Op.iLike]: `%${searchQuery}%` } },
            db.sequelize.where(
              db.sequelize.fn(
                "CONCAT",
                db.sequelize.col("profile.fname"),
                " ",
                db.sequelize.col("profile.lname")
              ),
              {
                [Op.iLike]: `%${searchQuery}%`,
              }
            ),
          ],
        },
        include: [
          {
            model: Profiles,
            as: "profile",
            required: true,
          },
          {
            model: UserStats,
            as: "stats",
            attributes: ["average_pace", "level", "experience"],
            required: false,
          },
          {
            model: DataSharingPreferences,
            as: "dataSharingPreferences",
            where: {
              showInSearch: true,
            },
            required: true,
          },
        ],
        attributes: ["id", "email", "createdAt"],
        limit: parseInt(limit),
        // Ajouter le logging pour voir la requête SQL générée
        // logging: console.log,
      });

      // console.log("Raw users found:", users.length);

      // Récupérer les données d'activité pour chaque utilisateur
      const usersWithActivityData = await Promise.all(
        users.map(async (user) => {
          try {
            const activityData = await db.sequelize.models.ActivityData.findAll(
              {
                where: { user_id: user.id },
                attributes: [
                  [
                    db.sequelize.fn("SUM", db.sequelize.col("distance")),
                    "totalDistance",
                  ],
                  [
                    db.sequelize.fn("COUNT", db.sequelize.col("id")),
                    "totalRuns",
                  ],
                ],
                raw: true,
              }
            );

            return {
              user: user.toJSON(),
              activityData: activityData[0] || {
                totalDistance: 0,
                totalRuns: 0,
              },
            };
          } catch (error) {
            console.error(
              "Error fetching activity data for user",
              user.id,
              error
            );
            return {
              user: user.toJSON(),
              activityData: { totalDistance: 0, totalRuns: 0 },
            };
          }
        })
      );

      // Formater la réponse
      const formattedUsers = usersWithActivityData.map(
        ({ user, activityData }) => ({
          id: user.id,
          email: user.email,
          name: `${user.profile.fname} ${user.profile.lname}`,
          profileImage: user.profile.image,
          joinedDate: user.createdAt,
          stats: {
            totalDistance: activityData.totalDistance || 0,
            totalRuns: activityData.totalRuns || 0,
            averagePace: user.stats?.average_pace || "0:00",
            level: user.stats?.level || 1,
            experience: user.stats?.experience || 0,
          },
          preferences: {
            profileVisibility:
              user.dataSharingPreferences?.profileVisibility || "public",
            activityVisibility:
              user.dataSharingPreferences?.activityVisibility || "public",
            showInSearch: user.dataSharingPreferences?.showInSearch || true,
          },
        })
      );

      // console.log("Formatted users:", formattedUsers);
      return serverMessage(res, "USERS_RETRIEVED", formattedUsers);
    } catch (error) {
      console.error("Erreur lors de la recherche d'utilisateurs:", error);
      return serverMessage(res, "USER_SEARCH_FAILED");
    }
  },
  // GET /api/friends/conversations - Récupérer les conversations
  getConversations: async (req, res) => {
    try {
      const conversations = await Conversation.find({
        participants: req.user.id,
        isActive: true,
      })
        .populate("participants", "fname lname email profile_image")
        .populate("lastMessage")
        .sort({ lastActivity: -1 });
      if (conversations.length === 0) {
        return serverMessage(res, "NO_CONVERSATIONS_FOUND");
      }

      return serverMessage(res, "CONVERSATIONS_RETRIEVED", conversations);
    } catch (error) {
      console.error("Erreur lors de la récupération des conversations:", error);
      return serverMessage(res, "CONVERSATIONS_RETRIEVAL_FAILED");
    }
  },

  // GET /api/friends/conversations/:id/messages - Récupérer les messages d'une conversation
  getConversationMessages: async (req, res) => {
    try {
      const { page = 1, limit = 50 } = req.query;

      // Vérifier que l'utilisateur fait partie de la conversation
      const conversation = await Conversation.findOne({
        id: req.params.id,
        participants: req.user.id,
      });

      if (!conversation) {
        return serverMessage(res, "NO_CONVERSATION_FOUND");
      }

      const messages = await Message.find({ conversation: req.params.id })
        .populate("sender", "fname lname profile_image")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      return serverMessage(res, "MESSAGES_RETRIEVED", messages.reverse());
    } catch (error) {
      console.error("Erreur lors de la récupération des messages:", error);
      return serverMessage(res, "MESSAGES_RETRIEVAL_FAILED", error.message);
    }
  },

  // POST /api/friends/:id/message - Envoyer un message à un ami
  sendMessage: async (req, res) => {
    try {
      const { error, value } = sendMessageSchema.validate(req.body);

      if (error) {
        console.error("Validation error:", error.details[0].message);
        return serverMessage(res, "BAD_REQUEST");
      }

      // Vérifier que les utilisateurs sont amis
      const friendship = await Friendship.findOne({
        $or: [
          { requester: req.user.id, recipient: req.params.id },
          { requester: req.params.id, recipient: req.user.id },
        ],
        status: "accepted",
      });

      if (!friendship) {
        console.error(
          "Amitié non trouvée pour l'envoi du message:",
          req.user.id,
          req.params.id
        );
        return serverMessage(res, "FRIENDSHIP_NOT_FOUND");
      }

      // Trouver ou créer la conversation
      let conversation = await Conversation.findOne({
        participants: { $all: [req.user.id, req.params.id] },
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [req.user.id, req.params.id],
        });
        await conversation.save();
      }

      // Créer le message
      const message = new Message({
        conversation: conversation.id,
        sender: req.user.id,
        content: value.content,
        messageType: value.messageType,
      });

      await message.save();

      // Mettre à jour la conversation
      conversation.lastMessage = message.id;
      conversation.lastActivity = new Date();
      await conversation.save();

      // Populer le message pour la réponse
      await message.populate("sender", "fname lname profile_image");

      return serverMessage(res, "MESSAGE_SENT", message);
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      return serverMessage(res, "MESSAGE_SEND_FAILED", error.message);
    }
  },

  // GET /api/friends/activity-feed - Récupérer le feed d'activités des amis
  getActivityFeed: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;

      // Récupérer les IDs des amis
      const friendships = await Friendship.getFriends(req.user.id);
      const friendIds = friendships.map((f) =>
        f.requester.id.toString() === req.user.id.toString()
          ? f.recipient.id
          : f.requester.id
      );

      const activities = await ActivityShare.find({
        sharedBy: { $in: friendIds },
        visibility: { $in: ["friends", "public"] },
        isActive: true,
      })
        .populate("sharedBy", "fname lname profile_image")
        .populate("likes.user", "fname lname profile_image")
        .populate("comments.user", "fname lname profile_image")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      if (activities.length === 0) {
        return serverMessage(res, "NO_ACTIVITIES_FOUND");
      }

      return serverMessage(res, "ACTIVITIES_RETRIEVED", activities);
    } catch (error) {
      console.error("Erreur lors de la récupération du feed:", error);
      return serverMessage(res, "ACTIVITY_FEED_RETRIEVAL_FAILED");
    }
  },

  // POST /api/friends/share-activity - Partager une activité
  shareActivity: async (req, res) => {
    try {
      const { error, value } = shareActivitySchema.validate(req.body);

      if (error) {
        console.error("Validation error:", error.details[0].message);

        return serverMessage(res, "BAD_REQUEST");
      }

      const activityShare = new ActivityShare({
        ...value,
        sharedBy: req.user.id,
      });

      await activityShare.save();
      await activityShare.populate("sharedBy", "fname lname profile_image");

      return serverMessage(res, "ACTIVITY_SHARED", activityShare);
    } catch (error) {
      console.error("Erreur lors du partage de l'activité:", error);
      return serverMessage(res, "ACTIVITY_SHARE_FAILED", error.message);
    }
  },

  // POST /api/friends/activity/:id/like - Liker une activité
  likeActivity: async (req, res) => {
    try {
      const activity = await ActivityShare.findById(req.params.id);

      if (!activity) {
        return serverMessage(res, "ACTIVITY_NOT_FOUND");
      }

      const existingLike = activity.likes.find(
        (like) => like.user.toString() === req.user.id.toString()
      );

      if (existingLike) {
        // Retirer le like
        activity.likes = activity.likes.filter(
          (like) => like.user.toString() !== req.user.id.toString()
        );
      } else {
        // Ajouter le like
        activity.likes.push({ user: req.user.id });
      }

      await activity.save();

      serverMessage(res, existingLike ? "LIKE_REMOVED" : "LIKE_ADDED", {
        liked: !existingLike,
        totalLikes: activity.likes.length,
      });
    } catch (error) {
      console.error("Erreur lors du like:", error);
      return serverMessage(res, "LIKE_ACTION_FAILED", error.message);
    }
  },

  // POST /api/friends/activity/:id/comment - Commenter une activité
  commentActivity: async (req, res) => {
    try {
      const { content } = req.body;

      if (!content || content.trim().length === 0) {
        return serverMessage(res, "COMMENT_CONTENT_REQUIRED");
      }

      if (content.length > 300) {
        console.error("Commentaire trop long :", content.length);
        return serverMessage(res, "COMMENT_TOO_LONG");
      }

      const activity = await ActivityShare.findById(req.params.id);

      if (!activity) {
        return serverMessage(res, "ACTIVITY_NOT_FOUND");
      }

      const comment = {
        user: req.user.id,
        content: content.trim(),
      };

      activity.comments.push(comment);
      await activity.save();

      await activity.populate("comments.user", "fname lname profile_image");

      return serverMessage(
        res,
        "COMMENT_ADDED",
        activity.comments[activity.comments.length - 1]
      );
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire:", error);
      return serverMessage(res, "COMMENT_ADD_FAILED", error.message);
    }
  },

  // POST /api/friends/report - Signaler un utilisateur
  reportUser: async (req, res) => {
    try {
      const { error, value } = reportUserSchema.validate(req.body);

      if (error) {
        console.error("Validation error:", error.details[0].message);

        return serverMessage(res, "BAD_REQUEST");
      }

      const { reportedUserId } = req.body;

      // Vérifier que l'utilisateur signalé existe
      const reportedUser = await User.findById(reportedUserId);
      if (!reportedUser) {
        return serverMessage(res, "USER_NOT_FOUND");
      }

      // Vérifier qu'on ne se signale pas soi-même
      if (reportedUserId === req.user.id.toString()) {
        console.error("Tentative de signalement de soi-même:", req.user.id);

        return serverMessage(res, "CANNOT_REPORT_SELF");
      }

      // Vérifier s'il n'y a pas déjà un signalement récent
      const existingReport = await Report.findOne({
        reporter: req.user.id,
        reported: reportedUserId,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      });

      if (existingReport) {
        console.error(
          "Signalement déjà existant pour l'utilisateur:",
          reportedUserId
        );

        return serverMessage(res, "USER_ALREADY_REPORTED");
      }

      const report = new Report({
        reporter: req.user.id,
        reported: reportedUserId,
        reason: value.reason,
        details: value.details,
        severity: value.severity,
      });

      await report.save();

      // Actions automatiques selon la gravité
      if (value.severity === "high") {
        // Bloquer automatiquement pour les cas graves
        await Friendship.findOneAndUpdate(
          {
            $or: [
              { requester: req.user.id, recipient: reportedUserId },
              { requester: reportedUserId, recipient: req.user.id },
            ],
          },
          {
            status: "blocked",
            blockedAt: new Date(),
            blockedBy: req.user.id,
          }
        );
      }

      // res.status(201).json({
      //   error: false,
      //   message:
      //     "Signalement envoyé avec succès. Notre équipe l'examinera dans les 24h.",
      //   data: { reportId: report.id },
      // });

      return serverMessage(res, "REPORT_SUBMITTED", {
        report_id: report.id,
      });
    } catch (error) {
      console.error("Erreur lors du signalement:", error);
      return serverMessage(res, "REPORT_SUBMISSION_FAILED");
    }
  },

  // GET /api/friends/stats - Statistiques des amis
  getFriendsStats: async (req, res) => {
    try {
      const userId = req.user.id;

      const [friendsCount, pendingRequests, sentRequests, recentActivity] =
        await Promise.all([
          // Compter les amis (relations acceptées)
          Friendship.count({
            where: {
              status: "accepted",
              [Op.or]: [{ requester_id: userId }, { recipient_id: userId }],
            },
          }),
          // Compter les demandes reçues en attente
          Friendship.count({
            where: {
              status: "pending",
              recipient_id: userId,
            },
          }),
          // Compter les demandes envoyées en attente
          Friendship.count({
            where: {
              status: "pending",
              requester_id: userId,
            },
          }),
          // Compter les activités récentes des amis
          (async () => {
            try {
              // Récupérer d'abord la liste des IDs des amis
              const friendships = await Friendship.findAll({
                where: {
                  status: "accepted",
                  [Op.or]: [{ requester_id: userId }, { recipient_id: userId }],
                },
                attributes: ["requester_id", "recipient_id"],
                raw: true,
              });

              // Extraire les IDs des amis
              const friendIds = friendships.map((friendship) =>
                friendship.requester_id === userId
                  ? friendship.recipient_id
                  : friendship.requester_id
              );

              if (friendIds.length === 0) return 0;

              // Compter les activités partagées par ces amis dans les 7 derniers jours
              return ActivityShare.count({
                where: {
                  shared_by_id: {
                    [Op.in]: friendIds,
                  },
                  createdAt: {
                    [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  },
                },
              });
            } catch (error) {
              console.error("Erreur lors du comptage des activités:", error);
              return 0;
            }
          })(),
        ]);

      const stats = {
        totalFriends: friendsCount,
        pendingRequests,
        sentRequests,
        recentActivity,
        onlineFriends: Math.floor(friendsCount * 0.3),
        mutualConnections: Math.floor(friendsCount * 1.5),
      };

      if (stats.totalFriends === 0) {
        return serverMessage(res, "NO_FRIENDS_STATS_FOUND");
      }

      return serverMessage(res, "FRIENDS_STATS_RETRIEVED", stats);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      return serverMessage(res, "FRIENDS_STATS_RETRIEVAL_FAILED");
    }
  },

  // PUT /api/friends/:id/block - Bloquer un utilisateur
  blockUser: async (req, res) => {
    try {
      const friendship = await Friendship.findOne({
        $or: [
          { requester: req.user.id, recipient: req.params.id },
          { requester: req.params.id, recipient: req.user.id },
        ],
      });

      if (friendship) {
        friendship.status = "blocked";
        friendship.blockedAt = new Date();
        friendship.blockedBy = req.user.id;
        await friendship.save();
      } else {
        // Créer une entrée de blocage même s'il n'y avait pas d'amitié
        const blockEntry = new Friendship({
          requester: req.user.id,
          recipient: req.params.id,
          status: "blocked",
          blockedAt: new Date(),
          blockedBy: req.user.id,
        });
        await blockEntry.save();
      }

      return serverMessage(res, "USER_BLOCKED");
    } catch (error) {
      console.error("Erreur lors du blocage:", error);
      return serverMessage(res, "BLOCK_USER_FAILED", error.message);
    }
  },
  // PUT /api/friends/:id/unblock - Debloquer un utilisateur
  unblockUser: async (req, res) => {
    try {
      const userIdToUnblock = req.params.id;
      const currentUserId = req.user.id;
      // Trouver l'amitié/relation de blocage
      const friendship = await Friendship.findOne({
        where: {
          [Op.or]: [
            {
              requester_id: currentUserId,
              recipient_id: userIdToUnblock,
              status: "blocked",
            },
            {
              requester_id: userIdToUnblock,
              recipient_id: currentUserId,
              status: "blocked",
            },
          ],
        },
      });

      if (!friendship) {
        return serverMessage(res, "BLOCK_RELATIONSHIP_NOT_FOUND");
      }

      // Vérifier qui a initié le blocage
      if (friendship.blockedBy !== currentUserId.toString()) {
        return serverMessage(res, "CANNOT_UNBLOCK_NOT_BLOCKED_BY_YOU");
      }

      if (friendship) {
        friendship.status = "accepted";
        friendship.blockedAt = null;
        friendship.blockedBy = null;
        await friendship.save();
      }

      return serverMessage(res, "USER_UNBLOCKED");
    } catch (error) {
      console.error("Erreur lors du blocage:", error);
      return serverMessage(res, "UNBLOCK_USER_FAILED", error.message);
    }
  },
};
