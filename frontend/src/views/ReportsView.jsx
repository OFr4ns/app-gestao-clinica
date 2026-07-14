import { PageHeader, StatCard } from '../components.jsx';
import { money } from '../utils.js';

function percent(value) {
  return Math.max(0, Math.min(Number(value || 0), 100));
}

function ProgressRow({ label, value, tone = 'default' }) {
  const safeValue = percent(value);

  return (
    <div className={`progress-row progress-row-${tone}`}>
      <span>{label}</span>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${safeValue}%` }} /></div>
      <strong>{safeValue}%</strong>
    </div>
  );
}

export function ReportsView({ reports }) {
  const operational = reports?.operational || {};
  const financial = reports?.financial || {};

  return (
    <div className="view-stack">
      <div className="toolbar">
        <PageHeader title="Analises e Indicadores Operacionais" />
      </div>

      <section className="metric-grid reports-metric-grid">
        <StatCard label="Presencas" value={operational.attended || 0} tone="success" />
        <StatCard label="Faltas" value={operational.missed || 0} tone="danger" />
        <StatCard label="Pendentes" value={operational.pending || 0} tone="warning" />
        <StatCard label="Consultas Futuras" value={operational.upcoming || 0} />
      </section>

      <section className="split-layout reports-grid">
        <div className="data-card">
          <h3>Metricas Operacionais Absolutas</h3>
          <div className="report-summary">
            <p><strong>Total de Atendimentos Historicos:</strong> {operational.totalAppointments || 0} sessoes</p>
            <ProgressRow label={`Presencas (${operational.attended || 0})`} value={operational.attendedPercentage} tone="success" />
            <ProgressRow label={`Faltas (${operational.missed || 0})`} value={operational.missedPercentage} tone="danger" />
            <ProgressRow label={`Pendentes (${operational.pending || 0})`} value={operational.pendingPercentage} tone="warning" />
            <ProgressRow label={`Futuras (${operational.upcoming || 0})`} value={operational.upcomingPercentage} />
          </div>
        </div>

        <div className="data-card">
          <h3>Resumo Financeiro Consolidado</h3>
          <div className="report-summary">
            <p><strong>Efetivamente Recebido:</strong> {money(financial.paidTotal)}</p>
            <p><strong>Valores em Aberto/Atraso:</strong> {money(financial.openTotal)}</p>
            <ProgressRow label="Adimplencia" value={financial.paidPercentage} tone="success" />
            <ProgressRow label="Inadimplencia" value={financial.openPercentage} tone="danger" />
          </div>
        </div>
      </section>
    </div>
  );
}
