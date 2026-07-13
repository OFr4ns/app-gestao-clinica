import { pool } from '../db/pool.js';

const historyColumns = `
  id,
  psychologist_id,
  patient_id,
  service_date,
  title_encrypted,
  notes_encrypted,
  created_at,
  updated_at,
  deleted_at
`;

export async function listClinicalHistory({ psychologistId, patientId }) {
  const params = [psychologistId];
  let patientClause = '';

  if (patientId) {
    patientClause = 'AND patient_id = ?';
    params.push(patientId);
  }

  const [rows] = await pool.execute(
    `SELECT ${historyColumns}
     FROM clinical_history
     WHERE psychologist_id = ?
       AND deleted_at IS NULL
       ${patientClause}
     ORDER BY service_date DESC, created_at DESC`,
    params
  );

  return rows;
}

export async function findClinicalHistoryById({ id, psychologistId }) {
  const [rows] = await pool.execute(
    `SELECT ${historyColumns}
     FROM clinical_history
     WHERE id = ?
       AND psychologist_id = ?
       AND deleted_at IS NULL
     LIMIT 1`,
    [id, psychologistId]
  );

  return rows[0] || null;
}

export async function insertClinicalHistory({ id, psychologistId, row }) {
  await pool.execute(
    `INSERT INTO clinical_history (
       id,
       psychologist_id,
       patient_id,
       service_date,
       title_encrypted,
       notes_encrypted
     ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id,
      psychologistId,
      row.patient_id,
      row.service_date,
      row.title_encrypted,
      row.notes_encrypted
    ]
  );
}

export async function updateClinicalHistory({ id, psychologistId, row }) {
  const [result] = await pool.execute(
    `UPDATE clinical_history
     SET patient_id = ?,
       service_date = ?,
       title_encrypted = ?,
       notes_encrypted = ?
     WHERE id = ?
       AND psychologist_id = ?
       AND deleted_at IS NULL`,
    [
      row.patient_id,
      row.service_date,
      row.title_encrypted,
      row.notes_encrypted,
      id,
      psychologistId
    ]
  );

  return result.affectedRows > 0;
}

export async function softDeleteClinicalHistory({ id, psychologistId }) {
  const [result] = await pool.execute(
    `UPDATE clinical_history
     SET deleted_at = CURRENT_TIMESTAMP(3)
     WHERE id = ?
       AND psychologist_id = ?
       AND deleted_at IS NULL`,
    [id, psychologistId]
  );

  return result.affectedRows > 0;
}

