import { db } from "./database.js";
import { searchTwitchUser } from "../services/twitch.js"; // Funktion, die die Twitch API aufruft

// Utility für Fehlerbehandlung
function logAndThrowError(message, error) {
  console.error(`${message}:, error.message`, error);
  throw new Error(message);
}

/**
 * Fügt einen Twitch-Streamer hinzu.
 */
export async function addTwitchChannel(
  streamername,
  discordChannelName = null,
  discordChannelId = null
) {
  if (!streamername || typeof streamername !== "string") {
    throw new Error("Der Benutzername muss ein gültiger String sein.");
  }

  try {
    const streamers = await searchTwitchUser(streamername);

    if (!Array.isArray(streamers)) {
      throw new Error(
        `Unerwartetes Format von searchTwitchUser. Erwartet ein Array, erhalten: ${typeof streamers}`
      );
    }

    const streamer = streamers.find(
      (s) => s.display_name.toLowerCase() === streamername.toLowerCase()
    );

    if (!streamer) {
      throw new Error(`Streamer "${streamername}" existiert nicht.`);
    }

    const { id: streamerId, display_name: displayName } = streamer;

    const query = ` 
      INSERT INTO twitch_streamers (streamer_name, streamer_id, discord_channel_id, discord_channel_name, created_at, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (streamer_name) DO UPDATE SET
        streamer_id = EXCLUDED.streamer_id,
        discord_channel_id = COALESCE(EXCLUDED.discord_channel_id, twitch_streamers.discord_channel_id),
        updated_at = CURRENT_TIMESTAMP;
    `;
    const result = await db.query(query, [
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
      `${TwitchUserFeedbackErrorEmoji} Fehler beim Hinzufügen des Streamers "${streamername}"`,
      error
    );
  }
}

/**
 * Setzt oder aktualisiert den Discord-Kanal für einen Streamer.
 */
export async function setDiscordChannelForStreamer(
  streamername,
  discordChannelName,
  discordChannelId
) {
  if (!streamername || typeof streamername !== "string") {
    throw new Error("Der Benutzername muss ein gültiger String sein.");
  }

  try {
    const query = `
      UPDATE twitch_streamers
      SET discord_channel_id = $1, discord_channel_name = $2, updated_at = CURRENT_TIMESTAMP
      WHERE streamer_name = $3
      RETURNING *;
    `;
    const result = await db.query(query, [
      discordChannelId,
      discordChannelName,
      streamername,
    ]);

    if (result.rowCount === 0) {
      return {
        success: false,
        message: `Streamer "${streamername}" nicht gefunden.`,
      };
    }

    return {
      success: true,
      data: result.rows[0],
      message: `Discord-Kanal für "${streamername}" geändert: ${discordChannelName} (${discordChannelId})`,
    };
  } catch (error) {
    logAndThrowError(
      `${TwitchUserFeedbackErrorEmoji} Fehler beim Setzen des Discord-Kanals für "${streamername}"`,
      error
    );
  }
}

/**
 * Ruft den Discord-Kanal für einen Streamer ab.
 */
export async function getDiscordChannelForStreamer(streamername) {
  const streamer = await getTwitchChannelByField("streamer_name", streamername);
  return streamer ? streamer.discord_channel_id : null;
}

/**
 * Entfernt einen Streamer aus der Datenbank.
 */
export async function removeTwitchChannel(streamername) {
  try {
    const query = ` 
      DELETE FROM twitch_streamers
      WHERE streamer_name = $1;
    `;
    const result = await db.query(query, [streamername]);

    if (result.rowCount === 0) {
      return {
        success: false,
        message: `Streamer "${streamername}" nicht gefunden.`,
      };
    }

    return {
      success: true,
      message: `Streamer "${streamername}" wurde entfernt.`,
    };
  } catch (error) {
    logAndThrowError(
      `${TwitchUserFeedbackErrorEmoji} Fehler beim Entfernen des Streamers "${streamername}"`,
      error
    );
  }
}

/**
 * Ruft alle überwachten Streamer ab.
 */
export async function getTrackedTwitchChannels() {
  try {
    const query = ` 
      SELECT streamer_name, discord_channel_name, discord_channel_id, created_at, updated_at
      FROM twitch_streamers
      ORDER BY streamer_name;
    `;
    const result = await db.query(query);

    if (result.rowCount === 0) {
      return [];
    }

    return result.rows;
  } catch (error) {
    logAndThrowError(
      `${TwitchUserFeedbackErrorEmoji} Fehler beim Abrufen der überwachten Streamer`,
      error
    );
  }
}
