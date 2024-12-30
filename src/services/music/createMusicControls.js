// src/services/Music/createMusicControls.js
import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";
import { getQueue } from "./queue.js";
import {
  generalMusicEmoji,
  generalMusicPlayPause,
  generalMusicSkip,
  generalMusicStop,
} from "../../alias.js";

/**
 * Erstellt und sendet das interaktive Musiksteuerungsmenü.
 * @param {TextChannel} channel - Der Kanal, in dem die Nachricht gesendet wird.
 * @param {string} guildId - Die ID der Guild, für die die Steuerung erstellt wird.
 * @returns {Promise<Message>} - Die gesendete Nachricht.
 */
export async function sendMusicControls(channel, guildId) {
  const queue = getQueue(guildId);

  const embed = createMusicEmbed(queue);
  const buttons = createMusicButtons();

  const message = await channel.send({
    embeds: [embed],
    components: [buttons],
  });

  return message;
}

/**
 * Aktualisiert die Steuerungsnachricht
 * @param {Message} message - Die Steuerungsnachricht, die aktualisiert werden soll
 * @param {string} guildId - Die ID der Guild
 */
export async function updateMusicControls(message, guildId) {
  const queue = getQueue(guildId);

  const embed = createMusicEmbed(queue);
  const buttons = createMusicButtons();

  await message.edit({ embeds: [embed], components: [buttons] });
}

/**
 * Erstellt das Musik-Embed basierend auf der Warteschlange.
 * @param {Object} queue - Die aktuelle Musikwarteschlange
 * @returns {MessageEmbed} - Das Musik-Embed
 */
function createMusicEmbed(queue) {
  return new MessageEmbed()
    .setTitle(`${generalMusicEmoji} Musiksteuerung`)
    .setDescription(
      `**Aktueller Song:** ${
        queue.current ? queue.current.title : "Kein Song"
      }\n**Warteschlange:** ${queue.songs.length} Songs`
    )
    .setColor("BLUE");
}

/**
 * Erstellt die interaktiven Musiksteuerungs-Buttons.
 * @returns {MessageActionRow} - Die Buttons für die Musiksteuerung
 */
function createMusicButtons() {
  return new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId("play_pause")
      .setLabel("Play/Pause")
      .setEmoji(generalMusicPlayPause)
      .setStyle("SUCCESS"),
    new MessageButton()
      .setCustomId("skip")
      .setLabel("Skip")
      .setEmoji(generalMusicSkip)
      .setStyle("PRIMARY"),
    new MessageButton()
      .setCustomId("stop")
      .setLabel("Stop")
      .setEmoji(generalMusicStop)
      .setStyle("DANGER")
  );
}
