// src/config/general.js
import dotenv from "dotenv";

// Lade die Umgebungsvariablen
dotenv.config();

// Einstellungen: Generell
const general = {
  // emoji: "",
  // Einstellungen: Generell: Benutzer-Feedback
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
  // Einstellungen Generell: Musik
  music: {
    emoji: "🎵",
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
    // Einstellungen Generell Musik: Steuerungen
    controls: {
      playPause: "⏯",
      pause: "⏸",
      skip: "⏭",
      stop: "⏹",
    },
  },
  // Einstellungen Generell: Benachrichtigungen
  notification: {
    emoji: "📢",
    // message: "",
  },
};

export default general;
