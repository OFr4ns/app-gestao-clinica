# Etapa 16 - Validacao Docker Compose

Data: 12/07/2026

## Objetivo

Validar a aplicacao rodando com MySQL, backend e frontend em containers Docker Compose.

## Validacoes executadas

- Docker Desktop iniciado.
- `docker compose up --build -d` executado com sucesso.
- Containers validados:
  - `gestao-clinica-mysql`;
  - `gestao-clinica-backend`;
  - `gestao-clinica-frontend`.
- MySQL ficou `healthy`.
- Backend respondeu `GET /api/health` com `database: ok`.
- Frontend respondeu `200` em `http://localhost:5173`.
- Fluxo autenticado validado via API:
  - cadastro de psicologo;
  - login;
  - cadastro de paciente;
  - cadastro de agendamento;
  - financeiro automatico;
  - historico clinico;
  - dashboard;
  - relatorios.

## Ajuste aplicado

O dashboard falhou inicialmente com `ER_WRONG_ARGUMENTS` no MySQL 8.4 por causa de `LIMIT ?` em prepared statement.

Foi corrigido em `backend/src/repositories/dashboardRepository.js` usando limite numerico sanitizado entre `1` e `50`.

## Resultado

Depois do restart do backend, `GET /api/dashboard` e `GET /api/reports` passaram no fluxo real em containers.
