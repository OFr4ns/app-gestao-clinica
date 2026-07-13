import { useState } from 'react';
import { Clipboard, Upload } from 'lucide-react';
import { Badge, EmptyState, Field, PageHeader } from '../components.jsx';

const legacyExportScript = `(() => {
  const read = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (err) {
      console.warn('Falha ao ler', key, err);
      return [];
    }
  };

  const backup = {
    patients: read('sensus_patients'),
    appointments: read('sensus_appointments'),
    financials: read('sensus_financials'),
    history: read('sensus_history')
  };

  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'backup-gestao-clinica-legado.json';
  link.click();
  URL.revokeObjectURL(url);
  console.log('Backup gerado:', backup);
})();`;

function parseMaybeJson(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    return JSON.parse(value || '[]');
  }

  return [];
}

function normalizeImportedPayload(parsed) {
  const source = parsed?.data && typeof parsed.data === 'object' ? parsed.data : parsed;

  if (source?.patients || source?.appointments || source?.financials || source?.history) {
    return {
      patients: parseMaybeJson(source.patients),
      appointments: parseMaybeJson(source.appointments),
      financials: parseMaybeJson(source.financials),
      history: parseMaybeJson(source.history)
    };
  }

  if (source?.sensus_patients || source?.sensus_appointments || source?.sensus_financials || source?.sensus_history) {
    return {
      patients: parseMaybeJson(source.sensus_patients),
      appointments: parseMaybeJson(source.sensus_appointments),
      financials: parseMaybeJson(source.sensus_financials),
      history: parseMaybeJson(source.sensus_history)
    };
  }

  throw new Error('Formato de backup nao reconhecido.');
}

function previewCounts(data) {
  return {
    patients: data.patients?.length || 0,
    appointments: data.appointments?.length || 0,
    financials: data.financials?.length || 0,
    history: data.history?.length || 0
  };
}

export function ImportView({ onImport, loading, lastImport }) {
  const [sourceFilename, setSourceFilename] = useState('backup-html.json');
  const [payload, setPayload] = useState('');
  const [localError, setLocalError] = useState('');
  const [preview, setPreview] = useState(null);
  const [copyMessage, setCopyMessage] = useState('');

  function readFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setSourceFilename(file.name);
    setLocalError('');
    setPreview(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      setPayload(text);

      if (file.name.toLowerCase().endsWith('.html')) {
        setLocalError('O arquivo HTML nao contem os dados salvos. Use o script abaixo no sistema antigo para gerar o JSON de backup.');
        return;
      }

      try {
        setPreview(previewCounts(normalizeImportedPayload(JSON.parse(text))));
      } catch {
        setPreview(null);
      }
    };
    reader.onerror = () => setLocalError('Nao foi possivel ler o arquivo.');
    reader.readAsText(file, 'utf-8');
  }

  async function copyScript() {
    setCopyMessage('');
    try {
      await navigator.clipboard.writeText(legacyExportScript);
      setCopyMessage('Script copiado.');
    } catch {
      setCopyMessage('Nao foi possivel copiar automaticamente. Selecione e copie o script manualmente.');
    }
  }

  function updatePayload(value) {
    setPayload(value);
    setLocalError('');
    try {
      setPreview(previewCounts(normalizeImportedPayload(JSON.parse(value))));
    } catch {
      setPreview(null);
    }
  }

  async function submit(event) {
    event.preventDefault();
    setLocalError('');
    try {
      const data = normalizeImportedPayload(JSON.parse(payload));
      await onImport({ sourceFilename, data });
    } catch (err) {
      setLocalError(err.message.includes('JSON') || err instanceof SyntaxError ? 'JSON invalido.' : err.message);
    }
  }

  return (
    <div className="view-stack">
      <div className="toolbar"><PageHeader title="Configuracoes Globais" /></div>
      <section className="split-layout">
        <form className="section form-stack" onSubmit={submit}>
          <h3>Importacao de Dados Legados</h3>
          <Field label="Arquivo"><input type="file" accept="application/json,.json,text/html,.html" onChange={readFile} /></Field>
          <Field label="Nome de origem"><input value={sourceFilename} onChange={(event) => setSourceFilename(event.target.value)} /></Field>
          <Field label="Conteudo JSON"><textarea className="json-input" value={payload} onChange={(event) => updatePayload(event.target.value)} required /></Field>
          {preview && (
            <div className="import-result">
              <Badge tone="success">Backup reconhecido</Badge>
              <span>Pacientes: {preview.patients}</span>
              <span>Agendamentos: {preview.appointments}</span>
              <span>Financeiro: {preview.financials}</span>
              <span>Prontuario: {preview.history}</span>
            </div>
          )}
          {localError && <div className="form-error">{localError}</div>}
          <button className="primary-button" type="submit" disabled={loading}><Upload size={17} />Importar</button>
        </form>
        <div className="section">
          <h3>Gerar backup no HTML antigo</h3>
          <p className="muted">Abra o sistema antigo no navegador onde os dados estao salvos, pressione F12, cole este script no Console e execute. Ele baixa um arquivo JSON para importar aqui.</p>
          <textarea className="json-input" readOnly value={legacyExportScript} />
          <button className="primary-button" type="button" onClick={copyScript}><Clipboard size={17} />Copiar script</button>
          {copyMessage && <div className="empty-state">{copyMessage}</div>}
        </div>
      </section>

      <section className="section">
        <h3>Ultima importacao</h3>
          {lastImport ? (
            <div className="import-result">
              <Badge tone={lastImport.status === 'COMPLETED' ? 'success' : 'warning'}>{lastImport.status}</Badge>
              <strong>{lastImport.sourceFilename}</strong>
              <span>Pacientes: {lastImport.counts?.patients || 0}</span>
              <span>Agendamentos: {lastImport.counts?.appointments || 0}</span>
              <span>Financeiro: {lastImport.counts?.financials || 0}</span>
              <span>Prontuario: {lastImport.counts?.history || 0}</span>
            </div>
          ) : <EmptyState>Nenhuma importacao executada nesta sessao.</EmptyState>}
      </section>
    </div>
  );
}
