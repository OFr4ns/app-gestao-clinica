CREATE TABLE IF NOT EXISTS audit_logs (
  id CHAR(36) PRIMARY KEY,
  psychologist_id CHAR(36) NULL,
  user_id CHAR(36) NULL,
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(80) NULL,
  entity_id CHAR(36) NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(512) NULL,
  metadata_encrypted TEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  CONSTRAINT fk_audit_logs_user
    FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_audit_logs_psychologist
    FOREIGN KEY (psychologist_id) REFERENCES users(id),

  KEY idx_audit_logs_user_created (user_id, created_at),
  KEY idx_audit_logs_psychologist_created (psychologist_id, created_at),
  KEY idx_audit_logs_entity (entity_type, entity_id)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
