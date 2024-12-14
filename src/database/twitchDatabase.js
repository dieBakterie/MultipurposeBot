import { db } from "./database.js";
import { searchTwitchChannel } from "../services/twitch.js"; // Funktion, die die Twitch API aufruft

// Utility für Fehlerbehandlung
function logAndThrowError(message, error) {
  console.error(`${message}:`, error.message);
  throw new Error(message);
}

/**
 * Fügt einen Twitch-Streamer hinzu.
 */
export async function addTwitchChannel(streamername, discordChannelId = null) {
  if (!streamername || typeof streamername !== "string") {
    throw new Error("Der Benutzername muss ein gültiger String sein.");
  }

  try {
    const streamers = await searchTwitchChannel(streamername);
    const streamer = streamers.find(
      (s) => s.display_name.toLowerCase() === streamername.toLowerCase()
    );

    if (!streamer) {
      throw new Error(`Streamer "${streamername}" existiert nicht.`);
    }

    const { id: streamerId, display_name: displayName } = streamer;

    const query = `
      INSERT INTO twitch_streamers (streamer_name, streamer_id, discord_channel_id, created_at, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (streamer_name) DO UPDATE SET
        streamer_id = EXCLUDED.streamer_id,
        discord_channel_id = COALESCE(EXCLUDED.discord_channel_id, twitch_streamers.discord_channel_id),
        updated_at = CURRENT_TIMESTAMP;
    `;
    await db.query(query, [displayName, streamerId, discordChannelId]);

    console.log(`Streamer "${displayName}" erfolgreich hinzugefügt.`);
  } catch (error) {
    logAndThrowError(
      `Fehler beim Hinzufügen des Streamers "${streamername}"`,
      error
    );
  }
}

/**
 * Setzt oder aktualisiert den Discord-Kanal für einen Streamer.
 */
export async function setDiscordChannelForStreamer(streamername, discordChannelId) {
  if (!streamername || typeof streamername !== "string") {
    throw new Error("Der Benutzername muss ein gültiger String sein.");
  }

  try {
    const query = `
      UPDATE twitch_streamers
      SET discord_channel_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE streamer_name = $2
      RETURNING *;
    `;
    const result = await db.query(query, [discordChannelId, streamername]);

    if (result.rowCount === 0) {
      console.log(`Streamer "${streamername}" nicht gefunden.`);
      return null;
    }

    console.log(
      `Discord-Kanal für "${streamername}" geändert: ${discordChannelId}`
    );
    return result.rows[0];
  } catch (error) {
    logAndThrowError(
      `Fehler beim Setzen des Discord-Kanals für "${streamername}"`,
      error
    );
  }
}

/**
 * Ruft einen Streamer anhand eines Felds ab.
 */
export async function getTwitchChannelByField(field, value) {
  const query = `
    SELECT *
    FROM twitch_streamers
    WHERE ${field} = $1;
  `;
  const result = await db.query(query, [value]);
  return result.rowCount > 0 ? result.rows[0] : null;
}

/**
 * Ruft den Discord-Kanal für einen Streamer ab.
 */
export async function getDiscordChannelForStreamer(streamername) {
  const streamer = await getStreamerByField("streamer_name", streamername);
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
      console.log(`Streamer "${streamername}" nicht gefunden.`);
      return {
        success: false,
        message: `Streamer "${streamername}" nicht gefunden.`,
      };
    }

    console.log(`Streamer "${streamername}" wurde entfernt.`);
    return { success: true, message: `Streamer "${streamername}" wurde entfernt.` };
  } catch (error) {
    logAndThrowError(
      `Fehler beim Entfernen des Streamers "${streamername}"`,
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
      SELECT streamer_name, discord_channel_id, created_at, updated_at
      FROM twitch_streamers
      ORDER BY streamer_name;
    `;
    const result = await db.query(query);

    if (result.rowCount === 0) {
      console.log("Keine überwachten Streamer gefunden.");
      return [];
    }

    return result.rows.map((row) => ({
      streamername: row.streamername,
      discordChannelId: row.discord_channel_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (error) {
    logAndThrowError("Fehler beim Abrufen der überwachten Streamer", error);
  }
}
