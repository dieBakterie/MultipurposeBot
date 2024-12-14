import { getTrackedTwitchChannels } from "../database/twitchDatabase.js";

export default {
  name: "interactionCreate",
  async execute(interaction) {
    if (interaction.isAutocomplete()) {
      const focusedOption = interaction.options.getFocused(true);

      // Autocomplete für Twitch-Streamer
      if (
        interaction.commandName === "twitch" &&
        focusedOption.name === "username"
      ) {
        const streamers = await getTrackedTwitchChannels();
        const choices = streamers.filter((streamer) =>
          streamer.toLowerCase().includes(focusedOption.value.toLowerCase())
        );
        return interaction.respond(
          choices.map((choice) => ({ name: choice, value: choice }))
        );
      }

      // Autocomplete für Rollen
      if (interaction.commandName === "rolemenu") {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "edit") {
          if (focusedOption.name === "message_id") {
            // Vorschläge für Rolemenu-IDs
            const roleMenus = await fetchAllRoleMenus(interaction.guild.id);
            await interaction.respond(
              roleMenus.map((menu) => ({
                name: `Gruppe: ${menu.group_name}, ID: ${menu.message_id}`,
                value: menu.message_id,
              }))
            );
          } else if (focusedOption.name === "emoji") {
            // Vorschläge für Emojis eines Rolemenus
            const messageId = interaction.options.getString("message_id");
            if (!messageId) {
              return interaction.respond([]);
            }
            const roles = await fetchRoleMenuRoles(messageId);
            await interaction.respond(
              roles.map((role) => ({
                name: `Emoji: ${role.emoji} → Rolle: ${role.role_name}`,
                value: role.emoji,
              }))
            );
          } else if (focusedOption.name === "role") {
            // Vorschläge für Rollen
            const guildRoles = interaction.guild.roles.cache.filter((role) =>
              role.name.toLowerCase().includes(focusedOption.value.toLowerCase())
            );

            const choices = guildRoles.map((role) => ({
              name: role.name,
              value: role.id,
            }));

            await interaction.respond(choices);
          }
        }
      }
    }

    if (!interaction.isCommand()) return;

    // Slash Command ausführen
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error("Fehler beim Ausführen des Befehls:", error);
      await interaction.reply({
        content: "Es gab ein Problem beim Ausführen des Befehls.",
        ephemeral: true,
      });
    }
  },
};
