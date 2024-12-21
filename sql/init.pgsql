-- sql/init.pgsql
-- Purpose: Create the database for the Multipurpose Discord bot.

-- Database: multipurpose

DROP DATABASE IF EXISTS multipurpose CASCADE;

CREATE DATABASE multipurpose
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'German_Germany.1252'
    LC_CTYPE = 'German_Germany.1252'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

COMMENT ON DATABASE multipurpose
    IS 'Datenbank für den Multipurpose Discord Bot. Speichert Daten für rolemenus, twitch, und YouTube-Integration.';

\c multipurpose

-- Purpose: Create the database tables for the Multipurpose Discord bot.

-- Trigger for updating updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for logging discord_channel_name changes
CREATE OR REPLACE FUNCTION log_channel_name_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO channel_name_changes (old_channel_name, new_channel_name)
  VALUES (OLD.discord_channel_name, NEW.discord_channel_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- Table: active_setups
-- ====================================
DROP TABLE IF EXISTS active_setups CASCADE;

CREATE TABLE active_setups (
	message_id VARCHAR(64) PRIMARY KEY,
	channel_id VARCHAR(64) NOT NULL,
	guild_id VARCHAR(64) NOT NULL,
	expires_at TIMESTAMP NOT NULL
);

COMMENT ON TABLE active_setups IS 'Speichert temporäre Informationen zu aktiven rolemenu-Setups.';
COMMENT ON COLUMN active_setups.message_id IS 'Id der Discord-Nachricht, die das aktive rolemenu darstellt.';
COMMENT ON COLUMN active_setups.channel_id IS 'Id des Discord-Kanals, in dem das rolemenu erstellt wurde.';
COMMENT ON COLUMN active_setups.guild_id IS 'Id der Discord-Gilde, zu der das rolemenu gehört.';
COMMENT ON COLUMN active_setups.expires_at IS 'Zeitpunkt, zu dem das Setup abläuft und bereinigt wird.';

-- Indexes for active_setups
CREATE INDEX idx_active_setups_guild_id ON active_setups (guild_id);
CREATE INDEX idx_active_setups_guild_expires ON active_setups (guild_id, expires_at);

-- ====================================
-- Table: channel_name_changes
-- ====================================
DROP TABLE IF EXISTS channel_name_changes CASCADE;

CREATE TABLE channel_name_changes (
  id SERIAL PRIMARY KEY,
  old_channel_name VARCHAR(255),
  new_channel_name VARCHAR(255),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================
-- Table: rolemenus
-- ====================================
DROP TABLE IF EXISTS rolemenus CASCADE;

CREATE TABLE rolemenus (
	id SERIAL PRIMARY KEY,
	message_id VARCHAR(64) NOT NULL,
	channel_id VARCHAR(64) NOT NULL,
	group_name VARCHAR(64) NOT NULL,
	mode VARCHAR(10) NOT NULL CHECK (mode IN ('single', 'multi')),
	guild_id VARCHAR(64) NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL,
	CONSTRAINT chk_updated_after_created CHECK (updated_at >= created_at)
);

COMMENT ON TABLE rolemenus IS 'Speichert Konfigurationen für rolemenus.';
COMMENT ON COLUMN rolemenus.id IS 'Id der Konfiguration.';
COMMENT ON COLUMN rolemenus.message_id IS 'Id der Discord-Nachricht, die das rolemenu darstellt.';
COMMENT ON COLUMN rolemenus.channel_id IS 'Id des Discord-Channels, in dem das rolemenu erstellt wurde.';
COMMENT ON COLUMN rolemenus.group_name IS 'Name der Rollengruppe im rolemenu.';
COMMENT ON COLUMN rolemenus.mode IS 'Modus des rolemenus: "single" (Einzelwahl) oder "multi" (Mehrfachwahl).';
COMMENT ON COLUMN rolemenus.guild_id IS 'Id der Discord-Gilde, zu der das rolemenu gehört.';
COMMENT ON COLUMN rolemenus.created_at IS 'Zeitpunkt, zu dem der Eintrag erstellt wurde.';
COMMENT ON COLUMN rolemenus.updated_at IS 'Zeitpunkt, zu dem der Eintrag zuletzt aktualisiert wurde.';

-- Indexes for rolemenus
CREATE INDEX idx_rolemenus_message_group ON rolemenus (message_id, group_name);
CREATE INDEX idx_rolemenus_guild_id_group_name ON rolemenus (guild_id, group_name);

CREATE TRIGGER update_rolemenus_updated_at
BEFORE UPDATE ON rolemenus
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- Table: rolemenu_roles
-- ====================================
DROP TABLE IF EXISTS rolemenu_roles CASCADE;

CREATE TABLE rolemenu_roles (
	id SERIAL PRIMARY KEY,
	rolemenu_id INTEGER REFERENCES rolemenus (id) ON DELETE CASCADE,
	role_id VARCHAR(255) NOT NULL,
	guild_id VARCHAR(255) NOT NULL,
	emoji VARCHAR(255) NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL,
	CONSTRAINT unique_rolemenu_emoji UNIQUE (rolemenu_id, emoji),
	CONSTRAINT chk_updated_after_created CHECK (updated_at >= created_at),
	CONSTRAINT chk_emoji_format CHECK (emoji ~ '^[a-zA-Z0-9_:-]+$')
);

COMMENT ON TABLE rolemenu_roles IS 'Verknüpft Rollen mit Emojis und rolemenus.';
COMMENT ON COLUMN rolemenu_roles.id IS 'Id der Verknüpfung.';
COMMENT ON COLUMN rolemenu_roles.rolemenu_id IS 'Referenz zur Id des zugehörigen rolemenus.';
COMMENT ON COLUMN rolemenu_roles.role_id IS 'Id der Discord-Rolle, die mit einem Emoji verknüpft ist.';
COMMENT ON COLUMN rolemenu_roles.guild_id IS 'Id der Discord-Gilde, zu der die Rolle gehört.';
COMMENT ON COLUMN rolemenu_roles.emoji IS 'Emoji, das mit der Rolle im rolemenu verknüpft ist.';
COMMENT ON COLUMN rolemenu_roles.created_at IS 'Zeitpunkt, zu dem der Eintrag erstellt wurde.';
COMMENT ON COLUMN rolemenu_roles.updated_at IS 'Zeitpunkt, zu dem der Eintrag zuletzt aktualisiert wurde.';
COMMENT ON CONSTRAINT unique_rolemenu_emoji ON rolemenu_roles IS 'Einzigartige Kombination aus rolemenu und Emoji.';

-- Indexes for rolemenu_roles
CREATE INDEX idx_rolemenu_roles_guild_id ON rolemenu_roles (guild_id);
CREATE INDEX idx_rolemenu_roles_menu_id_emoji ON rolemenu_roles (rolemenu_id, emoji);

-- Trigger for rolemenu_roles.updated_at
CREATE TRIGGER update_rolemenu_roles_updated_at
BEFORE UPDATE ON rolemenu_roles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- Table: twitch_streamers
-- ====================================
DROP TABLE IF EXISTS twitch_streamers CASCADE;

CREATE TABLE twitch_streamers (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  user_name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  discord_channel_id VARCHAR(255) NOT NULL,
  discord_channel_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL,
  CONSTRAINT chk_updated_after_created CHECK (updated_at >= created_at),
  CONSTRAINT chk_user_id_format CHECK (user_id ~ '^[a-zA-Z0-9_-]+$')
);

COMMENT ON TABLE twitch_streamers IS 'Speichert Informationen zu Twitch-Streamern.';
COMMENT ON COLUMN twitch_streamers.id IS 'Id des Twitch-Kanal-Datensatzes.';
COMMENT ON COLUMN twitch_streamers.user_id IS 'Eindeutige Id des Twitch-Streamers.';
COMMENT ON COLUMN twitch_streamers.user_name IS 'Twitch-Benutzername des Streamers.';
COMMENT ON COLUMN twitch_streamers.display_name IS 'Anzeigename des Streamers.';
COMMENT ON COLUMN twitch_streamers.discord_channel_id IS 'Id des Discord-Kanals für Benachrichtigungen über den Streamer.';
COMMENT ON COLUMN twitch_streamers.discord_channel_name IS 'Name des Discord-Kanals für Benachrichtigungen über den Streamer.';
COMMENT ON COLUMN twitch_streamers.created_at IS 'Zeitpunkt, zu dem der Eintrag erstellt wurde.';
COMMENT ON COLUMN twitch_streamers.updated_at IS 'Zeitpunkt, zu dem der Eintrag zuletzt aktualisiert wurde.';

-- Index für häufige Abfragen
CREATE INDEX idx_twitch_streamers_user_name ON twitch_streamers (user_name);
CREATE INDEX idx_twitch_streamers_user_id ON twitch_streamers (user_id);
CREATE INDEX idx_twitch_streamers_channel_id ON twitch_streamers (discord_channel_id);
CREATE INDEX idx_twitch_streamers_updated_at ON twitch_streamers (updated_at);
CREATE INDEX idx_twitch_streamers_user_name_channel_id ON twitch_streamers (user_name, discord_channel_id);

-- Trigger for updating `updated_at` column
CREATE TRIGGER update_twitch_streamers_updated_at
BEFORE UPDATE ON twitch_streamers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for logging `discord_channel_name` changes
CREATE TRIGGER log_twitch_streamers_channel_name_changes
AFTER UPDATE ON twitch_streamers
FOR EACH ROW
WHEN (OLD.discord_channel_name IS DISTINCT FROM NEW.discord_channel_name)
EXECUTE FUNCTION log_channel_name_changes();

-- ====================================
-- Table: youtubers
-- ====================================
DROP TABLE IF EXISTS youtubers CASCADE;

CREATE TABLE youtubers (
	id SERIAL PRIMARY KEY,
	user_id VARCHAR(255) NOT NULL UNIQUE,
	user_name VARCHAR(255) NOT NULL UNIQUE,
	discord_channel_id VARCHAR(255) NOT NULL,
	discord_channel_name VARCHAR(255) NOT NULL,
	latest_video_id VARCHAR(255) NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL,
	CONSTRAINT chk_updated_after_created CHECK (updated_at >= created_at)
);

COMMENT ON TABLE youtubers IS 'Speichert Informationen zu YouTube-Kanälen.';
COMMENT ON COLUMN youtubers.id IS 'Id des YouTube-Kanal-Datensatzes.';
COMMENT ON COLUMN youtubers.user_id IS 'Id des YouTube-Kanals.';
COMMENT ON COLUMN youtubers.user_name IS 'Benutzername des YouTube-Kanals.';
COMMENT ON COLUMN youtubers.discord_channel_id IS 'Id des Discord-Kanals für Benachrichtigungen über den Kanal.';
COMMENT ON COLUMN youtubers.discord_channel_name IS 'Name des Discord-Kanals für Benachrichtigungen über den Kanal.';
COMMENT ON COLUMN youtubers.latest_video_id IS 'Id des zuletzt verarbeiteten Videos im Kanal.';
COMMENT ON COLUMN youtubers.created_at IS 'Zeitpunkt, zu dem der Eintrag erstellt wurde.';

-- Indexes for youtubers
CREATE INDEX idx_youtubers_user_name ON youtubers (user_name);
CREATE INDEX idx_youtubers_channel_id ON youtubers (user_id);
CREATE INDEX idx_youtubers_youtuber_name_channel_id ON youtubers (user_name, discord_channel_id, discord_channel_name);
CREATE INDEX idx_youtubers_updated_at ON youtubers (updated_at);

-- Trigger for youtubers.updated_at
CREATE TRIGGER update_youtubers_updated_at
BEFORE UPDATE ON youtubers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for logging youtuber discord_channel_name changes
CREATE TRIGGER log_youtuber_channel_name_changes
AFTER UPDATE ON youtubers
FOR EACH ROW
WHEN (OLD.discord_channel_name IS DISTINCT FROM NEW.discord_channel_name)
EXECUTE FUNCTION log_channel_name_changes();
