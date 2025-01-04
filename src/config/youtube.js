// src/config/youtube.js
import dotenv from "dotenv";

// Lade die Umgebungsvariablen
dotenv.config();

// YouTube
const youtube = {
  // emoji: "",
  apiKey: process.env.YOUTUBE_API_KEY,
  // Einstellungen YouTube: Benutzer-Feedback
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
    loading: {
      emoji: "🔄",
      // message: "",
    },
    offline: {
      emoji: "🔴",
      // message: "",
    },
    online: {
      emoji: "🟢",
      // message: "",
    },
    stream: {
      emoji: "📺",
      // message: "",
    },
    video: {
      emoji: "🎬",
      // message: "",
    },
    game: {
      emoji: "🎮",
      // message: "",
    },
    user: {
      emoji: "👤",
      // message: "",
    },
    channel: {
      emoji: "📡",
      // message: "",
    },
    viewer: {
      emoji: "👀",
      // message: "",
    },
    follower: {
      emoji: "👥",
      // message: "",
    },
    subscriber: {
      emoji: "🎉",
      // message: "",
    },
    next: {
      emoji: "▶",
      // message: "",
    },
    previous: {
      emoji: "◀",
      // message: "",
    },
  },
  // Einstellungen YouTube: Benachrichtigungen
  notification: {
    emoji: "📢",
    // message: "",
    // Einstellungen YouTube: Benachrichtigungen: Benutzer-Feedback
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
      link: {
        emoji: "🔗",
        // message: "",
      },
    },
  },
  // Einstellungen YouTube: Musik
  music: {
    emoji: "🎶",
    controls: {
      playPause: "⏯",
      pause: "⏸",
      skip: "⏭",
      stop: "⏹",
    },
    // Einstellungen YouTube: Musik: Benutzer-Feedback
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
      link: {
        emoji: "🔗",
        // message: "",
      },
    },
  },
};

export default youtube;
