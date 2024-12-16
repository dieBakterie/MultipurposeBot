import { addRole, removeRole } from "../utils/roleActions.js";

export async function handleRoleMenuControl(interaction) {
  const customId = interaction.customId;

  if (customId.startsWith("role_")) {
    const action = customId.split("_")[1];
    const roleId = customId.split("_")[2];
    const member = interaction.member;

    if (!roleId || !member) {
      return interaction.reply({
        content: "Fehler: Keine Rolle gefunden.",
        ephemeral: true,
      });
    }

    try {
      if (action === "add") {
        await addRole(member, roleId);
        await interaction.reply({
          content: `Rolle erfolgreich hinzugefügt!`,
          ephemeral: true,
        });
      } else if (action === "remove") {
        await removeRole(member, roleId);
        await interaction.reply({
          content: `Rolle erfolgreich entfernt!`,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "Unbekannte Aktion.",
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error(`Fehler bei der Rollensteuerung: ${error.message}`);
      await interaction.reply({
        content: "Fehler beim Zuweisen der Rolle.",
        ephemeral: true,
      });
    }
  }
}
