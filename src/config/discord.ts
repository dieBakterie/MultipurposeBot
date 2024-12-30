// src/config/discord.ts
ord.js
import dotenv from "dotenv";

// Lade die Umgebungsvariablen
dotenv.config();

// Discord-Einstellungen
const discord = {
  // emoji: "",
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
  guildId: process.env.DISCORD_GUILD_ID,
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

export default discord;
