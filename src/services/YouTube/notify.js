// src/services/YouTube/notify.js
// Importiere alle erforderlichen Module
import { getLatestVideos } from "./youtube.js";
import { listYouTubeChannels, updateLastVideoId } from "../../database/youtubeDatabase.js";
import { youtubeFeedbackLink, youtubeNotificationEmoji } from "../../alias.js";
import pkg from "discord.js";
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = pkg;

export default async function checkYouTubeNotifications(client) {
  const monitoredYouTubeChannels = listYouTubeChannels(); // { channelId: lastVideoId }

  for (const [channelId, lastVideoId] of Object.entries(
    monitoredYouTubeChannels
  )) {
    try {
      const latestVideos = await getLatestVideos(channelId, 1); // Hole die neuesten Videos

      // Prüfen, ob es ein neues Video gibt
      if (latestVideos.length > 0 && latestVideos[0].id !== lastVideoId) {
        const newVideo = latestVideos[0];

        // Aktualisiere das letzte Video in der Datenbank
        await updateLastVideoId(channelId, newVideo.id);

        // Hole den Discord-Kanal (ersetze "channelId" durch deinen Discord-Kanal-ID)
        const discordChannel = client.channels.cache.get(
          "YOUR_DISCORD_CHANNEL_ID"
        );
        if (!discordChannel) {
          console.error(
            `Discord-Kanal nicht gefunden für Channel ID: YOUR_DISCORD_CHANNEL_ID`
          );
          continue;
        }

        // Erstelle das Embed für das neue Video
        const videoEmbed = new EmbedBuilder()
          .setColor(0xb2071d) // YouTube-Farbe
          .setTitle(newVideo.title)
          .setURL(`https://www.youtube.com/watch?v=${newVideo.id}`)
          .setDescription(`Ein neues Video wurde hochgeladen! 🎥`)
          .setThumbnail(newVideo.thumbnail) // Vorschaubild
          .addFields(
            { name: "Kanal", value: newVideo.channelTitle, inline: true },
            {
              name: "Veröffentlichungsdatum",
              value: new Date(newVideo.publishedAt).toLocaleString(),
              inline: true,
            }
          )
          .setFooter({
            text: "YouTube-Benachrichtigung",
            iconURL: "https://www.youtube.com/favicon.ico",
          })
          .setTimestamp();

        // Erstelle den Button zum Ansehen des Videos
        const watchButton = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("Watch Video")
            .setStyle(ButtonStyle.Link)
            .setURL(`https://www.youtube.com/watch?v=${newVideo.id}`)
        );

        // Sende die Nachricht mit dem Embed und Button
        await discordChannel.send({
          content: `${youtubeNotificationEmoji} Ein neues Video wurde veröffentlicht:`,
          embeds: [videoEmbed],
          components: [watchButton],
        });

        console.log(
          `YouTube-Benachrichtigung gesendet für Video: ${newVideo.title}`
        );
      }
    } catch (error) {
      console.error(
        `Fehler beim Verarbeiten von YouTube-Kanal ${channelId}:`,
        error
      );
    }
  }
}
