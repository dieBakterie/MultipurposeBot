const queue = new Map(); // GuildID => { songs: [], current: null, connection: null }

/*
 * Holt die Warteschlange für eine bestimmte Guild.
 * Wenn keine Warteschlange existiert, wird eine neue erstellt.
 * @param {string} guildId - Die ID der Guild
 * @returns {object} - Die Warteschlange für die Guild
 */
function getQueue(guildId) {
  if (!queue.has(guildId)) {
    queue.set(guildId, { songs: [], current: null, connection: null });
  }
  return queue.get(guildId);
}

/*
 * Fügt einen Song zur Warteschlange hinzu.
 * @param {string} guildId - Die ID der Guild
 * @param {object} song - Der Song, der hinzugefügt werden soll ({ title, url })
 */
function addSong(guildId, song) {
  const guildQueue = getQueue(guildId);
  guildQueue.songs.push(song);
  console.log(`Song hinzugefügt: ${song.title}`);
}

/*
 * Entfernt den aktuellen Song und gibt den nächsten Song zurück.
 * @param {string} guildId - Die ID der Guild
 * @returns {object|null} - Der nächste Song oder null, wenn die Warteschlange leer ist
 */
function skipSong(guildId) {
  const guildQueue = getQueue(guildId);
  if (guildQueue.songs.length > 0) {
    guildQueue.songs.shift(); // Entferne den aktuellen Song
    return guildQueue.songs[0] || null; // Gib den nächsten Song zurück
  }
  return null;
}

/*
 * Setzt die Warteschlange für eine Guild zurück.
 * @param {string} guildId - Die ID der Guild
 */
function clearQueue(guildId) {
  const guildQueue = getQueue(guildId);
  guildQueue.songs = [];
  guildQueue.current = null;
  guildQueue.connection = null;
  console.log(`Warteschlange für Guild ${guildId} wurde geleert.`);
}

/*
 * Entfernt die Warteschlange einer Guild vollständig.
 * @param {string} guildId - Die ID der Guild
 */
function deleteQueue(guildId) {
  if (queue.has(guildId)) {
    queue.delete(guildId);
    console.log(`Warteschlange für Guild ${guildId} wurde entfernt.`);
  }
}

export { getQueue, addSong, skipSong, clearQueue, deleteQueue };
