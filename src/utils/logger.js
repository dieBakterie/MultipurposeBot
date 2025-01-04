// src/utils/logger.js
import winston from "winston";
import "winston-daily-rotate-file";
import fs from "fs";
import path from "path";
import { nodeEnvironment } from "../alias.js";

// Ensure the logs directory exists
const logDir = path.join(process.cwd(), nodeEnvironment === "production" ? "prod-logs" : "dev-logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define log file paths
const logFile = path.join(logDir, "bot-info.log");
const errorLogFile = path.join(logDir, "bot-errors.log");

// Configure Winston logger
const logger = winston.createLogger({
  level: "info", // Default log level
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => {
          const colorizedLevel = level.toUpperCase();
          return `[${timestamp}] [${colorizedLevel}] ${message}`;
        })
      ),
    }),
    new winston.transports.File({ filename: logFile, level: "info" }),
    new winston.transports.File({ filename: errorLogFile, level: "error" }),
  ],
});

// Utility functions for logging at various levels
export const log = {
  info: (msg) => logger.info(msg),
  warn: (msg) => logger.warn(msg),
  error: (msg) => logger.error(msg),
  debug: (msg) => logger.debug(msg),
};

// File-based logging for custom entries (optional)
export function logMessageToFile(message, level = "info", filePath = logFile) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  fs.appendFileSync(filePath, logEntry, "utf8");
}

logger.add(
  new winston.transports.DailyRotateFile({
    dirname: logDir,
    filename: "application-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxSize: "10m", // Maximale Größe pro Datei
    maxFiles: "14d", // Behalte Logs für die letzten 14 Tage
    level: "info", // Rotierte Dateien nur für Info-Logs
  })
);

export default logger;
