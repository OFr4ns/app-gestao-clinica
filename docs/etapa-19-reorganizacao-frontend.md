# Etapa 19 - Reorganizacao do frontend

Data: 12/07/2026

## Objetivo

Reduzir o acoplamento do frontend e preparar a base para evoluir as telas sem manter tudo concentrado em um unico arquivo.

## Entregas

- `src/main.jsx` agora e apenas o ponto de entrada do React.
- `src/App.jsx` concentra a aplicacao e o roteamento interno atual.
- `src/api.js` centraliza a chamada HTTP e a URL base da API.
- `src/forms.js` centraliza os estados iniciais dos formularios.
- `src/utils.js` centraliza utilitarios puros:
  - data atual;
  - formatacao monetaria;
  - labels de status;
  - helper `pick`.
- `src/components.jsx` centraliza componentes comuns:
  - `Field`;
  - `Badge`;
  - `EmptyState`.

## Resultado

Nenhuma regra funcional foi alterada nesta etapa. A mudanca foi estrutural para facilitar manutencao.

## Validacao

```txt
npm run build
```

Resultado:

```txt
✓ built
```

## Proxima etapa sugerida

Etapa 20: separar as views grandes (`PatientsView`, `AppointmentsView`, `FinancialView`, `ClinicalHistoryView`, `AdminView`) em arquivos proprios.
