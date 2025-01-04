// src/utils/helpers.js
import { nodeEnvironment } from "../alias.js";
import logger from "./logger.js";

/**
 * Loggt den Fehler und wirft ihn dann erneut.
 * @param {string} emoji - Das Emoji, das vor der Fehlermeldung angezeigt werden soll.
 * @param {string} message - Die Fehlermeldung, die geloggt werden soll.
 * @param {Error|null} [error=null] - Der ursprüngliche Fehler (optional).
 * @throws {Error} - Der Fehler wird erneut geworfen.
 */
export function logAndThrowError(emoji, message, error = null) {
  const fullMessage = `${emoji} ${message}`;
  if (error) {
    logger.error(`${fullMessage} | Details: ${error.message}`);
    if (nodeEnvironment === "development") {
      logger.debug(error.stack);
    }
  } else {
    logger.error(fullMessage);
  }
  throw new Error(fullMessage);
}
export function logAndThrowError(emoji, message, error = null) {
  const fullMessage = `${emoji} ${message}`;
  const customError = new Error(fullMessage);
  customError.details = error ? error.stack : null;

  logger.error(fullMessage);
  if (error) {
    logger.debug(error.stack);
  }
  throw customError;
}

/**
 * Utility-Funktion zur Fehlerbehandlung für Axios-Anfragen.
 * @param {string} emoji - Emoji zur Darstellung des Fehlers.
 * @param {Error} error - Der aufgetretene Fehler.
 * @param {string} message - Benutzerdefinierte Fehlermeldung.
 */
export function handleAxiosError(emoji, error, message) {
  const { response } = error;
  const statusCode = response ? response.status : "N/A";
  const url = error.config?.url || "Unbekannte URL";
  const detailedMessage = response ? response.data?.error?.message : error.message;

  logger.error(
    `${emoji} ${message} | URL: ${url} | Status: ${statusCode} | Details: ${detailedMessage}`
  );
  logAndThrowError(emoji, `${message}: ${detailedMessage}`, error);
}

/**
 * Erstellt eine standardisierte Antwort für Erfolge oder Fehler.
 * @param {boolean} success - Gibt an, ob die Operation erfolgreich war.
 * @param {string} message - Die Nachricht, die die Operation beschreibt.
 * @param {Object|null} [data=null] - Optionale zusätzliche Daten.
 * @param {number} [statusCode=200] - Der Statuscode (optional).
 * @returns {Object} - Standardisiertes Antwortobjekt.
 */
export function createSuccessResponse(
  success,
  message,
  data = null,
  statusCode = 200
) {
  return {
    success,
    message,
    data,
    statusCode,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Holt Vorschläge für Autocomplete basierend auf einer API-spezifischen Funktion.
 * @param {string} query - Benutzerinput für die Suche.
 * @param {Function} fetchFunction - API-spezifische Funktion, die Daten abruft.
 * @param {Function} formatFunction - Funktion, die die Ergebnisse formatiert.
 * @returns {Promise<Object[]>} - Liste der formatierten Ergebnisse.
 */
export async function fetchAutocompleteSuggestions(
  query,
  fetchFunction,
  formatFunction = (item) => item
) {
  if (!query || typeof query !== "string" || query.trim() === "") {
    return [];
  }

  try {
    const results = await fetchFunction(query);
    return results.map(formatFunction);
  } catch (error) {
    logger.warn(`Fehler bei Autocomplete-Suche: ${error.message}`);
    return [];
  }
}
