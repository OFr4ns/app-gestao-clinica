import { useState } from 'react';
import { Activity, Edit3, Plus, Power, PowerOff, RefreshCcw, Save, ShieldCheck, Trash2, UserRound, UsersRound, X } from 'lucide-react';
import { Badge, EmptyState, Field, PaginationControls } from '../components.jsx';
import { statusLabel } from '../utils.js';

const emptyUserForm = {
  name: '',
  email: '',
  password: '',
  role: 'PSYCHOLOGIST'
};

export function AdminView({
  summary,
  users,
  logs,
  reload,
  onCreateUser,
  onUpdateUser,
  onUpdateUserStatus,
  onDeleteUser,
  usersPagination,
  auditPagination,
  onUsersPageChange,
  onUsersPageSizeChange,
  onAuditPageChange,
  onAuditPageSizeChange,
  currentUser,
  loading
}) {
  const [form, setForm] = useState(emptyUserForm);
  const [editingId, setEditingId] = useState('');

  function edit(user) {
    setEditingId(user.id);
    setForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'PSYCHOLOGIST'
    });
  }

  function cancel() {
    setEditingId('');
    setForm(emptyUserForm);
  }

  async function submit(event) {
    event.preventDefault();
    const payload = {
      name: form.name,
      email: form.email,
      role: form.role,
      ...(form.password ? { password: form.password } : {})
    };

    if (editingId) {
      await onUpdateUser(editingId, payload);
      cancel();
      return;
    }

    await onCreateUser({ ...payload, password: form.password });
    cancel();
  }

  return (
    <div className="view-stack">
      <div className="toolbar">
        <div><h2>Administracao</h2><p className="muted">Visao tecnica de usuarios e auditoria do sistema.</p></div>
        <button className="icon-button" type="button" onClick={reload} title="Atualizar"><RefreshCcw size={18} /></button>
      </div>
      <section className="metric-grid">
        <div className="metric"><UsersRound size={20} /><span>Usuarios</span><strong>{summary?.users?.totalUsers || 0}</strong></div>
        <div className="metric"><UserRound size={20} /><span>Psicologos</span><strong>{summary?.users?.psychologists || 0}</strong></div>
        <div className="metric"><ShieldCheck size={20} /><span>Admins</span><strong>{summary?.users?.admins || 0}</strong></div>
        <div className="metric"><Activity size={20} /><span>Eventos auditados</span><strong>{summary?.audit?.totalEvents || 0}</strong></div>
      </section>
      <section className="split-layout">
        <form className="section form-stack" onSubmit={submit}>
          <div className="section-title-row">
            <h3>{editingId ? 'Editar usuario' : 'Novo usuario'}</h3>
            {editingId && <button className="icon-button" type="button" onClick={cancel} title="Cancelar edicao"><X size={17} /></button>}
          </div>
          <Field label="Nome"><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></Field>
          <Field label="E-mail"><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></Field>
          <Field label="Perfil">
            <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
              <option value="PSYCHOLOGIST">Psicologo</option>
              <option value="ADMIN">Admin</option>
            </select>
          </Field>
          <Field label={editingId ? 'Nova senha' : 'Senha temporaria'}>
            <input
              type="password"
              minLength={8}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required={!editingId}
              placeholder={editingId ? 'Preencha apenas para alterar' : ''}
            />
          </Field>
          <button className="primary-button" type="submit" disabled={loading}>{editingId ? <Save size={17} /> : <Plus size={17} />}{editingId ? 'Salvar usuario' : 'Criar usuario'}</button>
        </form>
        <div className="section">
          <h3>Gerenciar usuarios</h3>
          <div className="list">
            {users.map((item) => (
              <div className="list-row" key={item.id}>
                <div>
                  <strong>{item.name || item.email}</strong>
                  <span>{item.email}</span>
                  <span>{statusLabel(item.role)} - {statusLabel(item.status)}</span>
                </div>
                <div className="row-actions">
                  <Badge tone={item.status === 'ACTIVE' ? 'success' : 'default'}>{statusLabel(item.status)}</Badge>
                  <button className="icon-button" type="button" onClick={() => edit(item)} title="Editar usuario"><Edit3 size={17} /></button>
                  {item.status === 'ACTIVE' ? (
                    <button className="icon-button danger" type="button" onClick={() => onUpdateUserStatus(item.id, 'INACTIVE')} title="Desativar usuario" disabled={item.id === currentUser?.id}><PowerOff size={17} /></button>
                  ) : (
                    <button className="icon-button" type="button" onClick={() => onUpdateUserStatus(item.id, 'ACTIVE')} title="Ativar usuario"><Power size={17} /></button>
                  )}
                  <button className="icon-button danger" type="button" onClick={() => onDeleteUser(item)} title="Excluir usuario" disabled={item.id === currentUser?.id}><Trash2 size={17} /></button>
                </div>
              </div>
            ))}
            {!users.length && <EmptyState>Nenhum usuario encontrado.</EmptyState>}
          </div>
          <PaginationControls pagination={usersPagination} onPageChange={onUsersPageChange} onPageSizeChange={onUsersPageSizeChange} />
        </div>
      </section>
      <section className="section">
        <h3>Auditoria recente</h3>
        <div className="list">
          {logs.map((item) => (
            <div className="list-row" key={item.id}>
              <div><strong>{item.action}</strong><span>{item.entityType || 'sistema'} - {item.createdAt}</span></div>
              <Badge>{item.userId ? 'usuario' : 'anonimo'}</Badge>
            </div>
          ))}
          {!logs.length && <EmptyState>Nenhum evento encontrado.</EmptyState>}
        </div>
        <PaginationControls pagination={auditPagination} onPageChange={onAuditPageChange} onPageSizeChange={onAuditPageSizeChange} />
      </section>
    </div>
  );
}
