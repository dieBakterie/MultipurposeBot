// src/commands/Copy/copy.js
// Importiere die erforderlichen Module
import { SlashCommandBuilder } from "discord.js";
import { generalFeedbackError, generalFeedbackSuccess } from "../../alias.js";

export default {
  data: new SlashCommandBuilder()
    .setName("copy")
    .setDescription("Kopiere Nachrichten zwischen Kanälen.")
    .addChannelOption((option) =>
      option
        .setName("target_channel")
        .setDescription("Die ID des Ziel-Kanals.")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("source_channel")
        .setDescription("Die ID des Ursprungs-Kanals.")
    )
    .addStringOption((option) =>
      option
        .setName("message_id")
        .setDescription("Die ID einer Nachricht, die kopiert werden soll.")
    )
    .addIntegerOption((option) =>
      option
        .setName("count")
        .setDescription(
          "Anzahl der letzten Nachrichten, die kopiert werden sollen (Standard: 5)."
        )
        .setMinValue(1)
        .setMaxValue(20)
    ),
  async execute(interaction) {
    const sourceChannel =
      interaction.options.getChannel("source_channel") || interaction.channel; // Standard: aktueller Kanal
    const targetChannel = interaction.options.getChannel("target_channel");
    const messageId = interaction.options.getString("message_id");
    const count = interaction.options.getInteger("count") || 5;

    try {
      // Überprüfe, ob der Zielkanal gültig ist
      if (!targetChannel) {
        return interaction.reply({
          content: `${generalFeedbackError.emoji} [Copy Command] Ungültige Ziel-Kanal-ID.`,
          ephemeral: true,
        });
      }

      let messagesToCopy = [];

      if (messageId) {
        // Nachricht basierend auf der ID abrufen
        const message = await sourceChannel.messages.fetch(messageId);
        if (!message) {
          return interaction.reply({
            content: `${generalFeedbackError.emoji} [Copy Command] Keine Nachricht mit der angegebenen ID nicht gefunden.`,
            ephemeral: true,
          });
        }
        messagesToCopy.push(message);
      } else {
        // Nachrichtenanzahl basierend auf `count` abrufen
        const messages = await sourceChannel.messages.fetch({ limit: count });
        messagesToCopy = [...messages.values()].reverse(); // Nachrichten in korrekter Reihenfolge
      }

      // Nachrichten in den Zielkanal posten
      for (const message of messagesToCopy) {
        const options = {};

        // Füge den Nachrichtentext hinzu
        if (message.content) {
          options.content = message.content;
        }

        // Füge Attachments hinzu
        if (message.attachments.size > 0) {
          options.files = message.attachments.map(
            (attachment) => attachment.url
          );
        }

        // Füge Embeds hinzu
        if (message.embeds.length > 0) {
          options.embeds = message.embeds.map((embed) => embed.toJSON());
        }

        // Reposte die Nachricht in den Zielkanal
        await targetChannel.send(options);
      }

      return interaction.reply({
        content: `${generalFeedbackSuccess.emoji} [Copy Command] Erfolgreich ${messagesToCopy.length} Nachricht(en) von <#${sourceChannel.id}> nach <#${targetChannel.id}> kopiert.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: `${generalFeedbackError.emoji} [Copy Command] Fehler beim Kopieren der Nachrichten.`,
        ephemeral: true,
      });
    }
  },
};
