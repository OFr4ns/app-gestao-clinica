import { useState } from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { EmptyState, Field, Modal, PageHeader, PaginationControls } from '../components.jsx';
import { emptyHistory } from '../forms.js';
import { fieldLimits, pick } from '../utils.js';
import { validateClinicalHistoryForm } from '../validation.js';

function patientLabel(patient) {
  if (!patient) {
    return 'Paciente';
  }

  return patient.recordNumber ? `(${patient.recordNumber}) ${patient.name}` : patient.name;
}

function patientTitle(patient) {
  if (!patient) {
    return 'Prontuário';
  }

  return `Prontuário [${patient.recordNumber || '---'}] - ${patient.name}`;
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
  const [formErrors, setFormErrors] = useState([]);
  const [submitError, setSubmitError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const selectedPatient = patients.find((patient) => patient.id === patientFilter) || null;

  function updateForm(patch) {
    setForm((current) => ({ ...current, ...patch }));
    setFormErrors([]);
    setSubmitError('');
  }

  function openCreate() {
    if (!patientFilter) {
      return;
    }

    setEditingId('');
    setForm({ ...emptyHistory, patientId: patientFilter });
    setFormErrors([]);
    setSubmitError('');
    setModalOpen(true);
  }

  function edit(entry) {
    setEditingId(entry.id);
    setForm(pick(entry, Object.keys(emptyHistory), emptyHistory));
    setFormErrors([]);
    setSubmitError('');
    setModalOpen(true);
  }

  function closeModal() {
    setEditingId('');
    setForm(emptyHistory);
    setFormErrors([]);
    setSubmitError('');
    setModalOpen(false);
  }

  async function submit(event) {
    event.preventDefault();
    const payload = {
      ...form,
      patientId: form.patientId || patientFilter
    };
    const validationErrors = validateClinicalHistoryForm(payload);
    if (validationErrors.length) {
      setFormErrors(validationErrors);
      setSubmitError('Revise os campos antes de gravar no prontuário.');
      return;
    }

    if (editingId) {
      const saved = await onUpdate(`/clinical-history/${editingId}`, payload, 'Registro clínico atualizado com sucesso.');
      if (saved) {
        closeModal();
      } else {
        setSubmitError('Não foi possível atualizar a evolução. Confira os campos e tente novamente.');
      }
      return;
    }

    const saved = await onCreate('/clinical-history', payload, 'Evolução registrada no prontuário com sucesso.');
    if (saved) {
      closeModal();
    } else {
      setSubmitError('Não foi possível gravar a evolução. Confira os campos e tente novamente.');
    }
  }

  return (
    <div className="view-stack">
      <div className="toolbar">
        <PageHeader title="Prontuário Clínico" />
      </div>

      <section className="data-card">
        <Field label="Selecione o Paciente para visualizar o Prontuário:">
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
              Evoluir Prontuário
            </button>
          </div>

          <div className="clinical-timeline">
            {history.map((entry) => (
              <article className="clinical-entry" key={entry.id}>
                <div>
                  <strong>{entry.title || 'Registro clínico'}</strong>
                  <span>{entry.serviceDate}</span>
                  <p>{entry.notes}</p>
                </div>
                <div className="table-actions">
                  <button className="small-button" type="button" onClick={() => edit(entry)}>
                    <Edit3 size={15} />
                    Editar
                  </button>
                  <button className="icon-button danger" type="button" onClick={() => onDelete(`/clinical-history/${entry.id}`, 'registro clínico')} title="Excluir registro">
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
            {!history.length && <EmptyState>Nenhuma evolução clínica registrada para este paciente.</EmptyState>}
          </div>

          <PaginationControls pagination={pagination} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
        </section>
      ) : (
        <section className="data-card">
          <EmptyState>Selecione um paciente para visualizar o prontuário clínico.</EmptyState>
        </section>
      )}

      {modalOpen && (
        <Modal
          title={editingId ? 'Editar Evolução de Prontuário' : 'Nova Evolução de Prontuário'}
          onClose={closeModal}
          footer={(
            <>
              <button className="small-button" type="button" onClick={closeModal}>Cancelar</button>
              <button className="primary-button" type="submit" form="clinical-history-form" disabled={loading}>Gravar no Prontuário</button>
            </>
          )}
        >
          <form id="clinical-history-form" className="form-stack" onSubmit={submit}>
            {submitError && <div className="form-error">{submitError}</div>}
            {formErrors.length > 0 && (
              <div className="form-error-list" role="alert">
                <strong>Corrija os campos abaixo:</strong>
                <ul>
                  {formErrors.map((message) => <li key={message}>{message}</li>)}
                </ul>
              </div>
            )}

            <div className="two-columns">
              <Field label="Data do Atendimento">
                <input type="date" value={form.serviceDate} onChange={(event) => updateForm({ serviceDate: event.target.value })} required />
              </Field>
              <Field label="Título da Sessão / ID">
                <input
                  maxLength={fieldLimits.clinicalTitle}
                  value={form.title || ''}
                  onChange={(event) => updateForm({ title: event.target.value })}
                  placeholder="Ex: Sessão 04 - Análise Comportamental"
                  required
                />
              </Field>
            </div>

            <Field label="Evolução Clínica / Anotações Teóricas (Sigilo Profissional)">
              <textarea
                className="clinical-notes-input"
                maxLength={fieldLimits.clinicalNotes}
                value={form.notes || ''}
                onChange={(event) => updateForm({ notes: event.target.value })}
                placeholder="Escreva detalhadamente a evolução do paciente baseado na abordagem terapêutica adotada..."
                required
              />
            </Field>
          </form>
        </Modal>
      )}
    </div>
  );
}
