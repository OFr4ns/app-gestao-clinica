import { CalendarDays, CheckCircle2, CreditCard, RefreshCcw, UsersRound } from 'lucide-react';
import { Badge, EmptyState } from '../components.jsx';
import { money, statusLabel } from '../utils.js';

export function DashboardView({ dashboard, reload }) {
  const stats = dashboard?.stats || {};
  const distribution = dashboard?.appointmentDistribution || {};

  return (
    <div className="view-stack">
      <div className="toolbar">
        <div><h2>Dashboard</h2><p className="muted">Resumo operacional do consultorio.</p></div>
        <button className="icon-button" type="button" onClick={reload} title="Atualizar"><RefreshCcw size={18} /></button>
      </div>
      <section className="metric-grid">
        <div className="metric"><UsersRound size={20} /><span>Pacientes ativos</span><strong>{stats.activePatients || 0}</strong></div>
        <div className="metric"><CalendarDays size={20} /><span>Agendamentos hoje</span><strong>{stats.appointmentsToday || 0}</strong></div>
        <div className="metric"><CheckCircle2 size={20} /><span>Recebido no mes</span><strong>{money(stats.paidCurrentMonth)}</strong></div>
        <div className="metric"><CreditCard size={20} /><span>Pendente total</span><strong>{money(stats.pendingTotal)}</strong></div>
      </section>
      <section className="split-layout">
        <div className="section">
          <h3>Proximos agendamentos</h3>
          <div className="list">
            {(dashboard?.upcomingAppointments || []).map((item) => (
              <div className="list-row" key={item.id}>
                <div><strong>{item.patient?.name || 'Paciente'}</strong><span>{item.date} as {item.time}</span></div>
                <Badge>{statusLabel(item.status)}</Badge>
              </div>
            ))}
            {!dashboard?.upcomingAppointments?.length && <EmptyState>Nenhum agendamento futuro encontrado.</EmptyState>}
          </div>
        </div>
        <div className="section">
          <h3>Distribuicao da agenda</h3>
          <div className="distribution">
            <div><span>Realizadas</span><strong>{distribution.percentages?.attended || 0}%</strong></div>
            <div><span>Faltas</span><strong>{distribution.percentages?.missed || 0}%</strong></div>
            <div><span>Agendadas</span><strong>{distribution.percentages?.scheduled || 0}%</strong></div>
          </div>
        </div>
      </section>
    </div>
  );
}
