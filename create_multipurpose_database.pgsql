-- Purpose: Create the database for the Multipurpose Discord bot.

-- Database: multipurpose

-- DROP DATABASE IF EXISTS multipurpose;

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