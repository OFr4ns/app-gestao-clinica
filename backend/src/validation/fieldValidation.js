import { AppError } from '../utils/AppError.js';

export const FIELD_LIMITS = {
  name: 160,
  email: 255,
  password: 128,
  recordNumber: 60,
  cpf: 11,
  rg: 9,
  phone: 11,
  profession: 120,
  civilStatus: 60,
  address: 255,
  city: 120,
  state: 60,
  insurance: 120,
  notes: 5000,
  emergencyName: 160,
  emergencyRelationship: 80,
  appointmentNotes: 2000,
  financialDescription: 160,
  financialNotes: 2000,
  clinicalTitle: 160,
  clinicalNotes: 10000,
  sourceFilename: 255
};

export function digitsOnly(value) {
  return String(value ?? '').replace(/\D/g, '');
}

export function cleanText(value) {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value).trim();
}

export function limitText(value, maxLength) {
  return cleanText(value).slice(0, maxLength);
}

export function assertMaxLength(value, maxLength, label) {
  const text = cleanText(value);

  if (text.length > maxLength) {
    throw new AppError(`${label} deve ter no maximo ${maxLength} caracteres`, 400, 'FIELD_TOO_LONG');
  }

  return text;
}

export function assertRequiredMaxLength(value, maxLength, label) {
  const text = assertMaxLength(value, maxLength, label);

  if (!text) {
    throw new AppError(`${label} e obrigatorio`, 400, 'VALIDATION_ERROR');
  }

  return text;
}

export function normalizePhone(value, label = 'Telefone') {
  const digits = digitsOnly(value);

  if (!digits) {
    return '';
  }

  if (![10, 11].includes(digits.length)) {
    throw new AppError(`${label} deve conter 10 ou 11 numeros`, 400, 'INVALID_PHONE');
  }

  return digits;
}

export function normalizeCpf(value) {
  const digits = digitsOnly(value);

  if (!digits) {
    return '';
  }

  if (digits.length !== 11) {
    throw new AppError('CPF deve conter 11 numeros', 400, 'INVALID_CPF');
  }

  return digits;
}

export function normalizeOptionalDigits(value, maxLength, label) {
  const digits = digitsOnly(value);

  if (digits.length > maxLength) {
    throw new AppError(`${label} deve ter no maximo ${maxLength} numeros`, 400, 'FIELD_TOO_LONG');
  }

  return digits;
}

export function assertEmail(value, { required = false } = {}) {
  const email = assertMaxLength(value, FIELD_LIMITS.email, 'E-mail').toLowerCase();

  if (!email && required) {
    throw new AppError('E-mail e obrigatorio', 400, 'VALIDATION_ERROR');
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError('E-mail invalido', 400, 'INVALID_EMAIL');
  }

  return email;
}

export function normalizeDateField(value, label) {
  const text = cleanText(value);

  if (!text) {
    return '';
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new AppError(`${label} deve estar no formato AAAA-MM-DD`, 400, 'INVALID_DATE');
  }

  return text;
}

export function normalizeTimeField(value) {
  const text = cleanText(value);

  if (!text) {
    return '';
  }

  if (!/^\d{2}:\d{2}$/.test(text)) {
    throw new AppError('Hora deve estar no formato HH:MM', 400, 'INVALID_TIME');
  }

  return text;
}

export function normalizeMoney(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new AppError('Valor financeiro invalido', 400, 'INVALID_AMOUNT');
  }

  if (amount > 99999999.99) {
    throw new AppError('Valor financeiro deve ser menor ou igual a 99999999.99', 400, 'INVALID_AMOUNT');
  }

  return Math.round(amount * 100) / 100;
}

export function permissiveMoney(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    return 0;
  }

  return Math.min(Math.round(amount * 100) / 100, 99999999.99);
}

export function permissivePhone(value) {
  const digits = digitsOnly(value);
  return [10, 11].includes(digits.length) ? digits : '';
}

export function permissiveCpf(value) {
  const digits = digitsOnly(value);
  return digits.length === 11 ? digits : '';
}

export function permissiveEmail(value) {
  const email = limitText(value, FIELD_LIMITS.email).toLowerCase();
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}
