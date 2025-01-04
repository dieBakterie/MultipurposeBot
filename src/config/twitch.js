// src/config/twitch.js
import dotenv from "dotenv";

// Lade die Umgebungsvariablen
dotenv.config();

// Twitch
const twitch = {
  // emoji: "",
  clientId: process.env.TWITCH_CLIENT_ID,
  clientSecret: process.env.TWITCH_CLIENT_SECRET,
  // Einstellungen Twitch: Benutzer-Feedback
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
  // Einstellungen Twitch: Benachrichtigungen
  notification: {
    emoji: "📢",
    // message: "",
  },
};

export default twitch;
