// src/database/twitchDatabase.js
import { db } from "./database.js";
import { searchStreamer } from "../services/Twitch/twitch.js";
import { twitchFeedbackError } from "../alias.js";
import { logAndThrowError } from "../utils/helpers.js";

/**
 * Synchronisiert die `discord_channel_name`-Felder basierend auf der `discord_channel_id`.
 * @param {Guild} guild - Die Discord-Guild.
 */
export async function syncChannelNames(guild) {
  try {
    const query = `SELECT discord_channel_id FROM twitch_streamers;`;
    const result = await db.query(query);

    const updates = [];
    for (const row of result.rows) {
      const channel = guild.channels.cache.get(row.discord_channel_id);

      if (channel && channel.name) {
        updates.push({ id: row.discord_channel_id, name: channel.name });
      }
    }

    if (updates.length > 0) {
      const updateQuery = `
        UPDATE twitch_streamers
        SET discord_channel_name = data.new_name
        FROM (VALUES ${updates
          .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
          .join(", ")}) AS data(old_id, new_name)
        WHERE twitch_streamers.discord_channel_id = data.old_id;
      `;
      const updateParams = updates.flatMap((u) => [u.id, u.name]);
      await db.query(updateQuery, updateParams);

      console.log(`Synchronisiert: ${updates.length} Kanalnamen.`);
    }
  } catch (error) {
    console.error("Fehler beim Synchronisieren der Kanalnamen:", error);
  }
}

/**
 * Fügt einen Twitch-Streamer hinzu.
 * @param {string} streamerName - Twitch-Benutzername.
 * @param {string} discordChannelId - Discord-Kanal-ID.
 */
export async function addTwitchChannel(streamerName, discordChannelId) {
  if (!streamerName || typeof streamerName !== "string") {
    throw new Error("Der Benutzername muss ein gültiger String sein.");
  }

  try {
    // Prüfen, ob der Discord-Kanal existiert
    const channelExists = await db.query(
      `SELECT 1 FROM discord_channels WHERE id = $1`,
      [discordChannelId]
    );

    if (channelExists.rowCount === 0) {
      throw new Error(`Discord-Kanal "${discordChannelId}" existiert nicht.`);
    }

    // Streamerinformationen abrufen
    const streamers = await searchStreamer(streamerName);

    if (!Array.isArray(streamers)) {
      throw new Error(
        `Unerwartetes Format von searchTwitchUser. Erwartet ein Array, erhalten: ${typeof streamers}`
      );
    }

    const streamer = streamers.find(
      (s) => s.display_name.toLowerCase() === streamerName.toLowerCase()
    );

    if (!streamer) {
      throw new Error(`Streamer "${streamerName}" existiert nicht.`);
    }

    const {
      user_name: userName,
      display_name: displayName,
      id: streamerId,
    } = streamer;

    // Streamer in der Datenbank speichern
    const query = `
      INSERT INTO twitch_streamers (user_name, display_name, user_id, discord_channel_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (user_name) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        display_name = EXCLUDED.display_name,
        discord_channel_id = EXCLUDED.discord_channel_id,
        updated_at = CURRENT_TIMESTAMP;
    `;
    const result = await db.query(query, [
      userName,
      displayName,
      streamerId,
      discordChannelId,
    ]);

    return {
      success: true,
      data: result.rows[0],
      message: `Streamer "${displayName}" erfolgreich hinzugefügt.`,
    };
  } catch (error) {
    logAndThrowError(
      `${twitchFeedbackError.emoji} Fehler beim Hinzufügen des Streamers "${streamerName}"`,
      error
    );
  }
}

/**
 * Ruft alle überwachten Twitch-Streamer ab.
 */
export async function getTrackedTwitchChannels() {
  try {
    const query = `
      SELECT user_name, display_name, user_id, discord_channel_id, created_at, updated_at
      FROM twitch_streamers
      ORDER BY user_name;
    `;
    const result = await db.query(query);

    if (result.rowCount === 0) {
      return [];
    }

    return result.rows.map((row) => ({
      userName: row.user_name,
      displayName: row.display_name,
      userId: row.user_id,
      discordChannelId: row.discord_channel_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (error) {
    logAndThrowError(
      `${twitchFeedbackError.emoji} Fehler beim Abrufen der überwachten Streamer`,
      error
    );
  }
}

/**
 * Aktualisiert `user_name` und `display_name` in der Datenbank.
 */
export async function updateStreamerInfo(userId, streamerDetails) {
  try {
    const query = `
      UPDATE twitch_streamers
      SET user_name = $1, display_name = $2, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $3;
    `;
    await db.query(query, [
      streamerDetails.user_name,
      streamerDetails.display_name,
      userId,
    ]);
  } catch (error) {
    logAndThrowError(
      `Fehler beim Aktualisieren der Streamer-Info für ${userId}`,
      error
    );
  }
}
