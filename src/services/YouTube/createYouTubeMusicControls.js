// src/services/YouTube/createYouTubeMusicControls.js
import { sendMusicControls } from "../Music/createMusicControls.js";
import {
  youtubeMusicPlayPause,
  youtubeMusicPause,
  youtubeMusicSkip,
  youtubeMusicStop,
} from "../../alias.js";

await sendMusicControls(channel, guildId, {
  platform: "YouTube",
  playPauseId: "youtube_play-pause",
  skipId: "youtube_skip",
  stopId: "youtube_stop",
  emojis: {
    playPause: youtubeMusicPlayPause,
    skip: youtubeMusicSkip,
    stop: youtubeMusicStop,
  },
});
