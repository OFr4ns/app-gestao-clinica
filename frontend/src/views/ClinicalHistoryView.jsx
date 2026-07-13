import { useState } from 'react';
import { Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import { EmptyState, Field, PaginationControls } from '../components.jsx';
import { emptyHistory } from '../forms.js';
import { pick } from '../utils.js';

export function ClinicalHistoryView({
  history,
  patients,
  pagination,
  patientFilter,
  onPatientFilterChange,
  onPageChange,
  onPageSizeChange,
  onCreate,
  onUpdate,
  onDelete,
  loading
}) {
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(emptyHistory);

  function edit(entry) {
    setEditingId(entry.id);
    setForm(pick(entry, Object.keys(emptyHistory), emptyHistory));
  }

  function cancel() {
    setEditingId('');
    setForm(emptyHistory);
  }

  async function submit(event) {
    event.preventDefault();
    if (editingId) {
      await onUpdate(`/clinical-history/${editingId}`, form, 'Registro clinico atualizado com sucesso.');
      cancel();
      return;
    }
    await onCreate('/clinical-history', form, 'Registro clinico criado com sucesso.');
    setForm({ ...emptyHistory, patientId: form.patientId });
  }

  return (
    <div className="view-stack">
      <div className="toolbar">
        <div><h2>Historico clinico</h2><p className="muted">Registros clinicos com titulo e anotacoes criptografados no banco.</p></div>
        <Field label="Paciente"><select value={patientFilter} onChange={(event) => onPatientFilterChange(event.target.value)}><option value="">Todos</option>{patients.map((patient) => <option value={patient.id} key={patient.id}>{patient.name}</option>)}</select></Field>
      </div>
      <section className="work-grid">
        <form className="section form-stack" onSubmit={submit}>
          <div className="section-title-row"><h3>{editingId ? 'Editar registro' : 'Novo registro'}</h3>{editingId && <button className="icon-button" type="button" onClick={cancel} title="Cancelar edicao"><X size={17} /></button>}</div>
          <Field label="Paciente"><select value={form.patientId} onChange={(event) => setForm({ ...form, patientId: event.target.value })} required><option value="">Selecione</option>{patients.map((patient) => <option value={patient.id} key={patient.id}>{patient.name}</option>)}</select></Field>
          <Field label="Data do atendimento"><input type="date" value={form.serviceDate} onChange={(event) => setForm({ ...form, serviceDate: event.target.value })} required /></Field>
          <Field label="Titulo"><input value={form.title || ''} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></Field>
          <Field label="Anotacoes"><textarea value={form.notes || ''} onChange={(event) => setForm({ ...form, notes: event.target.value })} required /></Field>
          <button className="primary-button" type="submit" disabled={loading}>{editingId ? <Save size={17} /> : <Plus size={17} />}{editingId ? 'Salvar' : 'Registrar'}</button>
        </form>
        <div className="section">
          <h3>Registros</h3>
          <div className="list">
            {history.map((entry) => (
              <div className="list-row clinical-row" key={entry.id}>
                <div><strong>{entry.title || 'Registro clinico'}</strong><span>{entry.patient?.name || 'Paciente'} - {entry.serviceDate}</span><p>{entry.notes}</p></div>
                <div className="row-actions">
                  <button className="icon-button" type="button" onClick={() => edit(entry)} title="Editar registro"><Edit3 size={17} /></button>
                  <button className="icon-button danger" type="button" onClick={() => onDelete(`/clinical-history/${entry.id}`, 'registro clinico')} title="Excluir registro"><Trash2 size={17} /></button>
                </div>
              </div>
            ))}
            {!history.length && <EmptyState>Nenhum registro clinico encontrado.</EmptyState>}
          </div>
          <PaginationControls pagination={pagination} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
        </div>
      </section>
    </div>
  );
}
