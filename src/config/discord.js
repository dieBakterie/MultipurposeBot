// src/config/discord.js
import dotenv from "dotenv";

// Lade die Umgebungsvariablen
dotenv.config();

// Discord-Einstellungen
const discord = {
  // emoji: "",
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
  guildId: process.env.DISCORD_GUILD_ID,
  // Einstellungen Discord: Benutzer-Feedback
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
  // Einstellungen Discord: Musik
  music: {
    emoji: "🎵",
    // Einstellungen Discord Musik: Benutzer-Feedback
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
    // Einstellungen Discord Musik: Steuerungen
    controls: {
      playPause: "⏯",
      pause: "⏸",
      skip: "⏭",
      stop: "⏹",
    },
  },
  // Einstellungen Discord: Benachrichtigungen
  notification: {
    emoji: "📢", // 🔔
    // message: "",
  },
};

export default discord;
