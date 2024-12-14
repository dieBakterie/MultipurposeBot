import { SlashCommandBuilder } from "discord.js";
import { exportsConfig } from "../../config.js";
const {
  GeneralUserFeedbackErrorEmoji,
  GeneralUserFeedbackSuccessEmoji,
  GeneralUserFeedbackInfoEmoji,
} = exportsConfig;
import {
  createRoleMenu,
  addActiveSetup,
  addRoleMenuRole,
  removeActiveSetup,
} from "../../database/rolemenuDatabase.js";

const activeSetups = new Map();
const SETUP_TIMEOUT = 10 * 60 * 1000;

export default {
  data: new SlashCommandBuilder()
    .setName("rolemenu")
    .setDescription("Verwalte Rolemenus.")
    .addSubcommand((sub) =>
      sub
        .setName("setup")
        .setDescription("Startet das Setup für ein Rolemenu.")
        .addStringOption((option) =>
          option
            .setName("group")
            .setDescription("Name der Gruppe.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("mode")
            .setDescription("Modus: Einzelwahl oder Mehrfachwahl.")
            .setRequired(true)
            .addChoices(
              { name: "Einzelwahl", value: "single" },
              { name: "Mehrfachwahl", value: "multi" }
            )
        )
        .addStringOption((option) =>
          option
            .setName("text")
            .setDescription("Nachrichtentext für das Rolemenu.")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("complete")
        .setDescription("Schließt das Setup eines Rolemenus ab.")
        .addStringOption((option) =>
          option
            .setName("message_id")
            .setDescription("Nachricht-ID des Rolemenus.")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("edit")
        .setDescription("Bearbeite ein Rolemenu.")
        .addStringOption((option) =>
          option
            .setName("message_id")
            .setDescription("Nachricht-ID des Rolemenus.")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "setup") {
      const groupName = interaction.options.getString("group");
      const mode = interaction.options.getString("mode");
      const text = interaction.options.getString("text");
      const guildId = interaction.guild.id;

      const menuMessage = await interaction.channel.send(text);

      // Verwende die ausgelagerte Funktion, um RoleMenu zu erstellen
      const rolemenuId = await createRoleMenu(
        menuMessage.id,
        interaction.channel.id,
        groupName,
        mode,
        guildId
      );

      await interaction.reply(
        `${GeneralUserFeedbackSuccessEmoji} Rolemenu erstellt:\n- Nachricht-ID: **${
          menuMessage.id
        }**\n- Gruppe: **${groupName}**\n- Modus: **${
          mode === "single" ? "Einzelwahl" : "Mehrfachwahl"
        }**`
      );

      await interaction.followUp(
        `${GeneralUserFeedbackInfoEmoji} Reagiere mit Emojis auf diese Nachricht und wähle anschließend Rollen aus.`
      );

      const filter = (reaction, user) => !user.bot;
      const collector = menuMessage.createReactionCollector({ filter });

      activeSetups.set(menuMessage.id, {
        collector,
        timeout: Date.now() + SETUP_TIMEOUT,
      });

      // Verwende die ausgelagerte Funktion, um das Setup hinzuzufügen
      await addActiveSetup(
        menuMessage.id,
        guildId,
        new Date(Date.now() + SETUP_TIMEOUT)
      );

      collector.on("collect", async (reaction, user) => {
        const emoji = reaction.emoji.name;

        await interaction.followUp({
          content: `${GeneralUserFeedbackInfoEmoji} Reagiere mit **${emoji}**. Wähle nun eine Rolle.`,
          ephemeral: true,
        });

        const roleResponse = await interaction.channel.awaitMessages({
          filter: (msg) => msg.author.id === user.id,
          max: 1,
          time: 60 * 1000,
        });

        const role = roleResponse.first().mentions.roles.first();
        if (!role) {
          await interaction.followUp({
            content: `${GeneralUserFeedbackInfoEmoji} Ungültige Rolle. Bitte erneut versuchen.`,
            ephemeral: true,
          });
          return;
        }

        // Verwende die ausgelagerte Funktion, um die Rolle hinzuzufügen
        await addRoleMenuRole(rolemenuId, emoji, role.id);

        await interaction.followUp(
          `${GeneralUserFeedbackSuccessEmoji} Emoji **${emoji}** wurde mit der Rolle <@&${role.id}> verknüpft.`
        );
      });
    } else if (subcommand === "complete") {
      const messageId = interaction.options.getString("message_id");

      if (!activeSetups.has(messageId)) {
        await interaction.reply({
          content: `${GeneralUserFeedbackInfoEmoji} Kein aktives Setup für diese Nachricht gefunden.`,
          ephemeral: true,
        });
        return;
      }

      const { collector } = activeSetups.get(messageId);
      collector.stop();
      activeSetups.delete(messageId);

      // Verwende die ausgelagerte Funktion, um das Setup zu entfernen
      await removeActiveSetup(messageId);

      await interaction.reply(
        `${GeneralUserFeedbackSuccessEmoji} Das Setup für die Nachricht **${messageId}** wurde abgeschlossen.`
      );
    }
  },
};
