// src/services/Spotify/interactionSpotifyControls.js
import handlePlatformControl from "../Music/handlePlatformControls.js";
import { sendMusicControls } from "../Music/createMusicControls.js";
import {
  spotifyMusicPlayPause,
  spotifyMusicSkip,
  spotifyMusicStop,
} from "../../alias.js";

/**
 * Behandelt Spotify-spezifische Interaktionen und erstellt Steuerung.
 * @param {Interaction} interaction - Die Benutzerinteraktion.
 * @param {TextChannel} channel - Der Discord-Channel, in dem die Steuerung angezeigt werden soll.
 * @param {string} guildId - Die ID der Guild.
 */
export default async function handleSpotifyControl(
  interaction,
  channel,
  guildId
) {
  if (interaction.isButton()) {
    await handlePlatformControl(interaction, "spotify");
  } else {
    await sendMusicControls(channel, guildId, {
      platform: "Spotify",
      playPauseId: "spotify-play_pause",
      skipId: "spotify-skip",
      stopId: "spotify-stop",
      emojis: {
        playPause: `${spotifyMusicPlayPause}`,
        skip: `${spotifyMusicSkip}`,
        stop: `${spotifyMusicStop}`,
      },
    });
  }
}
