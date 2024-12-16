import { SlashCommandBuilder } from "discord.js";
import { shoukaku } from "../../music/player.js";
import { getQueue } from "../../music/queue.js";
import { exportsConfig } from "../../config.js";
const { GeneralMusicUserFeedbackErrorEmoji } = exportsConfig;
export default {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stoppt die Wiedergabe."),
  async execute(interaction) {
    try {
      const guildId = interaction.guild.id;
      const queue = getQueue(guildId);
      if (!queue || !queue.current) {
        return interaction.reply({
          content: `${GeneralMusicUserFeedbackErrorEmoji} Es wird aktuell keine Musik abgespielt.`,
          ephemeral: true,
        });
      }
      queue.songs = [];
      queue.current = null;
      await shoukaku.getPlayer(guildId).node.player.stop();
      await interaction.reply({
        content: "Die Wiedergabe wurde gestoppt.",
        ephemeral: true,
      });
    } catch (error) {
      console.error(`Fehler beim Stoppen der Wiedergabe: ${error.message}`);
      await interaction.reply({
        content: `${GeneralMusicUserFeedbackErrorEmoji} Fehler beim Stoppen der Wiedergabe.`,
        ephemeral: true,
      });
    }
  },
};
