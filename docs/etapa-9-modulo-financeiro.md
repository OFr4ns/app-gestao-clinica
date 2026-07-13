# Etapa 9 - Modulo financeiro

Data: 10/07/2026

## Objetivo

Implementar o modulo financeiro completo no backend, mantendo isolamento por psicologo e compatibilidade com a geracao automatica feita pela agenda.

## Arquivos criados/alterados

```txt
backend/src/mappers/financialMapper.js
backend/src/repositories/financialRepository.js
backend/src/services/financialService.js
backend/src/routes/financialRoutes.js
backend/src/routes/index.js
```

## Endpoints

Todos exigem autenticacao.

```txt
GET    /api/financials
GET    /api/financials/summary
POST   /api/financials
GET    /api/financials/:id
PUT    /api/financials/:id
PATCH  /api/financials/:id/status
POST   /api/financials/:id/toggle-paid
DELETE /api/financials/:id
```

## Filtros

```txt
GET /api/financials?status=ALL
GET /api/financials?status=PENDING
GET /api/financials?status=PAID
GET /api/financials?status=OVERDUE
```

Tambem aceita equivalentes em portugues:

- `Pendente`;
- `Pago`;
- `Atrasado`.

## Criacao manual

Payload esperado:

```json
{
  "patientId": "...",
  "amount": 150,
  "method": "PIX",
  "dueDate": "2026-07-10",
  "status": "PENDING",
  "description": "Sessao avulsa",
  "notes": ""
}
```

Regras:

- paciente precisa pertencer ao psicologo logado;
- valor nao pode ser negativo;
- metodo precisa ser valido;
- status precisa ser valido;
- textos livres sao criptografados.

## Resumo financeiro

`GET /api/financials/summary` retorna:

```json
{
  "summary": {
    "paidTotal": 0,
    "pendingTotal": 0,
    "paidCurrentMonth": 0
  }
}
```

## Status

Status aceitos:

- `PENDING`;
- `PAID`;
- `OVERDUE`.

## Metodos de pagamento

Metodos aceitos:

- `CASH`;
- `PIX`;
- `CARD`;
- `INSURANCE`.

Tambem aceita equivalentes em portugues:

- `Dinheiro`;
- `Cartao`;
- `Cartão`;
- `Convenio`;
- `Convênio`.

## Exclusao logica

`DELETE /api/financials/:id` preenche `deleted_at` e nao remove fisicamente a linha.

## Integracao com agenda

A agenda continua usando:

- `insertFinancialRecord`;
- `markFinancialRecordPaidByAppointment`.

Essas funcoes foram preservadas no repository financeiro.

## Proxima etapa sugerida

Etapa 10: implementar historico clinico/prontuario:

- criar evolucao;
- listar por paciente;
- criptografar titulo e notas;
- escopo por psicologo;
- validacao de paciente.
