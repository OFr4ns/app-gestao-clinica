import { useState } from 'react';
import { CalendarCheck2, ClipboardCheck, LockKeyhole, ShieldCheck } from 'lucide-react';
import { api } from '../api.js';
import { Field } from '../components.jsx';
import { fieldLimits } from '../utils.js';
import { validateLoginForm } from '../validation.js';

export function AuthScreen({ onAuthenticated }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    const validationErrors = validateLoginForm(form);
    if (validationErrors.length) {
      setError(validationErrors.join(' '));
      return;
    }

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
      <section className="auth-shell">
        <div className="auth-panel">
          <div className="brand-mark"><ShieldCheck size={24} /><span>Gestao Clinica</span></div>
          <div className="auth-heading">
            <h1>Bem-vindo de volta</h1>
            <p className="muted">Entre com seu acesso autorizado.</p>
          </div>
          <form className="form-stack" onSubmit={submit}>
            <Field label="E-mail">
              <input
                type="email"
                autoComplete="email"
                maxLength={fieldLimits.email}
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
            </Field>
            <Field label="Senha">
              <input
                type="password"
                autoComplete="current-password"
                maxLength={fieldLimits.password}
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
            </Field>
            {error && <div className="form-error">{error}</div>}
            <button className="primary-button auth-submit" type="submit" disabled={loading}>
              {loading ? 'Processando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <aside className="auth-visual" aria-hidden="true">
          <div className="auth-visual-grid">
            <div className="auth-visual-chip auth-visual-chip-top"><LockKeyhole size={22} /></div>
            <div className="auth-visual-chip auth-visual-chip-left"><CalendarCheck2 size={24} /></div>
            <div className="auth-visual-chip auth-visual-chip-right"><ClipboardCheck size={24} /></div>

            <div className="auth-monitor">
              <div className="auth-monitor-header">
                <span />
                <span />
                <span />
              </div>
              <div className="auth-monitor-body">
                <div className="auth-monitor-line wide" />
                <div className="auth-monitor-line" />
                <div className="auth-monitor-line short" />
                <div className="auth-checkmark"><ShieldCheck size={40} /></div>
              </div>
            </div>
            <div className="auth-monitor-base" />
          </div>
        </aside>
      </section>
    </main>
  );
}
