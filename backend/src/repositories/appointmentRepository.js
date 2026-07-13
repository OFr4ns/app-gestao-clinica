import { pool } from '../db/pool.js';

const appointmentColumns = `
  id,
  psychologist_id,
  patient_id,
  appointment_date,
  appointment_time,
  status,
  notes_encrypted,
  created_at,
  updated_at,
  deleted_at
`;

export async function listAppointments({ psychologistId, date }) {
  const params = [psychologistId];
  let dateClause = '';

  if (date) {
    dateClause = 'AND appointment_date = ?';
    params.push(date);
  }

  const [rows] = await pool.execute(
    `SELECT ${appointmentColumns}
     FROM appointments
     WHERE psychologist_id = ?
       AND deleted_at IS NULL
       ${dateClause}
     ORDER BY appointment_date ASC, appointment_time ASC`,
    params
  );

  return rows;
}

export async function findAppointmentById({ id, psychologistId }) {
  const [rows] = await pool.execute(
    `SELECT ${appointmentColumns}
     FROM appointments
     WHERE id = ?
       AND psychologist_id = ?
       AND deleted_at IS NULL
     LIMIT 1`,
    [id, psychologistId]
  );

  return rows[0] || null;
}

export async function listAppointmentsByPatient({ psychologistId, patientId }) {
  const [rows] = await pool.execute(
    `SELECT ${appointmentColumns}
     FROM appointments
     WHERE psychologist_id = ?
       AND patient_id = ?
       AND deleted_at IS NULL
     ORDER BY appointment_date ASC, appointment_time ASC`,
    [psychologistId, patientId]
  );

  return rows;
}

export async function insertAppointment({ id, psychologistId, row }) {
  await pool.execute(
    `INSERT INTO appointments (
       id,
       psychologist_id,
       patient_id,
       appointment_date,
       appointment_time,
       status,
       notes_encrypted
     ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      psychologistId,
      row.patient_id,
      row.appointment_date,
      row.appointment_time,
      row.status,
      row.notes_encrypted
    ]
  );
}

export async function updateAppointmentStatus({ id, psychologistId, status }) {
  const [result] = await pool.execute(
    `UPDATE appointments
     SET status = ?
     WHERE id = ?
       AND psychologist_id = ?
       AND deleted_at IS NULL`,
    [status, id, psychologistId]
  );

  return result.affectedRows > 0;
}

export async function updateAppointment({ id, psychologistId, row }) {
  const [result] = await pool.execute(
    `UPDATE appointments
     SET patient_id = ?,
       appointment_date = ?,
       appointment_time = ?,
       status = ?,
       notes_encrypted = ?
     WHERE id = ?
       AND psychologist_id = ?
       AND deleted_at IS NULL`,
    [
      row.patient_id,
      row.appointment_date,
      row.appointment_time,
      row.status,
      row.notes_encrypted,
      id,
      psychologistId
    ]
  );

  return result.affectedRows > 0;
}

export async function softDeleteAppointment({ id, psychologistId }) {
  const [result] = await pool.execute(
    `UPDATE appointments
     SET status = 'REMOVED',
       deleted_at = CURRENT_TIMESTAMP(3)
     WHERE id = ?
       AND psychologist_id = ?
       AND deleted_at IS NULL`,
    [id, psychologistId]
  );

  return result.affectedRows > 0;
}
