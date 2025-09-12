require("dotenv").config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);

const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const passport = require("passport");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swaggerConfig");
const config = require("./src/config");

let logger;
if (process.env.NODE_ENV === "development") {
  logger = require("./src/utils/components/logger");
}

require("./db");
const db = require("./src/models");
const initSocket = require("./src/services/socket");

const io = socketIo(server, {
  cors: config.cors,
});

// Sécurité & middlewares
app.use(helmet());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors(config.cors));
app.set("trust proxy", 1);

// Initialize Socket.IO
initSocket(io);

// Middleware pour exposer io aux routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

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

    // IMPORTANT: Configuration de Passport AVANT les routes
    console.log("Configuration de Passport...");
    require("./src/config/passport")(app); // Cette ligne doit venir AVANT app.use(passport.initialize())

    app.use(passport.initialize());
    app.use(passport.session());

    app.get("/", (req, res) => res.json({ message: "API is healthy!" }));

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

// require("dotenv").config();
// const express = require("express");
// const http = require("http");
// const app = express();
// const server = http.createServer(app);

// const session = require("express-session");
// const SequelizeStore = require("connect-session-sequelize")(session.Store);
// const passport = require("passport");
// const socketIo = require("socket.io");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const helmet = require("helmet");
// const cookieParser = require("cookie-parser");
// const swaggerUi = require("swagger-ui-express");
// const swaggerSpec = require("./swaggerConfig");
// const config = require("./src/config");

// let logger;
// if (process.env.NODE_ENV === "development") {
//   logger = require("./src/utils/components/logger");
// }

// require("./db");
// const db = require("./src/models");
// const initSocket = require("./src/services/socket");

// const io = socketIo(server, {
//   cors: config.cors,
// });

// // Sécurité & middlewares
// app.use(helmet());
// app.use(bodyParser.json());
// app.use(cookieParser());
// app.use(cors(config.cors));
// app.set("trust proxy", 1);

// // Initialize Socket.IO
// initSocket(io);

// // Middleware pour exposer io aux routes
// app.use((req, res, next) => {
//   req.io = io;
//   next();
// });

// // Le reste de votre configuration serveur reste inchangé
// async function initializeServer() {
//   try {
//     console.log("Initialisation de la base de données...");
//     await db.sequelize.authenticate();
//     console.log("Connexion à la base de données établie.");

//     const sequelizeSessionStore = new SequelizeStore({
//       db: db.sequelize,
//       tableName: "sessions",
//       checkExpirationInterval: 15 * 60 * 1000,
//       expiration: 24 * 60 * 60 * 1000,
//     });

//     await sequelizeSessionStore.sync();
//     console.log("Table des sessions synchronisée.");

//     app.use(
//       session({
//         store: sequelizeSessionStore,
//         secret: process.env.SESSION_SECRET || "fallback-secret",
//         resave: false,
//         saveUninitialized: false,
//         cookie: {
//           secure: process.env.NODE_ENV === "production",
//           httpOnly: true,
//           maxAge: 24 * 60 * 60 * 1000,
//           sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
//         },
//         name: "runweek.sid",
//         rolling: true,
//       })
//     );

//     app.use(passport.initialize());
//     app.use(passport.session());

//     app.get("/", (req, res) => res.json({ message: "API is healthy!" }));

//     // app.get("/auth/google/callback", (req, res) => {
//     //   const { token, refresh, userId, code } = req.query;

//     //   // console.log("req.query: ", req.query);
//     //   if (!code) {
//     //     return res.status(400).json({ error: "Missing required parameters" });
//     //   }
//     //   res.cookie("token", token, { httpOnly: true });
//     //   res.cookie("refresh", refresh, { httpOnly: true });
//     //   res.cookie("userId", userId, { httpOnly: true });
//     //   return res.status(200).json({
//     //     message: "Profile updated successfully",
//     //     code,
//     //   });
//     // });

//     app.get(
//       "/auth/google/callback",
//       require("./src/controllers/components/userController")
//         .handleGoogleCallback
//     );

//     app.use("/api", require("./src/routers"));
//     app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//     app.set("io", io);

//     const PORT = process.env.PORT;
//     server.listen(PORT, () => {
//       if (process.env.NODE_ENV === "development") {
//         logger.info(
//           `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
//         );
//       } else {
//         console.info(
//           `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
//         );
//       }
//     });
//   } catch (error) {
//     console.error("Erreur lors de l'initialisation du serveur:", error);
//     process.exit(1);
//   }
// }

// process.on("unhandledRejection", (err) => {
//   console.error("Unhandled rejection:", err);
//   process.exit(1);
// });

// initializeServer();

// module.exports = server;
