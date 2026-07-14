import { RefreshCcw } from 'lucide-react';
import { Badge, EmptyState, PageHeader, StatCard } from '../components.jsx';
import { money, statusLabel } from '../utils.js';

function DistributionRow({ label, value }) {
  return (
    <div className="progress-row">
      <span>{label}</span>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${value || 0}%` }} /></div>
      <strong>{value || 0}%</strong>
    </div>
  );
}

export function DashboardView({ dashboard, reload }) {
  const stats = dashboard?.stats || {};
  const distribution = dashboard?.appointmentDistribution || {};
  const percentages = distribution.percentages || {};

  return (
    <div className="view-stack">
      <div className="toolbar">
        <PageHeader title="Dashboard Gerencial" />
        <button className="icon-button" type="button" onClick={reload} title="Atualizar"><RefreshCcw size={18} /></button>
      </div>

      <section className="metric-grid">
        <StatCard label="Total de Pacientes" value={stats.activePatients || 0} />
        <StatCard label="Consultas Hoje" value={stats.appointmentsToday || 0} />
        <StatCard label="Faturamento Mês" value={money(stats.paidCurrentMonth)} />
        <StatCard label="Valores Pendentes" value={money(stats.pendingTotal)} tone="warning" />
      </section>

      <section className="split-layout dashboard-panels">
        <div className="data-card">
          <h3>Próximos Atendimentos Agendados</h3>
          <div className="table-scroll">
            <table className="data-table dashboard-table">
              <thead>
                <tr>
                  <th>Horário</th>
                  <th>Paciente</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {(dashboard?.upcomingAppointments || []).map((item) => (
                  <tr key={item.id}>
                    <td>{item.date} {item.time}</td>
                    <td>{item.patient?.name || 'Paciente'}</td>
                    <td><Badge>{statusLabel(item.status)}</Badge></td>
                    <td>-</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!dashboard?.upcomingAppointments?.length && <EmptyState>Nenhum agendamento iminente registrado.</EmptyState>}
          </div>
        </div>

        <div className="data-card">
          <h3>Distribuição de Presença</h3>
          <div className="report-summary">
            <DistributionRow label="Comparecimento" value={percentages.attended} />
            <DistributionRow label="Absenteísmo" value={percentages.missed} />
            <DistributionRow label="Pendente / Agenda" value={percentages.scheduled} />
          </div>
        </div>
      </section>
    </div>
  );
}
