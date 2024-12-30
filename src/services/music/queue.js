// src/services/Music/queue.js
const queue = new Map(); // GuildID => { songs: [], current: null, connection: null }

/**
 * Holt die Warteschlange für eine bestimmte Guild.
 * Wenn keine Warteschlange existiert, wird eine neue erstellt.
 * @param {string} guildId - Die ID der Guild
 * @returns {object} - Die Warteschlange für die Guild
 */
export function getQueue(guildId) {
  try {
    if (!guildId) throw new Error("Guild-ID ist erforderlich.");

    if (!queue.has(guildId)) {
      queue.set(guildId, { songs: [], current: null, connection: null });
    }
    return queue.get(guildId);
  } catch (error) {
    console.error(`Fehler in getQueue: ${error.message}`);
    throw error;
  }
}

/**
 * Entfernt die Warteschlange einer Guild vollständig.
 * @param {string} guildId - Die ID der Guild
 */
export function deleteQueue(guildId) {
  try {
    if (!guildId) throw new Error("Guild-ID ist erforderlich.");

    if (queue.has(guildId)) {
      queue.delete(guildId);
      console.log(`Warteschlange für Guild ${guildId} wurde entfernt.`);
    } else {
      console.warn(`Warteschlange für Guild ${guildId} existiert nicht.`);
    }
  } catch (error) {
    console.error(`Fehler in deleteQueue: ${error.message}`);
    throw error;
  }
}

/**
 * Gibt den aktuellen Song in der Warteschlange zurück.
 * @param {string} guildId - Die ID der Guild
 * @returns {object|null} - Der aktuelle Song oder null, wenn keiner läuft
 */
export function getCurrentSong(guildId) {
  try {
    if (!guildId) throw new Error("Guild-ID ist erforderlich.");

    if (!queue.has(guildId)) {
      console.warn(`Warteschlange für Guild ${guildId} existiert nicht.`);
      return null;
    }
    return queue.get(guildId).current;
  } catch (error) {
    console.error(`Fehler in getCurrentSong: ${error.message}`);
    throw error;
  }
}

/**
 * Gibt den nächsten Song in der Warteschlange zurück.
 * @param {string} guildId - Die ID der Guild
 * @returns {object|null} - Der nächste Song oder null, wenn die Warteschlange leer ist
 */
export function getNextSong(guildId) {
  try {
    if (!guildId) throw new Error("Guild-ID ist erforderlich.");

    if (!queue.has(guildId)) {
      console.warn(`Warteschlange für Guild ${guildId} existiert nicht.`);
      return null;
    }

    const guildQueue = getQueue(guildId);

    if (guildQueue.songs.length <= 1) {
      console.info(
        `Keine weiteren Songs in der Warteschlange für Guild ${guildId}.`
      );
      return null;
    }

    return guildQueue.songs[1];
  } catch (error) {
    console.error(`Fehler in getNextSong: ${error.message}`);
    throw error;
  }
}

/**
 * Überprüft, ob ein nächster Song in der Warteschlange existiert.
 * @param {string} guildId - Die ID der Guild
 * @returns {boolean} - True, wenn ein nächster Song existiert, sonst false
 */
export function hasNextSong(guildId) {
  try {
    if (!guildId) throw new Error("Guild-ID ist erforderlich.");

    if (!queue.has(guildId)) {
      console.warn(`Warteschlange für Guild ${guildId} existiert nicht.`);
      return false;
    }
    const guildQueue = getQueue(guildId);
    return guildQueue.songs.length > 1;
  } catch (error) {
    console.error(`Fehler in hasNextSong: ${error.message}`);
    throw error;
  }
}

/**
 * Entfernt den aktuellen Song aus der Warteschlange und gibt ihn zurück.
 * @param {string} guildId - Die ID der Guild
 * @returns {object|null} - Der entfernte Song oder null, wenn die Warteschlange leer ist
 */
export function removeCurrentSong(guildId) {
  try {
    if (!guildId) throw new Error("Guild-ID ist erforderlich.");

    const guildQueue = getQueue(guildId);
    const removedSong = guildQueue.songs.shift();
    guildQueue.current = guildQueue.songs[0] || null;
    return removedSong;
  } catch (error) {
    console.error(`Fehler in removeCurrentSong: ${error.message}`);
    throw error;
  }
}

/**
 * Fügt einen Song zur Warteschlange hinzu.
 * @param {string} guildId - Die ID der Guild
 * @param {object} song - Der Song, der hinzugefügt werden soll ({ title, url })
 */
export function addSong(guildId, song) {
  try {
    if (!guildId || !song)
      throw new Error("Guild-ID und Song sind erforderlich.");

    const guildQueue = getQueue(guildId);
    guildQueue.songs.push(song);
    console.log(`Song hinzugefügt: ${song.title}`);
  } catch (error) {
    console.error(`Fehler in addSong: ${error.message}`);
    throw error;
  }
}

/**
 * Setzt den aktuellen Song in der Warteschlange.
 * @param {string} guildId - Die ID der Guild
 * @param {object} song - Der neue aktuelle Song
 */
export function setCurrentSong(guildId, song) {
  try {
    if (!guildId || !song)
      throw new Error("Guild-ID und Song sind erforderlich.");

    const guildQueue = getQueue(guildId);
    guildQueue.current = song;
  } catch (error) {
    console.error(`Fehler in setCurrentSong: ${error.message}`);
    throw error;
  }
}

/**
 * Setzt die Warteschlange für eine Guild zurück.
 * @param {string} guildId - Die ID der Guild
 */
export function clearQueue(guildId) {
  try {
    if (!guildId) throw new Error("Guild-ID ist erforderlich.");

    const guildQueue = getQueue(guildId);
    guildQueue.songs = [];
    guildQueue.current = null;
    guildQueue.connection?.disconnect();
    console.log(`Warteschlange für Guild ${guildId} wurde geleert.`);
  } catch (error) {
    console.error(`Fehler in clearQueue: ${error.message}`);
    throw error;
  }
}
