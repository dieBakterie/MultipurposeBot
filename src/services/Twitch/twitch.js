// src/services/Twitch/twitch.js
import APIManager from "../../utils/apiManager.js";
import {
  twitchClientId,
  twitchClientSecret,
  twitchFeedbackError,
} from "../../alias.js";

// Zugriffstoken und Ablaufzeit speichern
let accessToken = null;
let tokenExpiresAt = 0;

/**
 * Utility-Funktion zur Fehlerbehandlung
 * @param {string} emoji - Emoji zur Darstellung des Fehlers
 * @param {Error} error - Der aufgetretene Fehler
 * @param {string} message - Benutzerdefinierte Fehlermeldung
 */
function handleAxiosError(emoji, error, message) {
  throw new Error(
    `${emoji} ${message}: ${error.response?.statusText || error.message}`
  );
}

/**
 * Funktion, um das Twitch-Access-Token zu generieren
 * @returns {Promise<string>} - Das Twitch-Access-Token
 */
async function getTwitchAccessToken() {
  const twitchAuthApi = new APIManager("https://id.twitch.tv/oauth2/token");

  try {
    const response = await twitchAuthApi.makeRequest(
      "",
      "POST",
      {
        client_id: twitchClientId,
        client_secret: twitchClientSecret,
        grant_type: "client_credentials",
      },
      null,
      { "Content-Type": "application/x-www-form-urlencoded" }
    );

    const { access_token, expires_in } = response;

    // Setze das Ablaufdatum für das Token
    tokenExpiresAt = Date.now() + expires_in * 1000;

    return access_token;
  } catch (error) {
    handleAxiosError(
      twitchFeedbackError.emoji,
      error,
      "Fehler beim Abrufen des Twitch-Access-Tokens"
    );
  }
}

/**
 * Twitch API Manager für die REST-API
 */
const twitchHelixApi = new APIManager("https://api.twitch.tv/helix");

/**
 * Twitch API Authentifizierung
 * Ruft ein Zugriffstoken ab und speichert es.
 * @returns {Promise<string>} - Das Zugriffstoken
 */
async function authenticate() {
  const now = Date.now();

  // Überprüfen, ob ein gültiges Token existiert
  if (accessToken && now < tokenExpiresAt) {
    return accessToken;
  }

  try {
    // Token abrufen, wenn es abgelaufen ist oder noch nicht vorhanden ist
    accessToken = await getTwitchAccessToken();

    // Standard-Header für zukünftige API-Anfragen setzen
    twitchHelixApi.setDefaultHeaders({
      Authorization: `Bearer ${accessToken}`,
      "Client-ID": twitchClientId,
    });

    return accessToken;
  } catch (error) {
    handleAxiosError(
      twitchFeedbackError.emoji,
      error,
      "Twitch API Authentifizierung fehlgeschlagen"
    );
  }
}

/**
 * Sucht nach einem Streamer bei der Twitch API
 * @param {string} query - Suchbegriff oder Username des Streamers
 * @returns {Promise<Object[]>} - Array mit Streamer-Details
 */
export async function searchStreamer(query) {
  await authenticate();
  try {
    const response = await twitchHelixApi.makeRequest(
      "/search/channels",
      "GET",
      {
        query,
      }
    );
    return response.data || [];
  } catch (error) {
    handleAxiosError(
      twitchFeedbackError.emoji,
      error,
      "Twitch API Fehler bei der Streamer-Suche"
    );
  }
}

/**
 * Validiert einen Streamer über die Twitch API
 * @param {string} streamerName - Twitch Username des Streamers
 * @returns {Promise<Object|null>} - Streamer-Details oder null, wenn nicht gefunden
 */
export async function validateStreamer(streamerName) {
  const streamers = await searchStreamer(streamerName);
  return streamers.find(
    (s) => s.display_name.toLowerCase() === streamerName.toLowerCase()
  );
}

/**
 * Ruft Stream-Details von der Twitch API ab
 * @param {string} streamerName - Twitch Username des Streamers
 * @returns {Promise<Object|null>} - Stream-Details oder null, wenn offline
 */
export async function getTwitchStreamDetails(streamerName) {
  await authenticate();
  try {
    const response = await twitchHelixApi.makeRequest("/streams", "GET", {
      user_login: streamerName,
    });
    const { data } = response;
    return data.length > 0 ? data[0] : null; // Null zurückgeben, wenn offline
  } catch (error) {
    handleAxiosError(
      twitchFeedbackError.emoji,
      error,
      "Fehler beim Abrufen der Stream-Details"
    );
  }
}
