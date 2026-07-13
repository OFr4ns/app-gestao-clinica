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
        <strong>Pagina {totalPages ? page : 0} de {totalPages}</strong>
        <button className="small-button" type="button" onClick={() => onPageChange(page + 1)} disabled={!totalPages || page >= totalPages}>Proxima</button>
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
