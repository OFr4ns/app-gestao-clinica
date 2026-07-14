import { pool } from '../db/pool.js';

export async function getDashboardCounts({ psychologistId }) {
  const [rows] = await pool.execute(
    `SELECT
       (SELECT COUNT(*)
        FROM patients
        WHERE psychologist_id = ?
          AND status = 'ACTIVE'
          AND deleted_at IS NULL) AS active_patients,
       (SELECT COUNT(*)
        FROM appointments
        WHERE psychologist_id = ?
          AND appointment_date = CURRENT_DATE()
          AND deleted_at IS NULL
          AND status <> 'REMOVED') AS appointments_today`,
    [psychologistId, psychologistId]
  );

  return {
    activePatients: Number(rows[0]?.active_patients || 0),
    appointmentsToday: Number(rows[0]?.appointments_today || 0)
  };
}

export async function getFinancialDashboardTotals({ psychologistId }) {
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

export async function getUpcomingAppointments({ psychologistId, limit = 5 }) {
  const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 5, 1), 50);
  const [rows] = await pool.execute(
    `SELECT
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
     FROM appointments
     WHERE psychologist_id = ?
       AND deleted_at IS NULL
       AND status IN ('SCHEDULED', 'CONFIRMED', 'RESCHEDULED')
       AND appointment_date >= CURRENT_DATE()
     ORDER BY appointment_date ASC, appointment_time ASC
     LIMIT ${safeLimit}`,
    [psychologistId]
  );

  return rows;
}

export async function getAppointmentStatusDistribution({ psychologistId }) {
  const [rows] = await pool.execute(
    `SELECT status, COUNT(*) AS total
     FROM appointments
     WHERE psychologist_id = ?
       AND deleted_at IS NULL
       AND status <> 'REMOVED'
     GROUP BY status`,
    [psychologistId]
  );

  return rows.reduce((acc, row) => {
    acc[row.status] = Number(row.total || 0);
    return acc;
  }, {});
}

export async function getReportTotals({ psychologistId }) {
  const [rows] = await pool.execute(
    `SELECT
       (SELECT COUNT(*)
        FROM appointments
        WHERE psychologist_id = ?
          AND deleted_at IS NULL
          AND status <> 'REMOVED') AS total_appointments,
       (SELECT COUNT(*)
        FROM appointments
        WHERE psychologist_id = ?
          AND deleted_at IS NULL
          AND status = 'ATTENDED') AS attended,
       (SELECT COUNT(*)
        FROM appointments
        WHERE psychologist_id = ?
          AND deleted_at IS NULL
          AND status = 'MISSED') AS missed,
       (SELECT COUNT(*)
        FROM appointments
        WHERE psychologist_id = ?
          AND deleted_at IS NULL
          AND status IN ('SCHEDULED', 'CONFIRMED', 'RESCHEDULED')) AS pending,
       (SELECT COUNT(*)
        FROM appointments
        WHERE psychologist_id = ?
          AND deleted_at IS NULL
          AND status IN ('SCHEDULED', 'CONFIRMED', 'RESCHEDULED')
          AND appointment_date >= CURRENT_DATE()) AS upcoming,
       (SELECT COALESCE(SUM(amount), 0)
        FROM financial_records
        WHERE psychologist_id = ?
          AND deleted_at IS NULL
          AND status = 'PAID') AS paid_total,
       (SELECT COALESCE(SUM(amount), 0)
        FROM financial_records
        WHERE psychologist_id = ?
          AND deleted_at IS NULL
          AND status <> 'PAID') AS open_total`,
    [
      psychologistId,
      psychologistId,
      psychologistId,
      psychologistId,
      psychologistId,
      psychologistId,
      psychologistId
    ]
  );

  return {
    totalAppointments: Number(rows[0]?.total_appointments || 0),
    attended: Number(rows[0]?.attended || 0),
    missed: Number(rows[0]?.missed || 0),
    pending: Number(rows[0]?.pending || 0),
    upcoming: Number(rows[0]?.upcoming || 0),
    paidTotal: Number(rows[0]?.paid_total || 0),
    openTotal: Number(rows[0]?.open_total || 0)
  };
}
