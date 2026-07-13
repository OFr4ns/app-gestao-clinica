import { today } from './utils.js';

export const emptyPatient = {
  recordNumber: '',
  name: '',
  dob: '',
  cpf: '',
  rg: '',
  phone: '',
  whatsapp: '',
  email: '',
  profession: '',
  civilStatus: 'Solteiro(a)',
  address: '',
  city: '',
  state: '',
  insurance: '',
  status: 'ACTIVE',
  notes: '',
  emergencyName: '',
  emergencyRelationship: '',
  emergencyPhone: ''
};

export const emptyAppointment = {
  patientId: '',
  date: today(),
  time: '09:00',
  status: 'SCHEDULED',
  notes: '',
  generateFinancial: true,
  amount: '150',
  method: 'PIX'
};

export const emptyFinancial = {
  patientId: '',
  amount: '',
  method: 'PIX',
  dueDate: today(),
  status: 'PENDING',
  description: '',
  notes: ''
};

export const emptyHistory = {
  patientId: '',
  serviceDate: today(),
  title: '',
  notes: ''
};
