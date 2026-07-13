CREATE TABLE IF NOT EXISTS appointments (
  id CHAR(36) PRIMARY KEY,
  psychologist_id CHAR(36) NOT NULL,
  patient_id CHAR(36) NOT NULL,

  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status ENUM('SCHEDULED', 'CONFIRMED', 'ATTENDED', 'MISSED', 'RESCHEDULED', 'REMOVED') NOT NULL DEFAULT 'SCHEDULED',
  notes_encrypted TEXT NULL,

  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,

  CONSTRAINT fk_appointments_psychologist
    FOREIGN KEY (psychologist_id) REFERENCES users(id),
  CONSTRAINT fk_appointments_patient_scope
    FOREIGN KEY (patient_id, psychologist_id) REFERENCES patients(id, psychologist_id),

  UNIQUE KEY uq_appointments_id_psychologist (id, psychologist_id),
  KEY idx_appointments_psychologist_date (psychologist_id, appointment_date, appointment_time),
  KEY idx_appointments_psychologist_status (psychologist_id, status),
  KEY idx_appointments_patient (patient_id)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

