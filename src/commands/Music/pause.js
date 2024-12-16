// Importiere die erforderlichen Module
import { SlashCommandBuilder } from "discord.js";
import { shoukaku } from "../../music/player.js";
import { exportsConfig } from "../../config.js";
// Importiere die erforderlichen Konfigurationen aus der Konfigurationsdatei
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

    // Hole die Shoukaku-Player-Instanz
    const player = shoukaku.getPlayer(guildId);

    // Überprüfe, ob ein Player existiert
    if (!player) {
      return interaction.reply({
        content: `${GeneralMusicUserFeedbackInfoEmoji} Es wird aktuell keine Musik abgespielt.`,
        ephemeral: true,
      });
    }

    // Überprüfe, ob der Player aktiv ist
    if (!player.track) {
      return interaction.reply({
        content: `${GeneralMusicUserFeedbackInfoEmoji} Es wird aktuell keine Musik abgespielt.`,
        ephemeral: true,
      });
    }

    try {
      // Pausiere den Player
      player.setPaused(true);

      // Antwort an den Nutzer
      await interaction.reply(
        `${GeneralMusicControlsPauseEmoji} Wiedergabe wurde pausiert.`
      );
    } catch (error) {
      console.error(
        `${GeneralMusicUserFeedbackErrorEmoji} Fehler beim Pausieren der Wiedergabe: ${error.message}`
      );
      await interaction.reply({
        content: `${GeneralMusicUserFeedbackErrorEmoji} Fehler beim Pausieren der Wiedergabe.`,
        ephemeral: true,
      });
    }
  },
};
