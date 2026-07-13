CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('PSYCHOLOGIST', 'ADMIN') NOT NULL DEFAULT 'PSYCHOLOGIST',
  status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  last_login_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role_status (role, status)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS patients (
  id CHAR(36) PRIMARY KEY,
  psychologist_id CHAR(36) NOT NULL,
  record_number_encrypted TEXT NULL,
  name_encrypted TEXT NOT NULL,
  dob_encrypted TEXT NULL,
  cpf_encrypted TEXT NULL,
  rg_encrypted TEXT NULL,
  phone_encrypted TEXT NULL,
  whatsapp_encrypted TEXT NULL,
  email_encrypted TEXT NULL,
  profession_encrypted TEXT NULL,
  civil_status_encrypted TEXT NULL,
  address_encrypted TEXT NULL,
  city_encrypted TEXT NULL,
  state_encrypted TEXT NULL,
  insurance_encrypted TEXT NULL,
  notes_encrypted TEXT NULL,
  emergency_name_encrypted TEXT NULL,
  emergency_relationship_encrypted TEXT NULL,
  emergency_phone_encrypted TEXT NULL,
  record_number_hash CHAR(64) NULL,
  cpf_hash CHAR(64) NULL,
  rg_hash CHAR(64) NULL,
  phone_hash CHAR(64) NULL,
  whatsapp_hash CHAR(64) NULL,
  email_hash CHAR(64) NULL,
  status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,
  CONSTRAINT fk_patients_psychologist
    FOREIGN KEY (psychologist_id) REFERENCES users(id),
  UNIQUE KEY uq_patients_id_psychologist (id, psychologist_id),
  KEY idx_patients_psychologist_status_deleted (psychologist_id, status, deleted_at),
  KEY idx_patients_record_number_hash (psychologist_id, record_number_hash),
  KEY idx_patients_cpf_hash (psychologist_id, cpf_hash),
  KEY idx_patients_rg_hash (psychologist_id, rg_hash),
  KEY idx_patients_phone_hash (psychologist_id, phone_hash),
  KEY idx_patients_whatsapp_hash (psychologist_id, whatsapp_hash),
  KEY idx_patients_email_hash (psychologist_id, email_hash)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

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

CREATE TABLE IF NOT EXISTS schema_migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  checksum CHAR(64) NOT NULL,
  applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_schema_migrations_filename (filename)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
