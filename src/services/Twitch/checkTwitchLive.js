// src/services/Twitch/checkTwitchLive.js

import pkg from "discord.js";
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = pkg;
import {
  getCachedTrackedStreamers,
  updateStreamerInfo,
} from "../../database/twitchDatabase.js";
import { getTwitchStreamerDetails, getTwitchStreamDetails } from "./twitch.js";

/**
 * Sendet eine Live-Benachrichtigung in einen Discord-Kanal, wenn ein Twitch-Streamer
 * online geht.
 * @param {TextChannel} channel - Discord-Kanal, in den die Benachrichtigung
 *   gesendet werden soll.
 * @param {Object} streamDetails - Twitch-Stream-Daten.
 * @param {Object} userDetails - Twitch-Streamer-Daten.
 * @returns {Promise<Message>} - Die gesendete Nachricht oder null, wenn ein Fehler
 *   aufgetreten ist.
 */
async function sendLiveNotification(channel, streamDetails, userDetails) {
  try {
    const twitchLink = `https://www.twitch.tv/${userDetails.login}`;

    const liveEmbed = new EmbedBuilder()
      .setColor(0x6441a5)
      .setTitle(`${userDetails.display_name} ist jetzt live auf Twitch!`)
      .setDescription(
        `**Titel:** ${streamDetails.title || "Kein Titel verfügbar"}`
      )
      .setThumbnail(userDetails.profile_image_url)
      .addFields(
        {
          name: "Spiel",
          value: streamDetails.game_name || "Kein Spiel angegeben",
          inline: true,
        },
        {
          name: "Viewer",
          value: `${streamDetails.viewer_count || 0}`,
          inline: true,
        }
      )
      .setURL(twitchLink)
      .setFooter({
        text: "Twitch Live-Benachrichtigung",
        iconURL: "https://www.twitch.tv/favicon.ico",
      })
      .setTimestamp();

    const watchButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Watch Stream")
        .setStyle(ButtonStyle.Link)
        .setURL(twitchLink)
    );

    const sentMessage = await channel.send({
      content: `<@&${userDetails.id}> ist jetzt live!`,
      embeds: [liveEmbed],
      components: [watchButton],
    });

    return sentMessage;
  } catch (error) {
    console.error("Fehler beim Senden der Live-Benachrichtigung:", error);
    return null; // Klare Rückgabe bei Fehlern
  }
}

const streamStatusCache = new Map(); // Temporärer Cache

/**
 * Verarbeitet den aktuellen Stream-Status eines Twitch-Streamers und aktualisiert
 * den Benachrichtigungsstatus im Discord-Kanal.
 *
 * @param {Client} client - Der Discord-Client.
 * @param {string} userId - Die Twitch-Benutzer-ID des Streamers.
 * @param {string} discordChannelId - Die ID des Discord-Kanals, in dem Benachrichtigungen
 *   gesendet werden sollen.
 * @param {boolean} currentlyLive - Gibt an, ob der Streamer aktuell live ist.
 * @param {Object} streamDetails - Die Details des aktuellen Twitch-Streams.
 * @param {Object} userDetails - Die Details des Twitch-Streamers.
 */
async function processStreamStatus(
  client,
  userId,
  discordChannelId,
  currentlyLive,
  streamDetails,
  userDetails
) {
  if (!streamStatusCache.has(userId)) {
    streamStatusCache.set(userId, { online: false, lastMessage: null });
  }

  const status = streamStatusCache.get(userId);

  if (currentlyLive && !status.online) {
    const channel = client.channels.cache.get(discordChannelId);
    if (!channel || !channel.permissionsFor(client.user).has("SendMessages"))
      return;

    const sentMessage = await sendLiveNotification(
      channel,
      streamDetails,
      userDetails
    );
    if (sentMessage) {
      streamStatusCache.set(userId, { online: true, lastMessage: sentMessage });
    }
  } else if (!currentlyLive && status.online) {
    if (status.lastMessage) {
      await status.lastMessage.delete();
    }
    streamStatusCache.set(userId, { online: false, lastMessage: null });
  }
}

/**
 * Überprüft alle Twitch-Streamer, die in der Datenbank registriert sind,
 * auf Änderungen ihres Status (online/offline).
 * @param {Client} client - Der Discord-Client.
 * @returns {Promise<void>}
 */
async function checkTwitchLive(client) {
  try {
    // Verwende den Cache, um die Streamer abzurufen
    const trackedStreamers = await getCachedTrackedStreamers();
    console.log(`Überprüfe ${trackedStreamers.length} Twitch-Streamer...`);

    if (!trackedStreamers.length) {
      console.log("Keine Twitch-Streamer zum Überprüfen gefunden.");
      return;
    }

    const userDetailsCache = new Map();

    await Promise.all(
      trackedStreamers.map(async ({ userId, discordChannelId }) => {
        try {
          // Nutzer-Details aus dem Cache oder API abrufen
          const userDetails =
            userDetailsCache.get(userId) ||
            (await getTwitchStreamerDetails(userId));

          if (!userDetails) {
            console.warn(`Kein Benutzer mit ID ${userId} gefunden.`);
            return;
          }
          userDetailsCache.set(userId, userDetails);

          const streamDetails = await getTwitchStreamDetails(userId);
          const currentlyLive = !!streamDetails;

          await updateStreamerInfo(userId, {
            user_name: userDetails.login,
            display_name: userDetails.display_name,
          });

          await processStreamStatus(
            client,
            userId,
            discordChannelId,
            currentlyLive,
            streamDetails,
            userDetails
          );

          console.log(
            `Streamer ${userDetails.display_name} (ID: ${userId}) erfolgreich verarbeitet.`
          );
        } catch (error) {
          console.error(
            `Fehler beim Verarbeiten von Streamer ${userId} (${discordChannelId}):`,
            error
          );
        }
      })
    );
  } catch (error) {
    console.error("Fehler beim Überprüfen der Twitch-Streamer:", error);
  }
}

export default checkTwitchLive;
