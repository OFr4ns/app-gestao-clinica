import { pool } from '../db/pool.js';

const patientColumns = `
  id,
  psychologist_id,
  record_number_encrypted,
  name_encrypted,
  dob_encrypted,
  cpf_encrypted,
  rg_encrypted,
  phone_encrypted,
  whatsapp_encrypted,
  email_encrypted,
  profession_encrypted,
  civil_status_encrypted,
  address_encrypted,
  city_encrypted,
  state_encrypted,
  insurance_encrypted,
  notes_encrypted,
  emergency_name_encrypted,
  emergency_relationship_encrypted,
  emergency_phone_encrypted,
  record_number_hash,
  cpf_hash,
  rg_hash,
  phone_hash,
  whatsapp_hash,
  email_hash,
  status,
  created_at,
  updated_at,
  deleted_at
`;

export async function listPatients({ psychologistId, status }) {
  const params = [psychologistId];
  let statusClause = '';

  if (status && status !== 'ALL') {
    statusClause = 'AND status = ?';
    params.push(status);
  }

  const [rows] = await pool.execute(
    `SELECT ${patientColumns}
     FROM patients
     WHERE psychologist_id = ?
       AND deleted_at IS NULL
       ${statusClause}
     ORDER BY created_at DESC`,
    params
  );

  return rows;
}

export async function findPatientById({ id, psychologistId }) {
  const [rows] = await pool.execute(
    `SELECT ${patientColumns}
     FROM patients
     WHERE id = ?
       AND psychologist_id = ?
       AND deleted_at IS NULL
     LIMIT 1`,
    [id, psychologistId]
  );

  return rows[0] || null;
}

export async function countPatients({ psychologistId }) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM patients
     WHERE psychologist_id = ?`,
    [psychologistId]
  );

  return Number(rows[0]?.total || 0);
}

export async function insertPatient({ id, psychologistId, row }) {
  await pool.execute(
    `INSERT INTO patients (
       id, psychologist_id, record_number_encrypted, name_encrypted,
       dob_encrypted, cpf_encrypted, rg_encrypted, phone_encrypted,
       whatsapp_encrypted, email_encrypted, profession_encrypted,
       civil_status_encrypted, address_encrypted, city_encrypted,
       state_encrypted, insurance_encrypted, notes_encrypted,
       emergency_name_encrypted, emergency_relationship_encrypted,
       emergency_phone_encrypted, record_number_hash, cpf_hash, rg_hash,
       phone_hash, whatsapp_hash, email_hash, status
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, psychologistId, row.record_number_encrypted, row.name_encrypted,
      row.dob_encrypted, row.cpf_encrypted, row.rg_encrypted, row.phone_encrypted,
      row.whatsapp_encrypted, row.email_encrypted, row.profession_encrypted,
      row.civil_status_encrypted, row.address_encrypted, row.city_encrypted,
      row.state_encrypted, row.insurance_encrypted, row.notes_encrypted,
      row.emergency_name_encrypted, row.emergency_relationship_encrypted,
      row.emergency_phone_encrypted, row.record_number_hash, row.cpf_hash,
      row.rg_hash, row.phone_hash, row.whatsapp_hash, row.email_hash, row.status
    ]
  );
}

export async function updatePatient({ id, psychologistId, row }) {
  const [result] = await pool.execute(
    `UPDATE patients
     SET record_number_encrypted = ?, name_encrypted = ?, dob_encrypted = ?,
       cpf_encrypted = ?, rg_encrypted = ?, phone_encrypted = ?,
       whatsapp_encrypted = ?, email_encrypted = ?, profession_encrypted = ?,
       civil_status_encrypted = ?, address_encrypted = ?, city_encrypted = ?,
       state_encrypted = ?, insurance_encrypted = ?, notes_encrypted = ?,
       emergency_name_encrypted = ?, emergency_relationship_encrypted = ?,
       emergency_phone_encrypted = ?, record_number_hash = ?, cpf_hash = ?,
       rg_hash = ?, phone_hash = ?, whatsapp_hash = ?, email_hash = ?,
       status = ?
     WHERE id = ?
       AND psychologist_id = ?
       AND deleted_at IS NULL`,
    [
      row.record_number_encrypted, row.name_encrypted, row.dob_encrypted,
      row.cpf_encrypted, row.rg_encrypted, row.phone_encrypted,
      row.whatsapp_encrypted, row.email_encrypted, row.profession_encrypted,
      row.civil_status_encrypted, row.address_encrypted, row.city_encrypted,
      row.state_encrypted, row.insurance_encrypted, row.notes_encrypted,
      row.emergency_name_encrypted, row.emergency_relationship_encrypted,
      row.emergency_phone_encrypted, row.record_number_hash, row.cpf_hash,
      row.rg_hash, row.phone_hash, row.whatsapp_hash, row.email_hash,
      row.status, id, psychologistId
    ]
  );

  return result.affectedRows > 0;
}

export async function softDeletePatient({ id, psychologistId }) {
  const [result] = await pool.execute(
    `UPDATE patients
     SET deleted_at = CURRENT_TIMESTAMP(3)
     WHERE id = ?
       AND psychologist_id = ?
       AND deleted_at IS NULL`,
    [id, psychologistId]
  );

  return result.affectedRows > 0;
}

