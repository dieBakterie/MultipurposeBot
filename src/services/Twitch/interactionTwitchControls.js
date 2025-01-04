// src/services/Twitch/interactionTwitchControls.js
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import {
  twitchFeedbackNext,
  twitchFeedbackPrevious,
  twitchFeedbackError,
} from "../../alias.js";

export async function handleTwitchControl(
  interaction,
  count,
  itemsPerPage,
  totalPages,
  generateEmbed
) {
  try {
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("twitch_prev")
        .setLabel(`${twitchFeedbackPrevious.emoji} Zurück`)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("twitch_next")
        .setLabel(`${twitchFeedbackNext.emoji} Weiter`)
        .setStyle(ButtonStyle.Primary)
    );

    const reply = await interaction.reply({
      embeds: [generateEmbed(0)],
      components: count > itemsPerPage ? [buttons] : [], // Buttons nur anzeigen, wenn mehr als eine Seite existiert
      fetchReply: true,
    });

    if (count <= itemsPerPage) return; // Keine Paginierung notwendig

    const collector = reply.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: 60000,
    });

    let currentPage = 0;

    collector.on("collect", async (i) => {
      if (i.customId === "twitch_prev")
        currentPage = Math.max(0, currentPage - 1);
      if (i.customId === "twitch_next")
        currentPage = Math.min(totalPages - 1, currentPage + 1);

      await i.update({ embeds: [generateEmbed(currentPage)] });
    });

    collector.on("end", () => {
      interaction.editReply({ components: [] }).catch(console.error);
    });
  } catch (error) {
    console.error(
      `${twitchFeedbackError.emoji} Fehler bei der Paginierung:`,
      error.stack || error
    );
    return interaction.reply({
      content: `${twitchFeedbackError.emoji} Fehler bei der Paginierung.`,
      ephemeral: true,
    });
  }
}
