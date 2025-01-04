// src/services/Music/queue.js
const queue = new Map(); // GuildID => { songs: [], current: null, connection: null }

/**
 * Validiert die Guild-ID und prüft, ob eine Warteschlange existiert.
 * Erstellt bei Bedarf eine neue Warteschlange.
 * @param {string} guildId - Die ID der Guild
 * @returns {object} - Die Warteschlange für die Guild
 */
function ensureQueue(guildId) {
  if (!guildId) {
    throw new Error("Guild-ID ist erforderlich.");
  }

  if (!queue.has(guildId)) {
    queue.set(guildId, { songs: [], current: null, connection: null });
    console.log(`Neue Warteschlange für Guild ${guildId} erstellt.`);
  }

  return queue.get(guildId);
}

/**
 * Entfernt die Warteschlange einer Guild vollständig.
 * @param {string} guildId - Die ID der Guild
 */
export function deleteQueue(guildId) {
  try {
    if (!queue.delete(guildId)) {
      console.warn(`Warteschlange für Guild ${guildId} existiert nicht.`);
    } else {
      console.log(`Warteschlange für Guild ${guildId} wurde entfernt.`);
    }
  } catch (error) {
    handleQueueError("deleteQueue", error);
  }
}

/**
 * Gibt den aktuellen Song in der Warteschlange zurück.
 * @param {string} guildId - Die ID der Guild
 * @returns {object|null} - Der aktuelle Song oder null, wenn keiner läuft
 */
export function getCurrentSong(guildId) {
  try {
    const guildQueue = ensureQueue(guildId);
    return guildQueue.current;
  } catch (error) {
    handleQueueError("getCurrentSong", error);
    return null;
  }
}

/**
 * Gibt den nächsten Song in der Warteschlange zurück.
 * @param {string} guildId - Die ID der Guild
 * @returns {object|null} - Der nächste Song oder null, wenn die Warteschlange leer ist
 */
export function getNextSong(guildId) {
  try {
    const guildQueue = ensureQueue(guildId);
    return guildQueue.songs.length > 1 ? guildQueue.songs[1] : null;
  } catch (error) {
    handleQueueError("getNextSong", error);
    return null;
  }
}

/**
 * Fügt einen Song zur Warteschlange hinzu.
 * @param {string} guildId - Die ID der Guild
 * @param {object} song - Der Song, der hinzugefügt werden soll ({ title, url })
 */
export function addSong(guildId, song) {
  try {
    if (!song || !song.title || !song.url) {
      throw new Error("Ungültiger Song.");
    }

    const guildQueue = ensureQueue(guildId);
    guildQueue.songs.push(song);
    console.log(`Song hinzugefügt: ${song.title}`);
  } catch (error) {
    handleQueueError("addSong", error);
  }
}

/**
 * Entfernt einen Song aus der Warteschlange.
 * @param {string} guildId - Die ID der Guild
 * @param {string|null} songName - Der Titel des Songs (optional). Wenn null, wird der erste Song entfernt.
 * @returns {object|null} - Der entfernte Song oder null, wenn kein Song gefunden wurde
 */
export function removeSong(guildId, songName = null) {
  try {
    const guildQueue = ensureQueue(guildId);

    if (!songName) {
      const removedSong = guildQueue.songs.shift();
      guildQueue.current = guildQueue.songs[0] || null;
      return removedSong;
    }

    const songIndex = guildQueue.songs.findIndex((song) =>
      song.title.toLowerCase().includes(songName.toLowerCase())
    );

    if (songIndex === -1) {
      console.warn(`Song "${songName}" nicht gefunden.`);
      return null;
    }

    const [removedSong] = guildQueue.songs.splice(songIndex, 1);

    if (songIndex === 0) {
      guildQueue.current = guildQueue.songs[0] || null;
    }

    return removedSong;
  } catch (error) {
    handleQueueError("removeSong", error);
    return null;
  }
}

/**
 * Setzt die Warteschlange für eine Guild zurück.
 * @param {string} guildId - Die ID der Guild
 */
export function clearQueue(guildId) {
  try {
    const guildQueue = ensureQueue(guildId);
    guildQueue.songs = [];
    guildQueue.current = null;
    guildQueue.connection?.disconnect();
    console.log(`Warteschlange für Guild ${guildId} wurde geleert.`);
  } catch (error) {
    handleQueueError("clearQueue", error);
  }
}

/**
 * Zentrale Fehlerbehandlung für Warteschlangenoperationen.
 * @param {string} method - Der Name der Methode, die den Fehler ausgelöst hat.
 * @param {Error} error - Der aufgetretene Fehler.
 */
function handleQueueError(method, error) {
  console.error(`Fehler in ${method}: ${error.message}`);
}
