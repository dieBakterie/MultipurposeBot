// src/commands/Music/music.js
import { SlashCommandBuilder } from "discord.js";
import { MusicPlayer } from "../../services/Music/musicPlayer.js";
import {
  addSong,
  removeSong,
  deleteQueue,
  clearQueue,
} from "../../services/Music/queue.js";
import { generalFeedbackError } from "../../alias.js";

const queueManager = { addSong, removeSong, deleteQueue, clearQueue };
const musicPlayer = new MusicPlayer(queueManager, "Generic");

export default {
  data: new SlashCommandBuilder()
    .setName("music")
    .setDescription("Musik-Befehle")
    .addSubcommandGroup((subcommandGroup) =>
      subcommandGroup
        .setName("queue")
        .setDescription("Verwalte die Warteschlange.")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("add")
            .setDescription("Fügt einen Song hinzu.")
            .addStringOption((option) =>
              option
                .setName("query")
                .setDescription("Song oder URL.")
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("delete")
            .setDescription("Entfernt einen Song aus der Warteschlange.")
            .addStringOption((option) =>
              option
                .setName("song_name")
                .setDescription("Name des Songs, der entfernt werden soll.")
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand.setName("clear").setDescription("Leert die Warteschlange.")
        )
    )
    .addSubcommandGroup((subcommandGroup) =>
      subcommandGroup
        .setName("source")
        .setDescription("Verwalte die Musikquelle.")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("set")
            .setDescription("Setzt die Musikquelle (YouTube oder Spotify).")
            .addStringOption((option) =>
              option
                .setName("source")
                .setDescription("Musikquelle auswählen.")
                .setRequired(true)
                .addChoices(
                  { name: "YouTube", value: "youtube" },
                  { name: "Spotify", value: "spotify" }
                )
            )
        )
        .addSubcommand((subcommand) =>
          subcommand.setName("list").setDescription("Listet die Musikquellen.")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("play")
        .setDescription("Spielt einen Song ab.")
        .addStringOption((option) =>
          option
            .setName("query")
            .setDescription("Song oder URL.")
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("pause").setDescription("Pausiert die Wiedergabe.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("skip")
        .setDescription("Überspringt den aktuellen Song.")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("stop").setDescription("Stoppt die Wiedergabe.")
    ),

  async execute(interaction) {
    const subcommandGroup = interaction.options.getSubcommandGroup(false);
    const subcommand = interaction.options.getSubcommand(false);
    const guildId = interaction.guild.id;

    try {
      switch (subcommandGroup) {
        case "queue": {
          switch (subcommand) {
            case "add": {
              const query = interaction.options.getString("query");
              queueManager.addSong(guildId, { title: query, url: query });
              return interaction.reply(`Song **${query}** wurde hinzugefügt.`);
            }
            case "delete": {
              const songName = interaction.options.getString("song_name");
              const removedSong = queueManager.removeSong(guildId, songName);
              if (!removedSong) {
                return interaction.reply(
                  `Song **${songName}** konnte nicht gefunden werden.`
                );
              }
              return interaction.reply(
                `Song **${removedSong.title}** wurde entfernt.`
              );
            }
            case "clear": {
              queueManager.clearQueue(guildId);
              return interaction.reply("Die Warteschlange wurde geleert.");
            }
            default:
              throw new Error("Unbekannter Queue-Befehl.");
          }
        }
        case "source": {
          switch (subcommand) {
            case "set": {
              const source = interaction.options.getString("source");
              // Speichere die Quelle in einer DB oder Variable
              return interaction.reply(
                `Die Quelle wurde auf **${source}** gesetzt.`
              );
            }
            case "list": {
              // Beispielantwort
              return interaction.reply(
                "Verfügbare Quellen: **YouTube**, **Spotify**"
              );
            }
            default:
              throw new Error("Unbekannter Source-Befehl.");
          }
        }
        default: {
          switch (subcommand) {
            case "play": {
              const query = interaction.options.getString("query");
              const added = await musicPlayer.addToQueue(guildId, {
                title: query,
                url: query,
              });

              if (added.isFirstSong) {
                await musicPlayer.joinAndPlay(
                  interaction.member.voice.channel,
                  guildId,
                  interaction.channel
                );
              }
              return interaction.reply(
                `**${query}** wurde zur Warteschlange hinzugefügt!`
              );
            }
            case "pause":
              await musicPlayer.pause(guildId);
              return interaction.reply("Wiedergabe pausiert.");
            case "skip":
              const skipped = await musicPlayer.skip(guildId);
              return interaction.reply(
                skipped.hasNext
                  ? "Song übersprungen. Starte nächsten Song."
                  : "Song übersprungen. Keine weiteren Songs in der Warteschlange."
              );
            case "stop":
              await musicPlayer.stop(guildId);
              return interaction.reply("Die Wiedergabe wurde gestoppt.");
            default:
              throw new Error("Unbekannter Hauptbefehl.");
          }
        }
      }
    } catch (error) {
      console.error(`Fehler bei der Ausführung des Befehls: ${error.message}`);
      return interaction.reply({
        content: `${generalFeedbackError.emoji} Fehler bei der Ausführung des Befehls.`,
        ephemeral: true,
      });
    }
  },
};
