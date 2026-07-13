CREATE TABLE IF NOT EXISTS financial_records (
  id CHAR(36) PRIMARY KEY,
  psychologist_id CHAR(36) NOT NULL,
  patient_id CHAR(36) NOT NULL,
  appointment_id CHAR(36) NULL,

  amount DECIMAL(10,2) NOT NULL,
  method ENUM('CASH', 'PIX', 'CARD', 'INSURANCE') NOT NULL,
  due_date DATE NOT NULL,
  payment_date DATE NULL,
  status ENUM('PENDING', 'PAID', 'OVERDUE') NOT NULL DEFAULT 'PENDING',
  description_encrypted TEXT NULL,
  notes_encrypted TEXT NULL,

  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,

  CONSTRAINT fk_financial_records_psychologist
    FOREIGN KEY (psychologist_id) REFERENCES users(id),
  CONSTRAINT fk_financial_records_patient_scope
    FOREIGN KEY (patient_id, psychologist_id) REFERENCES patients(id, psychologist_id),
  CONSTRAINT fk_financial_records_appointment_scope
    FOREIGN KEY (appointment_id, psychologist_id) REFERENCES appointments(id, psychologist_id),

  KEY idx_financial_psychologist_due_date (psychologist_id, due_date),
  KEY idx_financial_psychologist_status (psychologist_id, status),
  KEY idx_financial_patient (patient_id),
  KEY idx_financial_appointment (appointment_id)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

