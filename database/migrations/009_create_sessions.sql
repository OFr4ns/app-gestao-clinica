CREATE TABLE IF NOT EXISTS sessions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  revoked_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  last_used_at DATETIME(3) NULL,

  CONSTRAINT fk_sessions_user
    FOREIGN KEY (user_id) REFERENCES users(id),

  UNIQUE KEY uq_sessions_token_hash (token_hash),
  KEY idx_sessions_user_expires (user_id, expires_at),
  KEY idx_sessions_expires_revoked (expires_at, revoked_at)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

