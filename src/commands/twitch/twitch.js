// src/commands/Twitch/twitch.js
import pkg from "discord.js";
const { SlashCommandBuilder, EmbedBuilder, ChannelType } = pkg;
import {
  addTwitchChannel,
  removeTwitchChannel,
  getTrackedStreamers,
  setDiscordChannelForStreamer,
} from "../../database/twitchDatabase.js";
import {
  twitchFeedbackError,
  twitchFeedbackSuccess,
  twitchFeedbackInfo,
  twitchFeedbackList,
} from "../../alias.js";

export default {
  data: new SlashCommandBuilder()
    .setName("twitch")
    .setDescription("Verwalte Twitch-Streamer.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Füge einen Twitch-Streamer hinzu.")
        .addStringOption((option) =>
          option
            .setName("user_name")
            .setDescription("Der Twitch-Username des Streamers.")
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addChannelOption((option) =>
          option
            .setName("channel_name")
            .setDescription(
              `${twitchFeedbackInfo.emoji} Der Discord-Kanal für Live-Benachrichtigungen.`
            )
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Entferne einen Twitch-Streamer.")
        .addStringOption((option) =>
          option
            .setName("user_name")
            .setDescription("Der Twitch-Username des Streamers.")
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set-channel")
        .setDescription("Ändere den Discord-Kanal eines Streamers.")
        .addStringOption((option) =>
          option
            .setName("user_name")
            .setDescription("Der Twitch-Username des Streamers.")
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addChannelOption((option) =>
          option
            .setName("channel_id")
            .setDescription("Der neue Discord-Kanal.")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("Liste aller Twitch-Streamer.")
        .addStringOption((option) =>
          option
            .setName("filter")
            .setDescription("Filtere die Liste nach einem Suchbegriff.")
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "add": {
        const streamerName = interaction.options.getString("user_name");
        const channel =
          interaction.options.getChannel("channel_name") || interaction.channel;

        // Überprüfung: Ist der Kanal gültig?
        if (!channel || channel.type !== ChannelType.GuildText) {
          return interaction.reply({
            content: `${twitchFeedbackError.emoji} Der Kanal **${
              channel?.toString() || "unbekannt"
            }** ist ungültig oder kein Textkanal.`,
            ephemeral: true,
          });
        }

        if (!streamerName.trim()) {
          return interaction.reply({
            content: `${twitchFeedbackError.emoji} Der Streamername darf nicht leer sein.`,
            ephemeral: true,
          });
        }

        try {
          console.log(
            `Füge Streamer hinzu: ${streamerName}, Kanal: ${channel.id}`
          );

          // Validierung und Abruf der Streamer-Details
          const streamerDetails = await validateAndFetchStreamerDetails(
            streamerName
          );

          if (!streamerDetails) {
            return interaction.reply({
              content: `${twitchFeedbackInfo.emoji} Der Streamer **${streamerName}** wurde nicht gefunden.`,
              ephemeral: true,
            });
          }

          // Überprüfen, ob der Streamer bereits hinzugefügt wurde
          const existingStreamers = await getTrackedStreamers();
          if (
            existingStreamers.data.some(
              (streamer) =>
                streamer.userId === streamerDetails.id ||
                streamer.userName === streamerDetails.login
            )
          ) {
            return interaction.reply({
              content: `${twitchFeedbackInfo.emoji} Der Streamer **${streamerName}** ist bereits hinzugefügt.`,
              ephemeral: true,
            });
          }

          // Hinzufügen des Streamers
          const result = await addTwitchChannel(
            streamerDetails.id,
            streamerDetails.login,
            streamerDetails.display_name,
            channel.id
          );

          return interaction.reply({
            content: `${result.success ? twitchFeedbackSuccess.emoji : twitchFeedbackError.emoji} ${
              result.message
            } Benachrichtigungen werden an ${channel.toString()} gesendet.`,
            ephemeral: true,
          });
        } catch (error) {
          console.error(
            `${twitchFeedbackError.emoji} Fehler beim Hinzufügen des Streamers:`,
            error.stack || error
          );
          return interaction.reply({
            content: `${twitchFeedbackError.emoji} Fehler beim Hinzufügen des Streamers.`,
            ephemeral: true,
          });
        }
      }

      case "set-channel": {
        const streamerName = interaction.options.getString("user_name");
        const channel = interaction.options.getChannel("channel_id");

        // Überprüfung: Ist der Kanal gültig?
        if (!channel || channel.type !== ChannelType.GuildText) {
          return interaction.reply({
            content: `${twitchFeedbackError.emoji} Der Kanal **${
              channel?.toString() || "unbekannt"
            }** ist ungültig oder kein Textkanal.`,
            ephemeral: true,
          });
        }

        if (!streamerName.trim()) {
          return interaction.reply({
            content: `${twitchFeedbackError.emoji} Der Streamername darf nicht leer sein.`,
            ephemeral: true,
          });
        }

        try {
          console.log(
            `Setze neuen Kanal für Streamer: ${streamerName}, Kanal: ${channel.id}`
          );

          const result = await setDiscordChannelForStreamer(
            streamerName,
            channel.id,
            channel.name
          );

          if (!result.success) {
            return interaction.reply({
              content: `${twitchFeedbackInfo.emoji} Der Streamer **${streamerName}** wurde nicht gefunden.`,
              ephemeral: true,
            });
          }

          return interaction.reply({
            content: `${
              twitchFeedbackSuccess.emoji
            } Der Discord-Kanal für **${streamerName}** wurde erfolgreich auf **${channel.toString()}** gesetzt.`,
            ephemeral: true,
          });
        } catch (error) {
          console.error(
            `${twitchFeedbackError.emoji} Fehler beim Ändern des Kanals:`,
            error.stack || error
          );
          return interaction.reply({
            content: `${twitchFeedbackError.emoji} Fehler beim Ändern des Kanals.`,
            ephemeral: true,
          });
        }
      }

      case "remove": {
        const streamerName = interaction.options.getString("user_name");

        if (!streamerName.trim()) {
          return interaction.reply({
            content: `${twitchFeedbackError.emoji} Der Streamername darf nicht leer sein.`,
            ephemeral: true,
          });
        }

        try {
          console.log(`Entferne Streamer: ${streamerName}`);

          const result = await removeTwitchChannel(streamerName);

          if (!result.success) {
            return interaction.reply({
              content: `${twitchFeedbackInfo.emoji} Der Streamer **${streamerName}** wurde nicht gefunden.`,
              ephemeral: true,
            });
          }

          return interaction.reply({
            content: `${twitchFeedbackSuccess.emoji} Der Streamer **${streamerName}** wurde erfolgreich entfernt.`,
            ephemeral: true,
          });
        } catch (error) {
          console.error(
            `${twitchFeedbackError.emoji} Fehler beim Entfernen des Streamers:`,
            error.stack || error
          );
          return interaction.reply({
            content: `${twitchFeedbackError.emoji} Fehler beim Entfernen des Streamers.`,
            ephemeral: true,
          });
        }
      }

      case "list": {
        try {
          const filter = interaction.options.getString("filter") || "";
          const streamers = await getCachedTrackedStreamers(filter);

          const count = streamers.length;

          if (count === 0) {
            return interaction.reply({
              content: `${twitchFeedbackInfo.emoji} Es sind keine Twitch-Streamer gespeichert.`,
              ephemeral: true,
            });
          }

          const itemsPerPage = 10;
          const totalPages = Math.ceil(count / itemsPerPage);

          const generateEmbed = (page) => {
            const start = page * itemsPerPage;
            const end = start + itemsPerPage;
            const pageItems = streamers.slice(start, end);

            const embed = new EmbedBuilder()
              .setTitle(`${twitchFeedbackList.emoji} Liste der Twitch-Streamer`)
              .setDescription(
                pageItems
                  .map(
                    (streamer, index) =>
                      `**${start + index + 1}.** ${
                        streamer.displayName
                      } (Kanal: ${
                        streamer.discordChannelId
                          ? `<#${streamer.discordChannelId}>`
                          : "Kein Kanal"
                      })`
                  )
                  .join("\n")
              )
              .setFooter({ text: `Seite ${page + 1} von ${totalPages}` });

            return embed;
          };

          await handleTwitchControl(
            interaction,
            count,
            itemsPerPage,
            totalPages,
            generateEmbed
          );
        } catch (error) {
          console.error(
            `${twitchFeedbackError.emoji} Fehler beim Abrufen der Streamerliste:`,
            error.stack || error
          );
          return interaction.reply({
            content: `${twitchFeedbackError.emoji} Fehler beim Abrufen der Streamerliste.`,
            ephemeral: true,
          });
        }
      }

      default:
        return interaction.reply({
          content: `${twitchFeedbackError.emoji} Unbekannter Befehl.`,
          ephemeral: true,
        });
    }
  },
};
