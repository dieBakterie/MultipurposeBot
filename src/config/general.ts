// src/config/general.ts
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
};

export default general;
