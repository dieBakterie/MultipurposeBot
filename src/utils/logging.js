import winston from "winston";
import path from "path";

const logFile = path.join("logs", "bot.log");

// Helper-Funktion für Logging
export function logMessage(logFile, message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFile, logEntry, "utf8");
}

// Logger konfigurieren
const logger = winston.createLogger({
  level: "info", // Setzt die Standard-Logstufe (z.B., "info", "debug")
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    }),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] [${level}] ${message}`;
        }),
      ),
    }),
    new winston.transports.File({ filename: logFile, level: "info" }),
  ],
});

// Log-Funktion für verschiedene Log-Level
export const log = {
  info: (msg) => logger.info(msg),
  warn: (msg) => logger.warn(msg),
  error: (msg) => logger.error(msg),
  debug: (msg) => logger.debug(msg),
};

// Beispielhafte Datei-Rotierung (optional)
/* logger.add(
  new winston.transports.File({
    filename: path.join(logDir, "bot-errors.log"),
    level: "error",
    maxsize: 5242880, // 5 MB
    maxFiles: 5, // Behalte die letzten 5 Dateien
  })
);*/

export default logger;
