import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import test from 'node:test';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config({ path: '../.env' });

const API_BASE_URL = process.env.TEST_API_BASE_URL || 'http://localhost:3000/api';

function uniqueEmail(prefix) {
  return `${prefix}.${Date.now()}.${Math.random().toString(16).slice(2)}@test.local`;
}

function cookieHeader(response) {
  const cookies = response.headers.getSetCookie
    ? response.headers.getSetCookie()
    : [response.headers.get('set-cookie')].filter(Boolean);

  return cookies.map((cookie) => cookie.split(';')[0]).join('; ');
}

async function request(path, { method = 'GET', body, cookie, headers = {} } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  return { response, data, cookie: cookieHeader(response) };
}

async function csrf(cookie) {
  const response = await request('/auth/csrf', { cookie });
  assert.equal(response.response.status, 200);

  return {
    token: response.data.csrfToken,
    cookie: [cookie, response.cookie].filter(Boolean).join('; ')
  };
}

async function safeRequest(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();

  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) || path === '/auth/login' || path === '/auth/register') {
    return request(path, options);
  }

  const csrfData = await csrf(options.cookie);
  return request(path, {
    ...options,
    cookie: csrfData.cookie,
    headers: {
      'x-csrf-token': csrfData.token,
      ...(options.headers || {})
    }
  });
}

async function registerAndLogin(prefix) {
  const { email, password } = await createTestUser(prefix);

  const login = await request('/auth/login', {
    method: 'POST',
    body: { email, password }
  });
  assert.equal(login.response.status, 200);
  assert.ok(login.cookie.includes('gc_session='));

  return {
    email,
    password,
    user: login.data.user,
    cookie: login.cookie
  };
}

async function createTestUser(prefix, role = 'PSYCHOLOGIST') {
  const id = crypto.randomUUID();
  const email = uniqueEmail(prefix);
  const password = 'SenhaTeste123';
  const passwordHash = await bcrypt.hash(password, 12);
  const connection = await db();

  try {
    await connection.execute(
      `INSERT INTO users (id, name, email, password_hash, role, status)
       VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
      [id, role === 'ADMIN' ? `Admin ${prefix}` : `Psicologo ${prefix}`, email, passwordHash, role]
    );
  } finally {
    await connection.end();
  }

  return {
    id,
    email,
    password
  };
}

async function db() {
  return mysql.createConnection({
    host: process.env.TEST_DB_HOST || 'localhost',
    port: Number(process.env.TEST_DB_PORT || process.env.DB_PORT || 3306),
    database: process.env.TEST_DB_NAME || process.env.MYSQL_DATABASE || process.env.DB_NAME || 'gestao_clinica',
    user: process.env.TEST_DB_USER || process.env.MYSQL_USER || process.env.DB_USER || 'gestao_app',
    password: process.env.TEST_DB_PASSWORD || process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || 'gestao_app_password'
  });
}

test('health endpoint reports database ok', async () => {
  const health = await request('/health');
  assert.equal(health.response.status, 200);
  assert.equal(health.data.status, 'ok');
  assert.equal(health.data.database, 'ok');
});

test('psychologist data is isolated and patient fields are encrypted at rest', async () => {
  const owner = await registerAndLogin('owner');
  const outsider = await registerAndLogin('outsider');
  const patientName = `Paciente Sigiloso ${Date.now()}`;

  const createPatient = await safeRequest('/patients', {
    method: 'POST',
    cookie: owner.cookie,
    body: {
      name: patientName,
      phone: '11999990000',
      email: uniqueEmail('patient'),
      cpf: '12345678901',
      notes: 'Anotacao sensivel de teste'
    }
  });
  assert.equal(createPatient.response.status, 201);
  const patientId = createPatient.data.patient.id;

  const ownerRead = await request(`/patients/${patientId}`, { cookie: owner.cookie });
  assert.equal(ownerRead.response.status, 200);
  assert.equal(ownerRead.data.patient.name, patientName);

  const outsiderRead = await request(`/patients/${patientId}`, { cookie: outsider.cookie });
  assert.equal(outsiderRead.response.status, 404);

  const outsiderList = await request('/patients?status=ALL', { cookie: outsider.cookie });
  assert.equal(outsiderList.response.status, 200);
  assert.equal(
    outsiderList.data.patients.some((patient) => patient.id === patientId),
    false
  );

  const ownerExport = await request(`/patients/${patientId}/export`, { cookie: owner.cookie });
  assert.equal(ownerExport.response.status, 200);
  assert.equal(ownerExport.data.export.patient.id, patientId);
  assert.equal(Array.isArray(ownerExport.data.export.appointments), true);
  assert.equal(Array.isArray(ownerExport.data.export.financials), true);
  assert.equal(Array.isArray(ownerExport.data.export.clinicalHistory), true);

  const outsiderExport = await request(`/patients/${patientId}/export`, { cookie: outsider.cookie });
  assert.equal(outsiderExport.response.status, 404);

  const connection = await db();
  try {
    const [rows] = await connection.execute(
      `SELECT psychologist_id, name_encrypted, notes_encrypted
       FROM patients
       WHERE id = ?`,
      [patientId]
    );

    assert.equal(rows.length, 1);
    assert.equal(rows[0].psychologist_id, owner.user.psychologistId);
    assert.match(rows[0].name_encrypted, /^v1:/);
    assert.match(rows[0].notes_encrypted, /^v1:/);
    assert.equal(rows[0].name_encrypted.includes(patientName), false);
    assert.equal(rows[0].notes_encrypted.includes('Anotacao sensivel'), false);
  } finally {
    await connection.end();
  }
});

test('unauthenticated protected routes are rejected', async () => {
  const response = await request('/patients');
  assert.equal(response.response.status, 401);
  assert.equal(response.data.error, 'UNAUTHENTICATED');
});

test('patients endpoint supports pagination with search and page size limits', async () => {
  const owner = await registerAndLogin('pagination-owner');
  const outsider = await registerAndLogin('pagination-outsider');
  const batch = `PaginaBatch${Date.now()}`;

  for (let index = 0; index < 12; index += 1) {
    const created = await safeRequest('/patients', {
      method: 'POST',
      cookie: owner.cookie,
      body: {
        name: `${batch} Paciente ${String(index + 1).padStart(2, '0')}`,
        phone: `1199000${String(index).padStart(4, '0')}`
      }
    });
    assert.equal(created.response.status, 201);
  }

  const pageOne = await request(`/patients?search=${encodeURIComponent(batch)}&page=1&pageSize=10`, {
    cookie: owner.cookie
  });
  assert.equal(pageOne.response.status, 200);
  assert.equal(pageOne.data.patients.length, 10);
  assert.equal(pageOne.data.items.length, 10);
  assert.equal(pageOne.data.pagination.page, 1);
  assert.equal(pageOne.data.pagination.pageSize, 10);
  assert.equal(pageOne.data.pagination.total, 12);
  assert.equal(pageOne.data.pagination.totalPages, 2);

  const pageTwo = await request(`/patients?search=${encodeURIComponent(batch)}&page=2&pageSize=10`, {
    cookie: owner.cookie
  });
  assert.equal(pageTwo.response.status, 200);
  assert.equal(pageTwo.data.patients.length, 2);
  assert.equal(pageTwo.data.pagination.page, 2);

  const maxPageSize = await request(`/patients?search=${encodeURIComponent(batch)}&page=1&pageSize=500`, {
    cookie: owner.cookie
  });
  assert.equal(maxPageSize.response.status, 200);
  assert.equal(maxPageSize.data.pagination.pageSize, 100);

  const outsiderPage = await request(`/patients?search=${encodeURIComponent(batch)}&page=1&pageSize=10`, {
    cookie: outsider.cookie
  });
  assert.equal(outsiderPage.response.status, 200);
  assert.equal(outsiderPage.data.pagination.total, 0);
  assert.equal(outsiderPage.data.patients.length, 0);
});

test('patient validation normalizes digits and rejects invalid fields', async () => {
  const owner = await registerAndLogin('field-validation');
  const maskedPatient = await safeRequest('/patients', {
    method: 'POST',
    cookie: owner.cookie,
    body: {
      name: 'Paciente Mascara',
      phone: '(16)99420-3492',
      whatsapp: '16994203492',
      cpf: '123.456.789-01'
    }
  });
  assert.equal(maskedPatient.response.status, 201);
  assert.equal(maskedPatient.data.patient.phone, '16994203492');
  assert.equal(maskedPatient.data.patient.whatsapp, '16994203492');
  assert.equal(maskedPatient.data.patient.cpf, '12345678901');

  const invalidPhone = await safeRequest('/patients', {
    method: 'POST',
    cookie: owner.cookie,
    body: {
      name: 'Paciente Telefone Invalido',
      phone: 'abc123'
    }
  });
  assert.equal(invalidPhone.response.status, 400);
  assert.equal(invalidPhone.data.error, 'INVALID_PHONE');

  const invalidCpf = await safeRequest('/patients', {
    method: 'POST',
    cookie: owner.cookie,
    body: {
      name: 'Paciente CPF Invalido',
      cpf: '123'
    }
  });
  assert.equal(invalidCpf.response.status, 400);
  assert.equal(invalidCpf.data.error, 'INVALID_CPF');

  const tooLongName = await safeRequest('/patients', {
    method: 'POST',
    cookie: owner.cookie,
    body: {
      name: 'A'.repeat(161)
    }
  });
  assert.equal(tooLongName.response.status, 400);
  assert.equal(tooLongName.data.error, 'FIELD_TOO_LONG');
});

test('operational list endpoints return pagination metadata', async () => {
  const owner = await registerAndLogin('list-pagination-owner');
  const createPatient = await safeRequest('/patients', {
    method: 'POST',
    cookie: owner.cookie,
    body: {
      name: `Paciente Listas ${Date.now()}`,
      phone: '11988887777'
    }
  });
  assert.equal(createPatient.response.status, 201);
  const patientId = createPatient.data.patient.id;

  const appointment = await safeRequest('/appointments', {
    method: 'POST',
    cookie: owner.cookie,
    body: {
      patientId,
      date: '2030-01-15',
      time: '09:30',
      status: 'SCHEDULED',
      generateFinancial: false
    }
  });
  assert.equal(appointment.response.status, 201);

  const financial = await safeRequest('/financials', {
    method: 'POST',
    cookie: owner.cookie,
    body: {
      patientId,
      amount: 120,
      method: 'PIX',
      dueDate: '2030-01-15',
      status: 'PENDING'
    }
  });
  assert.equal(financial.response.status, 201);

  const clinicalTitle = 'Sessao de teste';
  const clinicalNotes = 'Anotacao clinica de teste';
  const history = await safeRequest('/clinical-history', {
    method: 'POST',
    cookie: owner.cookie,
    body: {
      patientId,
      serviceDate: '2030-01-15',
      title: clinicalTitle,
      notes: clinicalNotes
    }
  });
  assert.equal(history.response.status, 201);
  assert.equal(history.data.entry.title, clinicalTitle);
  assert.equal(history.data.entry.notes, clinicalNotes);

  const connection = await db();
  try {
    const [rows] = await connection.execute(
      `SELECT title_encrypted, notes_encrypted
       FROM clinical_history
       WHERE id = ?`,
      [history.data.entry.id]
    );

    assert.equal(rows.length, 1);
    assert.match(rows[0].title_encrypted, /^v1:/);
    assert.match(rows[0].notes_encrypted, /^v1:/);
    assert.equal(rows[0].title_encrypted.includes(clinicalTitle), false);
    assert.equal(rows[0].notes_encrypted.includes(clinicalNotes), false);
  } finally {
    await connection.end();
  }

  const appointments = await request('/appointments?page=1&pageSize=10&date=2030-01-15', {
    cookie: owner.cookie
  });
  assert.equal(appointments.response.status, 200);
  assert.equal(Array.isArray(appointments.data.items), true);
  assert.equal(Array.isArray(appointments.data.appointments), true);
  assert.equal(appointments.data.pagination.pageSize, 10);
  assert.ok(appointments.data.pagination.total >= 1);

  const financials = await request('/financials?page=1&pageSize=10&status=PENDING', {
    cookie: owner.cookie
  });
  assert.equal(financials.response.status, 200);
  assert.equal(Array.isArray(financials.data.items), true);
  assert.equal(Array.isArray(financials.data.financials), true);
  assert.equal(financials.data.pagination.pageSize, 10);
  assert.ok(financials.data.pagination.total >= 1);

  const clinicalHistory = await request(`/clinical-history?page=1&pageSize=10&patientId=${patientId}`, {
    cookie: owner.cookie
  });
  assert.equal(clinicalHistory.response.status, 200);
  assert.equal(Array.isArray(clinicalHistory.data.items), true);
  assert.equal(Array.isArray(clinicalHistory.data.history), true);
  assert.equal(clinicalHistory.data.pagination.pageSize, 10);
  assert.ok(clinicalHistory.data.pagination.total >= 1);
});

test('public registration is disabled and admins create psychologist users', async () => {
  const publicRegister = await request('/auth/register', {
    method: 'POST',
    body: {
      name: 'Cadastro Publico',
      email: uniqueEmail('public'),
      password: 'SenhaTeste123'
    }
  });
  assert.equal(publicRegister.response.status, 403);
  assert.equal(publicRegister.data.error, 'PUBLIC_REGISTRATION_DISABLED');

  const psychologist = await registerAndLogin('not-admin');
  const forbiddenCreate = await safeRequest('/admin/users', {
    method: 'POST',
    cookie: psychologist.cookie,
    body: {
      name: 'Criado por psicologo',
      email: uniqueEmail('forbidden-admin-create'),
      password: 'SenhaTeste123'
    }
  });
  assert.equal(forbiddenCreate.response.status, 403);

  const adminSeed = await createTestUser('admin-create', 'ADMIN');
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: adminSeed.email, password: adminSeed.password }
  });
  assert.equal(adminLogin.response.status, 200);

  const adminUsersPage = await request('/admin/users?page=1&pageSize=10', {
    cookie: adminLogin.cookie
  });
  assert.equal(adminUsersPage.response.status, 200);
  assert.equal(Array.isArray(adminUsersPage.data.items), true);
  assert.equal(Array.isArray(adminUsersPage.data.users), true);
  assert.equal(adminUsersPage.data.pagination.pageSize, 10);

  const adminAuditPage = await request('/admin/audit-logs?page=1&pageSize=10', {
    cookie: adminLogin.cookie
  });
  assert.equal(adminAuditPage.response.status, 200);
  assert.equal(Array.isArray(adminAuditPage.data.items), true);
  assert.equal(Array.isArray(adminAuditPage.data.logs), true);
  assert.equal(adminAuditPage.data.pagination.pageSize, 10);

  const createdEmail = uniqueEmail('admin-created-psychologist');
  const created = await safeRequest('/admin/users', {
    method: 'POST',
    cookie: adminLogin.cookie,
    body: {
      name: 'Psicologo Criado Pelo Admin',
      email: createdEmail,
      password: 'SenhaTeste123'
    }
  });
  assert.equal(created.response.status, 201);
  assert.equal(created.data.user.email, createdEmail);
  assert.equal(created.data.user.role, 'PSYCHOLOGIST');

  const updatedEmail = uniqueEmail('admin-updated-psychologist');
  const updatedPassword = 'SenhaNova123';
  const updated = await safeRequest(`/admin/users/${created.data.user.id}`, {
    method: 'PUT',
    cookie: adminLogin.cookie,
    body: {
      name: 'Psicologo Editado Pelo Admin',
      email: updatedEmail,
      role: 'PSYCHOLOGIST',
      password: updatedPassword
    }
  });
  assert.equal(updated.response.status, 200);
  assert.equal(updated.data.user.email, updatedEmail);

  const updatedUserLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: updatedEmail, password: updatedPassword }
  });
  assert.equal(updatedUserLogin.response.status, 200);

  const deactivated = await safeRequest(`/admin/users/${created.data.user.id}/status`, {
    method: 'PATCH',
    cookie: adminLogin.cookie,
    body: { status: 'INACTIVE' }
  });
  assert.equal(deactivated.response.status, 200);
  assert.equal(deactivated.data.user.status, 'INACTIVE');

  const revokedSession = await request('/auth/me', { cookie: updatedUserLogin.cookie });
  assert.equal(revokedSession.response.status, 401);

  const reactivated = await safeRequest(`/admin/users/${created.data.user.id}/status`, {
    method: 'PATCH',
    cookie: adminLogin.cookie,
    body: { status: 'ACTIVE' }
  });
  assert.equal(reactivated.response.status, 200);
  assert.equal(reactivated.data.user.status, 'ACTIVE');

  const badDelete = await safeRequest(`/admin/users/${created.data.user.id}`, {
    method: 'DELETE',
    cookie: adminLogin.cookie,
    body: { confirmEmail: 'email-incorreto@test.local' }
  });
  assert.equal(badDelete.response.status, 400);

  const deleted = await safeRequest(`/admin/users/${created.data.user.id}`, {
    method: 'DELETE',
    cookie: adminLogin.cookie,
    body: { confirmEmail: updatedEmail }
  });
  assert.equal(deleted.response.status, 204);
});

test('unsafe authenticated requests require a valid CSRF token', async () => {
  const user = await registerAndLogin('csrf');
  const response = await request('/patients', {
    method: 'POST',
    cookie: user.cookie,
    body: { name: 'Paciente sem CSRF' }
  });

  assert.equal(response.response.status, 403);
  assert.equal(response.data.error, 'INVALID_CSRF_TOKEN');

  const logout = await safeRequest('/auth/logout', {
    method: 'POST',
    cookie: user.cookie
  });
  assert.equal(logout.response.status, 204);

  const me = await request('/auth/me', { cookie: user.cookie });
  assert.equal(me.response.status, 401);
});
