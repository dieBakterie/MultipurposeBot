// src/config/node.ts
.js
import dotenv from "dotenv";

// Lade die Umgebungsvariablen
dotenv.config();

// Node
const node = {
  // emoji: "",
  environment: process.env.NODE_ENVIRONMENT,
};

export default node;
