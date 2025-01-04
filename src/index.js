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

// Shoukaku-Setup
const resolvedLavaLinkHost = isDocker === "true" ? "lavaLink" : lavaLinkHost;
export const LavalinkNodes = [
  {
    name: "MainNode",
    url: `${resolvedLavaLinkHost}:${lavaLinkPort}`,
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

client.shoukaku = shoukaku;

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
  const files = await fs.promises.readdir(directory, { withFileTypes: true });

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
  try {
    // Commands laden
    console.log("Lade Commands...");
    const commandFiles = await loadFilesRecursively(
      path.resolve(__dirname, "./commands"),
      "command"
    );
    for (const file of commandFiles) {
      const command = (await import(`file://${file}`)).default;
      if (command?.data && command?.execute) {
        client.commands.set(command.data.name, command);
        console.log(`Command geladen: ${command.data.name}`);
      } else {
        console.warn(`Überspringe ungültigen Command in Datei: ${file}`);
      }
    }

    // Registriere die Commands bei Discord
    console.log("Registriere Commands bei Discord...");
    const commandData = client.commands.map((command) => command.data.toJSON());
    const rest = new REST({ version: "10" }).setToken(discordToken);
    await rest.put(
      Routes.applicationGuildCommands(discordClientId, discordGuildId),
      {
        body: commandData,
      }
    );
    console.log(
      `${discordFeedbackSuccess.emoji} Commands erfolgreich registriert!`
    );

    // Events laden
    console.log("Lade Events...");
    const eventFiles = await loadFilesRecursively(
      path.resolve(__dirname, "./events"),
      "event"
    );
    for (const file of eventFiles) {
      const event = (await import(`file://${file}`)).default;
      if (event?.name && event?.execute) {
        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args, client));
        } else {
          client.on(event.name, (...args) => event.execute(...args, client));
        }
        console.log(`Event geladen: ${event.name}`);
      } else {
        console.warn(`Überspringe ungültiges Event in Datei: ${file}`);
      }
    }
  } catch (error) {
    console.error(
      `${discordFeedbackError.emoji} Fehler bei der Registrierung der Commands und Events:`,
      error
    );
  }
}

// Startet den Bot
async function startBot() {
  try {
    console.log("Starte den Bot...");

    // Commands und Events laden und registrieren
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
