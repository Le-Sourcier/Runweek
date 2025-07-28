const winston = require("winston");

const LOG_LEVEL = process.env.LOG_LEVEL || "info";

// Define log format
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});
const dirName = process.env.NODE_ENV === "development" ? "logs" : "logsDir";
// Create logger
const logger = winston.createLogger({
    level: LOG_LEVEL,
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        logFormat
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                logFormat
            ),
        }),
        new winston.transports.File({
            filename: `${dirName}/error.log`,
            level: "error",
        }),
        new winston.transports.File({ filename: `${dirName}/combined.log` }),
    ],
});

module.exports = logger;
