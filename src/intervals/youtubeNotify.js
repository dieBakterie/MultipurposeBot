// Importiere alle erforderlichen Module
import { getLatestVideos } from "../services/youtube.js";
import { listYouTubeChannels } from "../services/youtubeDatabase.js";
// Importiere alle erforderlichen Konfigurationsobjekte
import { exportsConfig } from "../config.js";
const {
  YouTubeNotificationLinkEmoji,
  YouTubeNotificationEmoji,
} = exportsConfig;

export default async function checkYouTubeNotifications(client) {
  const monitoredYouTubeChannels = listYouTubeChannels();

  for (const [channelId, lastVideoId] of monitoredYouTubeChannels) {
    const latestVideos = await getLatestVideos(channelId, 1);
    if (latestVideos.length > 0 && latestVideos[0].id !== lastVideoId) {
      monitoredYouTubeChannels.set(channelId, latestVideos[0].id);

      const channel = client.channels.cache.get();
      await channel.send(
        `${YouTubeNotificationEmoji} Neues Video auf YouTube veröffentlicht: **${latestVideos[0].title}**\n${YouTubeNotificationLinkEmoji} https://www.youtube.com/watch?v=${latestVideos[0].id}`,
      );
    }
  }
}
