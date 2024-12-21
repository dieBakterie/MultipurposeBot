// src/commands/Rolemenu/rolemenu.js
import pkg from "discord.js";
const { MessageActionRow, ButtonBuilder, SlashCommandBuilder } = pkg;
import {
  createRoleMenuGroup,
  addRolesToGroup,
  fetchGroupRoles,
  fetchAllGroups,
  updateGroupRole,
} from "../../database/rolemenuDatabase.js";

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
    )
    .addSubcommand((sub) =>
      sub
        .setName("create")
        .setDescription("Erstelle ein RoleMenu aus einer Gruppe.")
        .addStringOption((option) =>
          option
            .setName("group")
            .setDescription("Der Name der Gruppe.")
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
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
          option.setName("emoji").setDescription("Neues .emoji/Neue Icon.")
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const groupName = interaction.options.getString("group");

    try {
      if (subcommand === "set-group") {
        const mode = interaction.options.getString("mode");
        const rolesInput = interaction.options.getString("roles");

        // Parse Rollen und Labels
        const roles = rolesInput.split(",").map((pair) => {
          const [roleId, label] = pair.split(":");
          return { roleId: roleId.trim(), label: label.trim() };
        });

        // Gruppe erstellen oder aktualisieren
        await createRoleMenuGroup(groupName, mode, interaction.guild.id);

        // Rollen zur Gruppe hinzufügen
        for (const { roleId, label } of roles) {
          await addRolesToGroup(groupName, roleId, label, interaction.guild.id);
        }

        await interaction.reply({
          content: `Gruppe **${groupName}** wurde erstellt/aktualisiert.`,
          ephemeral: true,
        });
      } else if (subcommand === "create") {
        const roles = await fetchGroupRoles(groupName, interaction.guild.id);

        if (!roles || roles.length === 0) {
          return interaction.reply({
            content: `Keine Rollen in der Gruppe **${groupName}** gefunden.`,
            ephemeral: true,
          });
        }

        // Dynamische Buttons erstellen
        const rows = [];
        let actionRow = new MessageActionRow();

        for (let i = 0; i < roles.length; i++) {
          const { roleId, label, emoji } = roles[i];

          const button = new ButtonBuilder()
            .setCustomId(`rolemenu_${roleId}`)
            .setLabel(label)
            .setStyle("PRIMARY")
            .set.emoji(emoji);

          actionRow.addComponents(button);

          if (actionRow.components.length === 5 || i === roles.length - 1) {
            rows.push(actionRow);
            actionRow = new MessageActionRow();
          }
        }

        await interaction.reply({
          content: `**${groupName}** RoleMenu`,
          components: rows,
        });
      } else if (subcommand === "edit") {
        const roleId = interaction.options.getString("role");
        const newLabel = interaction.options.getString("new_label");
        const newEmoji = interaction.options.getString("emoji");

        await updateGroupRole(groupName, roleId, newLabel, newEmoji);

        await interaction.reply({
          content: `Rolle in Gruppe **${groupName}** wurde aktualisiert.`,
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error("[Rolemenu Command] Fehler bei der Verarbeitung des RoleMenus:", error);
      await interaction.reply({
        content: "[Rolemenu Command] Fehler bei der Verarbeitung. Versuche es erneut.",
        ephemeral: true,
      });
    }
  },
};
