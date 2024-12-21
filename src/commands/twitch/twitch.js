// src/commands/Twitch/twitch.js
import { SlashCommandBuilder, ChannelType } from "discord.js";
import {
  addTwitchChannel,
  removeTwitchChannel,
  getTrackedTwitchChannels,
  setDiscordChannelForStreamer,
} from "../../database/twitchDatabase.js";
import { searchStreamer } from "../../services/Twitch/twitch.js";
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
              `${twitchFeedbackInfo.emoji} Der Discord-Kanal für Live-Benachrichtigungen. Falls nicht angegeben, wird der aktuelle Kanal verwendet.`
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
      subcommand.setName("list").setDescription("Liste aller Twitch-Streamer.")
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "add": {
        const streamerName = interaction.options.getString("user_name");
        const channel =
          interaction.options.getChannel("channel_name") || interaction.channel;

        // Überprüfung: Ist der Kanal gültig?
        if (!channel || !channel.isTextBased()) {
          return interaction.reply({
            content: `${twitchFeedbackError.emoji} Der Kanal **${
              channel?.toString() || "unbekannt"
            }** ist ungültig.`,
            ephemeral: true,
          });
        }

        try {
          // Twitch-Streamer-Details abrufen
          const streamerDetails = await searchStreamer(streamerName);

          if (!streamerDetails) {
            return interaction.reply({
              content: `${twitchFeedbackInfo.emoji} Der Streamer **${streamerName}** wurde nicht gefunden.`,
              ephemeral: true,
            });
          }

          // Streamer und Kanal-ID in der Datenbank speichern
          const result = await addTwitchChannel(
            streamerDetails.display_name,
            channel.id
          );

          // Erfolgsmeldung
          if (result.success) {
            return interaction.reply({
              content: `${twitchFeedbackSuccess.emoji} ${
                result.message
              } Benachrichtigungen werden an ${channel.toString()} gesendet.`,
              ephemeral: true,
            });
          } else {
            return interaction.reply({
              content: `${twitchFeedbackError.emoji} Fehler beim Hinzufügen des Streamers "${streamerName}".`,
              ephemeral: true,
            });
          }
        } catch (error) {
          console.error(
            "Fehler beim Hinzufügen des Streamers:",
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

        if (!channel) {
          return interaction.reply({
            content: `${
              twitchFeedbackError.emoji
            } Der Kanal **${channel?.ToString()}** ist ungültig.`,
            ephemeral: true,
          });
        }

        try {
          const result = await setDiscordChannelForStreamer(
            streamerName,
            channel
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
            } Der Discord-Kanal für **${streamerName}** wurde erfolgreich auf **${channel.ToString()}** (${channel}) geändert.`,
            ephemeral: false,
          });
        } catch (error) {
          console.error("Fehler beim Ändern des Kanals:", error.stack || error);
          return interaction.reply({
            content: `${twitchFeedbackError.emoji} Fehler beim Ändern des Kanals.`,
            ephemeral: true,
          });
        }
      }

      case "remove": {
        const streamerName = interaction.options.getString("user_name");

        try {
          const removed = await removeTwitchChannel(streamerName);

          if (!removed) {
            return interaction.reply({
              content: `${twitchFeedbackInfo.emoji} Der Streamer **${streamerName}** wurde nicht gefunden.`,
              ephemeral: true,
            });
          }

          return interaction.reply(
            `${twitchFeedbackSuccess.emoji} Der Streamer **${streamerName}** wurde erfolgreich entfernt.`
          );
        } catch (error) {
          console.error(
            "Fehler beim Entfernen des Streamers:",
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
          const streamerList = await getTrackedTwitchChannels();

          if (streamerList.length === 0) {
            return interaction.reply({
              content: `${twitchFeedbackInfo.emoji} Es sind keine Streamer gespeichert.`,
              ephemeral: true,
            });
          }

          return interaction.reply(
            `${
              twitchFeedbackList.emoji
            } Liste der Twitch-Streamer:\n${streamerList
              .map(
                (streamer) =>
                  `- **${streamer.streamerName}** (Kanal: ${
                    streamer.discordChannelId
                      ? `<#${streamer.discordChannelId}>`
                      : "Kein Kanal"
                  })`
              )
              .join("\n")}`
          );
        } catch (error) {
          console.error(
            `${twitchFeedbackError.emoji} Fehler beim Abrufen der Streamer-Liste:`,
            error
          );
          return interaction.reply({
            content: `${twitchFeedbackError.emoji} Fehler beim Abrufen der Streamer-Liste.`,
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
