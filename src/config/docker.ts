// src/config/docker.ts
er.js
import dotenv from "dotenv";

// Lade die Umgebungsvariablen
dotenv.config();

// Docker-Einstellungen
const docker = {
  // emoji: "",
  environment: process.env.DOCKER_ENVIRONMENT,
};

export default docker;
