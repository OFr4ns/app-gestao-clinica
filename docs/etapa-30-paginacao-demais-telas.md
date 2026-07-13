# Etapa 30 - Paginacao nas demais telas

## Objetivo

Replicar o contrato de paginacao validado em `Pacientes` para as demais listagens do sistema.

## Telas atualizadas

- Agenda.
- Financeiro.
- Historico clinico.
- Administracao - usuarios.
- Administracao - auditoria.

## Backend

As seguintes rotas agora aceitam `page` e `pageSize`:

```http
GET /api/appointments?page=1&pageSize=20
GET /api/financials?page=1&pageSize=20
GET /api/clinical-history?page=1&pageSize=20
GET /api/admin/users?page=1&pageSize=20
GET /api/admin/audit-logs?page=1&pageSize=20
```

Filtros mantidos:

- Agenda: `date`.
- Financeiro: `status`.
- Historico clinico: `patientId`.
- Administracao usuarios: `role`, `status`.
- Administracao auditoria: `userId`, `psychologistId`, `action`.

## Contrato

As respostas mantem o nome antigo da colecao por compatibilidade e incluem o novo contrato padrao:

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

Exemplos de colecoes mantidas:

- `appointments`.
- `financials`.
- `history`.
- `users`.
- `logs`.

## Frontend

Foi reutilizado o componente `PaginationControls`.

Comportamentos:

- `Anterior` fica desabilitado na primeira pagina.
- `Proxima` fica desabilitado na ultima pagina.
- Alterar quantidade por pagina volta para pagina `1`.
- Alterar filtro de data da agenda volta para pagina `1`.
- Alterar filtro de paciente do historico volta para pagina `1`.
- Usuarios e auditoria possuem paginacoes independentes no painel admin.

## Validacoes executadas

```powershell
node --check backend/src/services/appointmentService.js
node --check backend/src/services/financialService.js
node --check backend/src/services/clinicalHistoryService.js
node --check backend/src/services/adminService.js
node --check backend/src/routes/appointmentRoutes.js
node --check backend/src/routes/financialRoutes.js
node --check backend/src/routes/clinicalHistoryRoutes.js
node --check backend/test/integration.test.js
npm run build
npm run test:integration
```

Resultado:

- Build do frontend concluido com sucesso.
- Testes de integracao do backend: 7 passaram, 0 falharam.
