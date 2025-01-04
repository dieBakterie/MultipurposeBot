// src/services/Music/handlePlatformControls.js
import { handleMusicCommand } from "./handleMusicCommands.js";

const platformActions = {
  spotify: {
    skip: "skip",
    "play-pause": "pause",
    play: "play",
    stop: "stop",
  },
  youtube: {
    skip: "skip",
    "play-pause": "pause",
    play: "play",
    stop: "stop",
  },
};

/**
 * Generische Plattform-Handler-Funktion.
 * @param {Interaction} interaction - Die Benutzerinteraktion.
 * @param {string} platform - Die Plattform (z.B. "spotify", "youtube").
 */
export default async function handlePlatformControl(interaction, platform) {
  if (!interaction.isButton()) return;

  const actionKey = interaction.customId.replace(`${platform}_`, "");
  const action = platformActions[platform]?.[actionKey];

  if (!action) {
    return interaction.reply({
      content: "Unbekannte Aktion.",
      ephemeral: true,
    });
  }

  await handleMusicCommand(interaction, platform, action);
}
