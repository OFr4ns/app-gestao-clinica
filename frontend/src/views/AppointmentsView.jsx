import { useState } from 'react';
import { CheckCircle2, Edit3, Plus, Trash2, XCircle } from 'lucide-react';
import { Badge, EmptyState, Field, Modal, PageHeader, PaginationControls } from '../components.jsx';
import { emptyAppointment } from '../forms.js';
import { pick, statusLabel } from '../utils.js';

function patientLabel(patient) {
  if (!patient) {
    return 'Paciente';
  }

  return patient.recordNumber ? `(${patient.recordNumber}) ${patient.name}` : patient.name;
}

function buildAppointmentPayload(form, includeFinancial) {
  const payload = {
    patientId: form.patientId,
    date: form.date,
    time: form.time,
    status: form.status,
    notes: form.notes || ''
  };

  if (includeFinancial) {
    payload.generateFinancial = Boolean(form.generateFinancial);
    if (form.generateFinancial) {
      payload.amount = Number(form.amount || 0);
      payload.method = form.method;
    }
  }

  return payload;
}

export function AppointmentsView({
  appointments,
  patients,
  pagination,
  date,
  onDateChange,
  onPageChange,
  onPageSizeChange,
  onCreate,
  onUpdate,
  onDelete,
  onStatus,
  loading
}) {
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(emptyAppointment);
  const [modalOpen, setModalOpen] = useState(false);

  function openCreate() {
    setEditingId('');
    setForm(emptyAppointment);
    setModalOpen(true);
  }

  function edit(appointment) {
    setEditingId(appointment.id);
    setForm({
      ...emptyAppointment,
      ...pick(appointment, ['patientId', 'date', 'time', 'status', 'notes'], emptyAppointment),
      generateFinancial: false
    });
    setModalOpen(true);
  }

  function closeModal() {
    setEditingId('');
    setForm(emptyAppointment);
    setModalOpen(false);
  }

  async function submit(event) {
    event.preventDefault();

    if (editingId) {
      await onUpdate(
        `/appointments/${editingId}`,
        buildAppointmentPayload(form, false),
        'Agendamento atualizado com sucesso.'
      );
      closeModal();
      return;
    }

    await onCreate(
      '/appointments',
      buildAppointmentPayload(form, true),
      form.generateFinancial
        ? 'Agendamento criado e lancamento financeiro gerado com sucesso.'
        : 'Agendamento criado com sucesso.'
    );
    closeModal();
  }

  return (
    <div className="view-stack">
      <div className="toolbar">
        <PageHeader title="Agenda e Controle de Sessoes" />
      </div>

      <section className="data-card patient-filter-card">
        <div className="filter-row">
          <Field label="Filtrar data">
            <input type="date" value={date} onChange={(event) => onDateChange(event.target.value)} />
          </Field>
          {date && <button className="small-button" type="button" onClick={() => onDateChange('')}>Limpar filtro</button>}
        </div>
        <button className="primary-button" type="button" onClick={openCreate}>
          <Plus size={17} />
          Agendar Sessao
        </button>
      </section>

      <section className="data-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Horario</th>
                <th>Data</th>
                <th>Paciente</th>
                <th>Status da Sessao</th>
                <th>Presenca / Registro</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.time}</td>
                  <td>{appointment.date}</td>
                  <td>{patientLabel(appointment.patient)}</td>
                  <td><Badge>{statusLabel(appointment.status)}</Badge></td>
                  <td>
                    <div className="table-actions">
                      <button className="small-button" type="button" onClick={() => onStatus(appointment.id, 'ATTENDED')}>
                        <CheckCircle2 size={15} />
                        Presenca
                      </button>
                      <button className="small-button danger" type="button" onClick={() => onStatus(appointment.id, 'MISSED')}>
                        <XCircle size={15} />
                        Falta
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="small-button" type="button" onClick={() => edit(appointment)}>
                        <Edit3 size={15} />
                        Editar
                      </button>
                      <button className="icon-button danger" type="button" onClick={() => onDelete(`/appointments/${appointment.id}`, 'agendamento')} title="Remover agendamento">
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!appointments.length && <EmptyState>Nenhum compromisso agendado.</EmptyState>}
        </div>
        <PaginationControls pagination={pagination} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
      </section>

      {modalOpen && (
        <Modal
          title={editingId ? 'Editar Sessao Terapeutica' : 'Agendar Sessao Terapeutica'}
          width="small"
          onClose={closeModal}
          footer={(
            <>
              <button className="small-button" type="button" onClick={closeModal}>Cancelar</button>
              <button className="primary-button" type="submit" form="appointment-form" disabled={loading}>
                {editingId ? 'Salvar Agendamento' : 'Confirmar Agendamento'}
              </button>
            </>
          )}
        >
          <form id="appointment-form" className="form-stack" onSubmit={submit}>
            <Field label="Vincular Paciente *">
              <select value={form.patientId} onChange={(event) => setForm({ ...form, patientId: event.target.value })} required>
                <option value="">Selecione</option>
                {patients.map((patient) => <option value={patient.id} key={patient.id}>{patientLabel(patient)}</option>)}
              </select>
            </Field>

            <div className="two-columns">
              <Field label="Data *">
                <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
              </Field>
              <Field label="Horario *">
                <input type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} required />
              </Field>
            </div>

            <Field label="Status da Consulta">
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                <option value="SCHEDULED">Agendado</option>
                <option value="CONFIRMED">Confirmado</option>
                <option value="ATTENDED">Presenca Confirmada</option>
                <option value="MISSED">Falta Justificada/Nao Justificada</option>
                <option value="RESCHEDULED">Reagendado</option>
              </select>
            </Field>

            {!editingId && (
              <div className="inline-financial-card">
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={form.generateFinancial}
                    onChange={(event) => setForm({ ...form, generateFinancial: event.target.checked })}
                  />
                  <span>Gerar lancamento financeiro automaticamente</span>
                </label>

                {form.generateFinancial && (
                  <div className="two-columns">
                    <Field label="Valor da Sessao (R$)">
                      <input
                        type="number"
                        min="0"
                        max="99999999.99"
                        step="0.01"
                        value={form.amount}
                        onChange={(event) => setForm({ ...form, amount: event.target.value })}
                      />
                    </Field>
                    <Field label="Forma de Recebimento">
                      <select value={form.method} onChange={(event) => setForm({ ...form, method: event.target.value })}>
                        <option value="PIX">Pix</option>
                        <option value="CASH">Dinheiro</option>
                        <option value="TRANSFER">Transferencia</option>
                        <option value="CARD">Cartao</option>
                      </select>
                    </Field>
                  </div>
                )}
              </div>
            )}
          </form>
        </Modal>
      )}
    </div>
  );
}
