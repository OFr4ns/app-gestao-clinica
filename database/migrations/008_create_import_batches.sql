CREATE TABLE IF NOT EXISTS import_batches (
  id CHAR(36) PRIMARY KEY,
  psychologist_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  status ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
  source_filename VARCHAR(255) NULL,
  patients_count INT NOT NULL DEFAULT 0,
  appointments_count INT NOT NULL DEFAULT 0,
  financial_records_count INT NOT NULL DEFAULT 0,
  clinical_history_count INT NOT NULL DEFAULT 0,
  error_message_encrypted TEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  completed_at DATETIME(3) NULL,

  CONSTRAINT fk_import_batches_psychologist
    FOREIGN KEY (psychologist_id) REFERENCES users(id),
  CONSTRAINT fk_import_batches_user
    FOREIGN KEY (user_id) REFERENCES users(id),

  KEY idx_import_batches_psychologist_created (psychologist_id, created_at)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

