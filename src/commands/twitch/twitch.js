import { SlashCommandBuilder, ChannelType } from "discord.js";
import {
  addTwitchChannel,
  removeTwitchChannel,
  getTrackedTwitchChannels,
  setDiscordChannelForStreamer,
} from "../../database/twitchDatabase.js";
import { getTwitchStreamDetails } from "../../services/twitch.js";
import { exportsConfig } from "../../config.js";

const {
  TwitchUserFeedbackErrorEmoji,
  TwitchUserFeedbackSuccessEmoji,
  TwitchUserFeedbackInfoEmoji,
  TwitchUserFeedbackListEmoji,
} = exportsConfig;

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
            .setName("streamername")
            .setDescription("Der Twitch-Username des Streamers.")
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("channel_id")
            .setDescription(
              "Die Discord-Channel-ID für Live-Benachrichtigungen."
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Entferne einen Twitch-Streamer.")
        .addStringOption((option) =>
          option
            .setName("streamername")
            .setDescription("Der Twitch-Username des Streamers.")
            .setAutocomplete(true)
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("list").setDescription("Liste aller Twitch-Streamer.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set-channel")
        .setDescription("Ändere den Discord-Kanal eines Streamers.")
        .addStringOption((option) =>
          option
            .setName("streamername")
            .setDescription("Der Twitch-Username des Streamers.")
            .setAutocomplete(true)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("channel_id")
            .setDescription("Der neue Discord-Channel.")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "add": {
        const streamername = interaction.options.getString("streamername");
        const channel = interaction.options.getChannel("channel_id");

        if (!channel || channel.type !== ChannelType.GuildText) {
          return interaction.reply({
            content: `${TwitchUserFeedbackErrorEmoji} Der Kanal <#${channel?.id}> ist ungültig oder existiert nicht.`,
            ephemeral: true,
          });
        }

        try {
          const streamDetails = await getTwitchStreamDetails(streamername);

          if (!streamDetails) {
            return interaction.reply({
              content: `${TwitchUserFeedbackInfoEmoji} Der Streamer **${streamername}** wurde nicht gefunden.`,
              ephemeral: true,
            });
          }

          await addTwitchChannel(streamername, channel.id);
          return interaction.reply(
            `${TwitchUserFeedbackSuccessEmoji} Der Streamer **${streamername}** wurde erfolgreich hinzugefügt und Benachrichtigungen werden an <#${channel.id}> gesendet.`
          );
        } catch (error) {
          console.error(
            "Fehler beim Hinzufügen des Streamers:",
            error.stack || error
          );
          return interaction.reply({
            content: `${TwitchUserFeedbackErrorEmoji} Fehler beim Hinzufügen des Streamers.`,
            ephemeral: true,
          });
        }
      }

      case "set-channel": {
        const streamername = interaction.options.getString("streamername");
        const channel = interaction.options.getChannel("channel_id");

        if (!channel || channel.type !== ChannelType.GuildText) {
          return interaction.reply({
            content: `${TwitchUserFeedbackErrorEmoji} Der Kanal <#${channel?.id}> ist ungültig oder kein Textkanal.`,
            ephemeral: true,
          });
        }

        try {
          const updated = await setDiscordChannelForStreamer(
            streamername,
            channel.id
          );
          if (!updated) {
            return interaction.reply({
              content: `${TwitchUserFeedbackInfoEmoji} Der Streamer **${streamername}** wurde nicht gefunden.`,
              ephemeral: true,
            });
          }

          return interaction.reply({
            content: `${TwitchUserFeedbackSuccessEmoji} Der Discord-Kanal für **${streamername}** wurde erfolgreich auf <#${channel.id}> geändert.`,
            ephemeral: false,
          });
        } catch (error) {
          console.error("Fehler beim Ändern des Kanals:", error.stack || error);
          return interaction.reply({
            content: `${TwitchUserFeedbackErrorEmoji} Fehler beim Ändern des Kanals.`,
            ephemeral: true,
          });
        }
      }

      case "remove": {
        const streamername = interaction.options.getString("streamername");

        try {
          const removed = await removeTwitchChannel(streamername);

          if (!removed) {
            return interaction.reply({
              content: `${TwitchUserFeedbackInfoEmoji} Der Streamer **${streamername}** wurde nicht gefunden.`,
              ephemeral: true,
            });
          }

          return interaction.reply(
            `${TwitchUserFeedbackSuccessEmoji} Der Streamer **${streamername}** wurde erfolgreich entfernt.`
          );
        } catch (error) {
          console.error(
            "Fehler beim Entfernen des Streamers:",
            error.stack || error
          );
          return interaction.reply({
            content: `${TwitchUserFeedbackErrorEmoji} Fehler beim Entfernen des Streamers.`,
            ephemeral: true,
          });
        }
      }

      case "list": {
        try {
          const streamerList = await getTrackedTwitchChannels();

          if (streamerList.length === 0) {
            return interaction.reply({
              content: `${TwitchUserFeedbackInfoEmoji} Es sind keine Streamer gespeichert.`,
              ephemeral: true,
            });
          }

          return interaction.reply(
            `${TwitchUserFeedbackListEmoji} Liste der Twitch-Streamer:\n${streamerList
              .map(
                (streamer) =>
                  `- **${streamer.streamername}** (Kanal: ${
                    streamer.discordChannelId
                      ? `<#${streamer.discordChannelId}>`
                      : "Kein Kanal"
                  })`
              )
              .join("\n")}`
          );
        } catch (error) {
          console.error(
            `${TwitchUserFeedbackErrorEmoji} Fehler beim Abrufen der Streamer-Liste:`,
            error
          );
          return interaction.reply({
            content: `${TwitchUserFeedbackErrorEmoji} Fehler beim Abrufen der Streamer-Liste.`,
            ephemeral: true,
          });
        }
      }

      default:
        return interaction.reply({
          content: `${TwitchUserFeedbackErrorEmoji} Unbekannter Befehl.`,
          ephemeral: true,
        });
    }
  },
};
