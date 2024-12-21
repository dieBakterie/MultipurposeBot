// src/events/interactionCreate.js
import { handleMusicControl } from "../services/music/interactionMusicControls.js";
import { handleRoleMenuControl } from "../services/rolemenu/interactionRoleMenuControls.js";
import { getTrackedTwitchChannels } from "../database/twitchDatabase.js";
import {
  fetchAllRoleMenus,
  fetchRoleMenuRoles,
} from "../database/rolemenuDatabase.js";

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
        if (
          interaction.commandName === "twitch" &&
          focusedOption.name === "user_name"
        ) {
          const streamers = await getTrackedTwitchChannels();
          const choices = streamers.filter((streamer) =>
            streamer.toLowerCase().includes(focusedOption.value.toLowerCase())
          );
          return interaction.respond(
            choices.map((choice) => ({ name: choice, value: choice }))
          );
        }

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
