import { digitsOnly, fieldLimits } from './utils.js';

const appointmentStatuses = ['SCHEDULED', 'CONFIRMED', 'ATTENDED', 'MISSED', 'RESCHEDULED'];
const financialStatuses = ['PENDING', 'PAID', 'OVERDUE'];
const paymentMethods = ['CASH', 'PIX', 'CARD', 'TRANSFER', 'INSURANCE'];
const userRoles = ['PSYCHOLOGIST', 'ADMIN'];

function text(value) {
  return String(value || '').trim();
}

export function validateRequired(value, label) {
  return text(value) ? '' : `${label} e obrigatorio.`;
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
    errors.push('Nome completo e obrigatorio.');
  }

  if (name.length > fieldLimits.name) {
    errors.push(`Nome completo deve ter no maximo ${fieldLimits.name} caracteres.`);
  }

  if (!dob) {
    errors.push('Data de nascimento e obrigatoria.');
  } else if (!validateDate(dob)) {
    errors.push('Data de nascimento deve estar em um formato valido.');
  }

  if (!validateOptionalCpf(patient.cpf)) {
    errors.push('CPF deve conter 11 numeros.');
  }

  if (digitsOnly(patient.rg).length > fieldLimits.rg) {
    errors.push(`RG deve ter no maximo ${fieldLimits.rg} numeros.`);
  }

  if (!validateOptionalPhone(patient.phone)) {
    errors.push('Telefone deve conter 10 ou 11 numeros.');
  }

  if (!validateOptionalPhone(patient.whatsapp)) {
    errors.push('WhatsApp deve conter 10 ou 11 numeros.');
  }

  if (email.length > fieldLimits.email) {
    errors.push(`E-mail deve ter no maximo ${fieldLimits.email} caracteres.`);
  } else if (!validateEmail(email)) {
    errors.push('E-mail invalido.');
  }

  if (!validateOptionalPhone(patient.emergencyPhone)) {
    errors.push('Telefone do contato de emergencia deve conter 10 ou 11 numeros.');
  }

  return errors;
}

export function validateAppointmentForm(appointment, { includeFinancial = false } = {}) {
  const errors = [];

  if (!text(appointment.patientId)) {
    errors.push('Paciente e obrigatorio.');
  }

  if (!text(appointment.date)) {
    errors.push('Data do agendamento e obrigatoria.');
  } else if (!validateDate(appointment.date)) {
    errors.push('Data do agendamento deve estar em um formato valido.');
  }

  if (!text(appointment.time)) {
    errors.push('Horario e obrigatorio.');
  } else if (!validateTime(appointment.time)) {
    errors.push('Horario deve estar em um formato valido.');
  }

  if (!appointmentStatuses.includes(appointment.status)) {
    errors.push('Status do agendamento invalido.');
  }

  if (text(appointment.notes).length > fieldLimits.appointmentNotes) {
    errors.push(`Observacoes devem ter no maximo ${fieldLimits.appointmentNotes} caracteres.`);
  }

  if (includeFinancial && appointment.generateFinancial) {
    if (!validateMoney(appointment.amount)) {
      errors.push('Valor da sessao deve ser um numero entre 0 e 99999999.99.');
    }

    if (!paymentMethods.includes(appointment.method)) {
      errors.push('Forma de recebimento invalida.');
    }
  }

  return errors;
}

export function validateFinancialForm(financial) {
  const errors = [];

  if (!text(financial.patientId)) {
    errors.push('Paciente e obrigatorio.');
  }

  if (!validateMoney(financial.amount)) {
    errors.push('Valor cobrado deve ser um numero entre 0 e 99999999.99.');
  }

  if (!text(financial.dueDate)) {
    errors.push('Data de vencimento e obrigatoria.');
  } else if (!validateDate(financial.dueDate)) {
    errors.push('Data de vencimento deve estar em um formato valido.');
  }

  if (!paymentMethods.includes(financial.method)) {
    errors.push('Forma de pagamento invalida.');
  }

  if (!financialStatuses.includes(financial.status)) {
    errors.push('Status financeiro invalido.');
  }

  if (text(financial.description).length > fieldLimits.financialDescription) {
    errors.push(`Descricao deve ter no maximo ${fieldLimits.financialDescription} caracteres.`);
  }

  if (text(financial.notes).length > fieldLimits.financialNotes) {
    errors.push(`Observacoes devem ter no maximo ${fieldLimits.financialNotes} caracteres.`);
  }

  return errors;
}

export function validateClinicalHistoryForm(history) {
  const errors = [];

  if (!text(history.patientId)) {
    errors.push('Paciente e obrigatorio.');
  }

  if (!text(history.serviceDate)) {
    errors.push('Data do atendimento e obrigatoria.');
  } else if (!validateDate(history.serviceDate)) {
    errors.push('Data do atendimento deve estar em um formato valido.');
  }

  if (!text(history.title)) {
    errors.push('Titulo da sessao e obrigatorio.');
  } else if (text(history.title).length > fieldLimits.clinicalTitle) {
    errors.push(`Titulo da sessao deve ter no maximo ${fieldLimits.clinicalTitle} caracteres.`);
  }

  if (!text(history.notes)) {
    errors.push('Evolucao clinica e obrigatoria.');
  } else if (text(history.notes).length > fieldLimits.clinicalNotes) {
    errors.push(`Evolucao clinica deve ter no maximo ${fieldLimits.clinicalNotes} caracteres.`);
  }

  return errors;
}

export function validateUserForm(user, { editing = false } = {}) {
  const errors = [];
  const name = text(user.name);
  const email = text(user.email);
  const password = String(user.password || '');

  if (!name) {
    errors.push('Nome e obrigatorio.');
  } else if (name.length > fieldLimits.name) {
    errors.push(`Nome deve ter no maximo ${fieldLimits.name} caracteres.`);
  }

  if (!email) {
    errors.push('E-mail e obrigatorio.');
  } else if (email.length > fieldLimits.email) {
    errors.push(`E-mail deve ter no maximo ${fieldLimits.email} caracteres.`);
  } else if (!validateEmail(email)) {
    errors.push('E-mail invalido.');
  }

  if (!userRoles.includes(user.role)) {
    errors.push('Perfil de usuario invalido.');
  }

  if (!editing && !password) {
    errors.push('Senha temporaria e obrigatoria.');
  }

  if (password && password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres.');
  }

  if (password.length > fieldLimits.password) {
    errors.push(`Senha deve ter no maximo ${fieldLimits.password} caracteres.`);
  }

  return errors;
}

export function validateLoginForm(login) {
  const errors = [];
  const email = text(login.email);
  const password = String(login.password || '');

  if (!email) {
    errors.push('E-mail e obrigatorio.');
  } else if (!validateEmail(email)) {
    errors.push('E-mail invalido.');
  }

  if (!password) {
    errors.push('Senha e obrigatoria.');
  } else if (password.length > fieldLimits.password) {
    errors.push(`Senha deve ter no maximo ${fieldLimits.password} caracteres.`);
  }

  return errors;
}
