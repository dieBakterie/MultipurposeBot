// src/commands/Music/skip.js
// Importiere die erforderlichen Module
import { SlashCommandBuilder } from "discord.js";
import { getQueue } from "../../services/music/queue.js";
import { skipSong } from "../../services/music/player.js";
// Importiere die erforderlichen Alias'
import {
  generalFeedbackInfo,
  generalFeedbackError,
  generalMusicSkip,
} from "../../alias.js";

export default {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Überspringt den aktuellen Song."),
  async execute(interaction) {
    const guildId = interaction.guild.id;

    // Hole die Warteschlange
    const queue = getQueue(guildId);

    // Überprüfen, ob Musik abgespielt wird
    if (!queue || !queue.current) {
      return interaction.reply({
        content: `${generalFeedbackInfo.emoji} Es wird aktuell keine Musik abgespielt.`,
        ephemeral: true,
      });
    }

    // Überspringe den aktuellen Song
    try {
      skipSong(guildId);

      // Starte den nächsten Song, falls die Warteschlange nicht leer ist
      if (queue.songs.length > 0) {
        await playSong(guildId);
        await interaction.reply({
          content: `${generalMusicSkip} Song übersprungen. Starte nächsten Song.`,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: `${generalMusicSkip} Song übersprungen. Keine weiteren Songs in der Warteschlange.`,
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error(
        `${generalFeedbackError.emoji} Fehler beim Überspringen des Songs: ${error.message}`
      );
      await interaction.reply({
        content: `${generalFeedbackError.emoji} Fehler beim Überspringen des Songs.`,
        ephemeral: true,
      });
    }
  },
};
