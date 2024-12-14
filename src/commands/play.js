import { SlashCommandBuilder } from "discord.js";
import { addSong, getQueue } from "../music/queue.js";
// import { playSong } from "../music/player.js";
import { sendMusicControls } from "../music/controls.js";
// Importiere die erforderlichen Konfigurationen aus der Konfigurationsdatei
import { exportsConfig } from "../config.js";
const { GeneralMusicEmoji, GeneralMusicUserFeedbackErrorEmoji } = exportsConfig;

export default {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Spielt einen Song ab.")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Song oder URL.")
        .setRequired(true),
    ),
  async execute(interaction) {
    const query = interaction.options.getString("query");
    const guildId = interaction.guild.id;
    const channel = interaction.channel;

    if (!channel) {
      await interaction.reply(
        `${GeneralMusicUserFeedbackErrorEmoji} Fehler: Kanal nicht gefunden.`,
      );
      return;
    }

    // Füge Song zur Warteschlange hinzu
    const song = { title: query, url: query };
    addSong(guildId, song);

    // Hole die aktuelle Warteschlange
    const guildQueue = getQueue(guildId);

    // Wenn die Warteschlange leer war, starte die Wiedergabe und sende die Steuerung
    if (guildQueue.songs.length === 1) {
      // Steuerungsnachricht senden
      await sendMusicControls(channel);

      // Starte die Wiedergabe
      await playSong(guildId);
    }

    // Rückmeldung an den Benutzer
    await interaction.reply(
      `${GeneralMusicEmoji} **${query}** wurde zur Warteschlange hinzugefügt!`,
    );
  },
};
