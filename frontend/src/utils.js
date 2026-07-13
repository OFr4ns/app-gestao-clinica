export const today = () => new Date().toISOString().slice(0, 10);

export function money(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value || 0));
}

export function statusLabel(status) {
  const labels = {
    PSYCHOLOGIST: 'Psicologo',
    ADMIN: 'Admin',
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
    SCHEDULED: 'Agendado',
    CONFIRMED: 'Confirmado',
    ATTENDED: 'Presenca',
    MISSED: 'Falta',
    RESCHEDULED: 'Reagendado',
    REMOVED: 'Removido',
    PENDING: 'Pendente',
    PAID: 'Pago',
    OVERDUE: 'Atrasado',
    CASH: 'Dinheiro',
    PIX: 'Pix',
    CARD: 'Cartao',
    INSURANCE: 'Convenio'
  };

  return labels[status] || status || '-';
}

export function pick(source, fields, fallback) {
  const result = { ...fallback };
  for (const field of fields) {
    result[field] = source?.[field] ?? fallback[field] ?? '';
  }
  return result;
}
