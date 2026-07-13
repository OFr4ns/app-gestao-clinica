import { decryptAppointment } from '../mappers/appointmentMapper.js';
import { decryptPatient } from '../mappers/patientMapper.js';
import {
  getAppointmentStatusDistribution,
  getDashboardCounts,
  getFinancialDashboardTotals,
  getReportTotals,
  getUpcomingAppointments
} from '../repositories/dashboardRepository.js';
import { findPatientById } from '../repositories/patientRepository.js';
import { AppError } from '../utils/AppError.js';

function requirePsychologist(psychologistId) {
  if (!psychologistId) {
    throw new AppError('Only psychologist users can access dashboard data', 403, 'FORBIDDEN');
  }
}

function appointmentDistributionPayload(distribution) {
  const attended = distribution.ATTENDED || 0;
  const missed = distribution.MISSED || 0;
  const scheduled = (distribution.SCHEDULED || 0)
    + (distribution.CONFIRMED || 0)
    + (distribution.RESCHEDULED || 0);

  const total = attended + missed + scheduled;

  return {
    attended,
    missed,
    scheduled,
    total,
    percentages: {
      attended: total ? Math.round((attended / total) * 100) : 0,
      missed: total ? Math.round((missed / total) * 100) : 0,
      scheduled: total ? Math.round((scheduled / total) * 100) : 0
    }
  };
}

export async function getDashboard({ psychologistId }) {
  requirePsychologist(psychologistId);

  const [counts, financial, rawUpcoming, distribution] = await Promise.all([
    getDashboardCounts({ psychologistId }),
    getFinancialDashboardTotals({ psychologistId }),
    getUpcomingAppointments({ psychologistId }),
    getAppointmentStatusDistribution({ psychologistId })
  ]);

  const upcomingAppointments = [];

  for (const row of rawUpcoming) {
    const patientRow = await findPatientById({ id: row.patient_id, psychologistId });
    upcomingAppointments.push(decryptAppointment(
      row,
      patientRow ? decryptPatient(patientRow) : null
    ));
  }

  return {
    stats: {
      activePatients: counts.activePatients,
      appointmentsToday: counts.appointmentsToday,
      paidCurrentMonth: financial.paidCurrentMonth,
      pendingTotal: financial.pendingTotal,
      paidTotal: financial.paidTotal
    },
    upcomingAppointments,
    appointmentDistribution: appointmentDistributionPayload(distribution)
  };
}

export async function getReports({ psychologistId }) {
  requirePsychologist(psychologistId);

  const totals = await getReportTotals({ psychologistId });
  const operationalBase = totals.totalAppointments || 1;
  const financialBase = (totals.paidTotal + totals.openTotal) || 1;

  return {
    operational: {
      totalAppointments: totals.totalAppointments,
      attended: totals.attended,
      missed: totals.missed,
      attendedPercentage: Math.round((totals.attended / operationalBase) * 100),
      missedPercentage: Math.round((totals.missed / operationalBase) * 100)
    },
    financial: {
      paidTotal: totals.paidTotal,
      openTotal: totals.openTotal,
      paidPercentage: Math.round((totals.paidTotal / financialBase) * 100),
      openPercentage: Math.round((totals.openTotal / financialBase) * 100)
    }
  };
}

