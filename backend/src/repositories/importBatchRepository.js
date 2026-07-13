import { pool } from '../db/pool.js';

export async function createImportBatch({ id, psychologistId, userId, sourceFilename }) {
  await pool.execute(
    `INSERT INTO import_batches (
       id,
       psychologist_id,
       user_id,
       source_filename,
       status
     ) VALUES (?, ?, ?, ?, 'PENDING')`,
    [id, psychologistId, userId, sourceFilename || null]
  );
}

export async function completeImportBatch({ id, counts }) {
  await pool.execute(
    `UPDATE import_batches
     SET status = 'COMPLETED',
       patients_count = ?,
       appointments_count = ?,
       financial_records_count = ?,
       clinical_history_count = ?,
       completed_at = CURRENT_TIMESTAMP(3)
     WHERE id = ?`,
    [
      counts.patients,
      counts.appointments,
      counts.financials,
      counts.history,
      id
    ]
  );
}

export async function failImportBatch({ id, errorMessageEncrypted }) {
  await pool.execute(
    `UPDATE import_batches
     SET status = 'FAILED',
       error_message_encrypted = ?,
       completed_at = CURRENT_TIMESTAMP(3)
     WHERE id = ?`,
    [errorMessageEncrypted, id]
  );
}

export async function findImportBatchById({ id, psychologistId }) {
  const [rows] = await pool.execute(
    `SELECT
       id,
       psychologist_id,
       user_id,
       status,
       source_filename,
       patients_count,
       appointments_count,
       financial_records_count,
       clinical_history_count,
       error_message_encrypted,
       created_at,
       completed_at
     FROM import_batches
     WHERE id = ?
       AND psychologist_id = ?
     LIMIT 1`,
    [id, psychologistId]
  );

  return rows[0] || null;
}

