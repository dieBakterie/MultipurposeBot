import { checkTwitchLive } from "../intervals/checkTwitchLive.js";

export default {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`Bot ist bereit und eingeloggt als ${client.user.tag}`);

    // Twitch-Live-Check alle 60 Sekunden
    setInterval(() => {
      checkTwitchLive(client).catch((error) => {
        console.error("Fehler beim Twitch-Live-Check:", error);
      });
    }, 60 * 1000); // Alle 60 Sekunden
  },
};
