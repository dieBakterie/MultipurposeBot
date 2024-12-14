import APIManager from "../utils/apiManager.js";
import { exportsConfig } from "../config.js";
const { TwitchUserFeedbackErrorEmoji, TwitchClientId, TwitchClientSecret } =
  exportsConfig;

let accessToken = null;
let tokenExpiresAt = 0;

// Twitch API Manager erstellen
const twitchApi = new APIManager("https://id.twitch.tv/oauth2/token");

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
 * Twitch API Authentifizierung
 * Ruft ein Zugriffstoken ab und speichert es.
 * @returns {Promise<string>} - Das Zugriffstoken
 */
async function authenticate() {
  const now = Date.now();

  if (accessToken && now < tokenExpiresAt) {
    return accessToken;
  }

  try {
    const response = await twitchApi.makeRequest(
      "/",
      "POST",
      {},
      new URLSearchParams({
        client_id: TwitchClientId,
        client_secret: TwitchClientSecret,
        grant_type: "client_credentials",
      }),
      { "Content-Type": "application/x-www-form-urlencoded" }
    );

    if (!response || !response.access_token) {
      throw new Error("Kein Zugriffstoken erhalten.");
    }

    const { access_token, expires_in } = response;
    accessToken = access_token;
    tokenExpiresAt = now + expires_in * 1000;

    // Standard-Header aktualisieren
    twitchHelixApi.setDefaultHeaders({
      Authorization: `Bearer ${accessToken}`,
      "Client-ID": TwitchClientId,
    });

    return accessToken;
  } catch (error) {
    handleAxiosError(
      `${TwitchUserFeedbackErrorEmoji} Twitch API Authentifizierung fehlgeschlagen`,
      error
    );
  }
}

/**
 * Stellt sicher, dass die Authentifizierung vor der Nutzung erfolgt.
 */
async function ensureAuthenticated() {
  return authenticate();
}

/**
 * Twitch API Manager für die REST-API
 */
const twitchHelixApi = new APIManager("https://api.twitch.tv/helix", {
  Authorization: `Bearer ${accessToken}`,
  "Client-ID": TwitchClientId,
});

/**
 * Sucht nach einem Streamer bei der Twitch API
 * @param {string} query - Suchbegriff oder Username des Streamers
 * @returns {Promise<Object[]>} - Array mit Streamer-Details
 */
export async function searchTwitchChannel(query) {
  try {
    await ensureAuthenticated();
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
      TwitchUserFeedbackErrorEmoji,
      error,
      "Twitch API Fehler bei der Streamer-Suche"
    );
  }
}

/**
 * Ruft Stream-Details von der Twitch API ab
 * @param {string} streamername - Twitch Username des Streamers
 * @returns {Promise<Object|null>} - Stream-Details oder null, wenn offline
 */
export async function getTwitchStreamDetails(streamername) {
  try {
    await ensureAuthenticated();

    const response = await twitchHelixApi.makeRequest("/streams", "GET", {
      user_login: streamername, // Twitch Username
    });

    if (!response || !response.data) {
      throw new Error(`Kein Stream gefunden für Benutzer: ${streamername}`);
    }

    const { data } = response;
    return data.length > 0 ? data[0] : null; // Null zurückgeben, wenn offline
  } catch (error) {
    handleAxiosError(
      TwitchUserFeedbackErrorEmoji,
      error,
      `Fehler beim Abrufen der Stream-Details für ${streamername}`
    );
  }
}

/**
 * Validiert einen Streamer über die Twitch API
 * @param {string} streamername - Twitch Username des Streamers
 * @returns {Promise<Object|null>} - Streamer-Details oder null, wenn nicht gefunden
 */
export async function validateTwitchChannel(streamername) {
  try {
    const streamers = await searchTwitchChannel(streamername);
    return streamers.find(
      (s) => s.display_name.toLowerCase() === streamername.toLowerCase()
    );
  } catch (error) {
    handleAxiosError(
      TwitchUserFeedbackErrorEmoji,
      error,
      "Fehler bei der Streamer-Validierung"
    );
  }
}
