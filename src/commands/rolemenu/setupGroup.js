import { SlashCommandBuilder } from "discord.js";
import {
  createRoleMenuGroup,
  addRolesToGroup,
  fetchGroupRoles,
} from "../../database/.js";

export default {
  data: new SlashCommandBuilder()
    .setName("rolemenu")
    .setDescription("Erstelle und bearbeite RoleMenus.")
    .addSubcommand((sub) =>
      sub
        .setName("set-group")
        .setDescription("Erstelle oder bearbeite eine Gruppe.")
        .addStringOption((option) =>
          option
            .setName("group")
            .setDescription("Der Name der Gruppe.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("mode")
            .setDescription("Modus der Auswahl.")
            .addChoices(
              { name: "Einzelauswahl", value: "single" },
              { name: "Mehrfachauswahl", value: "multiple" }
            )
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("roles")
            .setDescription(
              "Definiere Rollen mit Beschriftung: role1:label1,role2:label2"
            )
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const groupName = interaction.options.getString("group");
    const mode = interaction.options.getString("mode");
    const rolesInput = interaction.options.getString("roles");

    // Parse Rollen und Labels
    const roles = rolesInput.split(",").map((pair) => {
      const [roleId, label] = pair.split(":");
      return { roleId: roleId.trim(), label: label.trim() };
    });

    try {
      // Gruppe erstellen oder aktualisieren
      await createRoleMenuGroup(groupName, mode, interaction.guild.id);

      // Rollen zur Gruppe hinzufügen
      for (const { roleId, label } of roles) {
        await addRolesToGroup(groupName, roleId, label, interaction.guild.id);
      }

      interaction.reply({
        content: `Gruppe **${groupName}** wurde erstellt/aktualisiert.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error("Fehler beim Erstellen der Gruppe:", error);
      interaction.reply({
        content: "Fehler beim Erstellen der Gruppe. Versuche es erneut.",
        ephemeral: true,
      });
    }
  },
};
