# Etapa 8 - Modulo de agenda

Data: 10/07/2026

## Objetivo

Implementar o modulo backend de agenda com isolamento por psicologo e integracao inicial com financeiro.

## Arquivos criados

```txt
backend/src/mappers/appointmentMapper.js
backend/src/mappers/financialMapper.js
backend/src/repositories/appointmentRepository.js
backend/src/repositories/financialRepository.js
backend/src/services/appointmentService.js
backend/src/routes/appointmentRoutes.js
```

## Endpoints

Todos exigem autenticacao.

```txt
GET    /api/appointments
POST   /api/appointments
GET    /api/appointments/:id
PATCH  /api/appointments/:id/status
POST   /api/appointments/:id/presence
DELETE /api/appointments/:id
```

## Filtro opcional por data

```txt
GET /api/appointments
GET /api/appointments?date=2026-07-10
```

Sem `date`, retorna todos os agendamentos do psicologo logado.

## Criacao de agendamento

Payload esperado:

```json
{
  "patientId": "...",
  "date": "2026-07-10",
  "time": "14:00",
  "status": "SCHEDULED",
  "generateFinancial": true,
  "amount": 150,
  "method": "PIX"
}
```

Regras:

- paciente precisa pertencer ao psicologo logado;
- paciente precisa estar ativo;
- financeiro e gerado automaticamente por padrao;
- se status inicial for `ATTENDED`, financeiro nasce como `PAID`.

## Status

Status aceitos:

- `SCHEDULED`;
- `CONFIRMED`;
- `ATTENDED`;
- `MISSED`;
- `RESCHEDULED`;
- `REMOVED`.

Tambem sao aceitos equivalentes em portugues:

- `Agendado`;
- `Confirmado`;
- `Presença`;
- `Falta`;
- `Reagendado`;
- `Removido`.

## Presenca

`POST /api/appointments/:id/presence`:

- altera o status para `ATTENDED`;
- marca o financeiro vinculado ao agendamento como `PAID`;
- define `payment_date` como a data do atendimento.

## Remocao

`DELETE /api/appointments/:id` nao apaga fisicamente.

Ele altera o status para:

```txt
REMOVED
```

## Observacoes

- O modulo financeiro completo ainda nao foi implementado.
- A camada financeira criada nesta etapa existe para suportar a regra de agenda.
- Auditoria ainda nao foi adicionada.
- Frontend ainda nao consome os endpoints.

## Proxima etapa sugerida

Etapa 9: implementar o modulo financeiro completo:

- listagem;
- criacao manual;
- edicao;
- exclusao logica;
- marcar pago/pendente;
- totais;
- filtros por status.
