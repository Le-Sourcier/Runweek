require("dotenv").config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);

const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const passport = require("passport");
const socketIo = require("socket.io");
const redis = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swaggerConfig");
const config = require("./src/config");

const { Friendship, ActivityShare } = require("./src/models");
const { Op } = require("sequelize");

let logger;
if (process.env.NODE_ENV === "development") {
  logger = require("./src/utils/components/logger");
}

require("./db");
const db = require("./src/models");

const io = socketIo(server, {
  cors: config.cors,
});

// Sécurité & middlewares
app.use(helmet());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors(config.cors));
app.set("trust proxy", 1);

// ***************************** SOCKET CONFIG CORRIGÉE *************************************
const pubClient = redis.createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
});

// Structures de données pour gérer les connexions
const userConnections = new Map(); // userId -> Set(socketIds)
const socketToUser = new Map(); // socketId -> userId
const userSessions = new Map(); // userId -> dernière activité

// Fonction pour calculer les stats d'amis
const calculateFriendStats = async (userId) => {
  try {
    const [friendships, pendingReceived, pendingSent, recentActivity] =
      await Promise.all([
        // Amis acceptés
        Friendship.findAll({
          where: {
            status: "accepted",
            [Op.or]: [{ requester_id: userId }, { recipient_id: userId }],
          },
          raw: true,
        }),
        // Demandes reçues en attente
        Friendship.count({
          where: {
            status: "pending",
            recipient_id: userId,
          },
        }),
        // Demandes envoyées en attente
        Friendship.count({
          where: {
            status: "pending",
            requester_id: userId,
          },
        }),
        // Activités récentes des amis (7 derniers jours)
        (async () => {
          const friendShips = await Friendship.findAll({
            where: {
              status: "accepted",
              [Op.or]: [{ requester_id: userId }, { recipient_id: userId }],
            },
            raw: true,
          });

          const friendIds = friendShips.map((friendship) =>
            friendship.requester_id === userId
              ? friendship.recipient_id
              : friendship.requester_id
          );

          if (friendIds.length === 0) return 0;

          return ActivityShare.count({
            where: {
              shared_by_id: { [Op.in]: friendIds },
              createdAt: {
                [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          });
        })(),
      ]);

    const friendIds = friendships.map((friendship) =>
      friendship.requester_id === userId
        ? friendship.recipient_id
        : friendship.requester_id
    );

    const onlineFriends = friendIds.filter(
      (friendId) =>
        userConnections.has(friendId) && userConnections.get(friendId).size > 0
    );

    return {
      totalFriends: friendIds.length,
      onlineFriends: onlineFriends.length,
      pendingRequests: pendingReceived,
      sentRequests: pendingSent,
      recentActivity: recentActivity,
      mutualConnections: Math.floor(friendIds.length * 1.5),
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error calculating friend stats:", error);
    return {
      totalFriends: 0,
      onlineFriends: 0,
      pendingRequests: 0,
      sentRequests: 0,
      recentActivity: 0,
      mutualConnections: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
};

// Fonction pour diffuser les stats à un utilisateur
const broadcastStatsToUser = async (userId) => {
  try {
    if (userConnections.has(userId)) {
      const stats = await calculateFriendStats(userId);
      userConnections.get(userId).forEach((socketId) => {
        io.to(socketId).emit("friends_stats_update", stats);
      });
    }
  } catch (error) {
    console.error("Error broadcasting stats to user:", error);
  }
};

// Fonction pour diffuser les stats à tous les amis d'un utilisateur
const broadcastStatsToFriends = async (userId) => {
  try {
    const friendships = await Friendship.findAll({
      where: {
        status: "accepted",
        [Op.or]: [{ requester_id: userId }, { recipient_id: userId }],
      },
      raw: true,
    });

    for (const friendship of friendships) {
      const friendId =
        friendship.requester_id === userId
          ? friendship.recipient_id
          : friendship.requester_id;

      await broadcastStatsToUser(friendId);
    }
  } catch (error) {
    console.error("Error broadcasting stats to friends:", error);
  }
};

io.on("connection", (socket) => {
  // console.log("User connected:", socket.id);

  // Événement pour récupérer les stats d'amis
  socket.on("get_friends_stats", async (userId) => {
    try {
      if (!userId) {
        socket.emit("friends_stats_error", { error: "User ID required" });
        return;
      }

      const stats = await calculateFriendStats(userId);
      socket.emit("friends_stats_response", stats);
    } catch (error) {
      console.error("Error getting friends stats:", error);
      socket.emit("friends_stats_error", { error: "Failed to get stats" });
    }
  });

  // Événement lorsqu'un utilisateur se connecte
  // socket.on("user_online", async (userId) => {
  //   // console.log("User online:", userId, "socket:", socket.id);

  //   // Vérifier si l'utilisateur a déjà des connexions actives
  //   const hasExistingConnections =
  //     userConnections.has(userId) && userConnections.get(userId).size > 0;

  //   try {
  //     // Stocker la connexion
  //     if (!userConnections.has(userId)) {
  //       userConnections.set(userId, new Set());
  //     }
  //     userConnections.get(userId).add(socket.id);
  //     socketToUser.set(socket.id, userId);
  //     userSessions.set(userId, Date.now());

  //     // Seulement notifier les amis si c'est une NOUVELLE connexion
  //     if (!hasExistingConnections) {
  //       // 1. INFORMER TOUS LES AMIS QUE CET UTILISATEUR EST EN LIGNE
  //       const friendships = await Friendship.findAll({
  //         where: {
  //           status: "accepted",
  //           [Op.or]: [{ requester_id: userId }, { recipient_id: userId }],
  //         },
  //       });

  //       friendships.forEach((friendship) => {
  //         const friendId =
  //           friendship.requester_id === userId
  //             ? friendship.recipient_id
  //             : friendship.requester_id;

  //         // Notifier tous les amis connectés que cet utilisateur est en ligne
  //         if (userConnections.has(friendId)) {
  //           userConnections.get(friendId).forEach((friendSocketId) => {
  //             io.to(friendSocketId).emit("friend_online", userId);
  //           });
  //         }
  //       });

  //       // console.log(
  //       //   `User ${userId} is now online (first connection). Notified friends.`
  //       // );
  //     } else {
  //       // console.log(
  //       //   `User ${userId} reconnected. Already has ${
  //       //     userConnections.get(userId).size
  //       //   } connections.`
  //       // );
  //     }

  //     // 2. ENVOYER LA LISTE DE TOUS LES AMIS EN LIGNE (toujours faire ça)
  //     const friendships = await Friendship.findAll({
  //       where: {
  //         status: "accepted",
  //         [Op.or]: [{ requester_id: userId }, { recipient_id: userId }],
  //       },
  //     });

  //     const onlineFriends = [];
  //     for (const friendship of friendships) {
  //       const friendId =
  //         friendship.requester_id === userId
  //           ? friendship.recipient_id
  //           : friendship.requester_id;

  //       if (
  //         userConnections.has(friendId) &&
  //         userConnections.get(friendId).size > 0
  //       ) {
  //         onlineFriends.push(friendId);
  //       }
  //     }

  //     // Envoyer la liste des amis en ligne
  //     socket.emit("friends_online_list", onlineFriends);
  //     // console.log(
  //     //   `Sent online friends list to user ${userId}: ${onlineFriends.length} friends online`
  //     // );
  //   } catch (error) {
  //     // console.error("Error handling user online:", error);
  //   }
  // });
  socket.on("user_online", async (userId) => {
    console.log("User online:", userId, "socket:", socket.id);

    // Stocker la connexion
    if (!userConnections.has(userId)) {
      userConnections.set(userId, new Set());
    }
    userConnections.get(userId).add(socket.id);
    socketToUser.set(socket.id, userId);
    userSessions.set(userId, Date.now());

    try {
      // 1. Notifier tous les amis que cet utilisateur est en ligne
      const friendships = await Friendship.findAll({
        where: {
          status: "accepted",
          [Op.or]: [{ requester_id: userId }, { recipient_id: userId }],
        },
        raw: true,
      });

      friendships.forEach((friendship) => {
        const friendId =
          friendship.requester_id === userId
            ? friendship.recipient_id
            : friendship.requester_id;

        // Notifier les amis connectés
        if (userConnections.has(friendId)) {
          userConnections.get(friendId).forEach((friendSocketId) => {
            io.to(friendSocketId).emit("friend_online", userId);
          });
        }
      });

      // 2. Mettre à jour les stats pour tous les amis
      await broadcastStatsToFriends(userId);

      // 3. Envoyer les stats à l'utilisateur qui vient de se connecter
      await broadcastStatsToUser(userId);

      console.log(
        `User ${userId} is now online. Stats updated for all friends.`
      );
    } catch (error) {
      console.error("Error handling user online:", error);
    }
  });

  // ********************** ÉVÉNEMENTS DE MESSAGERIE **********************
  // Dans server.js - remplacez les événements de messagerie par ceci :

  socket.on("join_conversation", (friendId) => {
    try {
      if (!friendId) {
        // console.error("Missing friendId in join_conversation");
        return;
      }

      const roomName = `friend_${friendId}`;
      socket.join(roomName);
      // console.log(
      //   `User ${socket.id} joined conversation for friend ${friendId}`
      // );
    } catch (error) {
      // console.error("Error joining conversation:", error);
    }
  });

  socket.on("leave_conversation", (friendId) => {
    try {
      if (!friendId) {
        // console.error("Missing friendId in leave_conversation");
        return;
      }

      socket.leave(`friend_${friendId}`);
      // console.log(`User ${socket.id} left conversation for friend ${friendId}`);
    } catch (error) {
      // console.error("Error leaving conversation:", error);
    }
  });

  socket.on("send_message", async (messageData, callback) => {
    try {
      // console.log("New message received via socket:", messageData);

      // Vérifier que le message a la structure correcte
      if (
        !messageData.friend_id ||
        !messageData.sender ||
        !messageData.content
      ) {
        // console.error("Invalid message structure:", messageData);
        if (callback)
          callback({ success: false, error: "Invalid message structure" });
        return;
      }

      // Formater le message pour correspondre au type TypeScript
      const formattedMessage = {
        id: messageData.id || Date.now().toString(),
        friend_id: messageData.friend_id,
        sender: {
          id: messageData.sender.id,
          email: messageData.sender.email || "",
          profile: {
            fname: messageData.sender.profile?.fname || "Utilisateur",
            lname: messageData.sender.profile?.lname || "",
            image: messageData.sender.profile?.image || "",
          },
        },
        content: messageData.content,
        messageType: messageData.messageType || "text",
        createdAt: messageData.createdAt || new Date().toISOString(),
      };

      console.log("Broadcasting formatted message:", formattedMessage);

      // Diffuser le message à tous les participants de la conversation d'ami
      io.to(`friend_${messageData.friend_id}`).emit(
        "new_message",
        formattedMessage
      );

      if (callback) callback({ success: true });
    } catch (error) {
      // console.error("Error handling message:", error);
      if (callback) callback({ success: false, error: error.message });
    }
  });

  socket.on("typing_start", (data) => {
    try {
      const { friendId, userId } = data;

      if (!friendId || !userId) {
        console.error("Missing friendId or userId in typing_start:", data);
        return;
      }

      console.log(
        `User ${userId} is typing in friend conversation ${friendId}`
      );

      // Diffuser à tous les participants de la conversation
      io.to(`friend_${friendId}`).emit("user_typing", {
        userId: userId,
        isTyping: true,
        friendId: friendId,
      });
    } catch (error) {
      console.error("Error in typing_start:", error);
    }
  });

  socket.on("typing_stop", (data) => {
    try {
      const { friendId, userId } = data;

      if (!friendId || !userId) {
        console.error("Missing friendId or userId in typing_stop:", data);
        return;
      }

      console.log(
        `User ${userId} stopped typing in friend conversation ${friendId}`
      );

      // Diffuser à tous les participants de la conversation
      io.to(`friend_${friendId}`).emit("user_typing", {
        userId: userId,
        isTyping: false,
        friendId: friendId,
      });
    } catch (error) {
      console.error("Error in typing_stop:", error);
    }
  });

  // ********************** FIN ÉVÉNEMENTS DE MESSAGERIE **********************

  // Gérer la déconnexion
  // socket.on("disconnect", async (reason) => {
  //   // console.log("User disconnected:", socket.id, "Reason:", reason);

  //   const userId = socketToUser.get(socket.id);

  //   if (userId) {
  //     // Retirer cette connexion
  //     // Attendre un peu pour voir si c'est une reconnexion rapide
  //     setTimeout(async () => {
  //       if (
  //         userConnections.has(userId) &&
  //         userConnections.get(userId).has(socket.id)
  //       ) {
  //         // La connexion n'a pas été rétablie, procéder à la déconnexion
  //         userConnections.get(userId).delete(socket.id);

  //         // Si c'était la dernière connexion de cet utilisateur
  //         if (userConnections.get(userId).size === 0) {
  //           userConnections.delete(userId);
  //           userSessions.delete(userId);

  //           // INFORMER TOUS LES AMIS QUE CET UTILISATEUR EST HORS LIGNE
  //           try {
  //             const friendships = await Friendship.findAll({
  //               where: {
  //                 status: "accepted",
  //                 [Op.or]: [{ requester_id: userId }, { recipient_id: userId }],
  //               },
  //             });

  //             console.log(
  //               `Notifying ${friendships.length} friends of offline status for user ${userId}`
  //             );

  //             friendships.forEach((friendship) => {
  //               const friendId =
  //                 friendship.requester_id === userId
  //                   ? friendship.recipient_id
  //                   : friendship.requester_id;

  //               // Notifier tous les amis connectés
  //               if (userConnections.has(friendId)) {
  //                 userConnections.get(friendId).forEach((friendSocketId) => {
  //                   io.to(friendSocketId).emit("friend_offline", userId);
  //                 });
  //               }
  //             });

  //             console.log(
  //               `User ${userId} is now offline (all connections lost)`
  //             );
  //           } catch (error) {
  //             console.error(
  //               "Error notifying friends of offline status:",
  //               error
  //             );
  //           }
  //         } else {
  //           console.log(
  //             `User ${userId} disconnected from one device, remaining connections: ${
  //               userConnections.get(userId).size
  //             }`
  //           );
  //         }
  //       }

  //       socketToUser.delete(socket.id);
  //     }, 2000); // Délai de 2 secondes
  //   }
  // });

  // // Gérer les déconnexions volontaires
  // socket.on("user_offline", async (userId) => {
  //   console.log("User explicitly went offline:", userId);

  //   if (userConnections.has(userId)) {
  //     // Forcer la suppression de toutes les connexions de cet utilisateur
  //     userConnections.get(userId).forEach((socketId) => {
  //       socketToUser.delete(socketId);
  //     });
  //     userConnections.delete(userId);
  //     userSessions.delete(userId);

  //     // Informer les amis
  //     try {
  //       const friendships = await Friendship.findAll({
  //         where: {
  //           status: "accepted",
  //           [Op.or]: [{ requester_id: userId }, { recipient_id: userId }],
  //         },
  //       });

  //       friendships.forEach((friendship) => {
  //         const friendId =
  //           friendship.requester_id === userId
  //             ? friendship.recipient_id
  //             : friendship.requester_id;

  //         if (userConnections.has(friendId)) {
  //           userConnections.get(friendId).forEach((friendSocketId) => {
  //             io.to(friendSocketId).emit("friend_offline", userId);
  //           });
  //         }
  //       });

  //       console.log(
  //         `User ${userId} explicitly went offline and all connections were removed`
  //       );
  //     } catch (error) {
  //       console.error("Error notifying friends of explicit offline:", error);
  //     }
  //   }
  // });

  // Gérer la déconnexion
  socket.on("disconnect", async (reason) => {
    console.log("User disconnected:", socket.id, "Reason:", reason);

    const userId = socketToUser.get(socket.id);

    if (userId) {
      setTimeout(async () => {
        if (
          userConnections.has(userId) &&
          userConnections.get(userId).has(socket.id)
        ) {
          userConnections.get(userId).delete(socket.id);

          if (userConnections.get(userId).size === 0) {
            userConnections.delete(userId);
            userSessions.delete(userId);

            try {
              // Notifier tous les amis que cet utilisateur est hors ligne
              const friendships = await Friendship.findAll({
                where: {
                  status: "accepted",
                  [Op.or]: [{ requester_id: userId }, { recipient_id: userId }],
                },
                raw: true,
              });

              friendships.forEach((friendship) => {
                const friendId =
                  friendship.requester_id === userId
                    ? friendship.recipient_id
                    : friendship.requester_id;

                if (userConnections.has(friendId)) {
                  userConnections.get(friendId).forEach((friendSocketId) => {
                    io.to(friendSocketId).emit("friend_offline", userId);
                  });
                }
              });

              // Mettre à jour les stats pour tous les amis
              await broadcastStatsToFriends(userId);

              console.log(
                `User ${userId} is now offline. Stats updated for all friends.`
              );
            } catch (error) {
              console.error(
                "Error notifying friends of offline status:",
                error
              );
            }
          } else {
            // Mettre à jour les stats pour refléter la déconnexion partielle
            await broadcastStatsToFriends(userId);
            console.log(
              `User ${userId} disconnected from one device. Stats updated.`
            );
          }
        }

        socketToUser.delete(socket.id);
      }, 2000);
    }
  });

  // Gérer les déconnexions volontaires
  socket.on("user_offline", async (userId) => {
    console.log("User explicitly went offline:", userId);

    if (userConnections.has(userId)) {
      userConnections.get(userId).forEach((socketId) => {
        socketToUser.delete(socketId);
      });
      userConnections.delete(userId);
      userSessions.delete(userId);

      try {
        const friendships = await Friendship.findAll({
          where: {
            status: "accepted",
            [Op.or]: [{ requester_id: userId }, { recipient_id: userId }],
          },
          raw: true,
        });

        friendships.forEach((friendship) => {
          const friendId =
            friendship.requester_id === userId
              ? friendship.recipient_id
              : friendship.requester_id;

          if (userConnections.has(friendId)) {
            userConnections.get(friendId).forEach((friendSocketId) => {
              io.to(friendSocketId).emit("friend_offline", userId);
            });
          }
        });

        // Mettre à jour les stats pour tous les amis
        await broadcastStatsToFriends(userId);

        console.log(
          `User ${userId} explicitly went offline. Stats updated for all friends.`
        );
      } catch (error) {
        console.error("Error notifying friends of explicit offline:", error);
      }
    }
  });
});

// Middleware pour exposer io aux routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ***************************** FIN SOCKET CONFIG *************************************

// Le reste de votre configuration serveur reste inchangé
async function initializeServer() {
  try {
    console.log("Initialisation de la base de données...");
    await db.sequelize.authenticate();
    console.log("Connexion à la base de données établie.");

    const sequelizeSessionStore = new SequelizeStore({
      db: db.sequelize,
      tableName: "sessions",
      checkExpirationInterval: 15 * 60 * 1000,
      expiration: 24 * 60 * 60 * 1000,
    });

    await sequelizeSessionStore.sync();
    console.log("Table des sessions synchronisée.");

    app.use(
      session({
        store: sequelizeSessionStore,
        secret: process.env.SESSION_SECRET || "fallback-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.NODE_ENV === "production",
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
          sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        },
        name: "runweek.sid",
        rolling: true,
      })
    );

    app.use(passport.initialize());
    app.use(passport.session());

    app.get("/", (req, res) => res.json({ message: "API is healthy!" }));

    app.get("/auth/google/callback", (req, res) => {
      const { token, refresh, userId, code } = req.query;
      if (!code) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      res.cookie("token", token, { httpOnly: true });
      res.cookie("refresh", refresh, { httpOnly: true });
      res.cookie("userId", userId, { httpOnly: true });
      return res.status(200).json({
        message: "Profile updated successfully",
        code,
      });
    });

    app.use("/api", require("./src/routers"));
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    app.set("io", io);

    const PORT = process.env.PORT;
    server.listen(PORT, () => {
      if (process.env.NODE_ENV === "development") {
        logger.info(
          `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
        );
      } else {
        console.info(
          `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
        );
      }
    });
  } catch (error) {
    console.error("Erreur lors de l'initialisation du serveur:", error);
    process.exit(1);
  }
}

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
  process.exit(1);
});

initializeServer();

module.exports = server;
