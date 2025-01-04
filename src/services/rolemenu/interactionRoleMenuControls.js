// src/services/Rolemenu/interactionRoleMenuControls.js
import { addRole, removeRole } from "../../utils/roleActions.js";

/**
 * Handhabt Rollensteuerungs-Interaktionen.
 * @param {Interaction} interaction - Die Benutzerinteraktion.
 */
export async function handleRoleMenuControl(interaction) {
  const customId = interaction.customId;

  if (!customId.startsWith("role_")) {
    return interaction.reply({
      content: "Ungültige Rollenaktion.",
      ephemeral: true,
    });
  }

  // Extrahiere Aktion und Rolle aus der Custom ID
  const [, action, roleId] = customId.split("_");
  const member = interaction.member;

  if (!roleId || !member) {
    return interaction.reply({
      content: "Fehler: Keine Rolle oder Benutzer gefunden.",
      ephemeral: true,
    });
  }

  try {
    // Aktion ausführen basierend auf der Custom ID
    switch (action) {
      case "add":
        await addRole(member, roleId);
        await interaction.reply({
          content: "Rolle erfolgreich hinzugefügt!",
          ephemeral: true,
        });
        break;

      case "remove":
        await removeRole(member, roleId);
        await interaction.reply({
          content: "Rolle erfolgreich entfernt!",
          ephemeral: true,
        });
        break;

      default:
        await interaction.reply({
          content: "Unbekannte Rollenaktion.",
          ephemeral: true,
        });
    }
  } catch (error) {
    console.error(`Fehler bei der Rollensteuerung: ${error.message}`);
    await interaction.reply({
      content: "Fehler beim Verarbeiten der Rollenaktion.",
      ephemeral: true,
    });
  }
}
