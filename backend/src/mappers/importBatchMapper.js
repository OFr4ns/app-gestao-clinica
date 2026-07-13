import { decryptField } from '../security/cryptoService.js';
import { toIsoDateTime } from '../utils/dateUtils.js';

export function mapImportBatch(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    psychologistId: row.psychologist_id,
    userId: row.user_id,
    status: row.status,
    sourceFilename: row.source_filename,
    counts: {
      patients: Number(row.patients_count || 0),
      appointments: Number(row.appointments_count || 0),
      financials: Number(row.financial_records_count || 0),
      history: Number(row.clinical_history_count || 0)
    },
    errorMessage: decryptField(row.error_message_encrypted),
    createdAt: toIsoDateTime(row.created_at),
    completedAt: toIsoDateTime(row.completed_at)
  };
}

