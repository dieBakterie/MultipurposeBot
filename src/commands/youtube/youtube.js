// src/commands/YouTube/youtube.js
// Importiere die erforderlichen Module
import { SlashCommandBuilder } from "discord.js";
import { getLatestVideos } from "../../services/YouTube/youtube.js";
import { searchMusic } from "../../services/YouTube/music.js";
import {
  addYouTubeChannel,
  removeYouTubeChannel,
  getTrackedYouTubeChannels,
  setDiscordChannelForYouTubeChannel,
} from "../../database/youtubeDatabase.js";
import {
  youtubeNotificationFeedbackSuccess,
  youtubeNotificationFeedbackError,
  youtubeNotificationFeedbackInfo,
  youtubeNotificationFeedbackList,
  youtubeMusicEmoji,
  youtubeMusicFeedbackError,
  youtubeMusicFeedbackLink,
} from "../../alias.js";

export default {
  data: new SlashCommandBuilder()
    .setName("youtube")
    .setDescription("Verwalte YouTube-Benachrichtigungen.")
    .addSubcommandGroup((group) =>
      group
        .setName("notify")
        .setDescription("Verwalte Benachrichtigungen für YouTube-Kanäle.")
        .addSubcommand((sub) =>
          sub
            .setName("add")
            .setDescription("Füge einen YouTube-Kanal zur Überwachung hinzu.")
            .addStringOption((option) =>
              option
                .setName("channel_name")
                .setDescription("Der Name des YouTube-Kanals.")
                .setRequired(true)
            )
            .addChannelOption((option) =>
              option
                .setName("notification_channel")
                .setDescription(
                  "Der Discord-Kanal für Benachrichtigungen zu neuen Videos."
                )
                .setRequired(true)
            )
            .addStringOption((option) =>
              option
                .setName("channel_id")
                .setDescription("Die ID des YouTube-Kanals.")
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName("remove")
            .setDescription("Entferne einen YouTube-Kanal aus der Überwachung.")
            .addStringOption((option) =>
              option
                .setName("channel_id")
                .setDescription("Die ID des YouTube-Kanals.")
                .setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName("set-channel")
            .setDescription(
              "Ändere den Discord-Kanal für Benachrichtigungen eines YouTube-Kanals."
            )
            .addStringOption((option) =>
              option
                .setName("channel_id")
                .setDescription("Die ID des YouTube-Kanals.")
                .setRequired(true)
                .setAutocomplete(true)
            )
            .addStringOption((option) =>
              option
                .setName("channel_name")
                .setDescription("Der Name des YouTube-Kanals.")
                .setRequired(true)
                .setAutocomplete(true)
            )
            .addChannelOption((option) =>
              option
                .setName("notification_channel")
                .setDescription(
                  "Der neue Discord-Kanal für Benachrichtigungen."
                )
                .setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName("list")
            .setDescription("Zeige die Liste der überwachten YouTube-Kanäle.")
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const group = interaction.options.getSubcommandGroup(false);

    if (group === "notify") {
      const channelId = interaction.options.getString("channel_id", false);
      const channelName = interaction.options.getString("channel_name", false);

      if (subcommand === "add") {
        const notificationChannel = interaction.options.getChannel(
          "notification_channel"
        );

        try {
          const latestVideos = await getLatestVideos(channelId, 1);
          if (latestVideos.length === 0) {
            return interaction.reply({
              content: `${youtubeNotificationFeedbackInfo.emoji} Der Kanal hat keine Videos oder existiert nicht.`,
              ephemeral: true,
            });
          }

          await addYouTubeChannel(
            channelId,
            channelName,
            latestVideos[0].id,
            notificationChannel.id,
            notificationChannel.name
          );

          return interaction.reply({
            content: `${youtubeNotificationFeedbackSuccess.emoji} Der YouTube-Kanal **${channelName}**(Kanal-ID: **${channelId}**) wird jetzt überwacht. Benachrichtigungen werden an <#${notificationChannel.id}> gesendet.`,
            ephemeral: true,
          });
        } catch (error) {
          console.error(error);
          return interaction.reply({
            content: `${youtubeNotificationFeedbackError.emoji} Fehler beim Hinzufügen des YouTube-Kanals.`,
            ephemeral: true,
          });
        }
      }

      if (subcommand === "remove") {
        try {
          const removed = await removeYouTubeChannel(channelName || channelId);
          if (!removed) {
            return interaction.reply({
              content: `${youtubeNotificationFeedbackInfo.emoji} Dieser Kanal wird nicht überwacht.`,
              ephemeral: true,
            });
          }
          return interaction.reply({
            content: `${youtubeNotificationFeedbackSuccess.emoji} Überwachung für diesen Kanal entfernt.`,
            ephemeral: true,
          });
        } catch (error) {
          console.error(error);
          return interaction.reply({
            content: `${youtubeNotificationFeedbackError.emoji} Fehler beim Entfernen des YouTube-Kanals.`,
            ephemeral: true,
          });
        }
      }

      if (subcommand === "list") {
        try {
          const channels = await getTrackedYouTubeChannels();
          if (channels.length === 0) {
            return interaction.reply({
              content: `${youtubeNotificationFeedbackInfo.emoji} Keine überwachten YouTube-Kanäle vorhanden.`,
              ephemeral: true,
            });
          }

          const list = channels
            .map(
              (channel) =>
                `- **Kanal-ID:** ${
                  channel.user_id
                }\n  - **Benachrichtigungen:** ${
                  channel.discord_channel_id
                    ? `<#${channel.discord_channel_id}>`
                    : "Kein Kanal"
                }\n  - **Letztes Video-ID:** ${channel.latest_video_id}`
            )
            .join("\n");
          return interaction.reply({
            content: `${youtubeNotificationFeedbackList.emoji} Überwachte YouTube-Kanäle:\n${list}`,
            ephemeral: true,
          });
        } catch (error) {
          console.error(error);
          return interaction.reply({
            content: `${youtubeNotificationFeedbackError.emoji} Fehler beim Abrufen der überwachten Kanäle.`,
            ephemeral: true,
          });
        }
      }

      if (subcommand === "set-channel") {
        const notificationChannel = interaction.options.getChannel(
          "notification_channel"
        );

        try {
          const updated = await setDiscordChannelForYouTubeChannel(
            channelId,
            notificationChannel.id,
            notificationChannel.name
          );

          if (!updated.success) {
            return interaction.reply({
              content: `${youtubeNotificationFeedbackInfo.emoji} Der Kanal **${channelId}** wird nicht überwacht.`,
              ephemeral: true,
            });
          }

          return interaction.reply({
            content: `${youtubeNotificationFeedbackSuccess.emoji} Benachrichtigungskanal für **${channelId}** wurde auf <#${notificationChannel.id}> geändert.`,
            ephemeral: true,
          });
        } catch (error) {
          console.error(error);
          return interaction.reply({
            content: `${youtubeNotificationFeedbackError.emoji} Fehler beim Ändern des Benachrichtigungskanals.`,
            ephemeral: true,
          });
        }
      }
    }
    if (subcommand === "music") {
      const query = interaction.options.getString("query");
      try {
        const music = await searchMusic(query);
        return interaction.reply(
          `${youtubeMusicEmoji} **${music.title}**\n${youtubeMusicFeedbackLink.emoji} https://www.youtube.com/watch?v=${music.id}`
        );
      } catch (error) {
        console.error(error);
        return interaction.reply(
          `${youtubeMusicFeedbackError.emoji} Fehler beim Abrufen der YouTube-Musik.`
        );
      }
    }
  },
};
