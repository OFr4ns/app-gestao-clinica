import { useState } from 'react';
import { CheckCircle2, Edit3, Plus, Save, Trash2, X, XCircle } from 'lucide-react';
import { Badge, EmptyState, Field, PaginationControls } from '../components.jsx';
import { emptyAppointment } from '../forms.js';
import { pick, statusLabel } from '../utils.js';

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

  function edit(appointment) {
    setEditingId(appointment.id);
    setForm(pick(appointment, Object.keys(emptyAppointment), emptyAppointment));
  }

  function cancel() {
    setEditingId('');
    setForm(emptyAppointment);
  }

  async function submit(event) {
    event.preventDefault();
    if (editingId) {
      await onUpdate(`/appointments/${editingId}`, form, 'Agendamento atualizado com sucesso.');
      cancel();
      return;
    }
    await onCreate('/appointments', form, 'Agendamento criado com sucesso.');
    setForm({ ...emptyAppointment, patientId: '' });
  }

  return (
    <div className="view-stack">
      <div className="toolbar">
        <div><h2>Agenda</h2><p className="muted">O filtro por data e opcional; sem data, todos os agendamentos aparecem.</p></div>
        <div className="filter-row"><Field label="Filtrar data"><input type="date" value={date} onChange={(event) => onDateChange(event.target.value)} /></Field>{date && <button className="small-button" type="button" onClick={() => onDateChange('')}>Limpar</button>}</div>
      </div>
      <section className="work-grid">
        <form className="section form-stack" onSubmit={submit}>
          <div className="section-title-row"><h3>{editingId ? 'Editar agendamento' : 'Novo agendamento'}</h3>{editingId && <button className="icon-button" type="button" onClick={cancel} title="Cancelar edicao"><X size={17} /></button>}</div>
          <Field label="Paciente"><select value={form.patientId} onChange={(event) => setForm({ ...form, patientId: event.target.value })} required><option value="">Selecione</option>{patients.map((patient) => <option value={patient.id} key={patient.id}>{patient.name}</option>)}</select></Field>
          <div className="two-columns">
            <Field label="Data"><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required /></Field>
            <Field label="Hora"><input type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} required /></Field>
          </div>
          <Field label="Status"><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="SCHEDULED">Agendado</option><option value="CONFIRMED">Confirmado</option><option value="ATTENDED">Presenca</option><option value="MISSED">Falta</option><option value="RESCHEDULED">Reagendado</option></select></Field>
          <Field label="Observacoes"><textarea value={form.notes || ''} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></Field>
          <button className="primary-button" type="submit" disabled={loading}>{editingId ? <Save size={17} /> : <Plus size={17} />}{editingId ? 'Salvar' : 'Agendar'}</button>
        </form>
        <div className="section">
          <h3>Agendamentos</h3>
          <div className="list">
            {appointments.map((appointment) => (
              <div className="list-row" key={appointment.id}>
                <div><strong>{appointment.patient?.name || 'Paciente'}</strong><span>{appointment.date} as {appointment.time}</span></div>
                <div className="row-actions">
                  <Badge>{statusLabel(appointment.status)}</Badge>
                  <button className="icon-button" type="button" onClick={() => onStatus(appointment.id, 'ATTENDED')} title="Marcar presenca"><CheckCircle2 size={17} /></button>
                  <button className="icon-button danger" type="button" onClick={() => onStatus(appointment.id, 'MISSED')} title="Marcar falta"><XCircle size={17} /></button>
                  <button className="icon-button" type="button" onClick={() => edit(appointment)} title="Editar agendamento"><Edit3 size={17} /></button>
                  <button className="icon-button danger" type="button" onClick={() => onDelete(`/appointments/${appointment.id}`, 'agendamento')} title="Remover agendamento"><Trash2 size={17} /></button>
                </div>
              </div>
            ))}
            {!appointments.length && <EmptyState>Nenhum agendamento encontrado.</EmptyState>}
          </div>
          <PaginationControls pagination={pagination} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
        </div>
      </section>
    </div>
  );
}
