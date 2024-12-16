import { Shoukaku, Connectors } from "shoukaku";
import { getQueue, deleteQueue } from "./queue.js";
import { exportsConfig } from "../config.js";

const { lavaLinkHost, lavaLinkPort, lavaLinkPassword } = exportsConfig;

// Shoukaku-Instanz erstellen
const LavalinkNodes = [
  {
    name: "MainNode",
    url: `${lavaLinkHost}:${lavaLinkPort}`,
    auth: lavaLinkPassword,
  },
];

export const shoukaku = new Shoukaku(new Connectors.DiscordJS(), LavalinkNodes, {
  moveOnDisconnect: false,
  resume: true,
  reconnectTries: 5,
  reconnectInterval: 5000,
});

// Ereignis-Handler für Shoukaku
shoukaku.on("ready", (name) =>
  console.log(`Lavalink Node ${name} ist bereit!`)
);
shoukaku.on("error", (name, error) =>
  console.error(`Lavalink Node ${name} hat einen Fehler:`, error)
);
shoukaku.on("close", (name, code, reason) =>
  console.warn(`Lavalink Node ${name} wurde geschlossen:`, { code, reason })
);
shoukaku.on("disconnect", (name, players, moved) =>
  console.warn(
    `Lavalink Node ${name} wurde getrennt. Players: ${players.size}. Moved: ${moved}`
  )
);

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

  const track = queue.songs[0];

  try {
    const result = await player.node.rest.resolve(track.url);
    if (!result) {
      console.error("Song konnte nicht aufgelöst werden.");
      queue.songs.shift(); // Entferne den fehlerhaften Song
      await playSong(guildId); // Spiele den nächsten Song
      return;
    }

    const song = result.tracks[0];
    player.playTrack(song); // Song abspielen
    console.log(`Spielt jetzt: ${track.title}`);
    queue.current = track;

    player.once("end", async () => {
      console.log(`Song beendet: ${track.title}`);
      queue.songs.shift();
      if (queue.songs.length > 0) {
        await playSong(guildId);
      } else {
        console.log("Warteschlange ist leer.");
        queue.current = null;
      }
    });

    player.once("exception", (error) => {
      console.error(`Fehler beim Abspielen: ${error.message}`);
      queue.songs.shift();
      if (queue.songs.length > 0) {
        playSong(guildId);
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
    console.error("Keine aktive Verbindung oder kein Song zum Pausieren.");
    return;
  }

  try {
    player.setPaused(true);
    console.log("Wiedergabe pausiert.");
  } catch (error) {
    console.error(`Fehler beim Pausieren des Songs: ${error.message}`);
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
  queue.songs.shift();
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
    player.stopTrack();
    deleteQueue(guildId); // Warteschlange komplett löschen
    console.log("Wiedergabe gestoppt und Warteschlange geleert.");
  } catch (error) {
    console.error(`Fehler beim Stoppen der Wiedergabe: ${error.message}`);
  }
}
