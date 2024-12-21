// src/events/ready.js
import { checkTwitchLive } from "../services/Twitch/checkTwitchLive.js";
import { logAndThrowError } from "../utils/helpers.js";

export default {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`Bot ist bereit und eingeloggt als ${client.user.tag}`);

    // Funktion für den Twitch-Live-Check mit Fehlerbehandlung
    const performTwitchLiveCheck = async () => {
      try {
        await checkTwitchLive(client);
        console.log("Twitch-Live-Check erfolgreich abgeschlossen.");
      } catch (error) {
        logAndThrowError("Fehler beim Twitch-Live-Check", error);
      }
    };

    // Starte den ersten Twitch-Live-Check sofort
    performTwitchLiveCheck();

    // Wiederhole den Twitch-Live-Check alle 60 Sekunden
    setInterval(performTwitchLiveCheck, 60 * 1000); // Alle 60 Sekunden
  },
};
