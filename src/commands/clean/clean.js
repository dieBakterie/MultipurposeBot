// Importiere die benötigten Module
import { SlashCommandBuilder } from "discord.js";
// import { logMessage } from "../../utils/logging.js";
import { exportsConfig } from "../../config.js";
const { DiscordUserFeedbackErrorEmoji, DiscordUserFeedbackSuccessEmoji } =
  exportsConfig;

// Export the command
export default {
  data: new SlashCommandBuilder()
    .setName("clean")
    .setDescription(
      "Löscht eine bestimmte Anzahl von Nachrichten mit erweiterten Filtern."
    )
    .addIntegerOption((option) =>
      option
        .setName("anzahl")
        .setDescription("Anzahl der zu löschenden Nachrichten (1-100)")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("benutzer")
        .setDescription("Löscht nur Nachrichten eines bestimmten Benutzers.")
    )
    .addStringOption((option) =>
      option
        .setName("regex")
        .setDescription(
          "Löscht Nachrichten, die einem Regex-Muster entsprechen."
        )
    )
    .addBooleanOption((option) =>
      option
        .setName("pin")
        .setDescription("Sollen auch angepinnte Nachrichten gelöscht werden?")
    ),

  async execute(interaction) {
    const num = interaction.options.getInteger("anzahl");
    const user = interaction.options.getUser("benutzer");
    const regexPattern = interaction.options.getString("regex");
    const includePinned = interaction.options.getBoolean("pin") || false;

    // Validierung der Anzahl
    if (num < 1 || num > 100) {
      /*      logMessage(${DiscordUserFeedbackErrorEmoji} Fehlerhafte Anzahl: ${num}); */
      return interaction.reply({
        content: `${DiscordUserFeedbackErrorEmoji} Die Anzahl muss zwischen 1 und 100 liegen.`,
        ephemeral: true,
      });
    }

    let regex = null;
    if (regexPattern) {
      try {
        regex = new RegExp(regexPattern);
      } catch (err) {
        /*                 logMessage(
                    ${DiscordUserFeedbackErrorEmoji} Ungültiges Regex-Muster: ${regexPattern},
                ); */
        return interaction.reply({
          content: `${DiscordUserFeedbackErrorEmoji} Ungültiges Regex-Muster.`,
          ephemeral: true,
        });
      }
    }

    try {
      const channel = interaction.channel;

      // Nachrichten abrufen (maximal 100)
      const fetchedMessages = await channel.messages.fetch({
        limit: 100,
      });

      // Nachrichten filtern
      let messagesToDelete = fetchedMessages.filter((msg) => {
        if (user && msg.author.id !== user.id) return false;
        if (!includePinned && msg.pinned) return false;
        if (regex && !regex.test(msg.content)) return false;
        return true;
      });

      // Auf die gewünschte Anzahl begrenzen
      messagesToDelete = [...messagesToDelete.values()].slice(0, num);

      // Nachrichten löschen
      const deleted = await channel.bulkDelete(messagesToDelete, true);

      // Erfolgsmeldung
      /*       logMessage(
        ${DiscordUserFeedbackSuccessEmoji} Erfolgreich ${deleted.size} Nachrichten gelöscht (Kanal: ${channel.id}).
      ); */
      await interaction.reply({
        content: `${DiscordUserFeedbackSuccessEmoji} Erfolgreich ${deleted.size} Nachrichten gelöscht.`,
        ephemeral: true,
      });
    } catch (error) {
      /*       logMessage(
        ${DiscordUserFeedbackErrorEmoji} Fehler beim Löschen: ${error.message}
      ); */
      console.error(
        `${DiscordUserFeedbackErrorEmoji} Fehler beim Löschen der Nachrichten:`,
        error
      );
      await interaction.reply({
        content: `${DiscordUserFeedbackErrorEmoji} Ein Fehler ist aufgetreten. Stellen Sie sicher, dass ich die Berechtigungen habe, Nachrichten zu löschen.`,
        ephemeral: true,
      });
    }
  },
};
