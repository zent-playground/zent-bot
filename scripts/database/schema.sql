CREATE TABLE guilds (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    prefix VARCHAR(5) NOT NULL DEFAULT 'z',
    language VARCHAR(2) NOT NULL DEFAULT 'en',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE temp_voice (
    id VARCHAR(36) PRIMARY KEY,
    guild_id VARCHAR(36) NOT NULL,
    author_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE,
    INDEX (guild_id)
);

CREATE TABLE temp_voice_configs (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    guild_id VARCHAR(36) NOT NULL,
    affix VARCHAR(255) NULL,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE,
    INDEX (guild_id)
);

CREATE TABLE temp_voice_participants (
    id VARCHAR(36) NOT NULL,
    member_id VARCHAR(36) NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP NULL,
    FOREIGN KEY (id) REFERENCES temp_voice(id) ON DELETE CASCADE,
    INDEX (id)
);
