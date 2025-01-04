// src/services/Spotify/spotify.js
import APIManager from "../../utils/apiManager.js";
import { spotifyClientId, spotifyClientSecret } from "../../alias.js";
import { handleAxiosError, logAndThrowError } from "../../utils/helpers.js";

// Create an instance of APIManager for the Spotify API
const spotifyApiManager = new APIManager("https://api.spotify.com/v1");

/**
 * Retrieves or caches the Spotify access token.
 * @returns {Promise<string>} - The Spotify access token.
 */
async function getSpotifyAccessToken() {
  try {
    const accessToken = await spotifyApiManager.getOrCacheAccessToken(
      spotifyClientId,
      spotifyClientSecret,
      "https://accounts.spotify.com/api/token",
      "client_credentials",
      60 * 60 // 1 Stunde TTL
    );
    return accessToken;
  } catch (error) {
    handleAxiosError(" ", error, "Error fetching Spotify access token");
    throw error;
  }
}

// Spotify API Instanz mit accessToken
let spotifyApi;
async function authenticate() {
  const accessToken = await getSpotifyAccessToken();
  spotifyApi = spotifyApiManager.getInstance(accessToken);
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
    handleAxiosError(`Spotify-Suche fehlgeschlagen: ${error.message}`);
  }
}

// Artist-Suche
async function followArtist(artist) {
  try {
    const response = await spotifyApi.makeRequest(`/me/following`, "PUT", {
      type: "artist",
      ids: [artist],
    });

    return response;
  } catch (error) {
    handleAxiosError(`Spotify-Follow fehlgeschlagen: ${error.message}`);
  }
}

// Gefolgte Artisten abrufen
async function getFollowedArtists() {
  try {
    const response = await spotifyApi.makeRequest(`/me/following`, "GET", {
      type: "artist",
    });

    return response.artists.items.map((artist) => artist.name);
  } catch (error) {
    handleAxiosError(`Spotify-Abfrage der gefolgten Artisten fehlgeschlagen: ${error.message}`);
  }
}

// Alben von einem Artisten abrufen
async function getArtistAlbums(artist) {
  try {
    const response = await spotifyApi.makeRequest(`/artists/${artist}/albums`, "GET", {
      album_type: "album",
      limit: 50,
    });

    return response.items.map((album) => album.name);
  } catch (error) {
    handleAxiosError(`Spotify-Abfrage der Alben von ${artist} fehlgeschlagen: ${error.message}`);
  }
}

// Tracks von einem Artisten abrufen
async function getArtistTracks(artist) {
  try {
    const response = await spotifyApi.makeRequest(`/artists/${artist}/top-tracks`, "GET", {
      country: "DE",
      limit: 50,
    });

    return response.tracks.map((track) => track.name);
  } catch (error) {
    handleAxiosError(`Spotify-Abfrage der Tracks von ${artist} fehlgeschlagen: ${error.message}`);
  }
}

// Top-Tracks von einem Artisten abrufen
async function getArtistTopTracks(artist) {
  try {
    const response = await spotifyApi.makeRequest(`/artists/${artist}/top-tracks`, "GET", {
      country: "DE",
      limit: 50,
    });

    return response.tracks.map((track) => track.name);
  } catch (error) {
    handleAxiosError(`Spotify-Abfrage der Top-Tracks von ${artist} fehlgeschlagen: ${error.message}`);
  }
}

export { authenticate, searchTrack, followArtist, getFollowedArtists, getArtistAlbums, getArtistTracks, getArtistTopTracks };
