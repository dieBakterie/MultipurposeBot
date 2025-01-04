// src/services/Rolemenu/interactionRoleMenuAutoComplete.js
import {
  fetchAllRoleMenus,
  fetchRoleMenuRoles,
} from "../database/rolemenuDatabase.js";

export async function handleRolMenuAutoCompleteSuggestions(
  interaction,
  focusedOption
) {
  // Autocomplete für Rollen im RoleMenu
  if (interaction.commandName === "rolemenu") {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "edit") {
      if (focusedOption.name === "message_id") {
        const roleMenus = await fetchAllRoleMenus(interaction.guild.id);
        return interaction.respond(
          roleMenus.map((menu) => ({
            name: `Gruppe: ${menu.group_name}, ID: ${menu.message_id}`,
            value: menu.message_id,
          }))
        );
      } else if (focusedOption.name === "emoji") {
        const messageId = interaction.options.getString("message_id");
        if (!messageId) return interaction.respond([]);
        const roles = await fetchRoleMenuRoles(messageId);
        return interaction.respond(
          roles.map((role) => ({
            name: `Emoji: ${role.emoji} → Rolle: ${role.role_name}`,
            value: role.emoji,
          }))
        );
      } else if (focusedOption.name === "role") {
        const guildRoles = interaction.guild.roles.cache.filter((role) =>
          role.name.toLowerCase().includes(focusedOption.value.toLowerCase())
        );
        const choices = guildRoles.map((role) => ({
          name: role.name,
          value: role.id,
        }));
        return interaction.respond(choices);
      }
    }
  }
}
