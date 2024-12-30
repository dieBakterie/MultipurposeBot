// src/services/Spotify/spotify.ts
otify/spotify.js
import APIManager from "../../utils/apiManager.js";

const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
let accessToken = null;
let tokenExpiresAt = 0;

// APIManager für Spotify
const spotifyApi = new APIManager(SPOTIFY_API_BASE_URL);

// Authentifizierung
async function authenticate(SpotifyClientId, SpotifyClientSecret) {
  const now = Date.now();

  if (accessToken && now < tokenExpiresAt) {
    return accessToken;
  }

  try {
    const response = await spotifyApi.makeRequest(
      SPOTIFY_TOKEN_URL,
      "POST",
      {},
      new URLSearchParams({ grant_type: "client_credentials" }),
      {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${SpotifyClientId}:${SpotifyClientSecret}`
        ).toString("base64")}`,
      }
    );

    const { access_token, expires_in } = response;
    accessToken = access_token;
    tokenExpiresAt = now + expires_in * 1000;

    // Aktualisiere die Header mit dem neuen Token
    spotifyApi.setDefaultHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return accessToken;
  } catch (error) {
    throw new Error(
      `Spotify Authentifizierung fehlgeschlagen: ${error.message}`
    );
  }
}

// Song-Suche
async function searchTrack(query) {
  try {
    const response = await spotifyApi.makeRequest(`/search`, "GET", {
      q: query,
      type: "track",
      limit: 1,
    });

    const track = response.tracks.items[0];
    if (!track) {
      throw new Error(`Kein Song gefunden.`);
    }

    return {
      name: track.name,
      artist: track.artists[0].name,
      url: track.external_urls.spotify,
      duration: track.duration_ms,
    };
  } catch (error) {
    throw new Error(`Spotify-Suche fehlgeschlagen: ${error.message}`);
  }
}

export { authenticate, searchTrack };
