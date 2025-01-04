// src/services/Twitch/twitch.js
import APIManager from "../../utils/apiManager.js";
import { logAndThrowError, handleAxiosError } from "../../utils/helpers.js";
import {
  twitchClientId,
  twitchClientSecret,
  twitchFeedbackError,
} from "../../alias.js";

/**
 * Twitch API Manager für die REST-API
 */
const twitchApiManager = new APIManager("https://api.twitch.tv/helix");

/**
 * Funktion, um das Twitch-Access-Token zu generieren und zu speichern
 * @returns {Promise<string>} - Das Twitch-Access-Token
 */
async function getTwitchAccessToken() {
  // Retrieve the access token using the APIManager instance
  const accessToken = await twitchApiManager.getOrCacheAccessToken(
    twitchClientId,
    twitchClientSecret,
    "https://id.twitch.tv/oauth2/token",
    "client_credentials",
    60 * 60 // 1 Stunde TTL
  );

  return accessToken;
}

// Twitch API Instanz mit accessToken
let twitchApi;
async function authenticate() {
  const accessToken = await getTwitchAccessToken();
  twitchApi = twitchApiManager.getInstance(accessToken);
}

/**
 * Sucht nach einem Streamer bei der Twitch API
 * @param {string} query - Suchbegriff oder Username des Streamers
 * @returns {Promise<Object[]>} - Array mit Streamer-Details
 */
export async function searchStreamer(query) {
  // Validierung von `query`
  if (!query || typeof query !== "string" || query.trim() === "") {
    logAndThrowError(
      twitchFeedbackError.emoji,
      new Error("Ungültiger Suchbegriff"),
      "Ungültiger Suchbegriff für Twitch API"
    );
    return []; // Gib ein leeres Array zurück, um keine Anfrage zu senden
  }

  await authenticate();

  try {
    const response = await twitchApi.makeRequest(
      "/search/channels",
      "GET",
      {
        query: query.trim(),
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
 * Ruft Stream-Daten von der Twitch API ab
 * @param {string} userId - Twitch User-ID des Streamers
 * @returns {Promise<Object|null>} - Stream-Daten oder null, wenn offline
 */
export async function getTwitchStreamDetails(userId) {
  await authenticate();

  try {
    // Stream-Details abrufen
    const response = await twitchApi.makeRequest("/streams", "GET", {
      user_id: userId,
    });
    const streamData = response.data?.length > 0 ? response.data[0] : null;

    return streamData || null; // Gibt null zurück, wenn offline
  } catch (error) {
    handleAxiosError(
      twitchFeedbackError.emoji,
      error,
      "Fehler beim Abrufen der Stream-Details"
    );
    return null;
  }
}

/**
 * Ruft Benutzer-Details von der Twitch API ab
 * @param {string}  - Twitch User-Id des Streamers
 * @returns {Promise<Object|null>} - Benutzer-Daten oder null, wenn nicht gefunden
 */
export async function getTwitchStreamerDetails(userId) {
  await authenticate();

  try {
    // Benutzer-Details abrufen
    const response = await twitchApi.makeRequest("/users", "GET", {
      id: userId,
    });
    const userData = response.data?.length > 0 ? response.data[0] : null;

    return userData || null; // Gibt null zurück, wenn Benutzer nicht gefunden
  } catch (error) {
    handleAxiosError(
      twitchFeedbackError.emoji,
      error,
      "Fehler beim Abrufen der Benutzer-Details"
    );
    return null;
  }
}

/**
 * Validiert einen Streamer und gibt dessen ID und Anzeigenamen zurück
 * @param {string} streamerName - Twitch Username des Streamers
 * @returns {Promise<Object|null>} - Objekt mit `id` und `display_name` oder null
 */
export async function validateAndFetchStreamerDetails(streamerName) {
  if (!streamerName || typeof streamerName !== "string") {
    logAndThrowError(
      twitchFeedbackError.emoji,
      new Error("Ungültiger Streamername"),
      "Ungültiger Streamername"
    );
    return null;
  }

  // Schritt 1: Suche den Streamer
  const streamers = await searchStreamer(streamerName);

  // Filtere nach exakter Übereinstimmung
  const matchedStreamer = streamers.find(
    (s) => s.broadcaster_login.toLowerCase() === streamerName.toLowerCase()
  );

  if (!matchedStreamer) {
    logAndThrowError(
      twitchFeedbackError.emoji,
      new Error("Streamer nicht gefunden"),
      `Streamer nicht gefunden: ${streamerName}`
    );
    return null;
  }

  // Schritt 2: Nutze getTwitchStreamerDetails für zusätzliche Validierung (optional)
  const streamerDetails = await getTwitchStreamerDetails(matchedStreamer.id);

  if (!streamerDetails) {
    logAndThrowError(
      twitchFeedbackError.emoji,
      new Error("Fehler beim Abrufen der Streamer-Details"),
      `Fehler beim Abrufen der Streamer-Details: ${matchedStreamer.id}`
    );
    return null;
  }

  // Rückgabe der benötigten Daten
  return {
    id: streamerDetails.id,
    display_name: streamerDetails.display_name,
    login: streamerDetails.login,
  };
}
