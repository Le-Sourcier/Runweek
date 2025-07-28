const _config = {
  development: {
    database: "runweek_db",
    username: "postgres",
    password: "admin",
    host: "localhost",
    dialect: "postgres",
    logging: false,
    cors: {
      origin: "*",
      //origin: process.env.ORIGINE_URL,
      credentials: false,
    },
  },
  production: {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
    cors: {
      origin: process.env.ORIGINE_URL,
      credentials: process.env.NODE_ENV === "production" ? true : false,
    },
  },
};

const env =
  process.env.NODE_ENV === "production" ? "production" : "development";
const config = _config[env];

module.exports = config;
