import { useState } from 'react';
import { Edit3, FileDown, Plus, Search, Trash2 } from 'lucide-react';
import { Badge, EmptyState, Field, Modal, PageHeader, PaginationControls } from '../components.jsx';
import { emptyPatient } from '../forms.js';
import { fieldLimits, limitDigits, pick, statusLabel } from '../utils.js';

function calculateAge(dob) {
  if (!dob) {
    return '-';
  }

  const birthDate = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) {
    return '-';
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age >= 0 ? `${age} anos` : '-';
}

function displayContact(patient) {
  return patient.whatsapp || patient.phone || patient.email || '-';
}

function normalizeState(value) {
  return String(value || '').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
}

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
  const [modalOpen, setModalOpen] = useState(false);

  function openCreate() {
    setEditingId('');
    setForm(emptyPatient);
    setModalOpen(true);
  }

  function edit(patient) {
    setEditingId(patient.id);
    setForm(pick(patient, Object.keys(emptyPatient), emptyPatient));
    setModalOpen(true);
  }

  function closeModal() {
    setEditingId('');
    setForm(emptyPatient);
    setModalOpen(false);
  }

  async function submit(event) {
    event.preventDefault();
    if (editingId) {
      await onUpdate(`/patients/${editingId}`, form, 'Paciente atualizado com sucesso.');
      closeModal();
      return;
    }
    await onCreate('/patients', form, 'Paciente cadastrado com sucesso.');
    closeModal();
  }

  return (
    <div className="view-stack">
      <div className="toolbar">
        <PageHeader title="Painel de Pacientes" />
      </div>

      <section className="data-card patient-filter-card">
        <div className="search-box">
          <Search size={17} />
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Pesquise por nome, N. Prontuario, CPF ou tel..."
          />
        </div>
        <button className="primary-button" type="button" onClick={openCreate}>
          <Plus size={17} />
          Novo Paciente
        </button>
      </section>

      <section className="data-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Prontuario / Nome Completo</th>
                <th>Idade</th>
                <th>WhatsApp / Telefone</th>
                <th>Convenio / Particular</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <div className="patient-name-cell">
                      <span className="record-pill">{patient.recordNumber || 'Sem numero'}</span>
                      <strong>{patient.name || 'Sem nome'}</strong>
                    </div>
                  </td>
                  <td>{calculateAge(patient.dob)}</td>
                  <td>{displayContact(patient)}</td>
                  <td>
                    <Badge tone={patient.insurance ? 'default' : 'success'}>
                      {patient.insurance || 'Particular'}
                    </Badge>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="icon-button" type="button" onClick={() => onExport(patient.id)} title="Exportar dados do paciente">
                        <FileDown size={17} />
                      </button>
                      <button className="small-button" type="button" onClick={() => edit(patient)}>
                        <Edit3 size={15} />
                        Editar
                      </button>
                      <button className="small-button danger" type="button" onClick={() => onDelete(`/patients/${patient.id}`, 'paciente')}>
                        <Trash2 size={15} />
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!patients.length && <EmptyState>Nenhum paciente encontrado.</EmptyState>}
        </div>
        <PaginationControls pagination={pagination} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
      </section>

      {modalOpen && (
        <Modal
          title={editingId ? 'Editar Prontuario Cadastral' : 'Cadastrar Novo Paciente'}
          onClose={closeModal}
          footer={(
            <>
              <button className="small-button" type="button" onClick={closeModal}>Cancelar</button>
              <button className="primary-button" type="submit" form="patient-form" disabled={loading}>Salvar Registro</button>
            </>
          )}
        >
          <form id="patient-form" className="form-stack" onSubmit={submit}>
            <div className="form-grid">
              <Field label="Codigo do Prontuario (ID)">
                <input value={form.recordNumber || 'Gerado automaticamente'} readOnly />
              </Field>
              <Field label="Nome Completo *">
                <input
                  maxLength={fieldLimits.name}
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  required
                />
              </Field>
              <Field label="Data de Nascimento *">
                <input type="date" value={form.dob || ''} onChange={(event) => setForm({ ...form, dob: event.target.value })} required />
              </Field>
            </div>

            <div className="form-grid four-columns">
              <Field label="CPF">
                <input
                  inputMode="numeric"
                  maxLength={fieldLimits.cpf}
                  value={form.cpf}
                  onChange={(event) => setForm({ ...form, cpf: limitDigits(event.target.value, fieldLimits.cpf) })}
                  placeholder="419.789.708-32"
                />
              </Field>
              <Field label="RG">
                <input
                  inputMode="numeric"
                  maxLength={fieldLimits.rg}
                  value={form.rg}
                  onChange={(event) => setForm({ ...form, rg: limitDigits(event.target.value, fieldLimits.rg) })}
                  placeholder="12.345.678-9"
                />
              </Field>
              <Field label="Telefone">
                <input
                  inputMode="numeric"
                  maxLength={fieldLimits.phone}
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: limitDigits(event.target.value, fieldLimits.phone) })}
                  placeholder="Ex: 11 99999-9999"
                />
              </Field>
              <Field label="WhatsApp">
                <input
                  inputMode="numeric"
                  maxLength={fieldLimits.phone}
                  value={form.whatsapp}
                  onChange={(event) => setForm({ ...form, whatsapp: limitDigits(event.target.value, fieldLimits.phone) })}
                  placeholder="Ex: 11 99999-9999"
                />
              </Field>
            </div>

            <div className="form-grid">
              <Field label="E-mail">
                <input type="email" maxLength={fieldLimits.email} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </Field>
              <Field label="Profissao">
                <input maxLength={fieldLimits.profession} value={form.profession} onChange={(event) => setForm({ ...form, profession: event.target.value })} />
              </Field>
              <Field label="Estado Civil">
                <select value={form.civilStatus} onChange={(event) => setForm({ ...form, civilStatus: event.target.value })}>
                  <option value="Solteiro(a)">Solteiro(a)</option>
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="Viuvo(a)">Viuvo(a)</option>
                  <option value="Uniao Estavel">Uniao Estavel</option>
                </select>
              </Field>
            </div>

            <div className="form-grid">
              <Field label="Endereco Residencial">
                <input maxLength={fieldLimits.address} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
              </Field>
              <Field label="Cidade">
                <input maxLength={fieldLimits.city} value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
              </Field>
              <Field label="Estado">
                <input maxLength="2" value={form.state} onChange={(event) => setForm({ ...form, state: normalizeState(event.target.value) })} />
              </Field>
            </div>

            <div className="form-grid">
              <Field label="Convenio / Plano de Saude">
                <input
                  maxLength={fieldLimits.insurance}
                  value={form.insurance}
                  onChange={(event) => setForm({ ...form, insurance: event.target.value })}
                  placeholder="Deixe em branco se for Particular"
                />
              </Field>
              <Field label="Status do Paciente">
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                </select>
              </Field>
            </div>

            <Field label="Observacoes Clinicas Iniciais / Queixa Principal">
              <textarea maxLength={fieldLimits.notes} rows="3" value={form.notes || ''} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            </Field>

            <div className="form-subsection">
              <h4>Contato de Seguranca / Emergencia</h4>
              <div className="form-grid">
                <Field label="Nome do Contato">
                  <input
                    maxLength={fieldLimits.emergencyName}
                    value={form.emergencyName}
                    onChange={(event) => setForm({ ...form, emergencyName: event.target.value })}
                    placeholder="Ex: Maria da Silva"
                  />
                </Field>
                <Field label="Grau de Parentesco / Vinculo">
                  <input
                    maxLength={fieldLimits.emergencyRelationship}
                    value={form.emergencyRelationship}
                    onChange={(event) => setForm({ ...form, emergencyRelationship: event.target.value })}
                    placeholder="Ex: Conjuge, Mae, Amigo"
                  />
                </Field>
                <Field label="Telefone do Contato">
                  <input
                    inputMode="numeric"
                    maxLength={fieldLimits.phone}
                    value={form.emergencyPhone}
                    onChange={(event) => setForm({ ...form, emergencyPhone: limitDigits(event.target.value, fieldLimits.phone) })}
                    placeholder="Ex: 11 99999-9999"
                  />
                </Field>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
