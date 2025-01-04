// src/services/Music/musicPlayer.js
import { shoukaku } from "../../index.js";
import { sendMusicControls } from "./createMusicControls.js";

export class MusicPlayer {
  constructor(queueManager, platform) {
    this.queueManager = queueManager;
    this.platform = platform;
  }

  validateQueue(queue, errorMessage) {
    if (!queue || !queue.current) {
      console.warn(`[${this.platform}] ${errorMessage}`);
      throw new Error(errorMessage);
    }
  }

  async addToQueue(guildId, song) {
    const queue = this.queueManager.getQueue(guildId);
    queue.songs.push(song);

    console.log(`[${this.platform}] Song hinzugefügt: ${song.title}`);
    return { isFirstSong: queue.songs.length === 1 };
  }

  async joinAndPlay(channel, guildId, textChannel) {
    const queue = this.queueManager.getQueue(guildId);

    if (!queue.connection) {
      queue.connection = await this.joinChannel(channel);
    }

    if (queue.songs.length === 1) {
      await sendMusicControls(textChannel, guildId, {
        platform: this.platform,
      });
      await this.play(guildId);
    }
  }

  async play(guildId) {
    const queue = this.queueManager.getQueue(guildId);
    if (!queue.songs.length) {
      console.warn(`[${this.platform}] Keine Songs in der Warteschlange.`);
      return;
    }

    const player = shoukaku.getPlayer(guildId);
    if (!player) {
      throw new Error(`[${this.platform}] Keine aktive Verbindung.`);
    }

    const track = queue.songs[0];
    try {
      const result = await player.node.rest.resolve(track.url);
      if (!result || !result.tracks.length) {
        console.error(`[${this.platform}] Song konnte nicht aufgelöst werden.`);
        queue.songs.shift();
        return this.play(guildId);
      }

      player.playTrack(result.tracks[0]);
      queue.current = track;

      player.once("end", async () => {
        queue.songs.shift();
        if (queue.songs.length > 0) {
          await this.play(guildId);
        } else {
          queue.current = null;
        }
      });

      player.once("exception", async (error) => {
        console.error(
          `[${this.platform}] Fehler beim Abspielen: ${error.message}`
        );
        queue.songs.shift();
        if (queue.songs.length > 0) {
          await this.play(guildId);
        }
      });
    } catch (error) {
      console.error(`[${this.platform}] Fehler: ${error.message}`);
    }
  }

  async skip(guildId) {
    const queue = this.queueManager.getQueue(guildId);
    this.validateQueue(queue, "Keine aktive Wiedergabe zum Überspringen.");

    console.log(`[${this.platform}] Song übersprungen.`);
    queue.songs.shift();
    if (queue.songs.length > 0) {
      await this.play(guildId);
    } else {
      queue.current = null;
    }

    return { hasNext: queue.songs.length > 0 };
  }

  async stop(guildId) {
    const queue = this.queueManager.getQueue(guildId);
    this.validateQueue(queue, "Keine aktive Wiedergabe zum Stoppen.");

    const player = shoukaku.getPlayer(guildId);
    if (player) {
      player.stopTrack();
    }

    this.queueManager.deleteQueue(guildId);
    console.log(`[${this.platform}] Wiedergabe gestoppt.`);
  }

  async pause(guildId) {
    const player = shoukaku.getPlayer(guildId);
    if (!player) {
      throw new Error(`[${this.platform}] Keine aktive Verbindung.`);
    }

    player.setPaused(true);
    console.log(`[${this.platform}] Wiedergabe pausiert.`);
  }

  async resume(guildId) {
    const player = shoukaku.getPlayer(guildId);
    if (!player) {
      throw new Error(`[${this.platform}] Keine aktive Verbindung.`);
    }

    player.setPaused(false);
    console.log(`[${this.platform}] Wiedergabe fortgesetzt.`);
  }

  async joinChannel(channel) {
    try {
      const connection = await shoukaku.joinVoiceChannel({
        guildId: channel.guild.id,
        channelId: channel.id,
        deaf: true,
      });
      console.log(
        `[${this.platform}] Mit Voice-Channel verbunden: ${channel.name}`
      );
      return connection;
    } catch (error) {
      throw new Error(
        `[${this.platform}] Fehler beim Verbinden: ${error.message}`
      );
    }
  }

  async leaveChannel(guildId) {
    try {
      const player = shoukaku.getPlayer(guildId);
      if (player) {
        await player.disconnect();
        this.queueManager.deleteQueue(guildId);
        console.log(`[${this.platform}] Voice-Channel verlassen.`);
      }
    } catch (error) {
      console.error(
        `[${this.platform}] Fehler beim Verlassen: ${error.message}`
      );
    }
  }
}
