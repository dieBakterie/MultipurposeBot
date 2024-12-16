import { SlashCommandBuilder, ChannelType } from "discord.js";
import {
  addTwitchChannel,
  removeTwitchChannel,
  getTrackedTwitchChannels,
  setDiscordChannelForStreamer,
} from "../../database/twitchDatabase.js";
import { searchTwitchUser } from "../../services/twitch.js";
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
            .setName("streamer_name")
            .setDescription("Der Twitch-Username des Streamers.")
            .setAutocomplete(true)
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
            .setName("streamer_name")
            .setDescription("Der Twitch-Username des Streamers.")
            .setAutocomplete(true)
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set-channel")
        .setDescription("Ändere den Discord-Kanal eines Streamers.")
        .addStringOption((option) =>
          option
            .setName("streamer_name")
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
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("list").setDescription("Liste aller Twitch-Streamer.")
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "add": {
        const streamername = interaction.options.getString("streamer_name");
        const channel = interaction.options.getChannel("channel_id");

        if (!channel || channel.type !== ChannelType.GuildText) {
          return interaction.reply({
            content: `${TwitchUserFeedbackErrorEmoji} Der Kanal <#${channel?.id}> ist ungültig oder kein Textkanal.`,
            ephemeral: true,
          });
        }

        try {
          const streamDetails = await searchTwitchUser(streamername);

          if (!streamDetails) {
            return interaction.reply({
              content: `${TwitchUserFeedbackInfoEmoji} Der Streamer **${streamername}** wurde nicht gefunden.`,
              ephemeral: true,
            });
          }

          // Speichere sowohl die Kanal-ID als auch den Kanalnamen
          const result = await addTwitchChannel(
            streamername,
            channel.name, // Channel-Name
            channel.id // Channel-ID
          );

          return interaction.reply({
            content: `${TwitchUserFeedbackSuccessEmoji} Der Streamer **${streamername}** wurde erfolgreich hinzugefügt und Benachrichtigungen werden an **${channel.name}** (<#${channel.id}>) gesendet.`,
            ephemeral: false,
          });
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
        const streamername = interaction.options.getString("streamer_name");
        const channel = interaction.options.getChannel("channel_id");

        if (!channel || channel.type !== ChannelType.GuildText) {
          return interaction.reply({
            content: `${TwitchUserFeedbackErrorEmoji} Der Kanal <#${channel?.id}> ist ungültig oder kein Textkanal.`,
            ephemeral: true,
          });
        }

        try {
          const result = await setDiscordChannelForStreamer(
            streamername,
            channel.name, // Channel-Name
            channel.id // Channel-ID
          );

          if (!result.success) {
            return interaction.reply({
              content: `${TwitchUserFeedbackInfoEmoji} Der Streamer **${streamername}** wurde nicht gefunden.`,
              ephemeral: true,
            });
          }

          return interaction.reply({
            content: `${TwitchUserFeedbackSuccessEmoji} Der Discord-Kanal für **${streamername}** wurde erfolgreich auf **${channel.name}** (<#${channel.id}>) geändert.`,
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
        const streamername = interaction.options.getString("streamer_name");

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
