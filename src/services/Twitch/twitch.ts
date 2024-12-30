// src/services/Twitch/twitch.ts
itch/twitch.js
import APIManager from "../../utils/apiManager.js";
import {
  twitchClientId,
  twitchClientSecret,
  twitchFeedbackError,
} from "../../alias.js";
import { logAndThrowError } from "../../utils/helpers.js";

// Zugriffstoken und Ablaufzeit speichern
let accessToken = null;
let tokenExpiresAt = 0;

/**
 * Utility-Funktion zur Fehlerbehandlung
 * @param {string} message - Benutzerdefinierte Fehlermeldung
 * @param {Error} error - Der aufgetretene Fehler
 * @throws {Error} - Geworfener Fehler mit zusätzlichen Details
 */
function handleAxiosError(message, error) {
  console.error(`${message}:`, error.response?.statusText || error.message);
  throw new Error(`${twitchFeedbackError.emoji} ${message}: ${error.message}`);
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
    handleAxiosError("Fehler beim Abrufen des Twitch-Access-Tokens", error);
  }
}

/**
 * Twitch API Manager für die REST-API
 */
const twitchHelixApi = new APIManager("https://api.twitch.tv/helix");

/**
 * Twitch API Authentifizierung
 * @returns {Promise<string>} - Das Zugriffstoken
 */
async function authenticate() {
  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken;
  }

  try {
    accessToken = await getTwitchAccessToken();
    twitchHelixApi.setDefaultHeaders({
      Authorization: `Bearer ${accessToken}`,
      "Client-ID": twitchClientId,
    });

    return accessToken;
  } catch (error) {
    handleAxiosError("Twitch API Authentifizierung fehlgeschlagen", error);
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
      { query }
    );
    return response.data || [];
  } catch (error) {
    handleAxiosError("Fehler bei der Streamer-Suche", error);
  }
}

/**
 * Validiert einen Streamer über die Twitch API
 * @param {string} streamerName - Twitch Username des Streamers
 * @returns {Promise<Object>} - Streamer-Details, wenn gefunden
 * @throws {Error} - Fehler, wenn der Streamer nicht gefunden wird
 */
export async function validateStreamer(streamerName) {
  if (!streamerName || typeof streamerName !== "string") {
    throw new Error("Ungültiger Streamername.");
  }

  try {
    const streamers = await searchStreamer(streamerName);

    if (!Array.isArray(streamers) || streamers.length === 0) {
      throw new Error(`Streamer "${streamerName}" nicht gefunden.`);
    }

    const matchedStreamer = streamers.find(
      (s) => s.broadcaster_login.toLowerCase() === streamerName.toLowerCase()
    );

    if (!matchedStreamer) {
      throw new Error(
        `Streamer "${streamerName}" konnte nicht validiert werden.`
      );
    }

    return matchedStreamer;
  } catch (error) {
    console.error(
      `${twitchFeedbackError.emoji} Fehler bei der Validierung des Streamers "${streamerName}":`,
      error.message
    );

    throw new Error(
      `${twitchFeedbackError.emoji} Fehler bei der Streamer-Validierung: ${error.message}`
    );
  }
}

/**
 * Ruft Stream-Details von der Twitch API ab
 * @param {string} streamerName - Twitch Username des Streamers
 * @returns {Promise<Object|null>} - Stream-Details oder null, wenn offline
 */
export async function getStreamerDetails(streamerName) {
  await authenticate();
  try {
    const response = await twitchHelixApi.makeRequest("/streams", "GET", {
      user_login: streamerName,
    });
    return response.data?.[0] || null;
  } catch (error) {
    handleAxiosError("Fehler beim Abrufen der Stream-Details", error);
  }
}
