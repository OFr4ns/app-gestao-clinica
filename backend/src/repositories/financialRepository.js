import { pool } from '../db/pool.js';

const financialColumns = `
  id,
  psychologist_id,
  patient_id,
  appointment_id,
  amount,
  method,
  due_date,
  payment_date,
  status,
  description_encrypted,
  notes_encrypted,
  created_at,
  updated_at,
  deleted_at
`;

export async function listFinancialRecords({ psychologistId, status }) {
  const params = [psychologistId];
  let statusClause = '';

  if (status && status !== 'ALL') {
    statusClause = 'AND status = ?';
    params.push(status);
  }

  const [rows] = await pool.execute(
    `SELECT ${financialColumns}
     FROM financial_records
     WHERE psychologist_id = ?
       AND deleted_at IS NULL
       ${statusClause}
     ORDER BY due_date DESC, created_at DESC`,
    params
  );

  return rows;
}

export async function findFinancialRecordById({ id, psychologistId }) {
  const [rows] = await pool.execute(
    `SELECT ${financialColumns}
     FROM financial_records
     WHERE id = ?
       AND psychologist_id = ?
       AND deleted_at IS NULL
     LIMIT 1`,
    [id, psychologistId]
  );

  return rows[0] || null;
}

export async function listFinancialRecordsByPatient({ psychologistId, patientId }) {
  const [rows] = await pool.execute(
    `SELECT ${financialColumns}
     FROM financial_records
     WHERE psychologist_id = ?
       AND patient_id = ?
       AND deleted_at IS NULL
     ORDER BY due_date DESC, created_at DESC`,
    [psychologistId, patientId]
  );

  return rows;
}

export async function insertFinancialRecord({ id, psychologistId, row }) {
  await pool.execute(
    `INSERT INTO financial_records (
       id,
       psychologist_id,
       patient_id,
       appointment_id,
       amount,
       method,
       due_date,
       payment_date,
       status,
       description_encrypted,
       notes_encrypted
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      psychologistId,
      row.patient_id,
      row.appointment_id,
      row.amount,
      row.method,
      row.due_date,
      row.payment_date,
      row.status,
      row.description_encrypted,
      row.notes_encrypted
    ]
  );
}

export async function updateFinancialRecord({ id, psychologistId, row }) {
  const [result] = await pool.execute(
    `UPDATE financial_records
     SET patient_id = ?,
       appointment_id = ?,
       amount = ?,
       method = ?,
       due_date = ?,
       payment_date = ?,
       status = ?,
       description_encrypted = ?,
       notes_encrypted = ?
     WHERE id = ?
       AND psychologist_id = ?
       AND deleted_at IS NULL`,
    [
      row.patient_id,
      row.appointment_id,
      row.amount,
      row.method,
      row.due_date,
      row.payment_date,
      row.status,
      row.description_encrypted,
      row.notes_encrypted,
      id,
      psychologistId
    ]
  );

  return result.affectedRows > 0;
}

export async function updateFinancialRecordStatus({ id, psychologistId, status, paymentDate }) {
  const [result] = await pool.execute(
    `UPDATE financial_records
     SET status = ?,
       payment_date = ?
     WHERE id = ?
       AND psychologist_id = ?
       AND deleted_at IS NULL`,
    [status, paymentDate, id, psychologistId]
  );

  return result.affectedRows > 0;
}

export async function softDeleteFinancialRecord({ id, psychologistId }) {
  const [result] = await pool.execute(
    `UPDATE financial_records
     SET deleted_at = CURRENT_TIMESTAMP(3)
     WHERE id = ?
       AND psychologist_id = ?
       AND deleted_at IS NULL`,
    [id, psychologistId]
  );

  return result.affectedRows > 0;
}

export async function getFinancialTotals({ psychologistId }) {
  const [rows] = await pool.execute(
    `SELECT
       COALESCE(SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END), 0) AS paid_total,
       COALESCE(SUM(CASE WHEN status <> 'PAID' THEN amount ELSE 0 END), 0) AS pending_total,
       COALESCE(SUM(CASE WHEN status = 'PAID'
         AND YEAR(payment_date) = YEAR(CURRENT_DATE())
         AND MONTH(payment_date) = MONTH(CURRENT_DATE())
         THEN amount ELSE 0 END), 0) AS paid_current_month
     FROM financial_records
     WHERE psychologist_id = ?
       AND deleted_at IS NULL`,
    [psychologistId]
  );

  return {
    paidTotal: Number(rows[0]?.paid_total || 0),
    pendingTotal: Number(rows[0]?.pending_total || 0),
    paidCurrentMonth: Number(rows[0]?.paid_current_month || 0)
  };
}

export async function markFinancialRecordPaidByAppointment({ appointmentId, psychologistId, paymentDate }) {
  await pool.execute(
    `UPDATE financial_records
     SET status = 'PAID',
       payment_date = ?
     WHERE appointment_id = ?
       AND psychologist_id = ?
       AND deleted_at IS NULL`,
    [paymentDate, appointmentId, psychologistId]
  );
}
