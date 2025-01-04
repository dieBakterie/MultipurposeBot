// src/services/Music/createMusicControls.js
import pkg from "discord.js";
const { Message, MessageActionRow, MessageButton, MessageEmbed } = pkg;
import { getQueue } from "src/services/Music/queue.js";

/**
 * Erstellt und sendet das interaktive Musiksteuerungsmenü.
 * @param {TextChannel} channel - Der Kanal, in dem die Nachricht gesendet wird.
 * @param {string} guildId - Die ID der Guild, für die die Steuerung erstellt wird.
 * @param {Object} options - Die Optionen für die Steuerung (z.B. Plattform-spezifische IDs und Emojis).
 * @returns {Promise<Message>} - Die gesendete Nachricht.
 */
export async function sendMusicControls(channel, guildId, options) {
  const queue = getQueue(guildId);

  const embed = createMusicEmbed(queue, options.platform);
  const buttons = createMusicButtons(options);

  const message = await channel.send({
    embeds: [embed],
    components: [buttons],
  });

  return message;
}

/**
 * Aktualisiert die Steuerungsnachricht.
 * @param {Message} message - Die Steuerungsnachricht, die aktualisiert werden soll.
 * @param {string} guildId - Die ID der Guild.
 * @param {Object} options - Die Optionen für die Steuerung (z.B. Plattform-spezifische IDs und Emojis).
 */
export async function updateMusicControls(message, guildId, options) {
  const queue = getQueue(guildId);

  const embed = createMusicEmbed(queue, options.platform);
  const buttons = createMusicButtons(options);

  await message.edit({ embeds: [embed], components: [buttons] });
}

/**
 * Erstellt das Musik-Embed basierend auf der Warteschlange.
 * @param {Object} queue - Die aktuelle Musikwarteschlange.
 * @param {string} platform - Der Name der Plattform (z.B. "Spotify", "YouTube").
 * @returns {MessageEmbed} - Das Musik-Embed.
 */
function createMusicEmbed(queue, platform) {
  return new MessageEmbed()
    .setTitle(`${platform} Musiksteuerung`)
    .setDescription(
      `**Aktueller Song:** ${
        queue.current ? queue.current.title : "Kein Song"
      }\n**Warteschlange:** ${queue.songs.length} Songs`
    )
    .setColor(platform === "Spotify" ? "0x1ed760" : "0xb2071d");
}

/**
 * Erstellt die interaktiven Musiksteuerungs-Buttons.
 * @param {Object} options - Die Optionen für die Buttons (z.B. IDs, Labels, Emojis).
 * @returns {MessageActionRow} - Die Buttons für die Musiksteuerung.
 */
function createMusicButtons({ playPauseId, skipId, stopId, emojis }) {
  return new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId(playPauseId)
      .setLabel("Play/Pause")
      .setEmoji(emojis.playPause)
      .setStyle("SUCCESS"),
    new MessageButton()
      .setCustomId(skipId)
      .setLabel("Skip")
      .setEmoji(emojis.skip)
      .setStyle("PRIMARY"),
    new MessageButton()
      .setCustomId(stopId)
      .setLabel("Stop")
      .setEmoji(emojis.stop)
      .setStyle("DANGER")
  );
}
