import { PageHeader } from '../components.jsx';
import { money } from '../utils.js';

function ProgressRow({ label, value }) {
  return (
    <div className="progress-row">
      <span>{label}</span>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${value || 0}%` }} /></div>
      <strong>{value || 0}%</strong>
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

      <section className="split-layout reports-grid">
        <div className="data-card">
          <h3>Metricas Operacionais Absolutas</h3>
          <div className="report-summary">
            <p><strong>Total de Atendimentos Historicos:</strong> {operational.totalAppointments || 0} sessoes</p>
            <ProgressRow label={`Presencas (${operational.attended || 0})`} value={operational.attendedPercentage} />
            <ProgressRow label={`Faltas (${operational.missed || 0})`} value={operational.missedPercentage} />
          </div>
        </div>

        <div className="data-card">
          <h3>Resumo Financeiro Consolidado</h3>
          <div className="report-summary">
            <p><strong>Efetivamente Recebido:</strong> {money(financial.paidTotal)}</p>
            <p><strong>Valores em Aberto/Atraso:</strong> {money(financial.openTotal)}</p>
            <ProgressRow label="Adimplencia" value={financial.paidPercentage} />
            <ProgressRow label="Inadimplencia" value={financial.openPercentage} />
          </div>
        </div>
      </section>
    </div>
  );
}
