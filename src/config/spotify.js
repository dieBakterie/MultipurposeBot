// src/config/spotify.js
import dotenv from "dotenv";

// Lade die Umgebungsvariablen
dotenv.config();

// Spotify-Einstellungen
const spotify = {
  // emoji: "",
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  // Einstellungen Spotify: Benutzer-Feedback
  userFeedback: {
    // emoji: "",
    error: {
      emoji: "❌",
      // message: "",
    },
    success: {
      emoji: "✅",
      // message: "",
    },
    info: {
      emoji: "ℹ️",
      // message: "",
    },
    list: {
      emoji: "📄",
      // message: "",
    },
    link: {
      emoji: "🔗",
      // message: "",
    },
  },
  // Einstellungen Spotify: Musik
  music: {
    emoji: "🎶",
    // Einstellungen Spotify Musik: Benutzer-Feedback
    userFeedback: {
      error: {
        emoji: "❌",
        // message: "",
      },
      success: {
        emoji: "✅",
        // message: "",
      },
      info: {
        emoji: "ℹ️",
        // message: "",
      },
      list: {
        emoji: "📄",
        // message: "",
      },
    },
    // Einstellungen Spotify Musik: Musiksteuerungen
    controls: {
      playPause: "⏯",
      pause: "⏸",
      skip: "⏭",
      stop: "⏹",
    },
  },
};

export default spotify;
