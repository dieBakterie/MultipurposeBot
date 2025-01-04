// src/services/YouTube/interactionYouTubeControls.js
import handlePlatformControl from "../Music/handlePlatformControls.js";

export default async function handleYouTubeControl(interaction) {
  await handlePlatformControl(interaction, "youtube");
}
