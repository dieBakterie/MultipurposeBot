// src/services/Music/platformPlayers.js
import { MusicPlayer } from "../Music/musicPlayer.js";
import { getQueue, deleteQueue } from "../Music/queue.js";

const queueManager = { getQueue, deleteQueue };

// Plattform-spezifische Instanzen
export const spotifyPlayer = new MusicPlayer(queueManager, "Spotify");
export const youtubePlayer = new MusicPlayer(queueManager, "YouTube");
