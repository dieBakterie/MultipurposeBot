// src/commands/Music/play.ts
sic/play.js
// Importiere die erforderlichen Module
import { SlashCommandBuilder } from "discord.js";
import { addSong, getQueue } from "../../services/music/queue.js";
import { playSong } from "../../services/music/player.js";
import { sendMusicControls } from "../../services/music/createMusicControls.js";

export default {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Spielt einen Song ab.")
    .addStringOption((option) =>
      option.setName("query").setDescription("Song oder URL.").setRequired(true)
    ),
  async execute(interaction) {
    const query = interaction.options.getString("query");
    const guildId = interaction.guild.id;
    const channel = interaction.channel;

    if (!channel) {
      await interaction.reply("Fehler: Kanal nicht gefunden.");
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
      await sendMusicControls(channel, guildId);

      // Starte die Wiedergabe
      await playSong(guildId);
    }

    // Rückmeldung an den Benutzer
    await interaction.reply(
      `**${query}** wurde zur Warteschlange hinzugefügt!`
    );
  },
};
