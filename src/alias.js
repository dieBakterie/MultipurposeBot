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

// Discord Music Aliases
export const discordMusicEmoji = discord.music.emoji;
export const discordMusicFeedbackError = discord.music.userFeedback.error;
export const discordMusicFeedbackSuccess = discord.music.userFeedback.success;
export const discordMusicFeedbackInfo = discord.music.userFeedback.info;
export const discordMusicFeedbackList = discord.music.userFeedback.list;
export const discordMusicFeedbackLink = discord.music.userFeedback.link;
export const discordMusicPlayPause = discord.music.controls.playPause;
export const discordMusicPause = discord.music.controls.pause;
export const discordMusicSkip = discord.music.controls.skip;
export const discordMusicStop = discord.music.controls.stop;

// Discord Notification Aliases
export const discordNotificationEmoji = discord.notification.emoji;

// Discord userFeedback Aliases
export const discordFeedbackError = discord.userFeedback.error;
export const discordFeedbackSuccess = discord.userFeedback.success;
export const discordFeedbackInfo = discord.userFeedback.info;
export const discordFeedbackList = discord.userFeedback.list;
export const discordFeedbackLink = discord.userFeedback.link;
export const discordFeedbackLoading = discord.userFeedback.loading;
export const discordFeedbackOffline = discord.userFeedback.offline;
export const discordFeedbackOnline = discord.userFeedback.online;
export const discordFeedbackStream = discord.userFeedback.stream;
export const discordFeedbackVideo = discord.userFeedback.video;
export const discordFeedbackGame = discord.userFeedback.game;
export const discordFeedbackUser = discord.userFeedback.user;
export const discordFeedbackChannel = discord.userFeedback.channel;
export const discordFeedbackHost = discord.userFeedback.viewer;
export const discordFeedbackFollow = discord.userFeedback.follower;
export const discordFeedbackSub = discord.userFeedback.subscriber;
export const discordFeedbackNext = discord.userFeedback.next;
export const discordFeedbackPrevious = discord.userFeedback.previous;

// Docker Aliases
export const isDocker = docker.environment;

// General Music Aliases
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

// General Notification Aliases
export const generalNotificationEmoji = general.notification.emoji;

// General userFeedback Aliases
export const generalFeedbackError = general.userFeedback.error;
export const generalFeedbackSuccess = general.userFeedback.success;
export const generalFeedbackInfo = general.userFeedback.info;
export const generalFeedbackList = general.userFeedback.list;
export const generalFeedbackLink = general.userFeedback.link;
export const generalFeedbackLoading = general.userFeedback.loading;
export const generalFeedbackOffline = general.userFeedback.offline;
export const generalFeedbackOnline = general.userFeedback.online;
export const generalFeedbackStream = general.userFeedback.stream;
export const generalFeedbackVideo = general.userFeedback.video;
export const generalFeedbackGame = general.userFeedback.game;
export const generalFeedbackUser = general.userFeedback.user;
export const generalFeedbackChannel = general.userFeedback.channel;
export const generalFeedbackHost = general.userFeedback.viewer;
export const generalFeedbackFollow = general.userFeedback.follower;
export const generalFeedbackSub = general.userFeedback.subscriber;
export const generalFeedbackNext = general.userFeedback.next;
export const generalFeedbackPrevious = general.userFeedback.previous;

// Lavalink Aliases
export const lavaLinkHost = lavaLink.host;
export const lavaLinkPort = lavaLink.port;
export const lavaLinkPassword = lavaLink.password;

// Node Aliases
export const nodeEnvironment = node.environment;

// Spotify Aliases
export const spotifyClientId = spotify.clientId;
export const spotifyClientSecret = spotify.clientSecret;

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

// Spotify Notification Alias
export const spotifyNotificationEmoji = spotify.notification.emoji;

// Spotify userFeedback Aliases
export const spotifyFeedbackError = spotify.userFeedback.error;
export const spotifyFeedbackSuccess = spotify.userFeedback.success;
export const spotifyFeedbackInfo = spotify.userFeedback.info;
export const spotifyFeedbackList = spotify.userFeedback.list;
export const spotifyFeedbackLink = spotify.userFeedback.link;
export const spotifyFeedbackLoading = spotify.userFeedback.loading;
export const spotifyFeedbackOffline = spotify.userFeedback.offline;
export const spotifyFeedbackOnline = spotify.userFeedback.online;
export const spotifyFeedbackStream = spotify.userFeedback.stream;
export const spotifyFeedbackVideo = spotify.userFeedback.video;
export const spotifyFeedbackGame = spotify.userFeedback.game;
export const spotifyFeedbackUser = spotify.userFeedback.user;
export const spotifyFeedbackChannel = spotify.userFeedback.channel;
export const spotifyFeedbackHost = spotify.userFeedback.viewer;
export const spotifyFeedbackFollow = spotify.userFeedback.follower;
export const spotifyFeedbackSub = spotify.userFeedback.subscriber;
export const spotifyFeedbackNext = spotify.userFeedback.next;
export const spotifyFeedbackPrevious = spotify.userFeedback.previous;

// Twitch Aliases
export const twitchClientId = twitch.clientId;
export const twitchClientSecret = twitch.clientSecret;

// Twitch Notification Aliases
export const twitchNotificationEmoji = twitch.notification.emoji;

// Twitch userFeedback Aliases
export const twitchFeedbackError = twitch.userFeedback.error;
export const twitchFeedbackSuccess = twitch.userFeedback.success;
export const twitchFeedbackInfo = twitch.userFeedback.info;
export const twitchFeedbackList = twitch.userFeedback.list;
export const twitchFeedbackLink = twitch.userFeedback.link;
export const twitchFeedbackLoading = twitch.userFeedback.loading;
export const twitchFeedbackOffline = twitch.userFeedback.offline;
export const twitchFeedbackOnline = twitch.userFeedback.online;
export const twitchFeedbackStream = twitch.userFeedback.stream;
export const twitchFeedbackVideo = twitch.userFeedback.video;
export const twitchFeedbackGame = twitch.userFeedback.game;
export const twitchFeedbackUser = twitch.userFeedback.user;
export const twitchFeedbackChannel = twitch.userFeedback.channel;
export const twitchFeedbackHost = twitch.userFeedback.viewer;
export const twitchFeedbackFollow = twitch.userFeedback.follower;
export const twitchFeedbackSub = twitch.userFeedback.subscriber;
export const twitchFeedbackNext = twitch.userFeedback.next;
export const twitchFeedbackPrevious = twitch.userFeedback.previous;

// YouTube Aliases
export const youtubeApiKey = youtube.apiKey;

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

// YouTube userFeedback Aliases
export const youtubeFeedbackError = youtube.userFeedback.error;
export const youtubeFeedbackSuccess = youtube.userFeedback.success;
export const youtubeFeedbackInfo = youtube.userFeedback.info;
export const youtubeFeedbackList = youtube.userFeedback.list;
export const youtubeFeedbackLink = youtube.userFeedback.link;
export const youtubeFeedbackLoading = youtube.userFeedback.loading;
export const youtubeFeedbackOffline = youtube.userFeedback.offline;
export const youtubeFeedbackOnline = youtube.userFeedback.online;
export const youtubeFeedbackStream = youtube.userFeedback.stream;
export const youtubeFeedbackVideo = youtube.userFeedback.video;
export const youtubeFeedbackGame = youtube.userFeedback.game;
export const youtubeFeedbackUser = youtube.userFeedback.user;
export const youtubeFeedbackChannel = youtube.userFeedback.channel;
export const youtubeFeedbackViewer = youtube.userFeedback.viewer;
export const youtubeFeedbackFollow = youtube.userFeedback.follower;
export const youtubeFeedbackSubscriber = youtube.userFeedback.subscriber;
export const youtubeFeedbackNext = youtube.userFeedback.next;
export const youtubeFeedbackPrevious = youtube.userFeedback.previous;