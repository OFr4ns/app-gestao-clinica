import React, { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  CalendarDays,
  CreditCard,
  FileClock,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Upload,
  UserRound,
  UsersRound
} from 'lucide-react';
import { api } from './api.js';
import { statusLabel } from './utils.js';
import { AdminView } from './views/AdminView.jsx';
import { AppointmentsView } from './views/AppointmentsView.jsx';
import { AuthScreen } from './views/AuthScreen.jsx';
import { ClinicalHistoryView } from './views/ClinicalHistoryView.jsx';
import { DashboardView } from './views/DashboardView.jsx';
import { FinancialView } from './views/FinancialView.jsx';
import { ImportView } from './views/ImportView.jsx';
import { PatientsView } from './views/PatientsView.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [patients, setPatients] = useState([]);
  const [patientOptions, setPatientOptions] = useState([]);
  const [patientPagination, setPatientPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [patientSearch, setPatientSearch] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [appointmentPagination, setAppointmentPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [appointmentDate, setAppointmentDate] = useState('');
  const [financials, setFinancials] = useState([]);
  const [financialPagination, setFinancialPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [history, setHistory] = useState([]);
  const [historyPagination, setHistoryPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [historyPatientFilter, setHistoryPatientFilter] = useState('');
  const [lastImport, setLastImport] = useState(null);
  const [adminSummary, setAdminSummary] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminUsersPagination, setAdminUsersPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [adminAuditLogs, setAdminAuditLogs] = useState([]);
  const [adminAuditPagination, setAdminAuditPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);

  function showSuccess(message) {
    setNotice({ type: 'success', message });
  }

  function showError(message) {
    setNotice({ type: 'error', message });
  }

  const loadData = useCallback(async () => {
    if (!user) {
      return;
    }

    setError('');
    setLoading(true);
    try {
      if (user.role === 'ADMIN') {
        const userParams = new URLSearchParams({
          page: String(adminUsersPagination.page),
          pageSize: String(adminUsersPagination.pageSize)
        });
        const auditParams = new URLSearchParams({
          page: String(adminAuditPagination.page),
          pageSize: String(adminAuditPagination.pageSize)
        });
        const [summaryData, usersData, logsData] = await Promise.all([
          api('/admin/summary'),
          api(`/admin/users?${userParams.toString()}`),
          api(`/admin/audit-logs?${auditParams.toString()}`)
        ]);
        setAdminSummary(summaryData.summary);
        setAdminUsers(usersData.users || []);
        setAdminUsersPagination(usersData.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 });
        setAdminAuditLogs(logsData.logs || []);
        setAdminAuditPagination(logsData.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 });
        return;
      }

      const patientParams = new URLSearchParams({
        page: String(patientPagination.page),
        pageSize: String(patientPagination.pageSize)
      });

      if (patientSearch.trim()) {
        patientParams.set('search', patientSearch.trim());
      }
      const appointmentParams = new URLSearchParams({
        page: String(appointmentPagination.page),
        pageSize: String(appointmentPagination.pageSize)
      });
      if (appointmentDate) {
        appointmentParams.set('date', appointmentDate);
      }
      const financialParams = new URLSearchParams({
        page: String(financialPagination.page),
        pageSize: String(financialPagination.pageSize)
      });
      const historyParams = new URLSearchParams({
        page: String(historyPagination.page),
        pageSize: String(historyPagination.pageSize)
      });
      if (historyPatientFilter) {
        historyParams.set('patientId', historyPatientFilter);
      }

      const [dashboardData, patientData, patientOptionsData, appointmentData, financialData, historyData] = await Promise.all([
        api('/dashboard'),
        api(`/patients?${patientParams.toString()}`),
        api('/patients?page=1&pageSize=100'),
        api(`/appointments?${appointmentParams.toString()}`),
        api(`/financials?${financialParams.toString()}`),
        api(`/clinical-history?${historyParams.toString()}`)
      ]);
      setDashboard(dashboardData.dashboard);
      setPatients(patientData.patients || []);
      setPatientOptions(patientOptionsData.patients || []);
      setPatientPagination(patientData.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 });
      setAppointments(appointmentData.appointments || []);
      setAppointmentPagination(appointmentData.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 });
      setFinancials(financialData.financials || []);
      setFinancialPagination(financialData.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 });
      setHistory(historyData.history || []);
      setHistoryPagination(historyData.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 });
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, [
    user,
    patientPagination.page,
    patientPagination.pageSize,
    patientSearch,
    appointmentPagination.page,
    appointmentPagination.pageSize,
    appointmentDate,
    financialPagination.page,
    financialPagination.pageSize,
    historyPagination.page,
    historyPagination.pageSize,
    historyPatientFilter,
    adminUsersPagination.page,
    adminUsersPagination.pageSize,
    adminAuditPagination.page,
    adminAuditPagination.pageSize
  ]);

  function changePatientSearch(value) {
    setPatientSearch(value);
    setPatientPagination((current) => ({ ...current, page: 1 }));
  }

  function changePatientPage(page) {
    setPatientPagination((current) => ({ ...current, page: Math.max(1, page) }));
  }

  function changePatientPageSize(pageSize) {
    setPatientPagination((current) => ({ ...current, page: 1, pageSize }));
  }

  function changeAppointmentDate(value) {
    setAppointmentDate(value);
    setAppointmentPagination((current) => ({ ...current, page: 1 }));
  }

  function changeAppointmentPage(page) {
    setAppointmentPagination((current) => ({ ...current, page: Math.max(1, page) }));
  }

  function changeAppointmentPageSize(pageSize) {
    setAppointmentPagination((current) => ({ ...current, page: 1, pageSize }));
  }

  function changeFinancialPage(page) {
    setFinancialPagination((current) => ({ ...current, page: Math.max(1, page) }));
  }

  function changeFinancialPageSize(pageSize) {
    setFinancialPagination((current) => ({ ...current, page: 1, pageSize }));
  }

  function changeHistoryPatientFilter(value) {
    setHistoryPatientFilter(value);
    setHistoryPagination((current) => ({ ...current, page: 1 }));
  }

  function changeHistoryPage(page) {
    setHistoryPagination((current) => ({ ...current, page: Math.max(1, page) }));
  }

  function changeHistoryPageSize(pageSize) {
    setHistoryPagination((current) => ({ ...current, page: 1, pageSize }));
  }

  function changeAdminUsersPage(page) {
    setAdminUsersPagination((current) => ({ ...current, page: Math.max(1, page) }));
  }

  function changeAdminUsersPageSize(pageSize) {
    setAdminUsersPagination((current) => ({ ...current, page: 1, pageSize }));
  }

  function changeAdminAuditPage(page) {
    setAdminAuditPagination((current) => ({ ...current, page: Math.max(1, page) }));
  }

  function changeAdminAuditPageSize(pageSize) {
    setAdminAuditPagination((current) => ({ ...current, page: 1, pageSize }));
  }

  useEffect(() => {
    api('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setBooting(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function createResource(path, payload, successMessage = 'Registro criado com sucesso.') {
    setLoading(true);
    setError('');
    setNotice(null);
    try {
      await api(path, { method: 'POST', body: JSON.stringify(payload) });
      await loadData();
      showSuccess(successMessage);
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateResource(path, payload, successMessage = 'Registro atualizado com sucesso.') {
    setLoading(true);
    setError('');
    setNotice(null);
    try {
      await api(path, { method: 'PUT', body: JSON.stringify(payload) });
      await loadData();
      showSuccess(successMessage);
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteResource(path, label = 'registro') {
    if (!window.confirm(`Excluir ${label}? Esta acao remove o item das listagens, mas mantem o registro interno para auditoria quando aplicavel.`)) {
      return;
    }

    setLoading(true);
    setError('');
    setNotice(null);
    try {
      await api(path, { method: 'DELETE' });
      await loadData();
      showSuccess(`${label.charAt(0).toUpperCase()}${label.slice(1)} excluido com sucesso.`);
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateAppointmentStatus(id, status) {
    setError('');
    setNotice(null);
    try {
      await api(`/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      await loadData();
      showSuccess(status === 'ATTENDED' ? 'Presenca registrada com sucesso.' : 'Status do agendamento atualizado.');
    } catch (err) {
      setError(err.message);
      showError(err.message);
    }
  }

  async function togglePaid(id) {
    setError('');
    setNotice(null);
    try {
      await api(`/financials/${id}/toggle-paid`, { method: 'POST' });
      await loadData();
      showSuccess('Status financeiro atualizado com sucesso.');
    } catch (err) {
      setError(err.message);
      showError(err.message);
    }
  }

  async function importBackup(payload) {
    setLoading(true);
    setError('');
    setNotice(null);
    try {
      const data = await api('/imports/html-json', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setLastImport(data.importBatch);
      await loadData();
      showSuccess('Importacao concluida com sucesso.');
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function createAdminUser(payload) {
    setLoading(true);
    setError('');
    setNotice(null);
    try {
      await api('/admin/users', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      await loadData();
      showSuccess('Usuario criado com sucesso.');
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateAdminUser(userId, payload) {
    setLoading(true);
    setError('');
    setNotice(null);
    try {
      await api(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      await loadData();
      showSuccess('Usuario atualizado com sucesso.');
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateAdminUserStatus(userId, status) {
    setLoading(true);
    setError('');
    setNotice(null);
    try {
      await api(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      await loadData();
      showSuccess(status === 'ACTIVE' ? 'Usuario ativado com sucesso.' : 'Usuario desativado com sucesso.');
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteAdminUser(targetUser) {
    if (!window.confirm(`Excluir o usuario ${targetUser.email}? Esta acao remove o acesso e revoga sessoes ativas.`)) {
      return;
    }

    const confirmEmail = window.prompt(`Para confirmar a exclusao, digite o e-mail completo do usuario:\n${targetUser.email}`);
    if (confirmEmail === null) {
      return;
    }

    setLoading(true);
    setError('');
    setNotice(null);
    try {
      await api(`/admin/users/${targetUser.id}`, {
        method: 'DELETE',
        body: JSON.stringify({ confirmEmail })
      });
      await loadData();
      showSuccess('Usuario excluido com sucesso.');
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function exportPatientData(patientId) {
    setError('');
    setNotice(null);
    try {
      const data = await api(`/patients/${patientId}/export`);
      const patientName = data.export?.patient?.name || patientId;
      const safeName = patientName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();
      const blob = new Blob([JSON.stringify(data.export, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `paciente-${safeName || patientId}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showSuccess('Exportacao do paciente gerada com sucesso.');
    } catch (err) {
      setError(err.message);
      showError(err.message);
    }
  }

  async function logoutUser() {
    await api('/auth/logout', { method: 'POST' });
    setUser(null);
    setActiveView('dashboard');
  }

  const navItems = [
    ['dashboard', 'Dashboard', LayoutDashboard],
    ['patients', 'Pacientes', UsersRound],
    ['appointments', 'Agenda', CalendarDays],
    ['financial', 'Financeiro', CreditCard],
    ['history', 'Historico', FileClock],
    ['import', 'Importacao', Upload]
  ];
  const adminNavItems = [['admin', 'Administracao', ShieldCheck]];

  if (booting) {
    return <main className="loading-page"><Activity size={28} />Carregando...</main>;
  }

  if (!user) {
    return <AuthScreen onAuthenticated={setUser} />;
  }

  const visibleNav = user.role === 'ADMIN' ? adminNavItems : navItems;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          <ShieldCheck size={24} />
          <span>Gestao Clinica</span>
        </div>
        <nav>
          {visibleNav.map(([key, label, Icon]) => (
            <button
              className={activeView === key ? 'nav-button active' : 'nav-button'}
              type="button"
              key={key}
              onClick={() => setActiveView(key)}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <div className="user-box">
          <UserRound size={18} />
          <div>
            <strong>{user.name || user.email}</strong>
            <span>{statusLabel(user.role)}</span>
          </div>
        </div>
        <button className="nav-button" type="button" onClick={logoutUser}>
          <LogOut size={18} />
          Sair
        </button>
      </aside>

      <section className="content">
        {notice && (
          <div className={`notice notice-${notice.type}`} role="status" aria-live="polite">
            <span>{notice.message}</span>
            <button className="text-button" type="button" onClick={() => setNotice(null)}>Fechar</button>
          </div>
        )}
        {!notice && error && <div className="form-error">{error}</div>}
        {user.role === 'ADMIN' && (
          <AdminView
            summary={adminSummary}
            users={adminUsers}
            logs={adminAuditLogs}
            reload={loadData}
            onCreateUser={createAdminUser}
            onUpdateUser={updateAdminUser}
            onUpdateUserStatus={updateAdminUserStatus}
            onDeleteUser={deleteAdminUser}
            usersPagination={adminUsersPagination}
            auditPagination={adminAuditPagination}
            onUsersPageChange={changeAdminUsersPage}
            onUsersPageSizeChange={changeAdminUsersPageSize}
            onAuditPageChange={changeAdminAuditPage}
            onAuditPageSizeChange={changeAdminAuditPageSize}
            currentUser={user}
            loading={loading}
          />
        )}
        {user.role !== 'ADMIN' && activeView === 'dashboard' && <DashboardView dashboard={dashboard} reload={loadData} />}
        {user.role !== 'ADMIN' && activeView === 'patients' && (
          <PatientsView
            patients={patients}
            pagination={patientPagination}
            search={patientSearch}
            onSearch={changePatientSearch}
            onPageChange={changePatientPage}
            onPageSizeChange={changePatientPageSize}
            onCreate={createResource}
            onUpdate={updateResource}
            onDelete={deleteResource}
            onExport={exportPatientData}
            loading={loading}
          />
        )}
        {user.role !== 'ADMIN' && activeView === 'appointments' && (
          <AppointmentsView
            appointments={appointments}
            patients={patientOptions}
            pagination={appointmentPagination}
            date={appointmentDate}
            onDateChange={changeAppointmentDate}
            onPageChange={changeAppointmentPage}
            onPageSizeChange={changeAppointmentPageSize}
            onCreate={createResource}
            onUpdate={updateResource}
            onDelete={deleteResource}
            onStatus={updateAppointmentStatus}
            loading={loading}
          />
        )}
        {user.role !== 'ADMIN' && activeView === 'financial' && (
          <FinancialView
            financials={financials}
            patients={patientOptions}
            pagination={financialPagination}
            onPageChange={changeFinancialPage}
            onPageSizeChange={changeFinancialPageSize}
            onCreate={createResource}
            onUpdate={updateResource}
            onDelete={deleteResource}
            onTogglePaid={togglePaid}
            loading={loading}
          />
        )}
        {user.role !== 'ADMIN' && activeView === 'history' && (
          <ClinicalHistoryView
            history={history}
            patients={patientOptions}
            pagination={historyPagination}
            patientFilter={historyPatientFilter}
            onPatientFilterChange={changeHistoryPatientFilter}
            onPageChange={changeHistoryPage}
            onPageSizeChange={changeHistoryPageSize}
            onCreate={createResource}
            onUpdate={updateResource}
            onDelete={deleteResource}
            loading={loading}
          />
        )}
        {user.role !== 'ADMIN' && activeView === 'import' && (
          <ImportView onImport={importBackup} loading={loading} lastImport={lastImport} />
        )}
      </section>
    </main>
  );
}
