// src/index.js
import {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
} from "discord.js";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { Shoukaku, Connectors } from "shoukaku";
import { db } from "./database/database.js";
import { log } from "./utils/logging.js";
import {
  discordToken,
  discordClientId,
  discordGuildId,
  discordFeedbackSuccess,
  discordFeedbackError,
  lavaLinkHost,
  lavaLinkPort,
  lavaLinkPassword,
  isDocker,
  nodeEnvironment,
} from "./alias.js";

const __dirname = path
  .dirname(new URL(import.meta.url).pathname)
  .replace(/^\/([a-zA-Z]):/, "$1:"); // Windows-Kompatibilität

// Discord Client Setup
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// Initialisiere die Map für erwartete Nachrichten
client.expectedMessages = new Map();
client.commands = new Collection();

// Dynamische Host/Port-Logik: Prüfen, ob im Docker-Container läuft
let dynamiclavaLinkHost;
let dynamiclavaLinkPort;

if (isDocker === "true") {
  console.log("Docker-Container erkannt.");
  dynamiclavaLinkHost = "lavaLink";
  dynamiclavaLinkPort = 2333;
}

// Fallback-Logik
const finalLavaLinkHost = dynamiclavaLinkHost || lavaLinkHost;
const finalLavaLinkPort = dynamiclavaLinkPort || lavaLinkPort;

// Shoukaku-Setup
export const LavalinkNodes = [
  {
    name: "MainNode",
    url: `${finalLavaLinkHost}:${finalLavaLinkPort}`,
    auth: lavaLinkPassword,
  },
];

export const shoukaku = new Shoukaku(
  new Connectors.DiscordJS(client),
  LavalinkNodes,
  {
    moveOnDisconnect: false,
    resume: true,
    reconnectTries: 5,
    reconnectInterval: 5000,
  }
);

// Shoukaku-Events
shoukaku.on("ready", (name) =>
  console.log(`Lavalink Node ${name} ist bereit!`)
);
shoukaku.on("error", (name, error) =>
  console.error(`Lavalink Node ${name} hat einen Fehler:`, error)
);
shoukaku.on("close", (name, code, reason) =>
  console.warn(`Lavalink Node ${name} wurde geschlossen:`, { code, reason })
);
shoukaku.on("disconnect", (name, players, moved) =>
  console.warn(
    `Lavalink Node ${name} wurde getrennt. Players: ${players.size}. Moved: ${moved}`
  )
);

// Funktion zum Laden von Commands und Events
async function loadFilesRecursively(directory, type) {
  const files = fs.readdirSync(directory, { withFileTypes: true });

  const filePaths = [];

  for (const entry of files) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      // Rekursive Verarbeitung für Unterverzeichnisse
      const nestedFiles = await loadFilesRecursively(fullPath, type);
      if (Array.isArray(nestedFiles)) {
        filePaths.push(...nestedFiles);
      }
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      filePaths.push(fullPath);
    }
  }

  return filePaths; // Sicherstellen, dass ein Array zurückgegeben wird
}

// Funktion zur Registrierung der Commands bei Discord
async function registerCommandsAndEvents() {
  const commandData = client.commands.map((command) => command.data.toJSON());

  const rest = new REST({ version: "10" }).setToken(discordToken);

  try {
    console.log("Registriere Slash-Befehle bei Discord...");

    await rest.put(
      Routes.applicationGuildCommands(discordClientId, discordGuildId),
      {
        body: commandData,
      }
    );

    console.log(
      `${discordFeedbackSuccess.emoji} Slash-Befehle erfolgreich registriert!`
    );
  } catch (error) {
    console.error(
      `${discordFeedbackError.emoji} Fehler bei der Registrierung der Slash-Befehle:`,
      error
    );
  }
}

// Startet den Bot
async function startBot() {
  try {
    console.log("Starte den Bot...");

    // Commands laden
    console.log("Lade Commands...");
    await loadFilesRecursively(
      path.resolve(__dirname, "./commands"),
      "command"
    );

    // Events laden
    console.log("Lade Events...");
    await loadFilesRecursively(path.resolve(__dirname, "./events"), "event");

    // Commands bei Discord registrieren
    console.log("Registriere Commands bei Discord...");
    await registerCommandsAndEvents();

    // Bot-Login
    console.log("Verbinde mit Discord...");
    await client.login(discordToken);

    // Synchronisiere Discord-Kanalnamen
    const guild = client.guilds.cache.first();
    if (guild) {
      console.log("Synchronisiere Discord-Kanalnamen...");
      await syncChannelNames(guild);
    }

    console.log("Bot erfolgreich gestartet!");
  } catch (error) {
    console.error(
      `${discordFeedbackError.emoji} Fehler beim Starten des Bots:`,
      error.message
    );
    if (nodeEnvironment === "development") {
      console.error(error); // Detailliertes Logging in der Entwicklungsumgebung
    }
  }
}

// Bot initialisieren
startBot();
