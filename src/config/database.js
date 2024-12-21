// src/config/database.js
import dotenv from "dotenv";

// Lade die Umgebungsvariablen
dotenv.config();

// Datenbank-Einstellungen
const database = {
  // emoji: "",
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  name: process.env.DATABASE_NAME,
};

export default database;
