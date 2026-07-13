(() => {
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
})();
