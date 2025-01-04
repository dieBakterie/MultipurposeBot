// src/services/Spotify/interactionSpotifyAutoComplete.js
import { fetchAutocompleteSuggestions } from "../../utils/helpers.js";
import { searchSpotifyArtist } from "./spotify.js";

/**
 * Handhabt Autocomplete-Vorschläge für Spotify-spezifische Befehle.
 * @param {Interaction} interaction - Die Benutzerinteraktion.
 * @param {Object} focusedOption - Das aktuell fokussierte Feld in der Interaktion.
 * @param {Map} autocompleteCache - Cache für Autocomplete-Ergebnisse.
 */
export async function handleSpotifyAutoCompleteSuggestions(
  interaction,
  focusedOption,
  autocompleteCache
) {
  if (interaction.commandName !== "spotify") return;

  const subcommand = interaction.options.getSubcommand();
  const query = focusedOption.value.trim().toLowerCase();

  // Überprüfung auf leere oder ungültige Eingaben
  if (!query) {
    return interaction.respond([]);
  }

  // Unterstützung für spezifische Subcommands (z. B. "follow", "unfollow")
  const supportedSubcommands = [
    "follow",
    "unfollow",
    "get-artist-albums",
    "get-artist-tracks",
    "get-artist-top-tracks",
  ];

  if (
    supportedSubcommands.includes(subcommand) &&
    focusedOption.name === "artist"
  ) {
    // Cache-Überprüfung
    if (autocompleteCache.has(query)) {
      return interaction.respond(autocompleteCache.get(query));
    }

    // Vorschläge abrufen und formatieren
    const suggestions = await fetchAutocompleteSuggestions(
      query,
      fetchSpotifyData, // Spotify-spezifische Fetch-Funktion
      formatSpotifyResult // Spotify-spezifische Formatierungsfunktion
    );

    // Ergebnisse im Cache speichern und zurückgeben
    const limitedSuggestions = suggestions.slice(0, 25);
    autocompleteCache.set(query, limitedSuggestions);
    return interaction.respond(limitedSuggestions);
  }

  // Wenn der Subcommand nicht unterstützt wird, leere Liste zurückgeben
  return interaction.respond([]);
}

/**
 * Spotify-spezifische Fetch-Funktion zur Suche nach Künstlern.
 * @param {string} query - Die Suchanfrage.
 * @returns {Promise<Array>} - Liste der Suchergebnisse.
 */
async function fetchSpotifyData(query) {
  return await searchSpotifyArtist(query);
}

/**
 * Spotify-spezifische Formatierungsfunktion für Autocomplete-Vorschläge.
 * @param {Object} artist - Der Künstler, der formatiert werden soll.
 * @returns {Object} - Formatierte Daten für Discord Autocomplete.
 */
function formatSpotifyResult(artist) {
  return {
    name: artist.name,
    value: artist.id,
  };
}
