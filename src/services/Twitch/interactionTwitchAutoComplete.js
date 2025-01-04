// src/services/Twitch/interactionTwitchAutoComplete.js
import { fetchAutocompleteSuggestions } from "../../utils/helpers.js";
import { getCachedTrackedStreamers } from "../../database/twitchDatabase.js";

export async function handleTwitchAutoCompleteSuggestions(
  interaction,
  focusedOption,
  autocompleteCache
) {
  if (interaction.commandName === "twitch") {
    const subcommand = interaction.options.getSubcommand();
    const query = focusedOption.value.trim().toLowerCase();

    // Validierung des Eingabewerts
    if (!query) {
      return interaction.respond([]); // Leere Liste für ungültige Eingaben
    }

    // Autocomplete für das Hinzufügen von Streamern
    if (subcommand === "add" && focusedOption.name === "user_name") {
      if (autocompleteCache.has(query)) {
        return interaction.respond(autocompleteCache.get(query));
      }

      const choices = await fetchAutocompleteSuggestions(
        query,
        fetchTwitchData, // Twitch-spezifische Fetch-Funktion
        formatTwitchResult // Twitch-spezifische Formatierungsfunktion
      );

      autocompleteCache.set(query, choices.slice(0, 25)); // Cache speichern
      return interaction.respond(choices.slice(0, 25));
    }

    // Autocomplete für das Entfernen von Streamern oder Ändern des Kanals
    if (
      ["remove", "set-channel"].includes(subcommand) &&
      focusedOption.name === "user_name"
    ) {
      const choices = await fetchAutocompleteSuggestions(
        query,
        async () => await getCachedTrackedStreamers(), // Fetch aus dem Cache
        (streamer) => ({
          name: streamer.displayName,
          value: streamer.userName,
        }) // Formatierungsfunktion
      );
      return interaction.respond(choices.slice(0, 25));
    }
  }
}

// Twitch-spezifische Fetch-Funktion
async function fetchTwitchData(query) {
  return await searchStreamer(query);
}

// Twitch-spezifische Formatierungsfunktion
function formatTwitchResult(streamer) {
  return {
    name: streamer.display_name,
    value: streamer.broadcaster_login,
  };
}
