# Etapa 10 - Historico clinico

Data: 10/07/2026

## Objetivo

Implementar o modulo backend de historico clinico/prontuario, preservando isolamento por psicologo e criptografia dos dados clinicos.

## Arquivos criados

```txt
backend/src/mappers/clinicalHistoryMapper.js
backend/src/repositories/clinicalHistoryRepository.js
backend/src/services/clinicalHistoryService.js
backend/src/routes/clinicalHistoryRoutes.js
```

## Endpoints

Todos exigem autenticacao.

```txt
GET    /api/clinical-history
POST   /api/clinical-history
GET    /api/clinical-history/:id
PUT    /api/clinical-history/:id
DELETE /api/clinical-history/:id
```

## Listagem por paciente

```txt
GET /api/clinical-history?patientId=<id>
```

Sem `patientId`, retorna os registros do psicologo logado.

Com `patientId`, primeiro valida que o paciente pertence ao psicologo logado.

## Criacao de evolucao

Payload esperado:

```json
{
  "patientId": "...",
  "serviceDate": "2026-07-10",
  "title": "Sessao 04",
  "notes": "Evolucao clinica..."
}
```

Tambem aceita `date` como alias de `serviceDate`.

## Criptografia

Campos criptografados:

- `title`;
- `notes`.

O banco armazena:

- `title_encrypted`;
- `notes_encrypted`.

## Isolamento por psicologo

Todas as queries usam:

```sql
WHERE psychologist_id = ?
```

Ao criar ou editar, o backend valida que o paciente pertence ao psicologo logado.

## Exclusao logica

`DELETE /api/clinical-history/:id` preenche `deleted_at`.

Nao ha exclusao fisica nesta etapa.

## Proxima etapa sugerida

Etapa 11: implementar dashboard e relatorios do backend:

- total de pacientes ativos;
- consultas de hoje;
- faturamento recebido;
- pendencias;
- proximos atendimentos;
- presencas/faltas;
- indicadores financeiros.
