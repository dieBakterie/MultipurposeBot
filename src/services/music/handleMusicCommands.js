// src/services/Music/handleMusicCommands.js
import { MusicPlayer } from "./musicPlayer.js";
import { getQueue } from "./queue.js";

const queueManager = { getQueue }; // Wrapper für die Queue-Funktionen

const musicPlayers = {
  spotify: new MusicPlayer(queueManager, "Spotify"),
  youtube: new MusicPlayer(queueManager, "YouTube"),
};

/**
 * Behandelt generische Musik-Commands.
 * @param {Interaction} interaction - Die Interaktion vom Benutzer.
 * @param {string} platform - Die Plattform (z.B. "spotify" oder "youtube").
 */
export async function handleMusicCommand(interaction, platform) {
  const guildId = interaction.guild.id;
  const player = musicPlayers[platform];

  if (!player) {
    return interaction.reply({
      content: "Ungültige Plattform.",
      ephemeral: true,
    });
  }

  try {
    switch (interaction.commandName) {
      case "play":
        await player.play(guildId);
        await interaction.reply(`${platform}: Wiedergabe gestartet.`);
        break;
      case "pause":
        await player.pause(guildId);
        await interaction.reply(`${platform}: Wiedergabe pausiert.`);
        break;
      case "skip":
        await player.skip(guildId);
        await interaction.reply(`${platform}: Song übersprungen.`);
        break;
      case "stop":
        await player.stop(guildId);
        await interaction.reply(`${platform}: Wiedergabe gestoppt.`);
        break;
      default:
        await interaction.reply("Unbekannter Command.");
        break;
    }
  } catch (error) {
    console.error(`Fehler bei ${platform}-Command: ${error.message}`);
    await interaction.reply("Fehler bei der Ausführung des Commands.");
  }
}
