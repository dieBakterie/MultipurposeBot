import { Client, GatewayIntentBits, Collection } from "discord.js";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { exportsConfig } from "./config.js";
import { db } from "./database/database.js";
import { log } from "./utils/logging.js";
import { REST, Routes } from "discord.js";

// Konfigurationsvariablen
const {
  DiscordToken,
  DiscordClientId,
  DiscordGuildId,
  DiscordUserFeedbackErrorEmoji,
  DiscordUserFeedbackSuccessEmoji,
} = exportsConfig;

const __dirname = path
  .dirname(new URL(import.meta.url).pathname)
  .replace(/^\/([a-zA-Z]):/, "$1:"); // Windows-Kompatibilität

// Discord Client Setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

// Initialisiere die Map für erwartete Nachrichten
client.expectedMessages = new Map();
client.commands = new Collection();

// Funktion zum rekursiven Laden von Dateien
function loadFilesRecursively(directory, fileExtension = ".js") {
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

  const rest = new REST({ version: "10" }).setToken(DiscordToken);

  try {
    console.log("Registriere Slash-Befehle bei Discord...");

    await rest.put(
      Routes.applicationGuildCommands(
        DiscordClientId,
        DiscordGuildId // Oder null, um globale Befehle zu registrieren
      ),
      { body: commandData }
    );

    console.log(
      `${DiscordUserFeedbackSuccessEmoji} Slash-Befehle erfolgreich registriert!`
    );
  } catch (error) {
    console.error(
      `${DiscordUserFeedbackErrorEmoji} Fehler bei der Registrierung der Slash-Befehle:`,
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
      `${DiscordUserFeedbackErrorEmoji} Fehler beim Laden von ${type} "${name}": ${error.message}`
    );
    console.error(
      `${DiscordUserFeedbackErrorEmoji} Fehler beim Laden von ${type} "${name}":`,
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

    // Bot starten
    await client.login(DiscordToken);
    console.log("Bot erfolgreich gestartet!");
  } catch (error) {
    console.error(
      `${DiscordUserFeedbackErrorEmoji} Fehler beim Starten des Bots:`,
      error
    );
  }
}

// Bot initialisieren
startBot();
