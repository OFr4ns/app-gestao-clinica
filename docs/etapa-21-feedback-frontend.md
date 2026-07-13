# Etapa 21 - Feedback de usuario no frontend

Data: 12/07/2026

## Objetivo

Melhorar o retorno visual para operacoes executadas no frontend, reduzindo ambiguidade apos criar, editar, excluir, importar ou alterar status.

## Entregas

- Faixa de aviso global em `App.jsx` para mensagens de sucesso e erro.
- Mensagens especificas para:
  - cadastro de paciente;
  - edicao de paciente;
  - cadastro de agendamento;
  - edicao de agendamento;
  - presenca/status de agendamento;
  - lancamento financeiro;
  - edicao financeira;
  - alternancia pago/pendente;
  - historico clinico;
  - importacao.
- Confirmacoes de exclusao mais claras, indicando o tipo de registro.
- Estilos `.notice`, `.notice-success` e `.notice-error`.
- Avisos com `role="status"` e `aria-live="polite"`.

## Arquivos alterados

```txt
frontend/src/App.jsx
frontend/src/styles.css
frontend/src/views/AppointmentsView.jsx
frontend/src/views/ClinicalHistoryView.jsx
frontend/src/views/FinancialView.jsx
frontend/src/views/PatientsView.jsx
```

## Validacao

```txt
npm run build
```

Resultado:

```txt
✓ built
```

## Proxima etapa sugerida

Etapa 22: importacao real do HTML legado, validando o arquivo original e criando um fluxo de extracao/migracao mais guiado.
