// Importiere die erforderlichen Module
import MessageEmbed from "discord.js";
// Importiere die erforderlichen Konfigurationsobjekte
import { exportsConfig } from "../config.js";
const {
  MusicEmoji,
  MusicControlsPlayPause,
  MusicControlsPause,
  MusicControlsSkip,
  MusicControlsStop,
} = exportsConfig;

/*
 * Erstellt und sendet die Steuerungsnachricht
 * @param {TextChannel} channel - Der Discord-Kanal, in dem die Nachricht gesendet wird
 * @param {Object} queue - Die aktuelle Musikwarteschlange
 * @returns {Promise<Message>} - Die gesendete Steuerungsnachricht
 */
export async function sendMusicControls(channel, queue) {
  const embed = new MessageEmbed()
    .setTitle(`${MusicEmoji} Musiksteuerung`)
    .setDescription(
      `${MusicControlsPlayPause} - Wiedergabe/Pause\n` +
        `${MusicControlsPause} - Pause\n` +
        `${MusicControlsSkip} - Überspringen\n` +
        `${MusicControlsStop} - Stoppen\n\n` +
        `**Aktueller Song:** ${
          queue.current ? queue.current.title : "Kein Song"
        }\n` +
        `**Warteschlange:** ${queue.songs.length} Songs`,
    )
    .setColor("BLUE");

  const controlMessage = await channel.send({ embeds: [embed] });

  // Emojis zur Nachricht hinzufügen
  for (const emoji of [
    MusicControlsPlayPause,
    MusicControlsPause,
    MusicControlsSkip,
    MusicControlsStop,
  ]) {
    await controlMessage.react(emoji);
  }

  return controlMessage;
}

/*
 * Aktualisiert die Steuerungsnachricht
 * @param {Message} message - Die Steuerungsnachricht, die aktualisiert werden soll
 * @param {Object} queue - Die aktuelle Musikwarteschlange
 */
export async function updateMusicControls(message, queue) {
  const embed = new MessageEmbed()
    .setTitle(`${MusicEmoji} Musiksteuerung`)
    .setDescription(
      `${MusicControlsPlayPause} - Wiedergabe/Pause\n` +
        `${MusicControlsPause} - Pause\n` +
        `${MusicControlsSkip} - Überspringen\n` +
        `${MusicControlsStop} - Stoppen\n\n` +
        `**Aktueller Song:** ${
          queue.current ? queue.current.title : "Kein Song"
        }\n` +
        `**Warteschlange:** ${queue.songs.length} Songs`,
    )
    .setColor("BLUE");

  await message.edit({ embeds: [embed] });
}
