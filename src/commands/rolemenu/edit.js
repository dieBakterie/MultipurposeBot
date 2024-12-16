import { SlashCommandBuilder } from "discord.js";
import {
  fetchAllGroups,
  updateGroupRole,
} from "../../database/.js";

export default {
  data: new SlashCommandBuilder()
    .setName("rolemenu")
    .setDescription("Erstelle und bearbeite RoleMenus.")
    .addSubcommand((sub) =>
      sub
        .setName("edit")
        .setDescription("Bearbeite eine existierende Gruppe.")
        .addStringOption((option) =>
          option
            .setName("group")
            .setDescription("Der Name der Gruppe.")
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addStringOption((option) =>
          option
            .setName("role")
            .setDescription("Die Rolle, die bearbeitet werden soll.")
            .setAutocomplete(true)
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("new_label")
            .setDescription("Neue Beschriftung für die Rolle.")
        )
        .addStringOption((option) =>
          option.setName("emoji").setDescription("Neues Emoji/Neue Icon.")
        )
    ),
  async execute(interaction) {
    const groupName = interaction.options.getString("group");
    const roleId = interaction.options.getString("role");
    const newLabel = interaction.options.getString("new_label");
    const newEmoji = interaction.options.getString("emoji");

    try {
      await updateGroupRole(groupName, roleId, newLabel, newEmoji);
      interaction.reply({
        content: `Rolle in Gruppe **${groupName}** wurde aktualisiert.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error("Fehler beim Bearbeiten der Rolle:", error);
      interaction.reply({
        content: "Fehler beim Bearbeiten der Rolle.",
        ephemeral: true,
      });
    }
  },
};
