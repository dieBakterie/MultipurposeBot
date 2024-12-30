// src/alias.ts
// src/alias.js
// Importiere alle Konfigurationen
import {
  database,
  discord,
  docker,
  general,
  lavaLink,
  node,
  spotify,
  twitch,
  youtube,
} from "./config/index.js";

// Database Aliases
export const databaseHost = database.host;
export const databasePort = database.port;
export const databaseUser = database.user;
export const databasePassword = database.password;
export const databaseName = database.name;

// Discord Aliases
export const discordToken = discord.token;
export const discordClientId = discord.clientId;
export const discordGuildId = discord.guildId;
export const discordFeedbackError = discord.userFeedback.error;
export const discordFeedbackSuccess = discord.userFeedback.success;
export const discordFeedbackInfo = discord.userFeedback.info;
export const discordFeedbackList = discord.userFeedback.list;
export const discordFeedbackLink = discord.userFeedback.link;

// Docker Aliases
export const isDocker = docker.environment;

// General Aliases
export const generalFeedbackError = general.userFeedback.error;
export const generalFeedbackSuccess = general.userFeedback.success;
export const generalFeedbackInfo = general.userFeedback.info;
export const generalFeedbackList = general.userFeedback.list;
export const generalFeedbackLink = general.userFeedback.link;

export const generalMusicEmoji = general.music.emoji;
export const generalMusicFeedbackError = general.music.userFeedback.error;
export const generalMusicFeedbackSuccess = general.music.userFeedback.success;
export const generalMusicFeedbackInfo = general.music.userFeedback.info;
export const generalMusicFeedbackList = general.music.userFeedback.list;
export const generalMusicFeedbackLink = general.music.userFeedback.link;
export const generalMusicPlayPause = general.music.controls.playPause;
export const generalMusicPause = general.music.controls.pause;
export const generalMusicSkip = general.music.controls.skip;
export const generalMusicStop = general.music.controls.stop;

// Lavalink Aliases
export const lavaLinkHost = lavaLink.host;
export const lavaLinkPort = lavaLink.port;
export const lavaLinkPassword = lavaLink.password;

// Node Aliases
export const nodeEnvironment = node.environment;

// Spotify Aliases
export const spotifyClientId = spotify.clientId;
export const spotifyClientSecret = spotify.clientSecret;
export const spotifyFeedbackError = spotify.userFeedback.error;
export const spotifyFeedbackSuccess = spotify.userFeedback.success;
export const spotifyFeedbackInfo = spotify.userFeedback.info;
export const spotifyFeedbackList = spotify.userFeedback.list;

// Spotify Music Aliases
export const spotifyMusicEmoji = spotify.music.emoji;
export const spotifyMusicFeedbackError = spotify.music.userFeedback.error;
export const spotifyMusicFeedbackSuccess = spotify.music.userFeedback.success;
export const spotifyMusicFeedbackInfo = spotify.music.userFeedback.info;
export const spotifyMusicFeedbackList = spotify.music.userFeedback.list;
export const spotifyMusicPlayPause = spotify.music.controls.playPause;
export const spotifyMusicPause = spotify.music.controls.pause;
export const spotifyMusicSkip = spotify.music.controls.skip;
export const spotifyMusicStop = spotify.music.controls.stop;

// Twitch Aliases
export const twitchClientId = twitch.clientId;
export const twitchClientSecret = twitch.clientSecret;
export const twitchFeedbackError = twitch.userFeedback.error;
export const twitchFeedbackSuccess = twitch.userFeedback.success;
export const twitchFeedbackInfo = twitch.userFeedback.info;
export const twitchFeedbackList = twitch.userFeedback.list;
export const twitchFeedbackLink = twitch.userFeedback.link;

// YouTube Aliases
export const youtubeApiKey = youtube.apiKey;
export const youtubeFeedbackError = youtube.userFeedback.error;
export const youtubeFeedbackSuccess = youtube.userFeedback.success;
export const youtubeFeedbackInfo = youtube.userFeedback.info;
export const youtubeFeedbackList = youtube.userFeedback.list;
export const youtubeFeedbackLink = youtube.userFeedback.link;

// YouTube Notification Aliases
export const youtubeNotificationEmoji = youtube.notification.emoji;
export const youtubeNotificationFeedbackError =
  youtube.notification.userFeedback.error;
export const youtubeNotificationFeedbackSuccess =
  youtube.notification.userFeedback.success;
export const youtubeNotificationFeedbackInfo =
  youtube.notification.userFeedback.info;
export const youtubeNotificationFeedbackList =
  youtube.notification.userFeedback.list;
export const youtubeNotificationFeedbackLink =
  youtube.notification.userFeedback.link;

// YouTube Music Aliases
export const youtubeMusicEmoji = youtube.music.emoji;
export const youtubeMusicFeedbackError = youtube.music.userFeedback.error;
export const youtubeMusicFeedbackSuccess = youtube.music.userFeedback.success;
export const youtubeMusicFeedbackInfo = youtube.music.userFeedback.info;
export const youtubeMusicFeedbackList = youtube.music.userFeedback.list;
export const youtubeMusicFeedbackLink = youtube.music.userFeedback.link;
export const youtubeMusicPlayPause = youtube.music.controls.playPause;
export const youtubeMusicPause = youtube.music.controls.pause;
export const youtubeMusicSkip = youtube.music.controls.skip;
export const youtubeMusicStop = youtube.music.controls.stop;
