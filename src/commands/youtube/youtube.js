// Importiere die erforderlichen Module
import { SlashCommandBuilder } from "discord.js";
import { getLatestVideos } from "../../services/youtube.js";
import {
  addYouTubeChannel,
  removeYouTubeChannel,
  getTrackedYouTubeChannels,
  setDiscordChannelForYouTubeChannel,
} from "../../database/youtubeDatabase.js";

// Importiere die erforderlichen Konfigurationen
import { exportsConfig } from "../../config.js";
const {
  YouTubeNotificationUserFeedbackErrorEmoji,
  YouTubeNotificationUserFeedbackSuccessEmoji,
  YouTubeNotificationUserFeedbackInfoEmoji,
  YouTubeNotificationUserFeedbackListEmoji,
  YouTubeMusicUserFeedbackErrorEmoji,
  YouTubeMusicUserFeedbackLinkEmoji
} = exportsConfig;

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
                .setName("channelid")
                .setDescription("Die ID des YouTube-Kanals.")
                .setRequired(true)
            )
            .addChannelOption((option) =>
              option
                .setName("notificationchannel")
                .setDescription(
                  "Der Discord-Kanal für Benachrichtigungen zu neuen Videos."
                )
                .setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName("remove")
            .setDescription("Entferne einen YouTube-Kanal aus der Überwachung.")
            .addStringOption((option) =>
              option
                .setName("channelid")
                .setDescription("Die ID des YouTube-Kanals.")
                .setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName("list")
            .setDescription("Zeige die Liste der überwachten YouTube-Kanäle.")
        )
        .addSubcommand((sub) =>
          sub
            .setName("set-channel")
            .setDescription(
              "Ändere den Discord-Kanal für Benachrichtigungen eines YouTube-Kanals."
            )
            .addStringOption((option) =>
              option
                .setName("channelid")
                .setDescription("Die ID des YouTube-Kanals.")
                .setRequired(true)
            )
            .addChannelOption((option) =>
              option
                .setName("notificationchannel")
                .setDescription(
                  "Der neue Discord-Kanal für Benachrichtigungen."
                )
                .setRequired(true)
            )
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const group = interaction.options.getSubcommandGroup(false);

    if (group === "notify") {
      const channelId = interaction.options.getString("channelid", false);

      if (subcommand === "add") {
        const notificationChannel = interaction.options.getChannel(
          "notificationchannel"
        );

        try {
          const latestVideos = await getLatestVideos(channelId, 1);
          if (latestVideos.length === 0) {
            return interaction.reply({
              content: `${YouTubeNotificationUserFeedbackInfoEmoji} Der Kanal hat keine Videos oder existiert nicht.`,
              ephemeral: true,
            });
          }

          await addYouTubeChannel(
            channelId,
            channelName, // Hier kannst du optional einen Kanalnamen integrieren
            latestVideos[0].id,
            notificationChannel.id,
            notificationChannel.name
          );

          return interaction.reply({
            content: `${YouTubeNotificationUserFeedbackSuccessEmoji} Der YouTube-Kanal **${channelId}** wird jetzt überwacht. Benachrichtigungen werden an <#${notificationChannel.id}> gesendet.`,
            ephemeral: true,
          });
        } catch (error) {
          console.error(error);
          return interaction.reply({
            content: `${YouTubeNotificationUserFeedbackErrorEmoji} Fehler beim Hinzufügen des YouTube-Kanals.`,
            ephemeral: true,
          });
        }
      }

      if (subcommand === "remove") {
        try {
          const removed = await removeYouTubeChannel(channelId);
          if (!removed) {
            return interaction.reply({
              content: `${YouTubeNotificationUserFeedbackInfoEmoji} Dieser Kanal wird nicht überwacht.`,
              ephemeral: true,
            });
          }
          return interaction.reply({
            content: `${YouTubeNotificationUserFeedbackSuccessEmoji} Überwachung für diesen Kanal entfernt.`,
            ephemeral: true,
          });
        } catch (error) {
          console.error(error);
          return interaction.reply({
            content: `${YouTubeNotificationUserFeedbackErrorEmoji} Fehler beim Entfernen des YouTube-Kanals.`,
            ephemeral: true,
          });
        }
      }

      if (subcommand === "list") {
        try {
          const channels = await getTrackedYouTubeChannels();
          if (channels.length === 0) {
            return interaction.reply({
              content: `${YouTubeNotificationUserFeedbackInfoEmoji} Keine überwachten YouTube-Kanäle vorhanden.`,
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
            content: `${YouTubeNotificationUserFeedbackListEmoji} Überwachte YouTube-Kanäle:\n${list}`,
            ephemeral: true,
          });
        } catch (error) {
          console.error(error);
          return interaction.reply({
            content: `${YouTubeNotificationUserFeedbackErrorEmoji} Fehler beim Abrufen der überwachten Kanäle.`,
            ephemeral: true,
          });
        }
      }

      if (subcommand === "set-channel") {
        const notificationChannel = interaction.options.getChannel(
          "notificationchannel"
        );

        try {
          const updated = await setDiscordChannelForYouTubeChannel(
            channelId,
            notificationChannel.id,
            notificationChannel.name
          );

          if (!updated.success) {
            return interaction.reply({
              content: `${YouTubeNotificationUserFeedbackInfoEmoji} Der Kanal **${channelId}** wird nicht überwacht.`,
              ephemeral: true,
            });
          }

          return interaction.reply({
            content: `${YouTubeNotificationUserFeedbackSuccessEmoji} Benachrichtigungskanal für **${channelId}** wurde auf <#${notificationChannel.id}> geändert.`,
            ephemeral: true,
          });
        } catch (error) {
          console.error(error);
          return interaction.reply({
            content: `${YouTubeNotificationUserFeedbackErrorEmoji} Fehler beim Ändern des Benachrichtigungskanals.`,
            ephemeral: true,
          });
        }
      }
      if (subcommand === "music") {
        const query = interaction.options.getString("query");
        try {
          const music = await searchMusic(query);
          return interaction.reply(
            `${YouTubeMusicEmoji} **${music.title}**\n${YouTubeMusicUserFeedbackLinkEmoji} https://www.youtube.com/watch?v=${music.id}`
          );
        } catch (error) {
          console.error(error);
          return interaction.reply(
            `${YouTubeMusicUserFeedbackErrorEmoji} Fehler beim Abrufen der YouTube-Musik.`
          );
        }
      }
    }
  },
};
