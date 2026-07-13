# Etapa 13 - Auditoria

Data: 10/07/2026

## Objetivo

Implementar uma camada central para registrar eventos importantes sem gravar dados sensiveis em claro.

## Arquivos criados/alterados

```txt
database/migrations/007_create_audit_logs.sql
database/migrations/010_make_audit_user_nullable.sql
database/init/001_schema.sql
backend/src/repositories/auditRepository.js
backend/src/services/auditService.js
```

## Estrategia

- `audit_logs.user_id` agora permite `NULL`, para registrar eventos antes de identificar o usuario, como falha de login.
- Metadados sao criptografados em `metadata_encrypted`.
- Logs nao devem gravar prontuario, notas clinicas, CPF, telefone ou nomes completos em texto puro.
- A camada exposta para as rotas e `auditEvent` / `auditAuthEvent`.

## Eventos planejados para registro

- `LOGIN_SUCCESS`;
- `LOGIN_FAILED`;
- `LOGOUT`;
- `PATIENT_CREATED`;
- `PATIENT_UPDATED`;
- `PATIENT_DELETED`;
- `APPOINTMENT_CREATED`;
- `APPOINTMENT_UPDATED`;
- `APPOINTMENT_STATUS_CHANGED`;
- `APPOINTMENT_PRESENCE_MARKED`;
- `FINANCIAL_CREATED`;
- `FINANCIAL_UPDATED`;
- `FINANCIAL_STATUS_CHANGED`;
- `FINANCIAL_DELETED`;
- `CLINICAL_HISTORY_CREATED`;
- `CLINICAL_HISTORY_UPDATED`;
- `CLINICAL_HISTORY_DELETED`;
- `IMPORT_COMPLETED`;

## Rotas conectadas

A auditoria foi conectada em:

- autenticacao;
- pacientes;
- agenda;
- financeiro;
- historico clinico;
- importacao.

## Proxima etapa sugerida

Etapa 14: iniciar o frontend real consumindo os endpoints ja implementados.
