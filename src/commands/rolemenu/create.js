import {
  SlashCommandBuilder,
  MessageActionRow,
  ButtonBuilder,
} from "discord.js";
import { fetchGroupRoles } from "../database/rolemenuDatabase.js";

export default {
  data: new SlashCommandBuilder()
    .setName("rolemenu")
    .setDescription("Erstelle und bearbeite RoleMenus.")
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
    ),
  async execute(interaction) {
    const groupName = interaction.options.getString("group");
    const roles = await fetchGroupRoles(groupName, interaction.guild.id);

    if (roles.length === 0) {
      return interaction.reply({
        content: `Keine Rollen in der Gruppe **${groupName}** gefunden.`,
        ephemeral: true,
      });
    }

    // Buttons erstellen
    const rows = [];
    let actionRow = new MessageActionRow();

    for (let i = 0; i < roles.length; i++) {
      const { roleId, label, emoji } = roles[i];

      const button = new ButtonBuilder()
        .setCustomId(`rolemenu_${roleId}`)
        .setLabel(label)
        .setStyle("PRIMARY")
        .setEmoji(emoji);

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
  },
};
