// src/database/youtubeDatabase.js
import { executeQuery } from "../utils/databaseUtils.js";
import { createSuccessResponse, logAndThrowError } from "../utils/helpers.js";
import { validateValue, validateFields } from "../utils/validation.js";
import { youtubeFeedbackError, youtubeFeedbackSuccess } from "../alias.js";

/**
 * Fügt einen YouTube-Kanal hinzu oder aktualisiert den neuesten Video-Status
 */
export async function addYouTubeChannel(
  userId,
  userName,
  latestVideoId,
  discordChannelId,
  discordChannelName
) {
  validateFields({
    user_id: userId,
    user_name: userName,
    latest_video_id: latestVideoId,
    discord_channel_id: discordChannelId,
    discord_channel_name: discordChannelName
  });

  try {
    const result = await executeQuery('INSERT', 'youtubers', {
      user_id: userId,
      user_name: userName,
      latest_video_id: latestVideoId,
      discord_channel_id: discordChannelId,
      discord_channel_name: discordChannelName,
      created_at: 'CURRENT_TIMESTAMP',
      updated_at: 'CURRENT_TIMESTAMP'
    }, {}, {
      target: 'user_id',
      action: 'UPDATE SET user_name = EXCLUDED.user_name, latest_video_id = EXCLUDED.latest_video_id'
    });
    return createSuccessResponse(true, result.rows[0], `${youtubeFeedbackSuccess.emoji} YouTube-Kanal "${userName}" erfolgreich hinzugefügt oder aktualisiert.`);
  } catch (error) {
    logAndThrowError(youtubeFeedbackError.emoji, `Fehler beim Hinzufügen oder Aktualisieren des YouTube-Kanals "${userName}"`, error);
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
  validateFields({
    user_name: userName,
    discord_channel_id: discordChannelId,
    discord_channel_name: discordChannelName
  });

  try {
    const result = await executeQuery('UPDATE', 'youtubers', {
      discord_channel_id: discordChannelId,
      discord_channel_name: discordChannelName,
      updated_at: 'CURRENT_TIMESTAMP'
    }, {
      user_name: userName
    });

    if (result.rowCount === 0) {
      return createSuccessResponse(false, `YouTube-Kanal "${userName}" nicht gefunden.`);
    }

    return createSuccessResponse(true, `${youtubeFeedbackSuccess.emoji} Discord-Kanal für "${userName}" erfolgreich aktualisiert.`, result.rows[0]);
  } catch (error) {
    logAndThrowError(youtubeFeedbackError.emoji, `Fehler beim Setzen des Discord-Kanals für "${userName}"`, error);
  }
}

/**
 * Entfernt einen YouTube-Kanal aus der Datenbank
 */
export async function removeYouTubeChannel(userName) {
  validateValue(userName, "user_name");
  try {
    await executeQuery('DELETE', 'youtubers', {}, {
      user_name: userName
    });
    return createSuccessResponse(true, `${youtubeFeedbackSuccess.emoji}YouTube-Kanal "${userName}" erfolgreich entfernt.`);
  } catch (error) {
    logAndThrowError(youtubeFeedbackError.emoji, `Fehler beim Entfernen des YouTube-Kanals "${userName}"`, error);
  }
}

/**
 * Ruft einen YouTube-Kanal anhand eines Feldes ab.
 */
export async function getYouTubeChannelByField(field, value) {
  validateValue(field, "field", "string");
  validateValue(value, "value", "string");
  try {
    const result = await executeQuery('SELECT', 'youtubers', {}, {
      [field]: value
    });
    return createSuccessResponse(true, `${youtubeFeedbackSuccess.emoji} YouTube-Kanal mit ${field} = "${value}" erfolgreich abgerufen.`, result.rows[0] || null);
  } catch (error) {
    logAndThrowError(youtubeFeedbackError.emoji, `Fehler beim Abrufen des YouTube-Kanals mit ${field} = "${value}"`, error);
  }
}

/**
 * Ruft alle überwachten YouTube-Kanäle ab.
 */
export async function getTrackedYouTubeChannels() {
  try {
    const result = await executeQuery('SELECT', 'youtubers');
    return createSuccessResponse(true, `${youtubeFeedbackSuccess.emoji} Überwachte YouTube-Kanäle erfolgreich abgerufen.`, result.rows);
  } catch (error) {
    logAndThrowError(youtubeFeedbackError.emoji, "Fehler beim Abrufen der überwachten YouTube-Kanäle", error);
  }
}
