// src/services/Music/interactionMusicControls.js
import { getQueue } from "./queue.js";
import { playSong, pauseSong, skipSong, stopPlayback } from "./player.js";
import { updateMusicControls } from "./createMusicControls.js";

/**
 * Behandelt Button-Interaktionen für die Musiksteuerung.
 * @param {Interaction} interaction - Die Button-Interaktion.
 */
export async function handleMusicControl(interaction) {
  if (!interaction.isButton()) return;

  const guildId = interaction.guild.id;
  const queue = getQueue(guildId);

  if (!queue) {
    return interaction.reply({
      content: "Es gibt keine aktive Warteschlange für diese Guild.",
      ephemeral: true,
    });
  }

  try {
    switch (interaction.customId) {
      case "play_pause":
        if (queue.current) {
          await pauseSong(guildId);
          await interaction.reply({
            content: "Wiedergabe pausiert!",
            ephemeral: true,
          });
        } else {
          await playSong(guildId);
          await interaction.reply({
            content: "Wiedergabe fortgesetzt!",
            ephemeral: true,
          });
        }
        break;

      case "skip":
        await skipSong(guildId);
        await interaction.reply({
          content: "Song übersprungen!",
          ephemeral: true,
        });
        break;

      case "stop":
        await stopPlayback(guildId);
        await interaction.reply({
          content: "Wiedergabe gestoppt und Warteschlange geleert!",
          ephemeral: true,
        });
        break;

      default:
        await interaction.reply({
          content: "Unbekannte Aktion.",
          ephemeral: true,
        });
        break;
    }

    // Aktualisiere die Steuerungsnachricht
    if (interaction.message) {
      await updateMusicControls(interaction.message, queue);
    }
  } catch (error) {
    console.error("Fehler bei der Musiksteuerung:", error);
    await interaction.reply({
      content: "Fehler bei der Ausführung der Aktion.",
      ephemeral: true,
    });
  }
}
