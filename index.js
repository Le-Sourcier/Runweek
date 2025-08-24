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

const { Friendship } = require("./src/models");
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

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Événement lorsqu'un utilisateur se connecte
  socket.on("user_online", async (userId) => {
    console.log("User online:", userId, "socket:", socket.id);

    // Vérifier si l'utilisateur a déjà des connexions actives
    const hasExistingConnections =
      userConnections.has(userId) && userConnections.get(userId).size > 0;

    try {
      // Stocker la connexion
      if (!userConnections.has(userId)) {
        userConnections.set(userId, new Set());
      }
      userConnections.get(userId).add(socket.id);
      socketToUser.set(socket.id, userId);
      userSessions.set(userId, Date.now());

      // Seulement notifier les amis si c'est une NOUVELLE connexion
      if (!hasExistingConnections) {
        // 1. INFORMER TOUS LES AMIS QUE CET UTILISATEUR EST EN LIGNE
        const friendships = await Friendship.findAll({
          where: {
            status: "accepted",
            [Op.or]: [{ requester_id: userId }, { recipient_id: userId }],
          },
        });

        friendships.forEach((friendship) => {
          const friendId =
            friendship.requester_id === userId
              ? friendship.recipient_id
              : friendship.requester_id;

          // Notifier tous les amis connectés que cet utilisateur est en ligne
          if (userConnections.has(friendId)) {
            userConnections.get(friendId).forEach((friendSocketId) => {
              io.to(friendSocketId).emit("friend_online", userId);
            });
          }
        });

        console.log(
          `User ${userId} is now online (first connection). Notified friends.`
        );
      } else {
        console.log(
          `User ${userId} reconnected. Already has ${
            userConnections.get(userId).size
          } connections.`
        );
      }

      // 2. ENVOYER LA LISTE DE TOUS LES AMIS EN LIGNE (toujours faire ça)
      const friendships = await Friendship.findAll({
        where: {
          status: "accepted",
          [Op.or]: [{ requester_id: userId }, { recipient_id: userId }],
        },
      });

      const onlineFriends = [];
      for (const friendship of friendships) {
        const friendId =
          friendship.requester_id === userId
            ? friendship.recipient_id
            : friendship.requester_id;

        if (
          userConnections.has(friendId) &&
          userConnections.get(friendId).size > 0
        ) {
          onlineFriends.push(friendId);
        }
      }

      // Envoyer la liste des amis en ligne
      socket.emit("friends_online_list", onlineFriends);
      console.log(
        `Sent online friends list to user ${userId}: ${onlineFriends.length} friends online`
      );
    } catch (error) {
      console.error("Error handling user online:", error);
    }
  });

  // Gérer la déconnexion
  socket.on("disconnect", async (reason) => {
    console.log("User disconnected:", socket.id, "Reason:", reason);

    const userId = socketToUser.get(socket.id);

    if (userId) {
      // Retirer cette connexion
      // Attendre un peu pour voir si c'est une reconnexion rapide
      setTimeout(async () => {
        if (
          userConnections.has(userId) &&
          userConnections.get(userId).has(socket.id)
        ) {
          // La connexion n'a pas été rétablie, procéder à la déconnexion
          userConnections.get(userId).delete(socket.id);

          // Si c'était la dernière connexion de cet utilisateur
          if (userConnections.get(userId).size === 0) {
            userConnections.delete(userId);
            userSessions.delete(userId);

            // INFORMER TOUS LES AMIS QUE CET UTILISATEUR EST HORS LIGNE
            try {
              const friendships = await Friendship.findAll({
                where: {
                  status: "accepted",
                  [Op.or]: [{ requester_id: userId }, { recipient_id: userId }],
                },
              });

              console.log(
                `Notifying ${friendships.length} friends of offline status for user ${userId}`
              );

              friendships.forEach((friendship) => {
                const friendId =
                  friendship.requester_id === userId
                    ? friendship.recipient_id
                    : friendship.requester_id;

                // Notifier tous les amis connectés
                if (userConnections.has(friendId)) {
                  userConnections.get(friendId).forEach((friendSocketId) => {
                    io.to(friendSocketId).emit("friend_offline", userId);
                  });
                }
              });

              console.log(
                `User ${userId} is now offline (all connections lost)`
              );
            } catch (error) {
              console.error(
                "Error notifying friends of offline status:",
                error
              );
            }
          } else {
            console.log(
              `User ${userId} disconnected from one device, remaining connections: ${
                userConnections.get(userId).size
              }`
            );
          }
        }

        socketToUser.delete(socket.id);
      }, 2000); // Délai de 2 secondes
    }
  });

  // Gérer les déconnexions volontaires
  socket.on("user_offline", async (userId) => {
    console.log("User explicitly went offline:", userId);

    if (userConnections.has(userId)) {
      // Forcer la suppression de toutes les connexions de cet utilisateur
      userConnections.get(userId).forEach((socketId) => {
        socketToUser.delete(socketId);
      });
      userConnections.delete(userId);
      userSessions.delete(userId);

      // Informer les amis
      try {
        const friendships = await Friendship.findAll({
          where: {
            status: "accepted",
            [Op.or]: [{ requester_id: userId }, { recipient_id: userId }],
          },
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

        console.log(
          `User ${userId} explicitly went offline and all connections were removed`
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
