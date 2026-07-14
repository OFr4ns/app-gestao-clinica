function formatLongDate(date = new Date()) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export function PageHeader({ title, children }) {
  return (
    <header className="page-header">
      <h1>{title}</h1>
      <div className="page-header-side">
        <span>{formatLongDate()}</span>
        {children}
      </div>
    </header>
  );
}

export function StatCard({ label, value, tone = 'default' }) {
  return (
    <div className={`stat-card stat-card-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function DataCard({ title, actions, children, className = '' }) {
  return (
    <section className={`data-card ${className}`.trim()}>
      {(title || actions) && (
        <div className="data-card-header">
          {title && <h3>{title}</h3>}
          {actions && <div className="data-card-actions">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Modal({ title, children, footer, onClose, width = 'default' }) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={`modal-content modal-${width}`}>
        <div className="modal-header">
          <h3 id="modal-title">{title}</h3>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Fechar">x</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function EmptyState({ children }) {
  return <div className="empty-state">{children}</div>;
}

export function Badge({ children, tone = 'default' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function PaginationControls({ pagination, onPageChange, onPageSizeChange }) {
  const page = pagination?.page || 1;
  const pageSize = pagination?.pageSize || 20;
  const total = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 0;

  return (
    <div className="pagination-bar">
      <span>{total} registro{total === 1 ? '' : 's'}</span>
      <div className="pagination-actions">
        <button className="small-button" type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>Anterior</button>
        <strong>Página {totalPages ? page : 0} de {totalPages}</strong>
        <button className="small-button" type="button" onClick={() => onPageChange(page + 1)} disabled={!totalPages || page >= totalPages}>Próxima</button>
        <select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
    </div>
  );
}
