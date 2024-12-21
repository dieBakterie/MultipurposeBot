// src/database/database.js
// Importieren der benötigten Pakete
import pkg from "pg";
const { Pool } = pkg;
import {
  isDocker,
  databaseHost,
  databasePort,
  databaseUser,
  databasePassword,
  databaseName,
} from "../alias.js";

// Dynamische Host-Logik: Prüfen, ob im Docker-Container läuft
let dynamicDatabaseHost;

if (isDocker === "true") {
  console.log("Docker-Container erkannt.");
  dynamicDatabaseHost = "postgres"; // Im Docker-Container wird "postgres" verwendet
  console.log(`Database Host: ${dynamicDatabaseHost}`);
} else {
  console.log("Kein Docker-Container erkannt.");
  console.log(`Database Host: ${databaseHost}`);
}

// PostgreSQL Pool Setup
const db = new Pool({
  host: dynamicDatabaseHost || databaseHost,
  port: databasePort,
  user: databaseUser,
  password: databasePassword,
  database: databaseName,
});

// Wrapper für Pool-Abfragen
const query = (text, params) => db.query(text, params);

export { db, query };
