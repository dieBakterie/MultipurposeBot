// Importiere die erforderlichen Module
import { SlashCommandBuilder } from "discord.js";
import { searchMusic } from "../../services/youtubeMusic.js";
import { getLatestVideos } from "../../services/youtube.js";
import {
  addYouTubeChannel,
  removeYouTubeChannel,
  listYouTubeChannels,
} from "../../database/youtubeDatabase.js";
// Importiere die erforderlichen Konfigurationen
import { exportsConfig } from "../../config.js";
const {
  YouTubeNotificationUserFeedbackErrorEmoji,
  YouTubeNotificationUserFeedbackSuccessEmoji,
  YouTubeNotificationUserFeedbackInfoEmoji,
  YouTubeMusicUserFeedbackErrorEmoji,
  YouTubeMusicUserFeedbackInfoEmoji,
  YouTubeNotificationUserFeedbackListEmoji,
  YouTubeMusicUserFeedbackLinkEmoji,
} = exportsConfig;

export default {
  data: new SlashCommandBuilder()
    .setName("youtube")
    .setDescription("Verwalte YouTube-Musik und Benachrichtigungen.")
/*     .addSubcommand((sub) =>
      sub
        .setName("music")
        .setDescription("Spiele Musik von YouTube.")
        .addStringOption((option) =>
          option
            .setName("query")
            .setDescription("Titel oder Suchbegriff der Musik.")
            .setRequired(true)
        )
    ) */
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
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const group = interaction.options.getSubcommandGroup(false);

    if (group === "notify") {
      const channelId = interaction.options.getString("channelid", false);

      if (subcommand === "add") {
        try {
          const latestVideos = await getLatestVideos(channelId, 1);
          if (latestVideos.length === 0) {
            return interaction.reply(
              `${YouTubeNotificationUserFeedbackInfoEmoji} Der Kanal hat keine Videos oder existiert nicht.`
            );
          }

          await addYouTubeChannel(channelId, latestVideos[0].id);
          return interaction.reply(
            `${YouTubeNotificationUserFeedbackSuccessEmoji} Der YouTube-Kanal **${channelId}** wird jetzt überwacht.`
          );
        } catch (error) {
          console.error(error);
          return interaction.reply(
            `${YouTubeNotificationUserFeedbackErrorEmoji} Fehler beim Hinzufügen des YouTube-Kanals.`
          );
        }
      }

      if (subcommand === "remove") {
        try {
          const removed = await removeYouTubeChannel(channelId);
          if (!removed) {
            return interaction.reply(
              `${YouTubeMusicUserFeedbackInfoEmoji} Dieser Kanal wird nicht überwacht.`
            );
          }
          return interaction.reply(
            `musicEmojiSuccess Überwachung für diesen Kanal entfernt.`
          );
        } catch (error) {
          console.error(error);
          return interaction.reply(
            `musicEmojiError Fehler beim Entfernen des YouTube-Kanals.`
          );
        }
      }

      if (subcommand === "list") {
        try {
          const channels = await listYouTubeChannels();
          if (channels.length === 0) {
            return interaction.reply(
              `${YouTubeNotificationInfoEmoji} Keine überwachten YouTube-Kanäle vorhanden.`
            );
          }
          const list = channels
            .map(
              (channel) =>
                `- **Kanal-ID:** ${channel.channel_id} (Letztes Video-ID: ${channel.latest_video_id})`
            )
            .join("\n");
          return interaction.reply(
            `${YouTubeNotificationUserFeedbackListEmoji} Überwachte YouTube-Kanäle:\n${list}`
          );
        } catch (error) {
          console.error(error);
          return interaction.reply(
            `${YouTubeMusicUserFeedbackErrorEmoji} Fehler beim Abrufen der überwachten Kanäle.`
          );
        }
      }
    }

/*     if (subcommand === "music") {
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
    } */
  },
};
