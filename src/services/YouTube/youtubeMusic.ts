// src/services/YouTube/youtubeMusic.ts
uTube/youtubeMusic.js
import { searchVideos } from "./youtube.js";
import { youtubeMusicFeedbackError } from "../../alias.js";

// Suche nach einem Musikvideo basierend auf einem Titel
async function searchMusic(query) {
  const videos = await searchVideos(query, 1); // Nur das erste Ergebnis zurückgeben
  if (videos.length === 0) {
    throw new Error(
      `${youtubeMusicFeedbackError.emoji} Keine Musik für '${query}' gefunden.`,
    );
  }

  return videos[0]; // Gibt das erste Suchergebnis zurück
}

export default searchMusic;
