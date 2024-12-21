// src/commands/Clean/clean.js
// Importiere die erforderlichen Module
import { SlashCommandBuilder } from "discord.js";
import { generalFeedbackError, generalFeedbackSuccess } from "../../alias.js";

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
      console.log(`[Clean Command] Fehlerhafte Anzahl: ${num}`);
      return interaction.reply({
        content: `${generalFeedbackError.emoji} Die Anzahl muss zwischen 1 und 100 liegen.`,
        ephemeral: true,
      });
    }

    let regex = null;
    if (regexPattern) {
      try {
        regex = new RegExp(regexPattern);
      } catch (error) {
        console.log(`[Clean Command] Ungültiges Regex-Muster: ${regexPattern}`);
        return interaction.reply({
          content: `${generalFeedbackError.emoji} Ungültiges Regex-Muster.`,
          ephemeral: true,
        });
      }
    }

    try {
      const channel = interaction.channel;

      // Nachrichten abrufen (maximal 100)
      const fetchedMessages = await channel.messages.fetch({ limit: 100 });

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
      console.log(
        `[Clean Command] ${generalFeedbackSuccess.emoji} Erfolgreich ${deleted.size} Nachrichten gelöscht (Kanal: ${channel.id}).`
      );
      return interaction.reply({
        content: `${generalFeedbackSuccess.emoji} Erfolgreich ${deleted.size} Nachrichten gelöscht.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(
        `[Clean Command] ${generalFeedbackError.emoji} Fehler beim Löschen der Nachrichten:`,
        error
      );
      return interaction.reply({
        content: `${generalFeedbackError.emoji} Ein Fehler ist aufgetreten. Stellen Sie sicher, dass ich die Berechtigungen habe, Nachrichten zu löschen.`,
        ephemeral: true,
      });
    }
  },
};
