# Etapa 7 - Modulo de pacientes

Data: 10/07/2026

## Objetivo

Implementar o primeiro modulo de negocio do backend com as regras de seguranca aprovadas:

- autenticacao obrigatoria;
- acesso apenas por psicologo;
- queries sempre escopadas por `psychologist_id`;
- dados pessoais criptografados;
- hashes auxiliares para busca futura;
- busca por nome em memoria;
- exclusao logica.

## Arquivos criados

```txt
backend/src/mappers/patientMapper.js
backend/src/repositories/patientRepository.js
backend/src/services/patientService.js
backend/src/routes/patientRoutes.js
backend/src/utils/dateUtils.js
```

## Endpoints

Todos exigem cookie de sessao valido.

```txt
GET    /api/patients
POST   /api/patients
GET    /api/patients/:id
PUT    /api/patients/:id
DELETE /api/patients/:id
```

## Filtros da listagem

```txt
GET /api/patients?status=ACTIVE
GET /api/patients?status=INACTIVE
GET /api/patients?status=ALL
GET /api/patients?search=maria
```

Status em portugues tambem sao aceitos no backend:

- `Ativo` -> `ACTIVE`;
- `Inativo` -> `INACTIVE`.

## Protecao por psicologo

As rotas usam:

```js
req.auth.psychologistId
```

O frontend nao envia `psychologist_id`.

Todas as queries relevantes usam:

```sql
WHERE psychologist_id = ?
```

Admins recebem `403` neste modulo, porque nao possuem `psychologistId` proprio.

## Criptografia e hashes

Campos pessoais sao convertidos para colunas `*_encrypted`.

Campos de busca exata recebem hash:

- `record_number_hash`;
- `cpf_hash`;
- `rg_hash`;
- `phone_hash`;
- `whatsapp_hash`;
- `email_hash`.

## Busca por nome

Na primeira versao:

1. o backend lista pacientes do psicologo;
2. descriptografa;
3. filtra por `search` em memoria.

A busca considera:

- nome;
- prontuario;
- CPF;
- telefone;
- WhatsApp;
- e-mail.

## Exclusao logica

`DELETE /api/patients/:id` nao remove a linha fisicamente.

Ele preenche:

```txt
deleted_at
```

As listagens comuns ignoram registros com `deleted_at`.

## Observacoes

- O numero de prontuario e gerado automaticamente quando nao enviado.
- A geracao atual usa a quantidade de pacientes do psicologo. Em etapa futura, pode virar uma sequencia mais robusta.
- Ainda nao ha auditoria de eventos.
- Ainda nao ha frontend consumindo estes endpoints.

## Proxima etapa sugerida

Etapa 8: implementar o modulo de agenda, incluindo:

- pacientes ativos;
- agendamentos por psicologo;
- filtro opcional por data;
- status;
- geracao automatica de financeiro;
- marcar presenca.
