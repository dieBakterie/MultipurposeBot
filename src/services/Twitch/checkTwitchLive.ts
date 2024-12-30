// src/services/Twitch/checkTwitchLive.ts
itch/checkTwitchLive.js
import { getStreamerDetails, searchStreamer } from "./twitch.js";
import {
  getTrackedTwitchChannels,
  updateStreamerInfo,
} from "../../database/twitchDatabase.js";

const streamStatus = {}; // Status der Streamer

// Funktion zum Überprüfen der Stream-Status
export async function checkTwitchLive(client) {
  try {
    // Hole alle getrackten Streamer mit ihren Twitch-IDs und Discord-Kanälen
    const trackedStreamers = await getTrackedTwitchChannels(); // Format: [{ user_id, discord_channel_id }]

    for (const { userId, discordChannelId } of trackedStreamers) {
      const streamDetails = await getStreamerDetails(userId);
      const currentlyLive = !!streamDetails;

      // Aktualisiere `user_name` und `display_name`, falls sie sich geändert haben
      const streamerDetails = await searchStreamer(userId);
      if (streamerDetails) {
        await updateStreamerInfo(userId, streamerDetails);
      }

      // Initialisiere den Status, falls nicht vorhanden
      if (!streamStatus[userId]) {
        streamStatus[userId] = { online: false, lastMessage: null };
      }

      // Falls der Streamer live ist und noch nicht als "online" markiert ist
      if (currentlyLive && !streamStatus[userId].online) {
        const channel = client.channels.cache.get(discordChannelId);
        if (!channel) {
          console.error(`Kanal mit ID ${discordChannelId} nicht gefunden.`);
          continue;
        }

        streamStatus[userId].online = true;
        const title = streamDetails.title;

        // Sende die Live-Benachrichtigung
        streamStatus[userId].lastMessage = await channel.send(
          `<@&${streamDetails.user_id}> ist jetzt live auf Twitch!\n**Titel:** ${title}\nSchau es dir an: https://www.twitch.tv/${streamDetails.user_name}`
        );
      }
      // Falls der Streamer offline ist und vorher als "online" markiert war
      else if (!currentlyLive && streamStatus[userId].online) {
        streamStatus[userId].online = false;

        // Lösche die vorherige Nachricht
        if (streamStatus[userId].lastMessage) {
          await streamStatus[userId].lastMessage.delete();
          streamStatus[userId].lastMessage = null;
        }
      }
    }
  } catch (error) {
    console.error("Fehler beim Überprüfen der Twitch-Streamer:", error);
  }
}
