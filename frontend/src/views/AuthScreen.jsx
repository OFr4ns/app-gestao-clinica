import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { api } from '../api.js';
import { Field } from '../components.jsx';

export function AuthScreen({ onAuthenticated }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, password: form.password })
      });
      onAuthenticated(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="brand-mark"><ShieldCheck size={24} /><span>Gestao Clinica</span></div>
        <h1>Acessar sistema</h1>
        <p className="muted">Ambiente dedicado para gestao de pacientes, agenda e financeiro.</p>
        <form className="form-stack" onSubmit={submit}>
          <Field label="E-mail"><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></Field>
          <Field label="Senha"><input type="password" minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></Field>
          {error && <div className="form-error">{error}</div>}
          <button className="primary-button" type="submit" disabled={loading}>{loading ? 'Processando...' : 'Entrar'}</button>
        </form>
      </section>
    </main>
  );
}
