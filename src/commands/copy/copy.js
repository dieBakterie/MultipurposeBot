// Importieren der erforderlichen Module
import { SlashCommandBuilder } from "discord.js";
import { exportsConfig } from "../../config.js";
const {
  DiscordUserFeedbackErrorEmoji,
  DiscordUserFeedbackSuccessEmoji,
  DiscordUserFeedbackListEmoji,
  DiscordUserFeedbackInfoEmoji,
} = exportsConfig;

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
          content: `${DiscordUserFeedbackErrorEmoji} Ungültige Ziel-Kanal-ID.`,
          ephemeral: true,
        });
      }

      let messagesToCopy = [];

      if (messageId) {
        // Nachricht basierend auf der ID abrufen
        const message = await sourceChannel.messages.fetch(messageId);
        if (!message) {
          return interaction.reply({
            content: `${DiscordUserFeedbackErrorEmoji} Nachricht mit der angegebenen ID nicht gefunden.`,
            ephemeral: true,
          });
        }
        messagesToCopy.push(message);
      } else {
        // Nachrichtenanzahl basierend auf `count` abrufen
        const messages = await sourceChannel.messages.fetch({ limit: count });
        messagesToCopy = [...messages.values()].reverse(); // In korrekter Reihenfolge
      }

      // Nachrichten in den Zielkanal posten
      for (const message of messagesToCopy) {
        const content = message.content || "**(Keine Textnachricht)**";
        const attachments = message.attachments.map((a) => a.url);

        let postContent = `${content}`;
        if (attachments.length > 0) {
          postContent += `\n${attachments.join("\n")}`;
        }

        await targetChannel.send({ content: postContent });
      }

      return interaction.reply({
        content: `${DiscordUserFeedbackSuccessEmoji} Erfolgreich ${messagesToCopy.length} Nachricht(en) von <#${sourceChannel.id}> nach <#${targetChannel.id}> kopiert.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: `${DiscordUserFeedbackErrorEmoji} Fehler beim Kopieren der Nachrichten.`,
        ephemeral: true,
      });
    }
  },
};
