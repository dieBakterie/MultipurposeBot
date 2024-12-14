import { checkTwitchLive } from "../intervals/checkTwitchLive.js";

export default {
  name: "ready",
  once: true, // Gibt an, ob das Event nur einmal ausgeführt werden soll
  execute(client) {
    console.log(`Bot ist bereit und eingeloggt als ${client.user.tag}`);

    // Twitch-Live-Check alle 60 Sekunden
    setInterval(() => {
      checkTwitchLive(client).catch((err) => {
        console.error("Fehler beim Twitch-Live-Check:", err);
      });
    }, 60 * 1000); // Alle 60 Sekunden
  },
};
