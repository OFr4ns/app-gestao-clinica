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

