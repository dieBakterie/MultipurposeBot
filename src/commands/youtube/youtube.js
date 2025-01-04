// src/commands/YouTube/youtube.js
// Importiere die erforderlichen Module
import pkg from "discord.js";
const {
  SlashCommandBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  EmbedBuilder,
  ChannelType,
} = pkg;
import { getLatestVideos } from "../../services/YouTube/youtube.js";
import searchMusic from "../../services/YouTube/music.js";
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
  youtubeFeedbackNext,
  youtubeFeedbackPrevious,
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
                .addChannelTypes(ChannelType.GuildText)
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
                .addChannelTypes(ChannelType.GuildText)
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

          const result = await addYouTubeChannel(
            channelId,
            channelName,
            latestVideos[0].id,
            notificationChannel.id,
            notificationChannel.name
          );

          return interaction.reply({
            content: `${result.success ? youtubeNotificationFeedbackSuccess.emoji : youtubeNotificationFeedbackError.emoji} ${result.message} Benachrichtigungen werden an <#${notificationChannel.id}> gesendet.`,
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
          const result = await removeYouTubeChannel(channelName || channelId);
          if (!result.success) {
            return interaction.reply({
              content: `${youtubeNotificationFeedbackInfo.emoji} Dieser Kanal wird nicht überwacht.`,
              ephemeral: true,
            });
          }

          return interaction.reply({
            content: `${result.success ? youtubeNotificationFeedbackSuccess.emoji : youtubeNotificationFeedbackError.emoji} ${result.message}`,
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

      if (subcommand == "list") {
        try {
          const youtuberList = await getTrackedYouTubeChannels();

          if (youtuberList.length === 0) {
            return interaction.reply({
              content: `${youtubeNotificationFeedbackInfo.emoji} Es sind keine Streamer gespeichert.`,
              ephemeral: true,
            });
          }

          if (youtuberList.length > 10) {
            const itemsPerPage = 10;
            const totalPages = Math.ceil(youtuberList.length / itemsPerPage);
            let currentPage = 0;

            const generateEmbed = (page) => {
              const start = page * itemsPerPage;
              const end = start + itemsPerPage;
              const pageItems = youtuberList.slice(start, end);

              return new EmbedBuilder()
                .setTitle(
                  `${youtubeNotificationFeedbackList.emoji} Liste der Twitch-Streamer`
                )
                .setDescription(
                  pageItems
                    .map(
                      (streamer, index) =>
                        `**${start + index + 1}.** ${
                          streamer.streamerName
                        } (Kanal: ${
                          streamer.discordChannelId
                            ? `<#${streamer.discordChannelId}>`
                            : "Kein Kanal"
                        })`
                    )
                    .join("\n")
                )
                .setFooter({ text: `Seite ${page + 1} von ${totalPages}` });
            };

            const embed = generateEmbed(currentPage);

            const buttons = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("prev")
                .setLabel(`${youtubeFeedbackPrevious.emoji}`)
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("next")
                .setLabel(`${youtubeFeedbackNext.emoji}`)
                .setStyle(ButtonStyle.Primary)
            );

            const reply = await interaction.reply({
              embeds: [embed],
              components: [buttons],
              fetchReply: true,
            });

            const collector = reply.createMessageComponentCollector({
              filter: (i) => i.user.id === interaction.user.id,
              time: 60000,
            });

            collector.on("collect", async (i) => {
              if (i.customId === "prev") {
                currentPage = (currentPage - 1 + totalPages) % totalPages;
              } else if (i.customId === "next") {
                currentPage = (currentPage + 1) % totalPages;
              }

              await i.update({
                embeds: [generateEmbed(currentPage)],
              });
            });

            collector.on("end", () => {
              reply.edit({ components: [] }).catch(console.error);
            });

            return;
          }

          // Liste ohne Seiten, wenn weniger als 10 Streamer
          const embed = new EmbedBuilder()
            .setTitle(
              `${youtubeNotificationFeedbackList.emoji} Liste der YouTuber`
            )
            .setDescription(
              youtuberList
                .map(
                  (streamer, index) =>
                    `**${index + 1}.** ${streamer.streamerName} (Kanal: ${
                      streamer.discordChannelId
                        ? `<#${streamer.discordChannelId}>`
                        : "Kein Kanal"
                    })`
                )
                .join("\n")
            );

          return interaction.reply({ embeds: [embed] });
        } catch (error) {
          console.error(
            `${youtubeNotificationFeedbackError.emoji} Fehler beim Abrufen der YouTuber-Liste:`,
            error
          );
          return interaction.reply({
            content: `${youtubeNotificationFeedbackError.emoji} Fehler beim Abrufen der YouTuber-Liste.`,
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
