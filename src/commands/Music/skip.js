// Importiere alle erforderlichen Module
import { SlashCommandBuilder } from "discord.js";
import { getQueue, skipSong } from "../../music/queue.js";
// import { playSong } from "../music/player.js";
// Importiere alle erforderlichen Konfigurationsobjekte
import { exportsConfig } from "../../config.js";
const { GeneralMusicUserFeedbackInfoEmoji,
  GeneralMusicControlsSkipEmoji,
  GeneralMusicUserFeedbackErrorEmoji,
} = exportsConfig;

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
        content: `${GeneralMusicUserFeedbackInfoEmoji} Es wird aktuell keine Musik abgespielt.`,
        ephemeral: true,
      });
    }

    // Überspringe den aktuellen Song
    try {
      skipSong(guildId);

      // Starte den nächsten Song, falls die Warteschlange nicht leer ist
      if (queue.songs.length > 0) {
        await playSong(guildId);
        await interaction.reply(
          `${GeneralMusicControlsSkipEmoji} Song übersprungen. Starte nächsten Song.`,
        );
      } else {
        await interaction.reply(
          `${GeneralMusicControlsSkipEmoji} Song übersprungen. Keine weiteren Songs in der Warteschlange.`,
        );
      }
    } catch (error) {
      console.error(
        `${GeneralMusicUserFeedbackErrorEmoji} Fehler beim Überspringen des Songs: ${error.message}`,
      );
      await interaction.reply({
        content: `${GeneralMusicUserFeedbackErrorEmoji} Fehler beim Überspringen des Songs.`,
        ephemeral: true,
      });
    }
  },
};
