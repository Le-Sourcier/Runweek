require("dotenv").config();
const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);

const session = require("express-session");
const passport = require("passport");

const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swaggerConfig"); // Import the generated spec
const config = require("./src/config");
require("./src/events");
require("./src/config/passport")(app); // Importez la configuration Passport

let logger;
if (process.env.NODE_ENV === "development") {
  logger = require("./src/utils/components/logger");
}
require("./db"); //initialize db instance
require("./src/events/dbDownloader"); //Auto download database

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

// Middleware de session (optionnel pour Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

// Initialisation de Passport
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => res.json({ message: "API is healthy!" }));

// Get user information from the callback after auth with Google
app.get("/auth/google/callback", (req, res) => {
  const { token, refresh, userId, code } = req.query;
  if (!code) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  // Store tokens in cookies or session as needed
  res.cookie("token", token, { httpOnly: true });
  res.cookie("refresh", refresh, { httpOnly: true });
  res.cookie("userId", userId, { httpOnly: true });
  // return res.redirect(process.env.FRONTEND_URL || "http://localhost:5173");
  return res.status(200).json({
    message: "Profile updated successfully",
    code,
  });
});

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
