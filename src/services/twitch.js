// src/services/twitch.js
import axios from "axios";
import APIManager from "../utils/apiManager.js";
import { exportsConfig } from "../config.js";
const { TwitchUserFeedbackErrorEmoji, TwitchClientId, TwitchClientSecret } =
  exportsConfig;

let twitchAccessToken = null;

// Funktion, um das Twitch-Access-Token zu generieren
async function getTwitchAccessToken() {
  const response = await axios.post("https://id.twitch.tv/oauth2/token", null, {
    params: {
      client_id: TwitchClientId,
      client_secret: TwitchClientSecret,
      grant_type: "client_credentials",
    },
  });
  return response.data.access_token;
}

// Funktion, um einen Twitch-Benutzer zu suchen
async function searchTwitchUser(username) {
  if (!twitchAccessToken) {
    twitchAccessToken = await getTwitchAccessToken();
  }

  try {
    const response = await axios.get("https://api.twitch.tv/helix/users", {
      headers: {
        "Client-ID": TwitchClientId,
        Authorization: `Bearer ${twitchAccessToken}`,
      },
      params: {
        login: username,
      },
    });

    if (response.data.data.length === 0) {
      return null;
    }
    return response.data.data[0]; // Gibt den ersten Benutzer zurück
  } catch (error) {
    console.error(
      "Error fetching Twitch user:",
      error.response?.data || error.message
    );
    return null;
  }
}

export { searchTwitchUser, getTwitchAccessToken };