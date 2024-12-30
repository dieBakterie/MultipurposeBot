// src/database/twitchDatabase.ts
itchDatabase.js
import { db } from "./database.js";
import { validateStreamer } from "../services/Twitch/twitch.js";
import { logAndThrowError } from "../utils/helpers.js";
import { twitchFeedbackError } from "../alias.js";

/**
 * Synchronisiert die `discord_channel_name`-Felder basierend auf der `discord_channel_id`.
 * @param {Guild} guild - Die Discord-Guild.
 */
export async function syncChannelNames(guild) {
  try {
    const query = `SELECT discord_channel_id FROM twitch_streamers;`;
    const result = await db.query(query);

    for (const row of result.rows) {
      const channel = guild.channels.cache.get(row.discord_channel_id);

      if (channel && channel.name) {
        const updateQuery = `
          UPDATE twitch_streamers
          SET discord_channel_name = $1, updated_at = CURRENT_TIMESTAMP
          WHERE discord_channel_id = $2;
        `;
        await db.query(updateQuery, [channel.name, row.discord_channel_id]);
        console.log(
          `Synchronisiert: Kanal ID "${row.discord_channel_id}" → Name "${channel.name}"`
        );
      }
    }
  } catch (error) {
    logAndThrowError("Fehler beim Synchronisieren der Kanalnamen", error);
  }
}

/**
 * Fügt einen Twitch-Streamer hinzu.
 * @param {string} providedUserName - Twitch-Benutzername.
 * @param {string} discordChannelId - Discord-Kanal-ID.
 * @param {Guild} guild - Die Discord-Guild, um den Kanalnamen zu ermitteln.
 */
export async function addTwitchChannel(providedUserName, discordChannelId, guild) {
  if (!providedUserName || typeof providedUserName !== "string") {
    throw new Error("Der Benutzername muss ein gültiger String sein.");
  }

  try {
    // Discord-Kanalnamen abrufen
    const channel = guild.channels.cache.get(discordChannelId);
    if (!channel) {
      throw new Error(`Discord-Kanal mit ID "${discordChannelId}" nicht gefunden.`);
    }
    const discordChannelName = channel.name;

    // Streamerinformationen validieren
    const streamer = await validateStreamer(providedUserName);

    if (!streamer) {
      throw new Error(`Streamer "${providedUserName}" konnte nicht validiert werden.`);
    }

    const {
      id: streamerId,
      broadcaster_login: userName,
      display_name: displayName,
    } = streamer;

    // Streamer in der Datenbank speichern
    const query = `
      INSERT INTO twitch_streamers (user_name, display_name, user_id, discord_channel_id, discord_channel_name, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (user_name) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        display_name = EXCLUDED.display_name,
        discord_channel_id = EXCLUDED.discord_channel_id,
        discord_channel_name = EXCLUDED.discord_channel_name,
        updated_at = CURRENT_TIMESTAMP;
    `;
    const result = await db.query(query, [
      userName,
      displayName,
      streamerId,
      discordChannelId,
      discordChannelName,
    ]);

    return {
      success: true,
      data: result.rows[0],
      message: `Streamer "${displayName}" erfolgreich hinzugefügt.`,
    };
  } catch (error) {
    logAndThrowError(
      `${twitchFeedbackError.emoji} Fehler beim Hinzufügen des Streamers "${providedUserName}"`,
      error
    );
  }
}

/**
 * Setzt oder aktualisiert den Discord-Kanal für einen Streamer.
 * @param {string} userName - Twitch-Benutzername.
 * @param {string} discordChannelId - Discord-Kanal-ID.
 * @param {Guild} guild - Die Discord-Guild, um den Kanalnamen zu ermitteln.
 */
export async function setDiscordChannelForStreamer(userName, discordChannelId, guild) {
  if (!userName || typeof userName !== "string") {
    throw new Error("Der Benutzername muss ein gültiger String sein.");
  }

  try {
    const channel = guild.channels.cache.get(discordChannelId);
    if (!channel) {
      throw new Error(`Discord-Kanal mit ID "${discordChannelId}" nicht gefunden.`);
    }

    const query = `
      UPDATE twitch_streamers
      SET discord_channel_id = $2, discord_channel_name = $3, updated_at = CURRENT_TIMESTAMP
      WHERE user_name = $1
      RETURNING user_name, display_name, discord_channel_id, discord_channel_name, updated_at;
    `;
    const result = await db.query(query, [
      userName,
      discordChannelId,
      channel.name,
    ]);

    if (result.rowCount === 0) {
      return {
        success: false,
        message: `Streamer "${userName}" nicht gefunden.`,
      };
    }

    const updatedStreamer = result.rows[0];
    return {
      success: true,
      data: updatedStreamer,
      message: `Discord-Kanal für "${updatedStreamer.display_name}" erfolgreich aktualisiert: ${updatedStreamer.discord_channel_name}.`,
    };
  } catch (error) {
    logAndThrowError(
      `Fehler beim Setzen des Discord-Kanals für "${userName}"`,
      error
    );
  }
}

/**
 * Entfernt einen Twitch-Streamer.
 * @param {string} userName - Twitch-Benutzername.
 */
export async function removeTwitchChannel(userName) {
  try {
    const query = `
      DELETE FROM twitch_streamers
      WHERE user_name = $1
      RETURNING *;
    `;
    const result = await db.query(query, [userName]);

    if (result.rowCount === 0) {
      return {
        success: false,
        message: `Streamer "${userName}" nicht gefunden.`,
      };
    }

    return {
      success: true,
      message: `Streamer "${result.rows[0].display_name}" wurde entfernt.`,
    };
  } catch (error) {
    logAndThrowError(
      `Fehler beim Entfernen des Streamers "${userName}"`,
      error
    );
  }
}

/**
 * Ruft alle Twitch-Streamer ab.
 */
export async function getTrackedTwitchChannels() {
  try {
    const query = `
      SELECT user_id, user_name, display_name, discord_channel_id, discord_channel_name, created_at, updated_at
      FROM twitch_streamers
      ORDER BY user_name;
    `;
    const result = await db.query(query);

    if (result.rowCount === 0) {
      return [];
    }

    return result.rows.map((row) => ({
      userId: row.user_id,
      userName: row.user_name,
      displayName: row.display_name,
      discordChannelId: row.discord_channel_id,
      discordChannelName: row.discord_channel_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (error) {
    logAndThrowError(
      `${twitchFeedbackError.emoji} Fehler beim Abrufen der Twitch-Streamer`,
      error
    );
  }
}

/**
 * Aktualisiert Twitch-Benutzernamen und Displaynamen.
 * @param {string} userId - Twitch-User-ID.
 * @param {Object} streamerDetails - Details des Streamers.
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
      `Fehler beim Aktualisieren der Streamer-Daten für ${userId}`,
      error
    );
  }
}
