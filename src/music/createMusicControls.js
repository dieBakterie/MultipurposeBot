import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";
import { getQueue } from "./queue.js";
import { exportsConfig } from "../config.js";

const { MusicEmoji } = exportsConfig;

/**
 * Erstellt und sendet das interaktive Musiksteuerungsmenü.
 * @param {TextChannel} channel - Der Kanal, in dem die Nachricht gesendet wird.
 * @param {string} guildId - Die ID der Guild, für die die Steuerung erstellt wird.
 * @returns {Promise<Message>} - Die gesendete Nachricht.
 */
export async function sendMusicControls(channel, guildId) {
  const queue = getQueue(guildId);

  const embed = new MessageEmbed()
    .setTitle(`${MusicEmoji} Musiksteuerung`)
    .setDescription(
      `**Aktueller Song:** ${
        queue.current ? queue.current.title : "Kein Song"
      }\n` + `**Warteschlange:** ${queue.songs.length} Songs`
    )
    .setColor("BLUE");

  const buttons = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId("play_pause")
      .setLabel("Play/Pause")
      .setStyle("SUCCESS"),
    new MessageButton()
      .setCustomId("skip")
      .setLabel("Skip")
      .setStyle("PRIMARY"),
    new MessageButton().setCustomId("stop").setLabel("Stop").setStyle("DANGER")
  );

  const message = await channel.send({
    embeds: [embed],
    components: [buttons],
  });

  return message;
}
