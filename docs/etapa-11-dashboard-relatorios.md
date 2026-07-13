# Etapa 11 - Dashboard e relatorios

Data: 10/07/2026

## Objetivo

Implementar endpoints backend para dashboard e relatorios, sempre escopados pelo psicologo logado.

## Arquivos criados

```txt
backend/src/repositories/dashboardRepository.js
backend/src/services/dashboardService.js
backend/src/routes/dashboardRoutes.js
```

## Endpoints

Todos exigem autenticacao.

```txt
GET /api/dashboard
GET /api/reports
```

## Dashboard

`GET /api/dashboard` retorna:

- total de pacientes ativos;
- consultas de hoje;
- faturamento pago no mes atual;
- valores pendentes;
- total pago historico;
- proximos atendimentos;
- distribuicao de presenca/falta/agendados.

Formato conceitual:

```json
{
  "dashboard": {
    "stats": {
      "activePatients": 0,
      "appointmentsToday": 0,
      "paidCurrentMonth": 0,
      "pendingTotal": 0,
      "paidTotal": 0
    },
    "upcomingAppointments": [],
    "appointmentDistribution": {
      "attended": 0,
      "missed": 0,
      "scheduled": 0,
      "total": 0,
      "percentages": {
        "attended": 0,
        "missed": 0,
        "scheduled": 0
      }
    }
  }
}
```

## Relatorios

`GET /api/reports` retorna:

- total de atendimentos;
- presencas;
- faltas;
- percentual de presenca;
- percentual de falta;
- total recebido;
- total em aberto;
- percentual pago;
- percentual em aberto.

## Isolamento por psicologo

Todas as queries usam:

```sql
WHERE psychologist_id = ?
```

Pacientes dos proximos atendimentos sao descriptografados apenas depois de validar o escopo pelo `psychologist_id`.

## Observacoes

- Esta etapa nao implementa frontend.
- Os valores financeiros ficam em claro no banco conforme decisao aprovada, permitindo somatorios via SQL.
- Dados pessoais retornados em proximos atendimentos passam pelo mesmo mapper de pacientes.

## Proxima etapa sugerida

Etapa 12: implementar importacao dos dados do HTML antigo:

- receber JSON;
- mapear IDs antigos para novos;
- importar pacientes;
- importar agendamentos;
- importar financeiro;
- importar historico;
- criptografar dados sensiveis;
- registrar resumo em `import_batches`.
