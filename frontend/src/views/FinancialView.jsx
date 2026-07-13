import { useState } from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { Badge, EmptyState, Field, Modal, PageHeader, PaginationControls, StatCard } from '../components.jsx';
import { emptyFinancial } from '../forms.js';
import { money, pick, statusLabel } from '../utils.js';

function patientLabel(patient) {
  if (!patient) {
    return 'Paciente';
  }

  return patient.recordNumber ? `(${patient.recordNumber}) ${patient.name}` : patient.name;
}

export function FinancialView({
  financials,
  patients,
  summary,
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
  const [modalOpen, setModalOpen] = useState(false);

  function openCreate() {
    setEditingId('');
    setForm(emptyFinancial);
    setModalOpen(true);
  }

  function edit(record) {
    setEditingId(record.id);
    setForm({ ...pick(record, Object.keys(emptyFinancial), emptyFinancial), amount: record.amount ?? '' });
    setModalOpen(true);
  }

  function closeModal() {
    setEditingId('');
    setForm(emptyFinancial);
    setModalOpen(false);
  }

  async function submit(event) {
    event.preventDefault();
    const payload = {
      ...form,
      amount: Number(form.amount),
      description: form.description || '',
      notes: form.notes || ''
    };

    if (editingId) {
      await onUpdate(`/financials/${editingId}`, payload, 'Lancamento financeiro atualizado com sucesso.');
      closeModal();
      return;
    }

    await onCreate('/financials', payload, 'Lancamento financeiro criado com sucesso.');
    closeModal();
  }

  return (
    <div className="view-stack">
      <div className="toolbar"><PageHeader title="Fluxo de Caixa e Inadimplencia" /></div>

      <section className="metric-grid financial-metric-grid">
        <StatCard label="Receita Historica Total" value={money(summary?.paidTotal)} />
        <StatCard label="Receita Mes Atual" value={money(summary?.paidCurrentMonth)} />
        <StatCard label="Inadimplencia / Pendente" value={money(summary?.pendingTotal)} tone="danger" />
      </section>

      <section className="data-card">
        <div className="data-card-header">
          <h3>Fluxo de Lancamentos Financeiros</h3>
          <button className="primary-button" type="button" onClick={openCreate}>
            <Plus size={17} />
            Novo Lancamento Manual
          </button>
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vencimento</th>
                <th>Paciente</th>
                <th>Valor</th>
                <th>Forma</th>
                <th>Status</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {financials.map((record) => (
                <tr key={record.id}>
                  <td>{record.dueDate}</td>
                  <td>{patientLabel(record.patient)}</td>
                  <td>{money(record.amount)}</td>
                  <td>{statusLabel(record.method)}</td>
                  <td><Badge tone={record.status === 'PAID' ? 'success' : 'warning'}>{statusLabel(record.status)}</Badge></td>
                  <td>
                    <div className="table-actions">
                      <button className="small-button" type="button" onClick={() => onTogglePaid(record.id)}>
                        {record.status === 'PAID' ? 'Reabrir' : 'Pagar'}
                      </button>
                      <button className="small-button" type="button" onClick={() => edit(record)}>
                        <Edit3 size={15} />
                        Editar
                      </button>
                      <button className="icon-button danger" type="button" onClick={() => onDelete(`/financials/${record.id}`, 'lancamento financeiro')} title="Excluir lancamento">
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!financials.length && <EmptyState>Nenhum registro financeiro computado.</EmptyState>}
        </div>
        <PaginationControls pagination={pagination} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
      </section>

      {modalOpen && (
        <Modal
          title={editingId ? 'Editar Registro Financeiro' : 'Novo Registro Financeiro'}
          width="small"
          onClose={closeModal}
          footer={(
            <>
              <button className="small-button" type="button" onClick={closeModal}>Cancelar</button>
              <button className="primary-button" type="submit" form="financial-form" disabled={loading}>Salvar Transacao</button>
            </>
          )}
        >
          <form id="financial-form" className="form-stack" onSubmit={submit}>
            <Field label="Paciente *">
              <select value={form.patientId} onChange={(event) => setForm({ ...form, patientId: event.target.value })} required>
                <option value="">Selecione</option>
                {patients.map((patient) => <option value={patient.id} key={patient.id}>{patientLabel(patient)}</option>)}
              </select>
            </Field>

            <div className="two-columns">
              <Field label="Valor Cobrado (R$) *">
                <input type="number" min="0" max="99999999.99" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} required />
              </Field>
              <Field label="Forma de Pagamento">
                <select value={form.method} onChange={(event) => setForm({ ...form, method: event.target.value })}>
                  <option value="PIX">Pix</option>
                  <option value="CASH">Dinheiro</option>
                  <option value="TRANSFER">Transferencia</option>
                  <option value="CARD">Cartao</option>
                </select>
              </Field>
            </div>

            <div className="two-columns">
              <Field label="Data de Vencimento *">
                <input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} required />
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                  <option value="PENDING">Pendente</option>
                  <option value="PAID">Pago</option>
                  <option value="OVERDUE">Atrasado</option>
                </select>
              </Field>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
