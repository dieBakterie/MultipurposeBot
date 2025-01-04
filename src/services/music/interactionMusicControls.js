// src/services/Music/interactionMusicControls.js
import { spotifyPlayer, youtubePlayer } from "./platformPlayers.js";
import { updateMusicControls } from "./createMusicControls.js";

/**
 * Behandelt Button-Interaktionen für die Musiksteuerung.
 * @param {Interaction} interaction - Die Button-Interaktion.
 * @param {string} platform - Die Plattform (z.B. "spotify", "youtube").
 */
export async function handleMusicControl(interaction, guildId, platform) {
  const player = platform === "spotify" ? spotifyPlayer : youtubePlayer;
  const queue = player.queueManager.getQueue(guildId);

  if (!queue) {
    return interaction.reply({
      content: `Es gibt keine aktive Warteschlange für diese Guild (${platform}).`,
      ephemeral: true,
    });
  }

  try {
    const action = interaction.customId.replace(`${platform}-`, ""); // Extrahiert die Aktion

    switch (action) {
      case "play_pause":
        if (queue.current) {
          await player.pause(guildId);
          await interaction.reply({
            content: `${platform}: Wiedergabe pausiert!`,
            ephemeral: true,
          });
        } else {
          await player.play(guildId);
          await interaction.reply({
            content: `${platform}: Wiedergabe fortgesetzt!`,
            ephemeral: true,
          });
        }
        break;

      case "skip":
        await player.skip(guildId);
        await interaction.reply({
          content: `${platform}: Song übersprungen!`,
          ephemeral: true,
        });
        break;

      case "stop":
        await player.stop(guildId);
        await interaction.reply({
          content: `${platform}: Wiedergabe gestoppt und Warteschlange geleert!`,
          ephemeral: true,
        });
        break;

      default:
        await interaction.reply({
          content: `Unbekannte Aktion (${platform}).`,
          ephemeral: true,
        });
        break;
    }

    // Aktualisiere die Steuerungsnachricht
    if (interaction.message) {
      await updateMusicControls(interaction.message, guildId, { platform });
    }
  } catch (error) {
    console.error(`[${platform}] Fehler bei der Musiksteuerung:`, error);
    await interaction.reply({
      content: `Fehler bei der Ausführung der ${platform}-Aktion.`,
      ephemeral: true,
    });
  }
}
