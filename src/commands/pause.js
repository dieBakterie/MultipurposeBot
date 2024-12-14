// Importiere die erforderlichen Module
import { SlashCommandBuilder } from "discord.js";
import { getQueue } from "../music/queue.js";
// Importiere die erforderlichen Konfigurationen aus der Konfigurationsdatei
import { exportsConfig } from "../config.js";
const {
  GeneralMusicControlsPauseEmoji,
  GeneralMusicUserFeedbackErrorEmoji,
  GeneralMusicUserFeedbackInfoEmoji,
} = exportsConfig;

export default {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pausiert die Wiedergabe."),
  async execute(interaction) {
    const guildId = interaction.guild.id;

    // Hole die Warteschlange für die aktuelle Guild
    const queue = getQueue(guildId);

    // Überprüfe, ob Musik abgespielt wird
    if (!queue || !queue.current) {
      return interaction.reply({
        content: `${GeneralMusicUserFeedbackInfoEmoji} Es wird aktuell keine Musik abgespielt.`,
        ephemeral: true,
      });
    }

    // Überprüfe, ob eine Verbindung existiert
    if (!queue.connection || !queue.connection.player) {
      return interaction.reply({
        content: `${GeneralMusicUserFeedbackInfoEmoji} Keine aktive Verbindung zum Voice-Channel.`,
        ephemeral: true,
      });
    }

    // Pausiere die Wiedergabe
    try {
      queue.connection.player.pause();
      await interaction.reply(
        `${GeneralMusicControlsPauseEmoji} Wiedergabe wurde pausiert.`,
      );
    } catch (error) {
      console.error(
        `${GeneralMusicUserFeedbackErrorEmoji} Fehler beim Pausieren der Wiedergabe: ${error.message}`,
      );
      await interaction.reply({
        content: `${GeneralMusicUserFeedbackErrorEmoji} Fehler beim Pausieren der Wiedergabe.`,
        ephemeral: true,
      });
    }
  },
};
