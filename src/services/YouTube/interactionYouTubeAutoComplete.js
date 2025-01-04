// src/services/YouTube/interactionYouTubeAutoComplete.js
import { youtubeApiKey } from "../../alias.js";
import { getLatestVideos } from "./youtube.js";
import { listYouTubeChannels, setDiscordChannelForYouTubeChannel, removeYouTubeChannel } from "../../database/youtubeDatabase.js";

export async function handleYouTubeAutoComplete(interaction) {
  const focusedOption = interaction.options.getFocused(true);
  const inputValue = focusedOption.value;

  if (focusedOption.name === "user_name") {
    const youtubeSearchResults = await getLatestVideos(
      "search",
      {
        part: "id,snippet",
        maxResults: 10,
        q: inputValue,
        key: youtubeApiKey,
      }
    );

    const channels = youtubeSearchResults.data.items.map((item) => ({
      name: item.snippet.title,
      value: item.id.channelId,
    }));

    await interaction.respond(channels);
  } else if (focusedOption.name === "channel_id") {
    const storedChannels = await listYouTubeChannels();

    const channels = storedChannels.map((channel) => ({
      name: channel.user_name,
      value: channel.user_id,
    }));

    await interaction.respond(channels);
  }
}

export async function setYouTubeChannel(interaction) {
  const channelName = interaction.options.getString("user_name");
  const channelId = interaction.options.getString("channel_id");
  const discordChannelId = interaction.options.getChannel("notification_channel")?.id;

  await setDiscordChannelForYouTubeChannel(channelId, discordChannelId);

  await interaction.reply({
    content: `YouTube-Kanal "${channelName}" wurde erfolgreich hinzugefügt.`,
    ephemeral: true,
  });
}

export async function removeYouTubeChannel(interaction) {
  const channelId = interaction.options.getString("channel_id");

  await removeYouTubeChannel(channelId);

  await interaction.reply({
    content: `YouTube-Kanal mit der ID "${channelId}" wurde erfolgreich entfernt.`,
    ephemeral: true,
  });
}
