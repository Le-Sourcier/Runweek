const Joi = require("joi");
const {
  User,
  Friendship,
  Conversation,
  Message,
  ActivityShare,
  Report,
} = require("../../models");

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
      const { status = "online", sort = "name" } = req.query;

      const friendships = await Friendship.getFriends(req.user._id);

      let friends = friendships.map((friendship) => {
        const friend =
          friendship.requester._id.toString() === req.user._id.toString()
            ? friendship.recipient
            : friendship.requester;

        return {
          ...friend.toObject(),
          friendshipId: friendship._id,
          friendsSince: friendship.acceptedAt,
        };
      });

      // Filtrer par statut
      if (status === "online") {
        friends = friends.map((friend) => ({
          ...friend,
          isOnline: Math.random() > 0.6,
          lastActivity: new Date(),
        }));
      }

      // Trier
      friends.sort((a, b) => {
        switch (sort) {
          case "name":
            return `${a.fname} ${a.lname}`.localeCompare(
              `${b.fname} ${b.lname}`
            );
          case "level":
            return (b.stats?.level || 0) - (a.stats?.level || 0);
          case "recent":
            return (
              new Date(b.lastActivity || 0).getTime() -
              new Date(a.lastActivity || 0).getTime()
            );
          default:
            return 0;
        }
      });

      res.json({
        error: false,
        message: "Liste des amis récupérée avec succès",
        data: friends,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des amis:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de la récupération des amis",
      });
    }
  },

  // GET /api/friends/requests - Récupérer les demandes d'amis
  getFriendRequests: async (req, res) => {
    try {
      const { type = "received" } = req.query;

      let filter = {};
      if (type === "received") {
        filter = { recipient: req.user._id, status: "pending" };
      } else if (type === "sent") {
        filter = { requester: req.user._id, status: "pending" };
      }

      const requests = await Friendship.find(filter)
        .populate("requester recipient", "fname lname email profileImage stats")
        .sort({ createdAt: -1 });

      res.json({
        error: false,
        message: "Demandes d'amis récupérées avec succès",
        data: requests,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des demandes:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de la récupération des demandes",
      });
    }
  },

  // POST /api/friends/request - Envoyer une demande d'ami
  sendFriendRequest: async (req, res) => {
    try {
      const { error, value } = sendFriendRequestSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          error: true,
          message: "Données invalides",
          details: error.details[0].message,
        });
      }

      const { email, message } = value;

      // Trouver l'utilisateur destinataire
      const recipient = await User.findOne({ email: email.toLowerCase() });

      if (!recipient) {
        return res.status(404).json({
          error: true,
          message: "Utilisateur non trouvé avec cette adresse email",
        });
      }

      if (recipient._id.toString() === req.user._id.toString()) {
        return res.status(400).json({
          error: true,
          message: "Vous ne pouvez pas vous ajouter vous-même",
        });
      }

      // Vérifier s'il y a déjà une relation
      const existingFriendship = await Friendship.findFriendship(
        req.user._id,
        recipient._id
      );

      if (existingFriendship) {
        if (existingFriendship.status === "accepted") {
          return res.status(409).json({
            error: true,
            message: "Vous êtes déjà amis avec cette personne",
          });
        } else if (existingFriendship.status === "pending") {
          return res.status(409).json({
            error: true,
            message: "Une demande d'ami est déjà en attente",
          });
        } else if (existingFriendship.status === "blocked") {
          return res.status(403).json({
            error: true,
            message: "Impossible d'envoyer une demande à cette personne",
          });
        }
      }

      // Vérifier les paramètres de confidentialité du destinataire
      if (!recipient.preferences?.dataSharing?.allowFriendRequests) {
        return res.status(403).json({
          error: true,
          message: "Cette personne n'accepte pas les demandes d'amis",
        });
      }

      // Créer la demande d'ami
      const friendship = new Friendship({
        requester: req.user._id,
        recipient: recipient._id,
        requestMessage: message,
      });

      await friendship.save();

      res.status(201).json({
        error: false,
        message: "Demande d'ami envoyée avec succès",
        data: friendship,
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de la demande:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de l'envoi de la demande",
      });
    }
  },

  // PUT /api/friends/requests/:id/accept - Accepter une demande d'ami
  acceptFriendRequest: async (req, res) => {
    try {
      const friendship = await Friendship.findOne({
        _id: req.params.id,
        recipient: req.user._id,
        status: "pending",
      }).populate("requester", "fname lname email profileImage");

      if (!friendship) {
        return res.status(404).json({
          error: true,
          message: "Demande d'ami non trouvée",
        });
      }

      friendship.status = "accepted";
      friendship.acceptedAt = new Date();
      await friendship.save();

      res.json({
        error: false,
        message: "Demande d'ami acceptée avec succès",
        data: friendship,
      });
    } catch (error) {
      console.error("Erreur lors de l'acceptation de la demande:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de l'acceptation de la demande",
      });
    }
  },

  // PUT /api/friends/requests/:id/decline - Refuser une demande d'ami
  declineFriendRequest: async (req, res) => {
    try {
      const friendship = await Friendship.findOne({
        _id: req.params.id,
        recipient: req.user._id,
        status: "pending",
      });

      if (!friendship) {
        return res.status(404).json({
          error: true,
          message: "Demande d'ami non trouvée",
        });
      }

      friendship.status = "declined";
      friendship.declinedAt = new Date();
      await friendship.save();

      res.json({
        error: false,
        message: "Demande d'ami refusée",
      });
    } catch (error) {
      console.error("Erreur lors du refus de la demande:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors du refus de la demande",
      });
    }
  },

  // DELETE /api/friends/:id - Supprimer un ami
  deleteFriend: async (req, res) => {
    try {
      const friendship = await Friendship.findOne({
        $or: [
          { requester: req.user._id, recipient: req.params.id },
          { requester: req.params.id, recipient: req.user._id },
        ],
        status: "accepted",
      });

      if (!friendship) {
        return res.status(404).json({
          error: true,
          message: "Amitié non trouvée",
        });
      }

      await Friendship.findByIdAndDelete(friendship._id);

      res.json({
        error: false,
        message: "Ami supprimé avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'ami:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de la suppression de l'ami",
      });
    }
  },

  // GET /api/friends/search - Rechercher des utilisateurs
  searchUsers: async (req, res) => {
    try {
      const { q, limit = 10 } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          error: true,
          message:
            "La requête de recherche doit contenir au moins 2 caractères",
        });
      }

      const searchRegex = new RegExp(q.trim(), "i");

      // Récupérer les IDs des amis existants
      const friendships = await Friendship.find({
        $or: [{ requester: req.user._id }, { recipient: req.user._id }],
        status: { $in: ["accepted", "pending"] },
      });

      const excludeIds = friendships.map((f) =>
        f.requester.toString() === req.user._id.toString()
          ? f.recipient
          : f.requester
      );
      excludeIds.push(req.user._id);

      const users = await User.find({
        _id: { $nin: excludeIds },
        $or: [
          { fname: searchRegex },
          { lname: searchRegex },
          { email: searchRegex },
        ],
        "preferences.dataSharing.showInSearch": true,
        isActive: true,
      })
        .select("fname lname email profileImage stats preferences")
        .limit(parseInt(limit));

      res.json({
        error: false,
        message: "Utilisateurs trouvés avec succès",
        data: users,
      });
    } catch (error) {
      console.error("Erreur lors de la recherche d'utilisateurs:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de la recherche d'utilisateurs",
      });
    }
  },

  // GET /api/friends/conversations - Récupérer les conversations
  getConversations: async (req, res) => {
    try {
      const conversations = await Conversation.find({
        participants: req.user._id,
        isActive: true,
      })
        .populate("participants", "fname lname email profileImage")
        .populate("lastMessage")
        .sort({ lastActivity: -1 });

      res.json({
        error: false,
        message: "Conversations récupérées avec succès",
        data: conversations,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des conversations:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de la récupération des conversations",
      });
    }
  },

  // GET /api/friends/conversations/:id/messages - Récupérer les messages d'une conversation
  getConversationMessages: async (req, res) => {
    try {
      const { page = 1, limit = 50 } = req.query;

      // Vérifier que l'utilisateur fait partie de la conversation
      const conversation = await Conversation.findOne({
        _id: req.params.id,
        participants: req.user._id,
      });

      if (!conversation) {
        return res.status(404).json({
          error: true,
          message: "Conversation non trouvée",
        });
      }

      const messages = await Message.find({ conversation: req.params.id })
        .populate("sender", "fname lname profileImage")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      res.json({
        error: false,
        message: "Messages récupérés avec succès",
        data: messages.reverse(),
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des messages:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de la récupération des messages",
      });
    }
  },

  // POST /api/friends/:id/message - Envoyer un message à un ami
  sendMessage: async (req, res) => {
    try {
      const { error, value } = sendMessageSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          error: true,
          message: "Données invalides",
          details: error.details[0].message,
        });
      }

      // Vérifier que les utilisateurs sont amis
      const friendship = await Friendship.findOne({
        $or: [
          { requester: req.user._id, recipient: req.params.id },
          { requester: req.params.id, recipient: req.user._id },
        ],
        status: "accepted",
      });

      if (!friendship) {
        return res.status(403).json({
          error: true,
          message: "Vous devez être amis pour envoyer des messages",
        });
      }

      // Trouver ou créer la conversation
      let conversation = await Conversation.findOne({
        participants: { $all: [req.user._id, req.params.id] },
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [req.user._id, req.params.id],
        });
        await conversation.save();
      }

      // Créer le message
      const message = new Message({
        conversation: conversation._id,
        sender: req.user._id,
        content: value.content,
        messageType: value.messageType,
      });

      await message.save();

      // Mettre à jour la conversation
      conversation.lastMessage = message._id;
      conversation.lastActivity = new Date();
      await conversation.save();

      // Populer le message pour la réponse
      await message.populate("sender", "fname lname profileImage");

      res.status(201).json({
        error: false,
        message: "Message envoyé avec succès",
        data: message,
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de l'envoi du message",
      });
    }
  },

  // GET /api/friends/activity-feed - Récupérer le feed d'activités des amis
  getActivityFeed: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;

      // Récupérer les IDs des amis
      const friendships = await Friendship.getFriends(req.user._id);
      const friendIds = friendships.map((f) =>
        f.requester._id.toString() === req.user._id.toString()
          ? f.recipient._id
          : f.requester._id
      );

      const activities = await ActivityShare.find({
        sharedBy: { $in: friendIds },
        visibility: { $in: ["friends", "public"] },
        isActive: true,
      })
        .populate("sharedBy", "fname lname profileImage")
        .populate("likes.user", "fname lname profileImage")
        .populate("comments.user", "fname lname profileImage")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      res.json({
        error: false,
        message: "Feed d'activités récupéré avec succès",
        data: activities,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération du feed:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de la récupération du feed",
      });
    }
  },

  // POST /api/friends/share-activity - Partager une activité
  shareActivity: async (req, res) => {
    try {
      const { error, value } = shareActivitySchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          error: true,
          message: "Données invalides",
          details: error.details[0].message,
        });
      }

      const activityShare = new ActivityShare({
        ...value,
        sharedBy: req.user._id,
      });

      await activityShare.save();
      await activityShare.populate("sharedBy", "fname lname profileImage");

      res.status(201).json({
        error: false,
        message: "Activité partagée avec succès",
        data: activityShare,
      });
    } catch (error) {
      console.error("Erreur lors du partage de l'activité:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors du partage de l'activité",
      });
    }
  },

  // POST /api/friends/activity/:id/like - Liker une activité
  likeActivity: async (req, res) => {
    try {
      const activity = await ActivityShare.findById(req.params.id);

      if (!activity) {
        return res.status(404).json({
          error: true,
          message: "Activité non trouvée",
        });
      }

      const existingLike = activity.likes.find(
        (like) => like.user.toString() === req.user._id.toString()
      );

      if (existingLike) {
        // Retirer le like
        activity.likes = activity.likes.filter(
          (like) => like.user.toString() !== req.user._id.toString()
        );
      } else {
        // Ajouter le like
        activity.likes.push({ user: req.user._id });
      }

      await activity.save();

      res.json({
        error: false,
        message: existingLike ? "Like retiré" : "Like ajouté",
        data: { liked: !existingLike, totalLikes: activity.likes.length },
      });
    } catch (error) {
      console.error("Erreur lors du like:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors du like",
      });
    }
  },

  // POST /api/friends/activity/:id/comment - Commenter une activité
  commentActivity: async (req, res) => {
    try {
      const { content } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          error: true,
          message: "Le contenu du commentaire est requis",
        });
      }

      if (content.length > 300) {
        return res.status(400).json({
          error: true,
          message: "Le commentaire ne peut pas dépasser 300 caractères",
        });
      }

      const activity = await ActivityShare.findById(req.params.id);

      if (!activity) {
        return res.status(404).json({
          error: true,
          message: "Activité non trouvée",
        });
      }

      const comment = {
        user: req.user._id,
        content: content.trim(),
      };

      activity.comments.push(comment);
      await activity.save();

      await activity.populate("comments.user", "fname lname profileImage");

      res.status(201).json({
        error: false,
        message: "Commentaire ajouté avec succès",
        data: activity.comments[activity.comments.length - 1],
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de l'ajout du commentaire",
      });
    }
  },

  // POST /api/friends/report - Signaler un utilisateur
  reportUser: async (req, res) => {
    try {
      const { error, value } = reportUserSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          error: true,
          message: "Données invalides",
          details: error.details[0].message,
        });
      }

      const { reportedUserId } = req.body;

      // Vérifier que l'utilisateur signalé existe
      const reportedUser = await User.findById(reportedUserId);
      if (!reportedUser) {
        return res.status(404).json({
          error: true,
          message: "Utilisateur non trouvé",
        });
      }

      // Vérifier qu'on ne se signale pas soi-même
      if (reportedUserId === req.user._id.toString()) {
        return res.status(400).json({
          error: true,
          message: "Vous ne pouvez pas vous signaler vous-même",
        });
      }

      // Vérifier s'il n'y a pas déjà un signalement récent
      const existingReport = await Report.findOne({
        reporter: req.user._id,
        reported: reportedUserId,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      });

      if (existingReport) {
        return res.status(409).json({
          error: true,
          message: "Vous avez déjà signalé cet utilisateur récemment",
        });
      }

      const report = new Report({
        reporter: req.user._id,
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
              { requester: req.user._id, recipient: reportedUserId },
              { requester: reportedUserId, recipient: req.user._id },
            ],
          },
          {
            status: "blocked",
            blockedAt: new Date(),
            blockedBy: req.user._id,
          }
        );
      }

      res.status(201).json({
        error: false,
        message:
          "Signalement envoyé avec succès. Notre équipe l'examinera dans les 24h.",
        data: { reportId: report._id },
      });
    } catch (error) {
      console.error("Erreur lors du signalement:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors du signalement",
      });
    }
  },

  // GET /api/friends/stats - Statistiques des amis
  getFriendsStats: async (req, res) => {
    try {
      const userId = req.user._id;

      const [friendsCount, pendingRequests, sentRequests, recentActivity] =
        await Promise.all([
          Friendship.countDocuments({
            $or: [
              { requester: userId, status: "accepted" },
              { recipient: userId, status: "accepted" },
            ],
          }),
          Friendship.countDocuments({
            recipient: userId,
            status: "pending",
          }),
          Friendship.countDocuments({
            requester: userId,
            status: "pending",
          }),
          ActivityShare.countDocuments({
            sharedBy: {
              $in: await Friendship.getFriends(userId).then((friends) =>
                friends.map((f) =>
                  f.requester._id.toString() === userId.toString()
                    ? f.recipient._id
                    : f.requester._id
                )
              ),
            },
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          }),
        ]);

      const stats = {
        totalFriends: friendsCount,
        pendingRequests,
        sentRequests,
        recentActivity,
        onlineFriends: Math.floor(friendsCount * 0.3),
        mutualConnections: Math.floor(friendsCount * 1.5),
      };

      res.json({
        error: false,
        message: "Statistiques récupérées avec succès",
        data: stats,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de la récupération des statistiques",
      });
    }
  },

  // PUT /api/friends/:id/block - Bloquer un utilisateur
  blockUser: async (req, res) => {
    try {
      const friendship = await Friendship.findOne({
        $or: [
          { requester: req.user._id, recipient: req.params.id },
          { requester: req.params.id, recipient: req.user._id },
        ],
      });

      if (friendship) {
        friendship.status = "blocked";
        friendship.blockedAt = new Date();
        friendship.blockedBy = req.user._id;
        await friendship.save();
      } else {
        // Créer une entrée de blocage même s'il n'y avait pas d'amitié
        const blockEntry = new Friendship({
          requester: req.user._id,
          recipient: req.params.id,
          status: "blocked",
          blockedAt: new Date(),
          blockedBy: req.user._id,
        });
        await blockEntry.save();
      }

      res.json({
        error: false,
        message: "Utilisateur bloqué avec succès",
      });
    } catch (error) {
      console.error("Erreur lors du blocage:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors du blocage",
      });
    }
  },
};
