// src/index.ts
import {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
} from "discord.js";
import fs from "fs";
import path from "path";
import { log } from "./utils/logging.js";
import { db } from "./database/database.js";
import { pathToFileURL } from "url";
import { Shoukaku, Connectors } from "shoukaku";
import { syncChannelNames } from "./database/twitchDatabase.js";
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
  .replace(/^\/?([a-zA-Z]):/, "$1:"); // Windows-Kompatibilität

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
    auth: lavaLinkPassword || "",
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
shoukaku.on("disconnect", (name, count, moved) =>
  console.warn(`Lavalink Node ${name} wurde getrennt. Players: ${count}. Moved: ${moved}`)
);

// Initialisiere die Map für erwartete Nachrichten
client.expectedMessages = new Map();
client.commands = new Collection();

// Funktion zum rekursiven Laden von Dateien
function loadFilesRecursively(directory: string, fileExtension = ".js") {
  let files = [];
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(loadFilesRecursively(fullPath, fileExtension));
    } else if (entry.isFile() && entry.name.endsWith(fileExtension)) {
      files.push(fullPath);
    }
  }

  return files;
}

// Funktion zur Registrierung der Commands bei Discord
async function registerCommands() {
  const commandData = client.commands.map((command) => command.data.toJSON());

  const rest = new REST({ version: "10" }).setToken(discordToken);

  try {
    console.log("Registriere Slash-Befehle bei Discord...");

    await rest.put(
      Routes.applicationGuildCommands(
        discordClientId,
        discordGuildId // Oder null, um globale Befehle zu registrieren
      ),
      { body: commandData }
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

// Funktion zum Registrieren von Commands oder Events
async function logCommandOrEvent(fileURL, name, client, db, type) {
  try {
    const { default: commandOrEvent } = await import(fileURL);

    log.info(`Lade ${type} "${name}".`);
    log.info(`Datei: ${fileURL}`);

    if (type === "event") {
      // Event registrieren
      if (commandOrEvent.once) {
        client.once(name, (...args) =>
          commandOrEvent.execute(...args, client, db)
        );
      } else {
        client.on(name, (...args) =>
          commandOrEvent.execute(...args, client, db)
        );
      }
    } else if (type === "command") {
      // Command registrieren
      client.commands.set(name, commandOrEvent);
    }

    log.info(
      `${
        type.charAt(0).toUpperCase() + type.slice(1)
      } "${name}" erfolgreich geladen.`
    );
  } catch (error) {
    log.error(
      `${discordFeedbackError.emoji} Fehler beim Laden von ${type} "${name}": ${error.message}`
    );
    console.error(
      `${discordFeedbackError.emoji} Fehler beim Laden von ${type} "${name}":`,
      error
    );
  }
}

// Startet den Bot
async function startBot() {
  try {
    console.log("Starte den Bot...");

    // Commands laden
    const commandFiles = loadFilesRecursively(
      path.resolve(__dirname, "./commands")
    );

    for (const filePath of commandFiles) {
      const fileURL = pathToFileURL(filePath).href; // Konvertiere zu file:// URL
      const commandName = path.basename(filePath, ".js"); // Extrahiere den Befehl-Namen
      await logCommandOrEvent(fileURL, commandName, client, db, "command");
    }

    // Commands bei Discord registrieren
    await registerCommands();

    // Events laden
    const eventFiles = loadFilesRecursively(
      path.resolve(__dirname, "./events")
    );

    for (const filePath of eventFiles) {
      const fileURL = pathToFileURL(filePath).href; // Konvertiere zu file:// URL
      const eventName = path.basename(filePath, ".js"); // Extrahiere den Event-Namen
      await logCommandOrEvent(fileURL, eventName, client, db, "event");
    }

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
