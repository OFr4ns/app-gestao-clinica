CREATE TABLE IF NOT EXISTS settings (
  id CHAR(36) PRIMARY KEY,
  psychologist_id CHAR(36) NOT NULL,
  setting_key VARCHAR(120) NOT NULL,
  value_encrypted TEXT NULL,
  value_plain VARCHAR(255) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  CONSTRAINT fk_settings_psychologist
    FOREIGN KEY (psychologist_id) REFERENCES users(id),

  UNIQUE KEY uq_settings_psychologist_key (psychologist_id, setting_key)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

