// src/database/twitchDatabase.js
import { getTwitchStreamerDetails } from "../services/Twitch/twitch.js";
import { twitchFeedbackError, twitchFeedbackInfo, twitchFeedbackSuccess } from "../alias.js";
import { logAndThrowError, createSuccessResponse } from "../utils/helpers.js";
import { validateValue, validateFields } from "../utils/validation.js";
import { buildConflictStrategy, handleDatabaseError, executeQuery } from '../utils/databaseUtils.js';

const streamerCache = new Map();

/**
 * Synchronisiert die `discord_channel_name`-Felder basierend auf der `discord_channel_id`.
 * @param {Guild} guild - Die Discord-Guild.
 */
export async function syncChannelNames(guild) {
  try {
    validateValue(guild, "guild", "object", twitchFeedbackError.emoji);

    const result = await executeQuery('SELECT', 'twitch_streamers', {}, {});

    const updates = [];
    for (const row of result.rows) {
      const channel = guild.channels.cache.get(row.discord_channel_id);

      if (channel && channel.name) {
        updates.push({ id: row.discord_channel_id, name: channel.name });
      }
    }

    if (updates.length > 0) {
      for (const update of updates) {
        await executeQuery('UPDATE', 'twitch_streamers', {
          discord_channel_name: update.name
        }, {
          discord_channel_id: update.id
        }, {
          conflict: {
            target: 'discord_channel_id',
            action: 'UPDATE SET discord_channel_name = EXCLUDED.discord_channel_name'
          }
        });
      }

      console.log(`Synchronisiert: ${updates.length} Kanalnamen.`, updates);
      return createSuccessResponse(
        true,
        twitchFeedbackSuccess.emoji,
        `${updates.length} Kanalnamen erfolgreich synchronisiert.`,
        updates
      );
    }

    console.log("Keine Kanalnamen zu synchronisieren.");
    return createSuccessResponse(true, twitchFeedbackSuccess.emoji, "Keine Kanalnamen zum Synchronisieren.");
  } catch (error) {
    logAndThrowError(
      twitchFeedbackError.emoji,
      error,
      "Fehler beim Synchronisieren der Kanalnamen"
    );
  }
}

/**
 * Aktualisiert den Discord-Kanal für Benachrichtigungen eines Twitch-Kanals.
 * @param {string} userName - Twitch-Benutzername.
 * @param {string} discordChannelId - Discord-Kanal-ID.
 * @param {string} discordChannelName - Discord-Kanal-Name.
 * @returns {Promise<Object>} - Antwort mit Erfolgsmeldung.
 */
export async function setDiscordChannelForStreamer(
  userName,
  discordChannelId,
  discordChannelName
) {
  try {
    validateFields({
      user_name: userName,
      discord_channel_id: discordChannelId,
      discord_channel_name: discordChannelName,
    }, twitchFeedbackError.emoji);

    const conflictStrategy = buildConflictStrategy('user_name', {
      discord_channel_id: discordChannelId,
      discord_channel_name: discordChannelName,
    });

    await executeQuery('UPDATE', 'twitch_streamers', {
      discord_channel_id: discordChannelId,
      discord_channel_name: discordChannelName,
      updated_at: 'CURRENT_TIMESTAMP',
    }, {
      user_name: userName,
    }, conflictStrategy);

    return createSuccessResponse(
      true,
      twitchFeedbackSuccess.emoji,
      `Discord-Kanal für "${userName}" erfolgreich aktualisiert.`,
    );
  } catch (error) {
    handleDatabaseError(error, `Setzen des Discord-Kanals für "${userName}"`, twitchFeedbackError.emoji);
  }
}

/**
 * Fügt einen Twitch-Streamer hinzu oder aktualisiert den Discord-Kanal.
 * @param {string} userId - Twitch-Benutzer-ID.
 * @param {string} streamerName - Twitch-Benutzername.
 * @param {string} displayName - Twitch-Anzeigename.
 * @param {string} discordChannelId - Discord-Kanal-ID.
 * @param {Guild} guild - Die Discord-Guild.
 */
export async function addTwitchChannel(
  userId,
  streamerName,
  displayName,
  discordChannelId,
  guild
) {
  try {
    validateFields({
      user_id: userId,
      streamer_name: streamerName,
      display_name: displayName,
      discord_channel_id: discordChannelId,
      guild,
    }, twitchFeedbackError.emoji);

    if (!guild.channels.cache.get(discordChannelId)) {
      logAndThrowError(
        twitchFeedbackError.emoji,
        `Discord-Kanal "${discordChannelId}" existiert nicht.`
      );
    }

    const streamers = await getTwitchStreamerDetails(userId);
    validateValue(streamers, "streamers", "array", twitchFeedbackInfo.emoji);

    const streamer = streamers.find(
      (s) => s.display_name.toLowerCase() === streamerName.toLowerCase()
    );

    validateValue(streamer, "streamer", "object", twitchFeedbackInfo.emoji);

    const existingStreamer = await executeQuery('SELECT', 'twitch_streamers', {}, {
      user_name: streamerName
    });

    if (existingStreamer.rows.length > 0) {
      return createSuccessResponse(
        false,
        twitchFeedbackInfo.emoji,
        `Streamer "${displayName}" ist bereits hinzugefügt.`
      );
    }

    await executeQuery('INSERT', 'twitch_streamers', {
      user_id: userId,
      user_name: streamerName,
      display_name: displayName,
      discord_channel_id: discordChannelId,
      guild_id: guild.id,
    });

    streamerCache.clear();
    return createSuccessResponse(
      true,
      twitchFeedbackSuccess.emoji,
      `Streamer "${streamerName}" erfolgreich hinzugefügt.`
    );
  } catch (error) {
    handleDatabaseError(error, `Hinzufügen des Twitch-Kanals "${streamerName}"`, twitchFeedbackError.emoji);
  }
}

/**
 * Entfernt einen Twitch-Kanal aus der Datenbank
 * @param {string} userName - Der Twitch-Username des Kanals
 * @returns {Promise<Object>} - Ein Objekt mit `success` und `message`-Property, optional mit `data`-Property (siehe unten)
 * @property {boolean} success - Gibt an, ob der Vorgang erfolgreich war
 * @property {string} message - Eine Nachricht, die den Erfolg oder Misserfolg des Vorgangs beschreibt
 * @property {Object} [data] - Ein Objekt mit Metadaten, falls der Vorgang erfolgreich war (siehe unten)
 * @property {string} data.userName - Der Twitch-Username des entfernten Kanals
 * @property {string} data.removedAt - Das Datum und die Uhrzeit der Entfernung im ISO-Format (z.B. "2022-12-31T12:00:00.000Z")
 */
export async function removeTwitchChannel(userName) {
  try {
    validateFields({
      user_name: userName
    }, twitchFeedbackError.emoji, "Ungültiger Twitch-Username");

    await executeQuery('DELETE', 'twitch_streamers', {}, {
      user_name: userName
    }, {
      conflict: {
        target: 'user_name',
        action: 'DELETE'
      }
    });

    console.log(`Entferne Twitch-Kanal "${userName}" aus der Datenbank.`);
    // Entferne nur relevante Filter aus dem Cache
    streamerCache.forEach((_, key) => {
      if (key.includes(userName.toLowerCase())) {
        streamerCache.delete(key);
      }
    });

    return createSuccessResponse(
      true,
      `Twitch-Kanal "${userName}" erfolgreich entfernt.`,
      { userName, removedAt: new Date().toISOString() }
    );
  } catch (error) {
    logAndThrowError(
      twitchFeedbackError.emoji,
      `Fehler beim Entfernen des Twitch-Kanals "${userName}"`,
      error
    );
  }
}

/**
 * Ruft alle überwachten Twitch-Streamer ab.
 */
export async function getTrackedStreamers(filter = "") {
  try {
    const result = await executeQuery('SELECT', 'twitch_streamers', {}, { filter });
    return createSuccessResponse(true, 'Verfolgte Streamer erfolgreich abgerufen.', result.rows);
  } catch (error) {
    logAndThrowError(
      twitchFeedbackError.emoji,
      "Fehler beim Abrufen der überwachten Twitch-Streamer",
      error
    );
  }
}

/**
 * Holt die gespeicherten Twitch-Streamer aus dem Cache oder der Datenbank.
 * @param {string} [filter=""] - Optionaler Filter für die Streamer-Suche.
 * @returns {Promise<Object[]>} - Liste der gespeicherten Streamer.
 */
export async function getCachedTrackedStreamers(filter = "") {
  // Normalisiere den Filter für konsistente Schlüssel im Cache
  const normalizedFilter = filter.trim().toLowerCase();
  const cacheEntry = streamerCache.get(normalizedFilter);

  // Prüfe, ob ein gültiger Cache-Eintrag vorhanden ist
  if (cacheEntry && cacheEntry.expiry > Date.now()) {
    console.log(`Cache-Hit für Filter: "${normalizedFilter}"`);
    return createSuccessResponse(true, twitchFeedbackSuccess.emoji, 'Streamer erfolgreich aus Cache abgerufen.', cacheEntry.data);
  }

  console.log(
    `Cache-Miss für Filter: "${normalizedFilter}". Abfrage aus Datenbank.`
  );

  // Abfrage der Datenbank, wenn keine gültigen Cache-Treffer existieren
  const result = await getTrackedStreamers(normalizedFilter);

  // Speichere die Daten mit einer TTL von 5 Minuten
  streamerCache.set(normalizedFilter, {
    data: result,
    expiry: Date.now() + 5 * 60 * 1000, // Ablaufzeit: 5 Minuten
  });

  return createSuccessResponse(true, twitchFeedbackSuccess.emoji, 'Streamer erfolgreich aus Datenbank abgerufen.', result);
}

/**
 * Aktualisiert die Details eines Twitch-Streamers in der Datenbank.
 * @param {string} userId - Die Twitch-Benutzer-ID des Streamers.
 * @param {Object} streamerDetails - Die aktualisierten Details des Streamers:
 *   `user_name` und `display_name`.
 * @returns {Promise<void>} - Ein Promise, das erfüllt wird, wenn die Aktualisierung
 *   erfolgreich war oder ein Fehler aufgetreten ist.
 */
export async function updateStreamerInfo(userId, streamerDetails) {
  try {
    validateFields({
      user_id: userId,
      user_name: streamerDetails.user_name,
      display_name: streamerDetails.display_name,
    }, twitchFeedbackError.emoji, `Ungültige Streamer-Daten für ${userId}: user_name=${streamerDetails.user_name}, display_name=${streamerDetails.display_name}`);

    const result = await executeQuery('SELECT', 'twitch_streamers', {}, {
      user_id: userId
    }, { forUpdate: true });
    const currentStreamerDetails = result.rows[0];

    if (
      currentStreamerDetails.user_name !== streamerDetails.user_name ||
      currentStreamerDetails.display_name !== streamerDetails.display_name
    ) {
      console.log("Aktualisiere Streamer-Info für:", {
        userId,
        streamerDetails,
      });

      await executeQuery('UPDATE', 'twitch_streamers', {
        user_name: streamerDetails.user_name,
        display_name: streamerDetails.display_name,
        updated_at: 'CURRENT_TIMESTAMP'
      }, {
        user_id: userId
      }, {
        conflict: {
          target: 'user_id',
          action: 'UPDATE SET user_name = EXCLUDED.user_name, display_name = EXCLUDED.display_name'
        }
      });

      console.log(
        `Streamer-Info erfolgreich aktualisiert: ${streamerDetails.user_name}`
      );
      return createSuccessResponse(true, twitchFeedbackSuccess.emoji, `Streamer-Info erfolgreich aktualisiert.`);
    } else {
      console.log(
        `Streamer-Info für ${userId} ist bereits auf dem neuesten Stand.`
      );
      return createSuccessResponse(true, twitchFeedbackInfo.emoji, `Streamer-Info ist bereits auf dem neuesten Stand.`);
    }
  } catch (error) {
    logAndThrowError(
      twitchFeedbackError.emoji,
      `Fehler beim Aktualisieren der Streamer-Info für ${userId}`,
      error
    );
  }
}
