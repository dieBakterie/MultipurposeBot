// src/services/YouTube/youtubeNotify.js
// Importiere alle erforderlichen Module
import { getLatestVideos } from "./youtube.js";
import { listYouTubeChannels } from "../../database/youtubeDatabase.js";
// Importiere alle erforderlichen Konfigurationsobjekte
import {
  youtubeFeedbackLink,
  youtubeNotificationEmoji,
} from "../../alias.js";

export default async function checkYouTubeNotifications(client) {
  const monitoredYouTubeChannels = listYouTubeChannels();

  for (const [channelId, lastVideoId] of monitoredYouTubeChannels) {
    const latestVideos = await getLatestVideos(channelId, 1);
    if (latestVideos.length > 0 && latestVideos[0].id !== lastVideoId) {
      monitoredYouTubeChannels.set(channelId, latestVideos[0].id);

      const channel = client.channels.cache.get();
      await channel.send(
        `${youtubeNotificationEmoji} Neues Video auf YouTube veröffentlicht: **${latestVideos[0].title}**\n${youtubeFeedbackLink.emoji} https://www.youtube.com/watch?v=${latestVideos[0].id}`
      );
    }
  }
}
