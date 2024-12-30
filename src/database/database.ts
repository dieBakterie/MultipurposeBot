// src/database/database.ts
tabase.js
// Importieren der benötigten Pakete
import pkg from "pg";
const { Pool } = pkg;
import {
  databaseHost,
  databasePort,
  databaseUser,
  databasePassword,
  databaseName,
  isDocker,
  nodeEnvironment,
} from "../alias.js";

// Dynamische Host-Logik: Prüfen, ob im Docker-Container läuft
if (nodeEnvironment === "development") {
  if (isDocker === "true") {
    console.log("Docker-Container erkannt.");
  } else {
    console.log("Kein Docker-Container erkannt.");
  }
  console.log(`Database Host: ${databaseHost}`);
}

// PostgreSQL Pool Setup
const db = new Pool({
  host: databaseHost,
  port: databasePort,
  user: databaseUser,
  password: databasePassword,
  database: databaseName,
});

// Wrapper für Pool-Abfragen
const query = (text, params) => db.query(text, params);

export { db, query };
