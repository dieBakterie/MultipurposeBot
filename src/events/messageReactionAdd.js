// Importiere alle erforderlichen Module
/* import {
  playSong,
  pauseSong,
  skipSong,
  stopPlayback,
} from "../music/player.js"; */
// Importiere alle erforderlichen Konfigurationsobjekte
import { exportsConfig } from "../config.js";
const {
  musicEmoji,
  musicControlsPlayPauseEmoji,
  musicControlsPauseEmoji,
  musicControlsSkipEmoji,
  musicControlsStopEmoji,
} = exportsConfig;

export default {
  name: "messageReactionAdd",
  async execute(reaction, user) {
    if (user.bot) return; // Ignoriere Bot-Reaktionen

    const { message, emoji } = reaction;
    const guildId = message.guild.id;

    // Stelle sicher, dass die Reaktion von der Musiksteuerungsnachricht stammt
    if (message.embeds[0]?.title !== `${musicEmoji} Musiksteuerung`) return;

    // Führe die Aktion basierend auf dem Emoji aus
    switch (emoji.name) {
      case musicControlsPlayPauseEmoji:
        await playSong(guildId);
        break;
      case musicControlsPauseEmoji:
        await pauseSong(guildId);
        break;
      case musicControlsSkipEmoji:
        await skipSong(guildId);
        break;
      case musicControlsStopEmoji:
        await stopPlayback(guildId);
        break;
      default:
        break;
    }

    // Reaktion entfernen
    await reaction.users.remove(user.id);
  },
};
