// src/commands/Music/pause.js
// Importiere die erforderlichen Module
import { SlashCommandBuilder } from "discord.js";
import { shoukaku } from "../../index.js";
import {
  generalMusicPause,
  generalFeedbackInfo,
  generalFeedbackError,
} from "../../alias.js";

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
        content: `${generalFeedbackInfo.emoji} [Play Command] Es wird aktuell keine Musik abgespielt.`,
        ephemeral: true,
      });
    }

    // Überprüfe, ob der Player aktiv ist
    if (!player.track) {
      return interaction.reply({
        content: `${generalFeedbackInfo.emoji} [Play Command] Es wird aktuell keine Musik abgespielt.`,
        ephemeral: true,
      });
    }

    try {
      // Pausiere den Player
      player.setPaused(true);

      // Antwort an den Nutzer
      await interaction.reply({
        content: `${generalMusicPause.emoji} Wiedergabe wurde pausiert.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(
        `${generalFeedbackError.emoji} Fehler beim Pausieren der Wiedergabe: ${error.message}`
      );
      await interaction.reply({
        content: `${generalFeedbackError.emoji} Fehler beim Pausieren der Wiedergabe.`,
        ephemeral: true,
      });
    }
  },
};
