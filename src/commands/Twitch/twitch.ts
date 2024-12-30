// src/commands/Twitch/twitch.ts
itch/twitch.js
import { SlashCommandBuilder, ChannelType } from "discord.js";
import {
  addTwitchChannel,
  removeTwitchChannel,
  getTrackedTwitchChannels,
  setDiscordChannelForStreamer,
} from "../../database/twitchDatabase.js";
import { validateStreamer } from "../../services/Twitch/twitch.js";
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
              "Discord-Kanal für Live-Benachrichtigungen, aktueller wird verwendet falls nicht angegeben."
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
            .setName("channel_name")
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

    try {
      switch (subcommand) {
        case "add": {
          const streamerName = interaction.options.getString("user_name");
          const channel =
            interaction.options.getChannel("channel_name") ||
            interaction.channel;

          if (!channel || !channel.isTextBased()) {
            return interaction.reply({
              content: `${twitchFeedbackError.emoji} Der Kanal **${
                channel?.toString() || "unbekannt"
              }** ist ungültig.`,
              ephemeral: true,
            });
          }

          try {
            const streamer = await validateStreamer(streamerName);

            if (!streamer) {
              return interaction.reply({
                content: `${twitchFeedbackError.emoji} Streamer "${streamerName}" konnte nicht validiert werden.`,
                ephemeral: true,
              });
            }

            const result = await addTwitchChannel(
              streamer.broadcaster_login,
              channel.id,
              interaction.guild
            );

            return interaction.reply({
              content: `${twitchFeedbackSuccess.emoji} ${
                result.message
              } Benachrichtigungen werden an ${channel.toString()} gesendet.`,
              ephemeral: true,
            });
          } catch (error) {
            console.error(
              "Fehler beim Hinzufügen des Streamers:",
              error.stack || error
            );
            return interaction.reply({
              content: `${twitchFeedbackError.emoji} Fehler beim Hinzufügen des Streamers: ${error.message}`,
              ephemeral: true,
            });
          }
        }

        case "set-channel": {
          const streamerName = interaction.options.getString("user_name");
          const channel = interaction.options.getChannel("channel_name");

          if (!channel || !channel.isTextBased()) {
            return interaction.reply({
              content: `${twitchFeedbackError.emoji} Der Kanal **${
                channel?.toString() || "unbekannt"
              }** ist ungültig.`,
              ephemeral: true,
            });
          }

          const result = await setDiscordChannelForStreamer(
            streamerName,
            channel.id
          );

          return interaction.reply({
            content: `${
              result.success
                ? `${twitchFeedbackSuccess.emoji} ${result.message}`
                : `${twitchFeedbackError.emoji} ${result.message}`
            }`,
            ephemeral: !result.success,
          });
        }

        case "remove": {
          const streamerName = interaction.options.getString("user_name");
          const result = await removeTwitchChannel(streamerName);

          return interaction.reply({
            content: `${
              result.success
                ? `${twitchFeedbackSuccess.emoji} ${result.message}`
                : `${twitchFeedbackError.emoji} ${result.message}`
            }`,
            ephemeral: !result.success,
          });
        }

        case "list": {
          const streamerList = await getTrackedTwitchChannels();

          if (streamerList.length === 0) {
            return interaction.reply({
              content: `${twitchFeedbackInfo.emoji} Es sind keine Streamer gespeichert.`,
              ephemeral: true,
            });
          }

          return interaction.reply({
            content: `${
              twitchFeedbackList.emoji
            } Liste der Twitch-Streamer:\n${streamerList
              .map(
                (streamer) =>
                  `- **${streamer.userName}** (Kanal: ${
                    streamer.discordChannelId
                      ? `<#${streamer.discordChannelId}>`
                      : "Kein Kanal"
                  })`
              )
              .join("\n")}`,
            ephemeral: true,
          });
        }

        default:
          return interaction.reply({
            content: `${twitchFeedbackError.emoji} Unbekannter Befehl.`,
            ephemeral: true,
          });
      }
    } catch (error) {
      console.error("Fehler bei der Ausführung des Twitch-Kommandos:", error);
      return interaction.reply({
        content: `${twitchFeedbackError.emoji} Ein Fehler ist aufgetreten.`,
        ephemeral: true,
      });
    }
  },
};
