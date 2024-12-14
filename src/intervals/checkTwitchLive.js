import { getTwitchStreamDetails } from "../services/twitch.js";
import { getTrackedTwitchChannels } from "../database/twitchDatabase.js";

const streamStatus = {}; // Status der Streamer

// Funktion zum Überprüfen der Stream-Status
export async function checkTwitchLive(client) {
  try {
    // Hole alle getrackten Streamer mit ihren zugehörigen Discord-Kanälen
    const trackedStreamers = await getTrackedTwitchChannels(); // Format: [{ username, channel_id }]

    for (const { username, channel_id } of trackedStreamers) {
      const streamDetails = await getTwitchStreamDetails(username);
      const currentlyLive = !!streamDetails;

      // Initialisiere den Status, falls nicht vorhanden
      if (!streamStatus[username]) {
        streamStatus[username] = { online: false, lastMessage: null };
      }

      // Falls der Streamer live ist und noch nicht als "online" markiert ist
      if (currentlyLive && !streamStatus[username].online) {
        const channel = client.channels.cache.get(channel_id);
        if (!channel) {
          console.error(`Kanal mit ID ${channel_id} nicht gefunden.`);
          continue;
        }

        streamStatus[username].online = true;
        const title = streamDetails.title;

        // Sende die Live-Benachrichtigung
        streamStatus[username].lastMessage = await channel.send(
          `${username} ist jetzt live auf Twitch!\n**Titel:** ${title}\nSchau es dir an: https://www.twitch.tv/${username}`
        );
      }
      // Falls der Streamer offline ist und vorher als "online" markiert war
      else if (!currentlyLive && streamStatus[username].online) {
        streamStatus[username].online = false;

        // Lösche die vorherige Nachricht
        if (streamStatus[username].lastMessage) {
          await streamStatus[username].lastMessage.delete();
          streamStatus[username].lastMessage = null;
        }
      }
    }
  } catch (error) {
    console.error("Fehler beim Überprüfen der Twitch-Streamer:", error);
  }
}
