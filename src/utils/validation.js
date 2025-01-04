// src/utils/validation.js
import { logAndThrowError } from "./helpers.js";

/**
 * Validates a string, number, object, or array.
 * @param {string|number|object|array} value - The value to be checked.
 * @param {string} fieldName - The name of the field for error messages.
 * @param {string} emoji - The emoji to display before the error message.
 * @param {string} [message] - A custom error message.
 * @param {boolean} [allowEmpty=false] - Indicates whether empty strings or empty objects/arrays are allowed.
 */
export function validateValue(value, fieldName, emoji, message, allowEmpty = false) {
  // Validate strings
  if (typeof value === "string") {
    if (!allowEmpty && value.trim() === "") {
      logAndThrowError(`${emoji} ${message || `Fehler: \"${fieldName}\" darf kein leerer String sein.`}`);
    }
    return;
  }

  // Validate numbers
  if (typeof value === "number") {
    if (isNaN(value) || value <= 0 || !Number.isSafeInteger(value)) {
      logAndThrowError(`${emoji} ${message || `Fehler: \"${fieldName}\" muss eine gültige positive Ganzzahl sein.`}`);
    }
    return;
  }

  // Validate objects
  if (typeof value === "object" && !Array.isArray(value)) {
    if (!allowEmpty && (value === null || Object.keys(value).length === 0)) {
      logAndThrowError(`${emoji} ${message || `Fehler: \"${fieldName}\" darf kein leeres Objekt sein.`}`);
    }
    return;
  }

  // Validate arrays
  if (Array.isArray(value)) {
    if (!allowEmpty && value.length === 0) {
      logAndThrowError(`${emoji} ${message || `Fehler: \"${fieldName}\" darf kein leeres Array sein.`}`);
    }
    return;
  }

  // If the type is not recognized
  logAndThrowError(`${emoji} ${message || `Fehler: \"${fieldName}\" hat einen ungültigen Typ.`}`);
}

/**
 * Validates multiple fields.
 * @param {Object} fields - An object with key-value pairs to validate.
 * @param {string} emoji - The emoji to display before the error message.
 * @param {string} [message] - A custom error message.
 * @param {boolean} [allowEmpty=false] - Indicates whether empty strings or empty objects/arrays are allowed.
 */
export function validateFields(fields, emoji, message, allowEmpty = false) {
  for (const [fieldName, value] of Object.entries(fields)) {
    validateValue(value, fieldName, emoji, message, allowEmpty);
  }
}
