import { useState } from 'react';
import { Edit3, FileDown, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { Badge, EmptyState, Field, PaginationControls } from '../components.jsx';
import { emptyPatient } from '../forms.js';
import { fieldLimits, limitDigits, pick, statusLabel } from '../utils.js';

export function PatientsView({
  patients,
  pagination,
  search,
  onSearch,
  onPageChange,
  onPageSizeChange,
  onCreate,
  onUpdate,
  onDelete,
  onExport,
  loading
}) {
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(emptyPatient);

  function edit(patient) {
    setEditingId(patient.id);
    setForm(pick(patient, Object.keys(emptyPatient), emptyPatient));
  }

  function cancel() {
    setEditingId('');
    setForm(emptyPatient);
  }

  async function submit(event) {
    event.preventDefault();
    if (editingId) {
      await onUpdate(`/patients/${editingId}`, form, 'Paciente atualizado com sucesso.');
      cancel();
      return;
    }
    await onCreate('/patients', form, 'Paciente cadastrado com sucesso.');
    setForm(emptyPatient);
  }

  return (
    <div className="view-stack">
      <div className="toolbar">
        <div><h2>Pacientes</h2><p className="muted">Cadastro isolado por psicologo com dados sensiveis criptografados.</p></div>
        <div className="search-box"><Search size={17} /><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Buscar" /></div>
      </div>
      <section className="work-grid">
        <form className="section form-stack" onSubmit={submit}>
          <div className="section-title-row"><h3>{editingId ? 'Editar paciente' : 'Novo paciente'}</h3>{editingId && <button className="icon-button" type="button" onClick={cancel} title="Cancelar edicao"><X size={17} /></button>}</div>
          <Field label="Nome"><input maxLength={fieldLimits.name} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></Field>
          <div className="two-columns">
            <Field label="Telefone"><input inputMode="numeric" maxLength={fieldLimits.phone} value={form.phone} onChange={(event) => setForm({ ...form, phone: limitDigits(event.target.value, fieldLimits.phone) })} /></Field>
            <Field label="WhatsApp"><input inputMode="numeric" maxLength={fieldLimits.phone} value={form.whatsapp} onChange={(event) => setForm({ ...form, whatsapp: limitDigits(event.target.value, fieldLimits.phone) })} /></Field>
          </div>
          <Field label="E-mail"><input type="email" maxLength={fieldLimits.email} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
          <div className="two-columns">
            <Field label="CPF"><input inputMode="numeric" maxLength={fieldLimits.cpf} value={form.cpf} onChange={(event) => setForm({ ...form, cpf: limitDigits(event.target.value, fieldLimits.cpf) })} /></Field>
            <Field label="Nascimento"><input type="date" value={form.dob || ''} onChange={(event) => setForm({ ...form, dob: event.target.value })} /></Field>
          </div>
          <div className="two-columns">
            <Field label="Profissao"><input maxLength={fieldLimits.profession} value={form.profession} onChange={(event) => setForm({ ...form, profession: event.target.value })} /></Field>
            <Field label="Status"><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="ACTIVE">Ativo</option><option value="INACTIVE">Inativo</option></select></Field>
          </div>
          <Field label="Observacoes"><textarea maxLength={fieldLimits.notes} value={form.notes || ''} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></Field>
          <button className="primary-button" type="submit" disabled={loading}>{editingId ? <Save size={17} /> : <Plus size={17} />}{editingId ? 'Salvar' : 'Adicionar'}</button>
        </form>
        <div className="section">
          <h3>Lista de pacientes</h3>
          <div className="list">
            {patients.map((patient) => (
              <div className="list-row" key={patient.id}>
                <div><strong>{patient.name || 'Sem nome'}</strong><span>{patient.phone || patient.whatsapp || patient.email || 'Sem contato'}</span></div>
                <div className="row-actions">
                  <Badge tone={patient.status === 'ACTIVE' ? 'success' : 'default'}>{statusLabel(patient.status)}</Badge>
                  <button className="icon-button" type="button" onClick={() => onExport(patient.id)} title="Exportar dados do paciente"><FileDown size={17} /></button>
                  <button className="icon-button" type="button" onClick={() => edit(patient)} title="Editar paciente"><Edit3 size={17} /></button>
                  <button className="icon-button danger" type="button" onClick={() => onDelete(`/patients/${patient.id}`, 'paciente')} title="Excluir paciente"><Trash2 size={17} /></button>
                </div>
              </div>
            ))}
            {!patients.length && <EmptyState>Nenhum paciente encontrado.</EmptyState>}
          </div>
          <PaginationControls pagination={pagination} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
        </div>
      </section>
    </div>
  );
}
