import { db } from "./database.js";

// Füge einen YouTube-Kanal hinzu oder aktualisiere den neuesten Video-Status
export async function addYouTubeChannel(channelId, latestVideoId) {
  try {
    const query = `
      INSERT INTO youtubers (channel_id, latest_video_id, created_at, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (channel_id) DO UPDATE SET
        latest_video_id = $2,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const result = await db.query(query, [channelId, latestVideoId]);
    return result.rows[0]; // Gibt den aktualisierten oder hinzugefügten Kanal zurück
  } catch (error) {
    console.error(
      `Fehler beim Hinzufügen oder Aktualisieren des YouTube-Kanals:`,
      error.message
    );
    throw error;
  }
}

// Entferne einen YouTube-Kanal
export async function removeYouTubeChannel(channelId) {
  try {
    const query = "DELETE FROM youtubers WHERE channel_id = $1";
    const result = await db.query(query, [channelId]);
    return result.rowCount > 0; // Gibt true zurück, wenn ein Kanal entfernt wurde
  } catch (error) {
    console.error(`Fehler beim Entfernen des YouTube-Kanals:`, error.message);
    throw error;
  }
}

// Liste alle überwachten YouTube-Kanäle
export async function listYouTubeChannels() {
  try {
    const query = `
      SELECT channel_id, latest_video_id, created_at, updated_at
      FROM youtubers
      ORDER BY created_at DESC;
    `;
    const result = await db.query(query);
    return result.rows; // Gibt die Liste der Kanäle zurück
  } catch (error) {
    console.error(`Fehler beim Abrufen der YouTube-Kanalliste:`, error.message);
    throw error;
  }
}
