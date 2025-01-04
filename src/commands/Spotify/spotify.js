// src/commands/Spotify/spotify.js
import { SlashCommandBuilder } from "discord.js";
import {
  followArtist,
  getFollowedArtists,
  getArtistAlbums,
  getArtistTracks,
  getArtistTopTracks,
} from "../../services/Spotify/spotify.js";
import { spotifyFeedbackError, spotifyFeedbackSuccess } from "../../alias.js";

export default {
  data: new SlashCommandBuilder()
    .setName("spotify")
    .setDescription("Kommandos für Spotify")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("follow")
        .setDescription("Folgt einem Künstler auf Spotify")
        .addStringOption((option) =>
          option
            .setName("artist")
            .setDescription("Name des Künstlers")
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("unfollow")
        .setDescription("Hört auf einen Künstler zu folgen")
        .addStringOption((option) =>
          option
            .setName("artist")
            .setDescription("Name des Künstlers")
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("get-followed-artists")
        .setDescription("Zeigt die gefolgten Künstler an")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("get-artist-albums")
        .setDescription("Zeigt die Alben eines Künstlers an")
        .addStringOption((option) =>
          option
            .setName("artist")
            .setDescription("Name des Künstlers")
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("get-artist-tracks")
        .setDescription("Zeigt die Lieder eines Künstlers an")
        .addStringOption((option) =>
          option
            .setName("artist")
            .setDescription("Name des Künstlers")
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("get-artist-top-tracks")
        .setDescription("Zeigt die beliebtesten Lieder eines Künstlers an")
        .addStringOption((option) =>
          option
            .setName("artist")
            .setDescription("Name des Künstlers")
            .setRequired(true)
            .setAutocomplete(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    switch (subcommand) {
      case "follow":
        const artist = interaction.options.getString("artist");
        try {
          await followArtist(artist);
          await interaction.reply(
            `${spotifyFeedbackSuccess} Du folgst jetzt ${artist} auf Spotify!`
          );
        } catch (error) {
          await interaction.reply(
            `${spotifyFeedbackError} Fehler beim Folgen von ${artist}: ${error.message}`
          );
        }
        break;
      case "unfollow":
        const unfollowArtist = interaction.options.getString("artist");
        try {
          await unfollowArtist(unfollowArtist);
          await interaction.reply(
            `${spotifyFeedbackSuccess} Du folgst jetzt nicht mehr ${unfollowArtist} auf Spotify!`
          );
        } catch (error) {
          await interaction.reply(
            `${spotifyFeedbackError} Fehler beim Nicht-Folgen von ${unfollowArtist}: ${error.message}`
          );
        }
        break;
      case "get-followed-artists":
        const followedArtists = await getFollowedArtists();
        await interaction.reply(
          `${spotifyFeedbackSuccess} Du folgst ${followedArtists.length} Künstlern auf Spotify:\n${followedArtists
            .map((artist) => `- ${artist}`)
            .join("\n")}`
        );
        break;
      case "get-artist-albums":
        const artistAlbums = interaction.options.getString("artist");
        const albums = await getArtistAlbums(artistAlbums);
        await interaction.reply(
          `${spotifyFeedbackSuccess} Die Alben von ${artistAlbums} sind:\n${albums
            .map((album) => `- ${album}`)
            .join("\n")}`
        );
        break;
      case "get-artist-tracks":
        const artistTracks = interaction.options.getString("artist");
        const tracks = await getArtistTracks(artistTracks);
        await interaction.reply(
          `${spotifyFeedbackSuccess} Die Lieder von ${artistTracks} sind:\n${tracks
            .map((track) => `- ${track}`)
            .join("\n")}`
        );
        break;
      case "get-artist-top-tracks":
        const artistTopTracks = interaction.options.getString("artist");
        const topTracks = await getArtistTopTracks(artistTopTracks);
        await interaction.reply(
          `${spotifyFeedbackSuccess} Die beliebtesten Lieder von ${artistTopTracks} sind:\n${topTracks
            .map((track) => `- ${track}`)
            .join("\n")}`
        );
        break;
    }
  },
};
