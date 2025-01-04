// src/events/interactionCreate.js
// **Imports**

// Music
import { handleMusicControl } from "../services/music/interactionMusicControls.js";

// RoleMenu
import { handleRoleMenuControl } from "../services/rolemenu/interactionRoleMenuControls.js";
import { handleRoleMenuAutoCompleteSuggestions } from "../services/Rolemenu/interactionRoleMenuAutoComplete.js";

// Spotify
import { handleSpotifyControl } from "../services/Spotify/interactionSpotifyControls.js";
import { handleSpotifyAutoCompleteSuggestions } from "../services/Spotify/interactionSpotifyAutoComplete.js";

// Twitch
import { handleTwitchControl } from "../services/Twitch/interactionTwitchControls.js";
import { handleTwitchAutoCompleteSuggestions } from "../services/Twitch/interactionTwitchAutoComplete.js";

// YouTube
import { handleYouTubeControl } from "../services/YouTube/interactionYouTubeControls.js";
import { handleYouTubeAutoCompleteSuggestions } from "../services/YouTube/interactionYouTubeAutoComplete.js";

export default {
  name: "interactionCreate",
  async execute(interaction) {
    try {
      const guildId = interaction.guildId;

      // **Button-Interaktionen**
      if (interaction.isButton()) {
        const customId = interaction.customId;

        if (["play_pause", "skip", "stop"].includes(customId)) {
          // Musiksteuerung
          await handleMusicControl(interaction, guildId);
        } else if (customId.startsWith("role_")) {
          // Rollensteuerung
          await handleRoleMenuControl(interaction);
        } else if (customId.startsWith("spotify_")) {
          // Spotify-Interaktionen
          await handleSpotifyControl(interaction, interaction.channel, guildId);
        } else if (customId.startsWith("twitch_")) {
          // Twitch-Interaktionen
          await handleTwitchControl(interaction, guildId);
        } else if (customId.startsWith("youtube_")) {
          // YouTube-Interaktionen
          await handleYouTubeControl(interaction, interaction.channel, guildId);
        } else {
          await interaction.reply({
            content: "Diese Interaktion ist nicht verstanden.",
            ephemeral: true,
          });
        }
        return;
      }

      // **Autocomplete-Interaktionen**
      if (interaction.isAutocomplete()) {
        const focusedOption = interaction.options.getFocused(true);
        const autocompleteCache = new Map(); // Cache initialisieren

        switch (interaction.commandName) {
          case "twitch":
            await handleTwitchAutoCompleteSuggestions(
              interaction,
              focusedOption,
              autocompleteCache
            );
            break;
          case "rolemenu":
            await handleRoleMenuAutoCompleteSuggestions(
              interaction,
              focusedOption,
              autocompleteCache
            );
            break;
          case "youtube":
            await handleYouTubeAutoCompleteSuggestions(
              interaction,
              focusedOption,
              autocompleteCache
            );
            break;
          case "spotify":
            await handleSpotifyAutoCompleteSuggestions(
              interaction,
              focusedOption,
              autocompleteCache
            );
            break;
          default:
            await interaction.respond({
              content: "Autocomplete-Funktion nicht verfügbar.",
              ephemeral: true,
            });
        }
        return;
      }

      // **Slash-Commands**
      if (interaction.isCommand()) {
        const command = interaction.client.commands.get(
          interaction.commandName
        );
        if (!command) return;

        await command.execute(interaction);
      }
    } catch (error) {
      console.error("Fehler bei der Interaktion:", error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "Ein Fehler ist aufgetreten.",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "Ein Fehler ist aufgetreten.",
          ephemeral: true,
        });
      }
    }
  },
};
