import { useState } from 'react';
import { Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import { Badge, EmptyState, Field, PaginationControls } from '../components.jsx';
import { emptyFinancial } from '../forms.js';
import { fieldLimits, money, pick, statusLabel } from '../utils.js';

export function FinancialView({
  financials,
  patients,
  pagination,
  onPageChange,
  onPageSizeChange,
  onCreate,
  onUpdate,
  onDelete,
  onTogglePaid,
  loading
}) {
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(emptyFinancial);

  function edit(record) {
    setEditingId(record.id);
    setForm({ ...pick(record, Object.keys(emptyFinancial), emptyFinancial), amount: record.amount ?? '' });
  }

  function cancel() {
    setEditingId('');
    setForm(emptyFinancial);
  }

  async function submit(event) {
    event.preventDefault();
    const payload = { ...form, amount: Number(form.amount) };
    if (editingId) {
      await onUpdate(`/financials/${editingId}`, payload, 'Lancamento financeiro atualizado com sucesso.');
      cancel();
      return;
    }
    await onCreate('/financials', payload, 'Lancamento financeiro criado com sucesso.');
    setForm(emptyFinancial);
  }

  return (
    <div className="view-stack">
      <div className="toolbar"><div><h2>Financeiro</h2><p className="muted">Valores ficam em claro para relatorios; descricoes e notas sao criptografadas.</p></div></div>
      <section className="work-grid">
        <form className="section form-stack" onSubmit={submit}>
          <div className="section-title-row"><h3>{editingId ? 'Editar lancamento' : 'Novo lancamento'}</h3>{editingId && <button className="icon-button" type="button" onClick={cancel} title="Cancelar edicao"><X size={17} /></button>}</div>
          <Field label="Paciente"><select value={form.patientId} onChange={(event) => setForm({ ...form, patientId: event.target.value })} required><option value="">Selecione</option>{patients.map((patient) => <option value={patient.id} key={patient.id}>{patient.name}</option>)}</select></Field>
          <div className="two-columns">
            <Field label="Valor"><input type="number" min="0" max="99999999.99" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} required /></Field>
            <Field label="Vencimento"><input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} required /></Field>
          </div>
          <div className="two-columns">
            <Field label="Metodo"><select value={form.method} onChange={(event) => setForm({ ...form, method: event.target.value })}><option value="PIX">Pix</option><option value="CASH">Dinheiro</option><option value="CARD">Cartao</option><option value="INSURANCE">Convenio</option></select></Field>
            <Field label="Status"><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="PENDING">Pendente</option><option value="PAID">Pago</option><option value="OVERDUE">Atrasado</option></select></Field>
          </div>
          <Field label="Descricao"><input maxLength={fieldLimits.financialDescription} value={form.description || ''} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
          <Field label="Observacoes"><textarea maxLength={fieldLimits.financialNotes} value={form.notes || ''} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></Field>
          <button className="primary-button" type="submit" disabled={loading}>{editingId ? <Save size={17} /> : <Plus size={17} />}{editingId ? 'Salvar' : 'Lancar'}</button>
        </form>
        <div className="section">
          <h3>Recebimentos</h3>
          <div className="list">
            {financials.map((record) => (
              <div className="list-row" key={record.id}>
                <div><strong>{money(record.amount)}</strong><span>{record.patient?.name || 'Paciente'} - {record.dueDate}</span></div>
                <div className="row-actions">
                  <Badge tone={record.status === 'PAID' ? 'success' : 'warning'}>{statusLabel(record.status)}</Badge>
                  <button className="small-button" type="button" onClick={() => onTogglePaid(record.id)}>{record.status === 'PAID' ? 'Reabrir' : 'Pagar'}</button>
                  <button className="icon-button" type="button" onClick={() => edit(record)} title="Editar lancamento"><Edit3 size={17} /></button>
                  <button className="icon-button danger" type="button" onClick={() => onDelete(`/financials/${record.id}`, 'lancamento financeiro')} title="Excluir lancamento"><Trash2 size={17} /></button>
                </div>
              </div>
            ))}
            {!financials.length && <EmptyState>Nenhum lancamento encontrado.</EmptyState>}
          </div>
          <PaginationControls pagination={pagination} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
        </div>
      </section>
    </div>
  );
}
