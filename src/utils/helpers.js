export function getGuildChannels(guild) {
  return guild.channels.cache
    .filter((channel) => channel.type === 0) // Nur Textkanäle
    .map((channel) => ({
      name: channel.name,
      id: channel.id,
    }));
}
