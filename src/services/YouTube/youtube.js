// src/services/YouTube/youtube.js
import APIManager from "../../utils/apiManager.js";
import { handleAxiosError } from "../../utils/helpers.js";
import { youtubeFeedbackError, youtubeApiKey } from "../../alias.js";

const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";

// Create APIManager instance
const youtubeApi = new APIManager(YOUTUBE_API_BASE_URL);

/**
 * Validiert einen YouTube-Kanal
 * @param {string} channelId - Die ID des YouTube-Kanals
 * @returns {Promise<Object>} - Kanalinformationen, wenn der Kanal existiert
 */
export async function validateYouTubeChannel(channelId) {
  if (!channelId)
    throw new Error(`${youtubeFeedbackError.emoji} Kanal-ID fehlt.`);

  try {
    const response = await youtubeApi.makeRequest("/channels", "GET", {
      part: "snippet",
      id: channelId,
      key: youtubeApiKey,
    });

    if (!response.items || response.items.length === 0) {
      throw new Error(`Kanal mit der ID "${channelId}" nicht gefunden.`);
    }

    const channel = response.items[0];
    return {
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
    };
  } catch (error) {
    handleAxiosError(
      youtubeFeedbackError.emoji,
      error,
      "Fehler bei der Kanalvalidierung"
    );
  }
}

/**
 * Videosuche mit der YouTube API
 * @param {string} query - Suchbegriff für die Videosuche
 * @param {number} maxResults - Maximale Anzahl der Ergebnisse (Standard: 5)
 * @returns {Promise<Object[]>} - Array von Videos mit ID, Titel und Kanalname
 */
export async function searchVideos(query, maxResults = 5) {
  if (!query)
    throw new Error(`${youtubeFeedbackError.emoji} Suchbegriff fehlt.`);

  try {
    const response = await youtubeApi.makeRequest("/search", "GET", {
      part: "snippet",
      type: "video",
      q: query,
      maxResults,
      key: youtubeApiKey,
    });

    return response.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
    }));
  } catch (error) {
    handleAxiosError(
      youtubeFeedbackError.emoji,
      error,
      "Fehler bei der Videosuche"
    );
  }
}

/**
 * Ruft die neuesten Videos eines Kanals ab
 * @param {string} channelId - ID des YouTube-Kanals
 * @param {number} maxResults - Maximale Anzahl der Ergebnisse (Standard: 5)
 * @returns {Promise<Object[]>} - Array von Videos mit ID, Titel und Veröffentlichungsdatum
 */
export async function getLatestVideos(channelId, maxResults = 5) {
  if (!channelId)
    throw new Error(`${youtubeFeedbackError.emoji} Kanal-ID fehlt.`);

  try {
    const response = await youtubeApi.makeRequest("/search", "GET", {
      part: "snippet",
      channelId,
      maxResults,
      order: "date",
      type: "video",
      key: youtubeApiKey,
    });

    return response.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (error) {
    handleAxiosError(
      youtubeFeedbackError.emoji,
      error,
      "Fehler beim Abrufen der neuesten Videos"
    );
  }
}
