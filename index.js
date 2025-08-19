require("dotenv").config();
const express = require("express");
const http = require("http");
const socketManager = require("./src/socket/socketManager");
const config = require("./src/config");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swaggerConfig");

let logger;
if (process.env.NODE_ENV === "development") {
  logger = require("./src/utils/components/logger");
}

const app = express();
const server = http.createServer(app);

const io = socketManager.init(server, { cors: config.cors });

// Sécurité & middlewares
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors(config.cors));
app.set("trust proxy", 1);

// Routes HTTP
/**
 * @openapi
 * /:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns a simple message to indicate the API is healthy.
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: API is healthy!
 */
app.get("/", (req, res) => res.json({ message: "API is healthy!" }));
app.use("/api", require("./src/routers"));

// Swagger UI Setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware pour rendre 'io' accessible dans les routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Gestion des connexions Socket.IO
io.on("connection", (socket) => {
  if (process.env.NODE_ENV === "development") {
    logger.info(`Un utilisateur est connecté: ${socket.id}`);
  } else {
    console.log(`Un utilisateur est connecté: ${socket.id}`);
  }

  // L'utilisateur doit s'identifier en émettant cet événement depuis le client
  socket.on("authenticate", (userId) => {
    if (userId) {
      if (process.env.NODE_ENV === "development") {
        logger.info(
          `Socket ${socket.id} authentifié pour l'utilisateur ${userId}`
        );
      } else {
        console.log(
          `Socket ${socket.id} authentifié pour l'utilisateur ${userId}`
        );
      }
      // L'utilisateur rejoint une "room" qui porte son propre ID
      // pour pouvoir lui envoyer des notifications ciblées.
      socket.join(userId);
    }
  });

  socket.on("disconnect", () => {
    if (process.env.NODE_ENV === "development") {
      logger.info(`Utilisateur déconnecté: ${socket.id}`);
    } else {
      console.log(`Utilisateur déconnecté: ${socket.id}`);
    }
  });
});

// silence all console outputs on production
if (process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.warn = () => {};
  console.info = () => {};
  console.debug = () => {};
  // console.error; //remains active
}
// Serveur
const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV;
server.listen(PORT, async () => {
  // notifyLowCreditsEvent
  // await notifyLowCreditsEvent();
  if (process.env.NODE_ENV === "development") {
    logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
  } else console.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  if (process.env.NODE_ENV === "development")
    logger.error(`Error: ${err.message}`);
  else console.error(`Error: ${err.message}`);

  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = server;