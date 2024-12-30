// src/utils/helpers.ts
rs.js
import { nodeEnvironment } from "../alias.js";

/**
 * Loggt den Fehler und wirft ihn dann erneut. Wenn wir uns in der
 * Entwicklungsumgebung befinden, wird der gesamte Fehler geloggt.
 * @param {string} message - Die Fehlermeldung, die geloggt werden soll.
 * @param {Error} error - Der Fehler, der geloggt werden soll.
 * @throws {Error} - Der Fehler wird erneut geworfen.
 */
export function logAndThrowError(message, error) {
  console.error(`${message}:`, error.message);
  if (nodeEnvironment === "development") {
    console.error(error); // Zeige vollen Fehler nur in Entwicklung
  }
  throw new Error(message);
}
