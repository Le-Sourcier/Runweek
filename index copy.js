// require("dotenv").config();
// const express = require("express");
// const http = require("http");

// const app = express();
// const server = http.createServer(app);

// const session = require("express-session");
// const passport = require("passport");

// const socketIo = require("socket.io");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const helmet = require("helmet");
// const cookieParser = require("cookie-parser");
// const swaggerUi = require("swagger-ui-express");
// const swaggerSpec = require("./swaggerConfig"); // Import the generated spec
// const config = require("./src/config");
// require("./src/events");
// require("./src/config/passport")(app); // Importez la configuration Passport

// let logger;
// if (process.env.NODE_ENV === "development") {
//   logger = require("./src/utils/components/logger");
// }
// require("./db"); //initialize db instance
// require("./src/events/dbDownloader"); //Auto download database

// const io = socketIo(server, {
//   cors: config.cors,
// });

// // Sécurité & middlewares
// app.use(helmet());
// // app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(cookieParser());
// app.use(cors(config.cors));
// app.set("trust proxy", 1);

// // Middleware de session (optionnel pour Passport)
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: { secure: process.env.NODE_ENV === "production" },
//   })
// );

// // Initialisation de Passport
// app.use(passport.initialize());
// app.use(passport.session());

// app.get("/", (req, res) => res.json({ message: "API is healthy!" }));

// // Get user information from the callback after auth with Google
// app.get("/auth/google/callback", (req, res) => {
//   const { token, refresh, userId, code } = req.query;
//   if (!code) {
//     return res.status(400).json({ error: "Missing required parameters" });
//   }
//   // Store tokens in cookies or session as needed
//   res.cookie("token", token, { httpOnly: true });
//   res.cookie("refresh", refresh, { httpOnly: true });
//   res.cookie("userId", userId, { httpOnly: true });
//   // return res.redirect(process.env.FRONTEND_URL || "http://localhost:5173");
//   return res.status(200).json({
//     message: "Profile updated successfully",
//     code,
//   });
// });

// app.use("/api", require("./src/routers"));

// // Swagger UI Setup
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// // Démarrer les sockets
// app.set("io", io);

// io.on("connection", (socket) => {});

// // silence all console outputs on production
// if (process.env.NODE_ENV === "production") {
//   console.log = () => {};
//   console.warn = () => {};
//   console.info = () => {};
//   console.debug = () => {};
//   // console.error; //remains active
// }
// // Serveur
// const PORT = process.env.PORT;
// const NODE_ENV = process.env.NODE_ENV;
// server.listen(PORT, async () => {
//   // notifyLowCreditsEvent
//   // await notifyLowCreditsEvent();
//   if (process.env.NODE_ENV === "development") {
//     logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
//   } else console.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
// });

// // Handle unhandled promise rejections
// process.on("unhandledRejection", (err) => {
//   if (process.env.NODE_ENV === "development")
//     logger.error(`Error: ${err.message}`);
//   else console.error(`Error: ${err.message}`);

//   // Close server & exit process
//   server.close(() => process.exit(1));
// });

// module.exports = server;

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

require("./db"); // Importez votre instance Sequelize
const db = require("./src/models"); // Importez votre instance Sequelize

const io = socketIo(server, {
  cors: config.cors,
});

// Sécurité & middlewares
app.use(helmet());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors(config.cors));
app.set("trust proxy", 1);

// ***************************** SOCKET CONFIG *************************************
// Configuration Redis pour les multiples instances (optionnel)
const pubClient = redis.createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
});

// Stockage des utilisateurs connectés
const connectedUsers = new Map();

io.on("connection", (socket) => {
  // console.log("User connected:", socket.id);

  // Événement lorsqu'un utilisateur se connecte
  socket.on("user_online", async (userId) => {
    // console.log("User connected:", userId);

    try {
      // Stocker la connexion
      connectedUsers.set(userId, {
        socketId: socket.id,
        lastSeen: new Date(),
      });

      // Informer les amis que cet utilisateur est en ligne
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

        if (connectedUsers.has(friendId)) {
          socket
            .to(connectedUsers.get(friendId).socketId)
            .emit("friend_online", userId);
        }
      });

      console.log(`User ${userId} is now online`);
    } catch (error) {
      console.error("Error handling user online:", error);
    }
  });

  // Gérer la déconnexion
  socket.on("disconnect", async () => {
    let disconnectedUserId;

    // Trouver l'utilisateur déconnecté
    for (let [userId, data] of connectedUsers.entries()) {
      if (data.socketId === socket.id) {
        disconnectedUserId = userId;
        break;
      }
    }

    if (disconnectedUserId) {
      connectedUsers.delete(disconnectedUserId);

      // Informer les amis que l'utilisateur est hors ligne
      const friendships = await Friendship.findAll({
        where: {
          status: "accepted",
          [Op.or]: [
            { requester_id: disconnectedUserId },
            { recipient_id: disconnectedUserId },
          ],
        },
      });

      friendships.forEach((friendship) => {
        const friendId =
          friendship.requester_id === disconnectedUserId
            ? friendship.recipient_id
            : friendship.requester_id;

        if (connectedUsers.has(friendId)) {
          io.to(connectedUsers.get(friendId).socketId).emit(
            "friend_offline",
            disconnectedUserId
          );
        }
      });

      console.log(`User ${disconnectedUserId} is now offline`);
    }
  });

  // Vérification de présence
  socket.on("check_presence", (userIds, callback) => {
    const presence = {};
    userIds.forEach((id) => {
      presence[id] = connectedUsers.has(id);
    });
    callback(presence);
  });
});

// Middleware pour exposer io aux routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ***************************** END OF SOCKET CONFIG *************************************

// Fonction pour initialiser le serveur après la connexion à la DB
async function initializeServer() {
  try {
    console.log("Initialisation de la base de données...");

    // Attendre que la DB soit prête
    await db.sequelize.authenticate();
    console.log("Connexion à la base de données établie.");

    // Maintenant initialiser le store de session
    const sequelizeSessionStore = new SequelizeStore({
      db: db.sequelize,
      tableName: "sessions",
      checkExpirationInterval: 15 * 60 * 1000,
      expiration: 24 * 60 * 60 * 1000,
    });

    // Synchroniser la table des sessions
    await sequelizeSessionStore.sync();
    console.log("Table des sessions synchronisée.");

    // Configuration de la session
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

    // Initialisation de Passport
    app.use(passport.initialize());
    app.use(passport.session());

    // Routes
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

    // Démarrer les sockets
    app.set("io", io);
    io.on("connection", (socket) => {});

    // Démarrer le serveur
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

// Gestion des erreurs non capturées
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
  process.exit(1);
});

// Démarrer l'initialisation
initializeServer();

module.exports = server;
