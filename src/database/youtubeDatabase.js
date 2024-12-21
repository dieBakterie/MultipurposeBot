// src/database/youtubeDatabase.js
import { db } from "./database.js";

// Utility für Fehlerbehandlung
function logAndThrowError(message, error) {
  console.error(`${message}:`, error.message);
  throw new Error(message);
}

/**
 * Fügt einen YouTube-Kanal hinzu oder aktualisiert den neuesten Video-Status
 */
export async function addYouTubeChannel(
  userName,
  userId,
  latestVideoId,
  discordChannelId = null,
  discordChannelName = null
) {
  if (!userName || typeof userName !== "string") {
    throw new Error("Der Benutzername muss ein gültiger String sein.");
  }

  try {
    const query = `
      INSERT INTO youtubers (user_id, user_name, latest_video_id, discord_channel_id, discord_channel_name, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) DO UPDATE SET
        user_name = EXCLUDED.user_name,
        latest_video_id = EXCLUDED.latest_video_id,
        discord_channel_id = COALESCE(EXCLUDED.discord_channel_id, youtubers.discord_channel_id),
        discord_channel_name = COALESCE(EXCLUDED.discord_channel_name, youtubers.discord_channel_name),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const result = await db.query(query, [
      userId,
      userName,
      latestVideoId,
      discordChannelId,
      discordChannelName,
    ]);
    return {
      success: true,
      data: result.rows[0],
      message: `YouTube-Kanal "${userName}" erfolgreich hinzugefügt oder aktualisiert.`,
    };
  } catch (error) {
    logAndThrowError(
      `Fehler beim Hinzufügen oder Aktualisieren des YouTube-Kanals "${userName}"`,
      error
    );
  }
}

/**
 * Setzt oder aktualisiert den Discord-Kanal für Benachrichtigungen eines YouTube-Kanals.
 */
export async function setDiscordChannelForYouTubeChannel(
  userName,
  discordChannelId,
  discordChannelName
) {
  if (!userName || typeof userName !== "string") {
    throw new Error("Der Benutzername muss ein gültiger String sein.");
  }

  try {
    const query = `
      UPDATE youtubers
      SET discord_channel_id = $1, discord_channel_name = $2, updated_at = CURRENT_TIMESTAMP
      WHERE user_name = $3
      RETURNING *;
    `;
    const result = await db.query(query, [
      discordChannelId,
      discordChannelName,
      userName,
    ]);

    if (result.rowCount === 0) {
      return {
        success: false,
        message: `YouTube-Kanal "${userName}" nicht gefunden.`,
      };
    }

    return {
      success: true,
      data: result.rows[0],
      message: `Discord-Kanal für "${userName}" erfolgreich aktualisiert.`,
    };
  } catch (error) {
    logAndThrowError(
      `Fehler beim Setzen des Discord-Kanals für "${userName}"`,
      error
    );
  }
}

/**
 * Entfernt einen YouTube-Kanal aus der Datenbank
 */
export async function removeYouTubeChannel(userName) {
  try {
    const query = `
      DELETE FROM youtubers
      WHERE user_name = $1;
    `;
    const result = await db.query(query, [userName]);

    if (result.rowCount === 0) {
      return {
        success: false,
        message: `YouTube-Kanal "${userName}" nicht gefunden.`,
      };
    }

    return {
      success: true,
      message: `YouTube-Kanal "${userName}" wurde entfernt.`,
    };
  } catch (error) {
    logAndThrowError(
      `Fehler beim Entfernen des YouTube-Kanals "${userName}"`,
      error
    );
  }
}

/**
 * Ruft einen YouTube-Kanal anhand eines Feldes ab.
 */
export async function getYouTubeChannelByField(field, value) {
  try {
    const query = `
      SELECT * FROM youtubers
      WHERE ${field} = $1;
    `;
    const result = await db.query(query, [value]);

    if (result.rowCount === 0) return null;

    return result.rows[0];
  } catch (error) {
    logAndThrowError("Fehler beim Abrufen des YouTube-Kanals", error);
  }
}

/**
 * Ruft alle überwachten YouTube-Kanäle ab.
 */
export async function getTrackedYouTubeChannels() {
  try {
    const query = `
      SELECT user_name, discord_channel_name, discord_channel_id, latest_video_id, created_at, updated_at
      FROM youtubers
      ORDER BY user_name;
    `;
    const result = await db.query(query);

    if (result.rowCount === 0) {
      return [];
    }

    return result.rows;
  } catch (error) {
    logAndThrowError(
      "Fehler beim Abrufen der überwachten YouTube-Kanäle",
      error
    );
  }
}
