import { digitsOnly, fieldLimits } from './utils.js';

const appointmentStatuses = ['SCHEDULED', 'CONFIRMED', 'ATTENDED', 'MISSED', 'RESCHEDULED'];
const financialStatuses = ['PENDING', 'PAID', 'OVERDUE'];
const paymentMethods = ['CASH', 'PIX', 'CARD', 'TRANSFER', 'INSURANCE'];
const userRoles = ['PSYCHOLOGIST', 'ADMIN'];

function text(value) {
  return String(value || '').trim();
}

export function validateRequired(value, label) {
  return text(value) ? '' : `${label} é obrigatório.`;
}

export function validateEmail(value) {
  const email = text(value);
  return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(text(value));
}

export function validateTime(value) {
  return /^\d{2}:\d{2}$/.test(text(value));
}

export function validateMoney(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 && amount <= 99999999.99;
}

export function validateOptionalCpf(value) {
  const digits = digitsOnly(value);
  return !digits || digits.length === fieldLimits.cpf;
}

export function validateOptionalPhone(value) {
  const digits = digitsOnly(value);
  return !digits || digits.length === 10 || digits.length === 11;
}

export function validatePatientForm(patient) {
  const errors = [];
  const name = text(patient.name);
  const dob = text(patient.dob);
  const email = text(patient.email);

  if (!name) {
    errors.push('Nome completo é obrigatório.');
  }

  if (name.length > fieldLimits.name) {
    errors.push(`Nome completo deve ter no máximo ${fieldLimits.name} caracteres.`);
  }

  if (!dob) {
    errors.push('Data de nascimento é obrigatória.');
  } else if (!validateDate(dob)) {
    errors.push('Data de nascimento deve estar em um formato valido.');
  }

  if (!validateOptionalCpf(patient.cpf)) {
    errors.push('CPF deve conter 11 números.');
  }

  if (digitsOnly(patient.rg).length > fieldLimits.rg) {
    errors.push(`RG deve ter no máximo ${fieldLimits.rg} números.`);
  }

  if (!validateOptionalPhone(patient.phone)) {
    errors.push('Telefone deve conter 10 ou 11 números.');
  }

  if (!validateOptionalPhone(patient.whatsapp)) {
    errors.push('WhatsApp deve conter 10 ou 11 números.');
  }

  if (email.length > fieldLimits.email) {
    errors.push(`E-mail deve ter no máximo ${fieldLimits.email} caracteres.`);
  } else if (!validateEmail(email)) {
    errors.push('E-mail inválido.');
  }

  if (!validateOptionalPhone(patient.emergencyPhone)) {
    errors.push('Telefone do contato de emergência deve conter 10 ou 11 números.');
  }

  return errors;
}

export function validateAppointmentForm(appointment, { includeFinancial = false } = {}) {
  const errors = [];

  if (!text(appointment.patientId)) {
    errors.push('Paciente é obrigatório.');
  }

  if (!text(appointment.date)) {
    errors.push('Data do agendamento é obrigatória.');
  } else if (!validateDate(appointment.date)) {
    errors.push('Data do agendamento deve estar em um formato valido.');
  }

  if (!text(appointment.time)) {
    errors.push('Horário é obrigatório.');
  } else if (!validateTime(appointment.time)) {
    errors.push('Horário deve estar em um formato válido.');
  }

  if (!appointmentStatuses.includes(appointment.status)) {
    errors.push('Status do agendamento inválido.');
  }

  if (text(appointment.notes).length > fieldLimits.appointmentNotes) {
    errors.push(`Observações devem ter no máximo ${fieldLimits.appointmentNotes} caracteres.`);
  }

  if (includeFinancial && appointment.generateFinancial) {
    if (!validateMoney(appointment.amount)) {
      errors.push('Valor da sessão deve ser um número entre 0 e 99999999.99.');
    }

    if (!paymentMethods.includes(appointment.method)) {
      errors.push('Forma de recebimento inválida.');
    }
  }

  return errors;
}

export function validateFinancialForm(financial) {
  const errors = [];

  if (!text(financial.patientId)) {
    errors.push('Paciente é obrigatório.');
  }

  if (!validateMoney(financial.amount)) {
    errors.push('Valor cobrado deve ser um número entre 0 e 99999999.99.');
  }

  if (!text(financial.dueDate)) {
    errors.push('Data de vencimento é obrigatória.');
  } else if (!validateDate(financial.dueDate)) {
    errors.push('Data de vencimento deve estar em um formato válido.');
  }

  if (!paymentMethods.includes(financial.method)) {
    errors.push('Forma de pagamento inválida.');
  }

  if (!financialStatuses.includes(financial.status)) {
    errors.push('Status financeiro inválido.');
  }

  if (text(financial.description).length > fieldLimits.financialDescription) {
    errors.push(`Descrição deve ter no máximo ${fieldLimits.financialDescription} caracteres.`);
  }

  if (text(financial.notes).length > fieldLimits.financialNotes) {
    errors.push(`Observações devem ter no máximo ${fieldLimits.financialNotes} caracteres.`);
  }

  return errors;
}

export function validateClinicalHistoryForm(history) {
  const errors = [];

  if (!text(history.patientId)) {
    errors.push('Paciente é obrigatório.');
  }

  if (!text(history.serviceDate)) {
    errors.push('Data do atendimento é obrigatória.');
  } else if (!validateDate(history.serviceDate)) {
    errors.push('Data do atendimento deve estar em um formato válido.');
  }

  if (!text(history.title)) {
    errors.push('Título da sessão é obrigatório.');
  } else if (text(history.title).length > fieldLimits.clinicalTitle) {
    errors.push(`Título da sessão deve ter no máximo ${fieldLimits.clinicalTitle} caracteres.`);
  }

  if (!text(history.notes)) {
    errors.push('Evolução clínica é obrigatória.');
  } else if (text(history.notes).length > fieldLimits.clinicalNotes) {
    errors.push(`Evolução clínica deve ter no máximo ${fieldLimits.clinicalNotes} caracteres.`);
  }

  return errors;
}

export function validateUserForm(user, { editing = false } = {}) {
  const errors = [];
  const name = text(user.name);
  const email = text(user.email);
  const password = String(user.password || '');

  if (!name) {
    errors.push('Nome é obrigatório.');
  } else if (name.length > fieldLimits.name) {
    errors.push(`Nome deve ter no máximo ${fieldLimits.name} caracteres.`);
  }

  if (!email) {
    errors.push('E-mail é obrigatório.');
  } else if (email.length > fieldLimits.email) {
    errors.push(`E-mail deve ter no máximo ${fieldLimits.email} caracteres.`);
  } else if (!validateEmail(email)) {
    errors.push('E-mail inválido.');
  }

  if (!userRoles.includes(user.role)) {
    errors.push('Perfil de usuário inválido.');
  }

  if (!editing && !password) {
    errors.push('Senha temporária é obrigatória.');
  }

  if (password && password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres.');
  }

  if (password.length > fieldLimits.password) {
    errors.push(`Senha deve ter no máximo ${fieldLimits.password} caracteres.`);
  }

  return errors;
}

export function validateLoginForm(login) {
  const errors = [];
  const email = text(login.email);
  const password = String(login.password || '');

  if (!email) {
    errors.push('E-mail é obrigatório.');
  } else if (!validateEmail(email)) {
    errors.push('E-mail inválido.');
  }

  if (!password) {
    errors.push('Senha é obrigatória.');
  } else if (password.length > fieldLimits.password) {
    errors.push(`Senha deve ter no máximo ${fieldLimits.password} caracteres.`);
  }

  return errors;
}
