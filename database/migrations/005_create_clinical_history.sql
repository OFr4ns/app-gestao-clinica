CREATE TABLE IF NOT EXISTS clinical_history (
  id CHAR(36) PRIMARY KEY,
  psychologist_id CHAR(36) NOT NULL,
  patient_id CHAR(36) NOT NULL,

  service_date DATE NOT NULL,
  title_encrypted TEXT NOT NULL,
  notes_encrypted TEXT NOT NULL,

  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,

  CONSTRAINT fk_clinical_history_psychologist
    FOREIGN KEY (psychologist_id) REFERENCES users(id),
  CONSTRAINT fk_clinical_history_patient_scope
    FOREIGN KEY (patient_id, psychologist_id) REFERENCES patients(id, psychologist_id),

  KEY idx_clinical_history_patient_date (patient_id, service_date),
  KEY idx_clinical_history_psychologist_date (psychologist_id, service_date)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

