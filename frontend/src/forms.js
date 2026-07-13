import { today } from './utils.js';

export const emptyPatient = {
  name: '',
  phone: '',
  whatsapp: '',
  email: '',
  cpf: '',
  dob: '',
  profession: '',
  city: '',
  state: '',
  status: 'ACTIVE',
  notes: ''
};

export const emptyAppointment = {
  patientId: '',
  date: today(),
  time: '09:00',
  status: 'SCHEDULED',
  notes: ''
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
