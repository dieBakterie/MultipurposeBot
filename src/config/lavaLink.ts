// src/config/lavaLink.ts
import dotenv from "dotenv";

// Lade die Umgebungsvariablen
dotenv.config();

// Lavalink-Einstellungen
const lavaLink = {
  // emoji: "",
  host: process.env.LAVALINK_HOST,
  port: parseInt(process.env.LAVALINK_PORT || "2333", 10),
  password: process.env.LAVALINK_PASSWORD,
};

export default lavaLink;
