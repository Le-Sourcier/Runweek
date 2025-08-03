require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swaggerConfig"); // Import the generated spec
const config = require("./src/config");
require("./src/events");

let logger;
if (process.env.NODE_ENV === "development") {
  logger = require("./src/utils/components/logger");
}
require("./db"); //initialize db instance
require("./src/events/dbDownloader"); //Auto download database

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: config.cors,
});

// Sécurité & middlewares
app.use(helmet());
// app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
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

// Démarrer les sockets
app.set("io", io);

io.on("connection", (socket) => {});

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
