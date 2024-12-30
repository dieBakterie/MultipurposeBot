// src/events/interactionCreate.ts
ractionCreate.js
import { handleMusicControl } from "../services/music/interactionMusicControls.js";
import { handleRoleMenuControl } from "../services/rolemenu/interactionRoleMenuControls.js";
import { getTrackedTwitchChannels } from "../database/twitchDatabase.js";
import {
  fetchAllRoleMenus,
  fetchRoleMenuRoles,
} from "../database/rolemenuDatabase.js";
import { searchStreamer } from "../services/Twitch/twitch.js";

/**
 * Helper: Filtere und formatiere Autocomplete-Optionen.
 */
function filterAndMapChoices(items, filterKey, focusedValue) {
  return items
    .filter((item) =>
      item[filterKey]?.toLowerCase().includes(focusedValue.toLowerCase())
    )
    .map((item) => ({
      name: item[filterKey],
      value: item[filterKey],
    }));
}

export default {
  name: "interactionCreate",
  async execute(interaction) {
    try {
      // **Button-Interaktionen**
      if (interaction.isButton()) {
        // Musiksteuerung
        if (["play_pause", "skip", "stop"].includes(interaction.customId)) {
          await handleMusicControl(interaction);
        } else if (interaction.customId.startsWith("role_")) {
          // Rollensteuerung
          await handleRoleMenuControl(interaction);
        }
        return;
      }

      // **Autocomplete-Interaktionen**
      if (interaction.isAutocomplete()) {
        const focusedOption = interaction.options.getFocused(true);

        // Autocomplete für Twitch-Streamer
        if (interaction.commandName === "twitch") {
          const subcommand = interaction.options.getSubcommand();

          if (subcommand === "add" && focusedOption.name === "user_name") {
            if (!focusedOption.value?.trim()) {
              return interaction.respond([]);
            }

            try {
              const streamers = await searchStreamer(focusedOption.value);
              const choices = filterAndMapChoices(
                streamers,
                "display_name",
                focusedOption.value
              );
              return interaction.respond(choices);
            } catch (error) {
              console.error(
                "Fehler bei der Autovervollständigung für Twitch-Streamer:",
                error
              );
              return interaction.respond([]);
            }
          }

          if (
            ["remove", "set-channel"].includes(subcommand) &&
            focusedOption.name === "user_name"
          ) {
            const trackedStreamers = await getTrackedTwitchChannels();
            const choices = filterAndMapChoices(
              trackedStreamers,
              "userName",
              focusedOption.value
            );
            return interaction.respond(choices);
          }
        }

        // Autocomplete für Rollen im RoleMenu
        if (interaction.commandName === "rolemenu") {
          const subcommand = interaction.options.getSubcommand();

          if (subcommand === "edit") {
            if (focusedOption.name === "message_id") {
              const roleMenus = await fetchAllRoleMenus(interaction.guild.id);
              const choices = roleMenus.map((menu) => ({
                name: `Gruppe: ${menu.group_name}, ID: ${menu.message_id}`,
                value: menu.message_id,
              }));
              return interaction.respond(choices);
            } else if (focusedOption.name === "emoji") {
              const messageId = interaction.options.getString("message_id");
              if (!messageId) return interaction.respond([]);
              const roles = await fetchRoleMenuRoles(messageId);
              const choices = roles.map((role) => ({
                name: `Emoji: ${role.emoji} → Rolle: ${role.role_name}`,
                value: role.emoji,
              }));
              return interaction.respond(choices);
            } else if (focusedOption.name === "role") {
              const guildRoles = interaction.guild.roles.cache.filter((role) =>
                role.name
                  .toLowerCase()
                  .includes(focusedOption.value.toLowerCase())
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

      // **Slash-Commands**
      if (interaction.isCommand()) {
        const command = interaction.client.commands.get(
          interaction.commandName
        );
        if (!command) return;

        await command.execute(interaction);
      }
    } catch (error) {
      console.error("Fehler bei der Interaktion:", error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "Ein Fehler ist aufgetreten.",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "Ein Fehler ist aufgetreten.",
          ephemeral: true,
        });
      }
    }
  },
};
