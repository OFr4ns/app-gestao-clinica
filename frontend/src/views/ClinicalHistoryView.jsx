import { useState } from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { EmptyState, Field, Modal, PageHeader, PaginationControls } from '../components.jsx';
import { emptyHistory } from '../forms.js';
import { fieldLimits, pick } from '../utils.js';

function patientLabel(patient) {
  if (!patient) {
    return 'Paciente';
  }

  return patient.recordNumber ? `(${patient.recordNumber}) ${patient.name}` : patient.name;
}

function patientTitle(patient) {
  if (!patient) {
    return 'Prontuario';
  }

  return `Prontuario [${patient.recordNumber || '---'}] - ${patient.name}`;
}

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
  const [modalOpen, setModalOpen] = useState(false);
  const selectedPatient = patients.find((patient) => patient.id === patientFilter) || null;

  function openCreate() {
    if (!patientFilter) {
      return;
    }

    setEditingId('');
    setForm({ ...emptyHistory, patientId: patientFilter });
    setModalOpen(true);
  }

  function edit(entry) {
    setEditingId(entry.id);
    setForm(pick(entry, Object.keys(emptyHistory), emptyHistory));
    setModalOpen(true);
  }

  function closeModal() {
    setEditingId('');
    setForm(emptyHistory);
    setModalOpen(false);
  }

  async function submit(event) {
    event.preventDefault();
    const payload = {
      ...form,
      patientId: form.patientId || patientFilter
    };

    if (editingId) {
      await onUpdate(`/clinical-history/${editingId}`, payload, 'Registro clinico atualizado com sucesso.');
      closeModal();
      return;
    }

    await onCreate('/clinical-history', payload, 'Evolucao registrada no prontuario com sucesso.');
    closeModal();
  }

  return (
    <div className="view-stack">
      <div className="toolbar">
        <PageHeader title="Prontuario Clinico" />
      </div>

      <section className="data-card">
        <Field label="Selecione o Paciente para visualizar o Prontuario:">
          <select value={patientFilter} onChange={(event) => onPatientFilterChange(event.target.value)}>
            <option value="">-- Selecione o Paciente --</option>
            {patients.map((patient) => <option value={patient.id} key={patient.id}>{patientLabel(patient)}</option>)}
          </select>
        </Field>
      </section>

      {selectedPatient ? (
        <section className="data-card clinical-card">
          <div className="data-card-header">
            <h3>{patientTitle(selectedPatient)}</h3>
            <button className="primary-button" type="button" onClick={openCreate}>
              <Plus size={17} />
              Evoluir Prontuario
            </button>
          </div>

          <div className="clinical-timeline">
            {history.map((entry) => (
              <article className="clinical-entry" key={entry.id}>
                <div>
                  <strong>{entry.title || 'Registro clinico'}</strong>
                  <span>{entry.serviceDate}</span>
                  <p>{entry.notes}</p>
                </div>
                <div className="table-actions">
                  <button className="small-button" type="button" onClick={() => edit(entry)}>
                    <Edit3 size={15} />
                    Editar
                  </button>
                  <button className="icon-button danger" type="button" onClick={() => onDelete(`/clinical-history/${entry.id}`, 'registro clinico')} title="Excluir registro">
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
            {!history.length && <EmptyState>Nenhuma evolucao clinica registrada para este paciente.</EmptyState>}
          </div>

          <PaginationControls pagination={pagination} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
        </section>
      ) : (
        <section className="data-card">
          <EmptyState>Selecione um paciente para visualizar o prontuario clinico.</EmptyState>
        </section>
      )}

      {modalOpen && (
        <Modal
          title={editingId ? 'Editar Evolucao de Prontuario' : 'Nova Evolucao de Prontuario'}
          onClose={closeModal}
          footer={(
            <>
              <button className="small-button" type="button" onClick={closeModal}>Cancelar</button>
              <button className="primary-button" type="submit" form="clinical-history-form" disabled={loading}>Gravar no Prontuario</button>
            </>
          )}
        >
          <form id="clinical-history-form" className="form-stack" onSubmit={submit}>
            <div className="two-columns">
              <Field label="Data do Atendimento">
                <input type="date" value={form.serviceDate} onChange={(event) => setForm({ ...form, serviceDate: event.target.value })} required />
              </Field>
              <Field label="Titulo da Sessao / ID">
                <input
                  maxLength={fieldLimits.clinicalTitle}
                  value={form.title || ''}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="Ex: Sessao 04 - Analise Comportamental"
                  required
                />
              </Field>
            </div>

            <Field label="Evolucao Clinica / Anotacoes Teoricas (Sigilo Profissional)">
              <textarea
                className="clinical-notes-input"
                maxLength={fieldLimits.clinicalNotes}
                value={form.notes || ''}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                placeholder="Escreva detalhadamente a evolucao do paciente baseado na abordagem terapeutica adotada..."
                required
              />
            </Field>
          </form>
        </Modal>
      )}
    </div>
  );
}
