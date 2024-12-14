// Importieren der benötigten Pakete
import pkg from "pg";
const { Pool } = pkg;
import { exportsConfig } from "../config.js";
const {
  DatabaseHost,
  DatabasePort,
  DatabaseUser,
  DatabasePassword,
  DatabaseName,
} = exportsConfig;

// PostgreSQL Pool Setup
const db = new Pool({
  host: DatabaseHost,
  port: DatabasePort,
  user: DatabaseUser,
  password: DatabasePassword,
  database: DatabaseName,
});

// Wrapper für Pool-Abfragen
const query = (text, params) => db.query(text, params);

export { db, query };
