// src/services/music/player.ts
sic/player.js
r.js
import { shoukaku } from "../../index.js";
import { getQueue, deleteQueue } from "./queue.js";

// Verbindung zum Voice-Channel herstellen
export async function joinChannel(channel) {
  try {
    const connection = await shoukaku.joinVoiceChannel({
      guildId: channel.guild.id,
      channelId: channel.id,
      deaf: true,
    });
    console.log(`Mit Voice-Channel verbunden: ${channel.name}`);
    return connection;
  } catch (error) {
    console.error(`Fehler beim Verbinden mit Voice-Channel: ${error.message}`);
  }
}

// Verbindung zum Voice-Channel trennen
export async function leaveChannel(guildId) {
  try {
    const player = shoukaku.getPlayer(guildId);
    if (player) {
      await player.disconnect();
      deleteQueue(guildId); // Warteschlange löschen
      console.log("Voice-Channel verlassen.");
    }
  } catch (error) {
    console.error(`Fehler beim Verlassen des Voice-Channels: ${error.message}`);
  }
}

// Song abspielen
export async function playSong(guildId) {
  const queue = getQueue(guildId);

  if (!queue || !queue.songs.length) {
    console.warn("Keine Songs in der Warteschlange.");
    return;
  }

  const player = shoukaku.getPlayer(guildId);
  if (!player) {
    console.error("Keine aktive Verbindung für die Guild.");
    return;
  }

  const track = queue.songs[0]; // Der erste Song in der Warteschlange

  try {
    const result = await player.node.rest.resolve(track.url); // URL auflösen
    if (!result || !result.tracks.length) {
      console.error("Song konnte nicht aufgelöst werden.");
      queue.songs.shift(); // Entferne den fehlerhaften Song
      await playSong(guildId); // Versuche, den nächsten Song abzuspielen
      return;
    }

    const song = result.tracks[0];
    player.playTrack(song); // Song abspielen
    console.log(`Spielt jetzt: ${track.title}`);
    queue.current = track; // Aktuellen Song setzen

    // Song-Ende behandeln
    player.once("end", async () => {
      console.log(`Song beendet: ${track.title}`);
      queue.songs.shift(); // Entferne den Song aus der Warteschlange
      if (queue.songs.length > 0) {
        await playSong(guildId); // Spiele den nächsten Song
      } else {
        console.log("Warteschlange ist leer.");
        queue.current = null;
      }
    });

    // Fehler beim Abspielen behandeln
    player.once("exception", async (error) => {
      console.error(`Fehler beim Abspielen: ${error.message}`);
      queue.songs.shift();
      if (queue.songs.length > 0) {
        await playSong(guildId);
      } else {
        queue.current = null;
      }
    });
  } catch (error) {
    console.error(`Fehler beim Abspielen des Songs: ${error.message}`);
    queue.songs.shift();
    if (queue.songs.length > 0) {
      await playSong(guildId);
    }
  }
}

// Song pausieren
export async function pauseSong(guildId) {
  const player = shoukaku.getPlayer(guildId);

  if (!player) {
    console.warn("Keine aktive Verbindung oder kein Song zum Pausieren.");
    return;
  }

  try {
    player.setPaused(true);
    console.log("Wiedergabe pausiert.");
  } catch (error) {
    console.error(`Fehler beim Pausieren des Songs: ${error.message}`);
  }
}

// Song fortsetzen
export async function resumeSong(guildId) {
  const player = shoukaku.getPlayer(guildId);

  if (!player) {
    console.warn("Keine aktive Verbindung oder kein pausierter Song.");
    return;
  }

  try {
    player.setPaused(false);
    console.log("Wiedergabe fortgesetzt.");
  } catch (error) {
    console.error(`Fehler beim Fortsetzen der Wiedergabe: ${error.message}`);
  }
}

// Song überspringen
export async function skipSong(guildId) {
  const queue = getQueue(guildId);

  if (!queue || !queue.songs.length) {
    console.warn("Keine Songs in der Warteschlange zum Überspringen.");
    return;
  }

  console.log(`Song übersprungen: ${queue.current?.title || "Unbekannt"}`);
  queue.songs.shift(); // Entferne den aktuellen Song
  if (queue.songs.length > 0) {
    await playSong(guildId);
  } else {
    console.log("Warteschlange ist leer.");
    queue.current = null;
  }
}

// Wiedergabe stoppen
export async function stopPlayback(guildId) {
  const player = shoukaku.getPlayer(guildId);

  if (!player) {
    console.warn("Keine aktive Verbindung oder keine Wiedergabe aktiv.");
    return;
  }

  try {
    player.stopTrack(); // Stoppe die Wiedergabe
    deleteQueue(guildId); // Warteschlange löschen
    console.log("Wiedergabe gestoppt und Warteschlange geleert.");
  } catch (error) {
    console.error(`Fehler beim Stoppen der Wiedergabe: ${error.message}`);
  }
}
