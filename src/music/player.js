import pkg from "lavacord";
const { Node } = pkg;
import { getQueue } from "./queue.js";
import { exportsConfig } from "../config.js";

const { lavaLinkHost, lavaLinkPort, lavaLinkPassword } = exportsConfig;

let node; // Lavalink-Node

// Verbindung zu Lavalink herstellen
async function connectNode(client) {
  node = new Node({
    userId: client.user.id,
    shards: 1,
    host: lavaLinkHost,
    port: lavaLinkPort,
    password: lavaLinkPassword,
  });

  try {
    await node.connect();
    console.log("Mit Lavalink verbunden!");
  } catch (error) {
    console.error("Fehler bei der Verbindung zu Lavalink:", error.message);
  }
}

// Song abspielen
async function playSong(guildId) {
  const queue = getQueue(guildId);

  if (!queue || !queue.songs.length) {
    console.log("Keine Songs in der Warteschlange.");
    return;
  }

  const connection = queue.connection;

  if (!connection) {
    console.error("Keine aktive Verbindung für die Guild.");
    return;
  }

  const track = queue.songs[0]; // Aktueller Song

  try {
    const player = connection.player;
    await player.play(track.url); // URL oder Audio-Track an Lavalink senden
    console.log(`Spielt jetzt: ${track.title}`);
    queue.current = track; // Setze den aktuellen Song

    // Event für Song-Ende
    player.on("end", async () => {
      console.log(`Song beendet: ${track.title}`);
      queue.songs.shift(); // Entferne den aktuellen Song aus der Warteschlange
      if (queue.songs.length > 0) {
        await playSong(guildId); // Spiele den nächsten Song
      } else {
        console.log("Warteschlange ist leer.");
        queue.current = null;
      }
    });

    player.on("error", (error) => {
      console.error(`Fehler beim Abspielen: ${error.message}`);
      queue.songs.shift(); // Entferne den fehlerhaften Song
      if (queue.songs.length > 0) {
        playSong(guildId); // Spiele den nächsten Song
      } else {
        queue.current = null;
      }
    });
  } catch (error) {
    console.error(`Fehler beim Abspielen des Songs: ${error.message}`);
    queue.songs.shift(); // Entferne den fehlerhaften Song
    if (queue.songs.length > 0) {
      await playSong(guildId); // Versuche, den nächsten Song abzuspielen
    }
  }
}

// Song pausieren
async function pauseSong(guildId) {
  const queue = getQueue(guildId);

  if (!queue || !queue.connection || !queue.connection.player) {
    console.error(
      "Keine aktive Verbindung zum Voice-Channel oder kein Song zum Pausieren.",
    );
    return;
  }

  try {
    const player = queue.connection.player;
    player.pause(true); // Pausiert die Wiedergabe
    console.log("Wiedergabe pausiert.");
  } catch (error) {
    console.error(`Fehler beim Pausieren des Songs: ${error.message}`);
  }
}

// Song überspringen
async function skipSong(guildId) {
  const queue = getQueue(guildId);

  if (!queue || !queue.songs.length) {
    console.log("Keine Songs in der Warteschlange zum Überspringen.");
    return;
  }

  try {
    console.log(`Song übersprungen: ${queue.current?.title || "Unbekannt"}`);
    queue.songs.shift(); // Entferne den aktuellen Song aus der Warteschlange

    if (queue.songs.length > 0) {
      await playSong(guildId); // Spiele den nächsten Song
    } else {
      console.log("Warteschlange ist leer.");
      queue.current = null;
    }
  } catch (error) {
    console.error(`Fehler beim Überspringen des Songs: ${error.message}`);
  }
}

// Wiedergabe stoppen
async function stopPlayback(guildId) {
  const queue = getQueue(guildId);

  if (!queue || !queue.connection || !queue.connection.player) {
    console.error(
      "Keine aktive Verbindung zum Voice-Channel oder keine Wiedergabe aktiv.",
    );
    return;
  }

  try {
    const player = queue.connection.player;
    player.stop(); // Stoppe die Wiedergabe
    queue.songs = []; // Leere die Warteschlange
    queue.current = null;
    console.log("Wiedergabe gestoppt und Warteschlange geleert.");
  } catch (error) {
    console.error(`Fehler beim Stoppen der Wiedergabe: ${error.message}`);
  }
}

// Verbindung zum Voice-Channel herstellen
async function joinChannel(channel) {
  const connection = await node.join({
    guild: channel.guild.id,
    channel: channel.id,
    node: node,
  });

  console.log(`Mit Voice-Channel verbunden: ${channel.name}`);
  return connection;
}

// Verbindung zum Voice-Channel trennen
async function leaveChannel(guildId) {
  const connection = node.players.get(guildId);
  if (connection) {
    await connection.destroy();
    console.log("Voice-Channel verlassen.");
  }
}

export {
  connectNode,
  playSong,
  pauseSong,
  skipSong,
  stopPlayback,
  joinChannel,
  leaveChannel,
};
