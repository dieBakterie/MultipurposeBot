// src/config/twitch.ts
ch.js
import dotenv from "dotenv";

// Lade die Umgebungsvariablen
dotenv.config();

// Twitch
const twitch = {
  // emoji: "",
  clientId: process.env.TWITCH_CLIENT_ID,
  clientSecret: process.env.TWITCH_CLIENT_SECRET,
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
};

export default twitch;
