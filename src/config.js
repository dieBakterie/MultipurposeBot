import dotenv from "dotenv-safe";

// Lade die Umgebungsvariablen aus .env
dotenv.config();

// Konfigurationsobjekt
const config = {
  discord: {
    clientId: process.env.DISCORD_CLIENT_ID,
    token: process.env.DISCORD_TOKEN,
    guildId: process.env.DISCORD_GUILD_ID,
    // emoji: "",
    userFeedback: {
      error: {
        emoji: "❌",
        // message: "",
      },
      success: {
        emoji: "✅",
        // message: "",
      },
      info: {
        emoji: "ℹ️",
        // message: "",
      },
      list: {
        emoji: "📄",
        // message: "",
      },
      link: {
        emoji: "🔗",
        // message: "",
      },
    },
  },
  twitch: {
    clientId: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_CLIENT_SECRET,
    // emoji: "",
    userFeedback: {
      error: {
        emoji: "❌",
        // message: "",
      },
      success: {
        emoji: "✅",
        // message: "",
      },
      info: {
        emoji: "ℹ️",
        // message: "",
      },
      list: {
        emoji: "📄",
        // message: "",
      },
      link: {
        emoji: "🔗",
        // message: "",
      },
    },
  },
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  lavalink: {
    host: process.env.LAVALINK_HOST,
    port: parseInt(process.env.LAVALINK_PORT, 10),
    password: process.env.LAVALINK_PASSWORD,
  },
  spotify: {
    // Einstellungen: Spotify
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    // emoji: "",
    // Einstellungen Spotify: Benutzer-Feedback
    userFeedback: {
      error: {
        emoji: "❌",
        // message: "",
      },
      success: {
        emoji: "✅",
        // message: "",
      },
      info: {
        emoji: "ℹ️",
        // message: "",
      },
      list: {
        emoji: "📄",
        // message: "",
      },
    },
    // Einstellungen Spotify: Musik
    music: {
      emoji: "🎶",
      // Einstellungen Spotify Musik: Benutzer-Feedback
      UserFeedback: {
        error: {
          emoji: "❌",
          // message: "",
        },
        success: {
          emoji: "✅",
          // message: "",
        },
        info: {
          emoji: "ℹ️",
          // message: "",
        },
        list: {
          emoji: "📄",
          // message: "",
        },
      },
      controls: {
        playPause: "⏯",
        pause: "⏸",
        skip: "⏭",
        stop: "⏹",
      },
    },
  },

  // Einstellungen: YouTube
  youTube: {
    APIKey: process.env.YOUTUBE_API_KEY,
    // Einstellungen YouTube: Generell
    // emoji: "",
    userFeedback: {
      error: {
        emoji: "❌",
        // message: "",
      },
      success: {
        emoji: "✅",
        // message: "",
      },
      info: {
        emoji: "ℹ️",
        // message: "",
      },
      list: {
        emoji: "📄",
        // message: "",
      },
    },
    // Einstellungen YouTube: Musik
    music: {
      emoji: "🎶",
      error: {
        emoji: "❌",
        // message: "",
      },
      success: {
        emoji: "✅",
        // message: "",
      },
      info: {
        emoji: "ℹ️",
        // message: "",
      },
      list: {
        emoji: "📄",
        // message: "",
      },
      controls: {
        playPause: "⏯",
        pause: "⏸",
        skip: "⏭",
        stop: "⏹",
      },
    },
    // Einstellungen YouTube: Benachrichtigungen
    notification: {
      emoji: "📢",
      // Einstellungen YouTube: Benachrichtigungen: Benutzer-Feedback
      userFeedback: {
        error: {
          emoji: "❌",
          // message: "",
        },
        success: {
          emoji: "✅",
          // message: "",
        },
        info: {
          emoji: "ℹ️",
          // message: "",
        },
        list: {
          emoji: "📄",
          // message: "",
        },
      },
    },
  },

  // Einstellungen: Generell
  general: {
    environment: process.env.NODE_ENV || "development", // Standardwert für NODE_ENV
    // Einstellungen: Generell: Benutzer-Feedback
    userFeedback: {
      error: {
        emoji: "❌",
        // message: "",
      },
      success: {
        emoji: "✅",
        // message: "",
      },
      info: {
        emoji: "ℹ️",
        // message: "",
      },
      list: {
        emoji: "📄",
        // message: "",
      },
      link: {
        emoji: "🔗",
        // message: "",
      },
    },
    // Einstellungen Generell: Musik
    music: {
      emoji: "🎵",
      userFeedback: {
        error: {
          emoji: "❌",
          // message: "",
        },
        success: {
          emoji: "✅",
          // message: "",
        },
        info: {
          emoji: "ℹ️",
          // message: "",
        },
        list: {
          emoji: "📄",
          // message: "",
        },
        link: {
          emoji: "🔗",
          // message: "",
        },
      },
      // Einstellungen Generell Musik: Steuerungen
      controls: {
        playPause: "⏯",
        pause: "⏸",
        skip: "⏭",
        stop: "⏹",
      },
    },
  },
};

// Überprüfen, ob alle kritischen Variablen gesetzt sind
function validateConfig(config) {
  for (const [category, settings] of Object.entries(config)) {
    for (const [key, value] of Object.entries(settings)) {
      if (value === undefined || value === null) {
        throw new Error(`Fehlende KonfigurationsVariable: ${category}.${key}`);
      }
    }
  }
}

// Validierung ausführen
validateConfig(config);

// Dynamische Exporte erstellen
const exportsConfig = {};

function createDynamicExports(obj, prefix = "") {
  for (const [key, value] of Object.entries(obj)) {
    const exportName = `${prefix}${key[0].toUpperCase() + key.slice(1)}`;
    if (typeof value === "object" && value !== null) {
      createDynamicExports(value, exportName); // Rekursiver Aufruf
    } else {
      exportsConfig[exportName] = value; // Export hinzufügen
    }
  }
}

createDynamicExports(config);

// Standard-Export für das Konfigurationsobjekt
export default config;

// Exportiere alle dynamischen Schlüssel in einem einzigen Objekt
export { exportsConfig };
