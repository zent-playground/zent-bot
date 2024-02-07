CREATE TABLE guilds (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    prefix VARCHAR(5) NOT NULL DEFAULT 'z',
    language VARCHAR(2) NOT NULL DEFAULT 'en',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE temp_voices (
    id VARCHAR(36) PRIMARY KEY,
    guild_id VARCHAR(36) NOT NULL,
    author_id VARCHAR(36) NOT NULL,
    creator_channel_id VARCHAR(36) NOT NULL,
    claimed_by VARCHAR(36) NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
);

CREATE TABLE temp_voice_creators (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    guild_id VARCHAR(36) NOT NULL,
    affix VARCHAR(255) NULL,
    generic_name VARCHAR(255) NULL,
    generic_limit INT NULL,
    allow_custom_name BOOLEAN NOT NULL DEFAULT false,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
);

CREATE TABLE temp_voice_configs (
    id VARCHAR(36) NOT NULL,
    guild_id VARCHAR(36) NULL,
    is_global BOOLEAN NOT NULL DEFAULT false,
    name VARCHAR(255) NULL,
    nsfw BOOLEAN NOT NULL DEFAULT false,
    blacklisted_ids JSON,
    whitelisted_ids JSON,
    joinable INT NOT NULL DEFAULT 0,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
);

