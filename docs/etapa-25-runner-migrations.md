# Etapa 25 - Runner de migrations

Data: 12/07/2026

## Objetivo

Criar um mecanismo confiavel para aplicar migrations SQL em ordem e registrar o historico de execucao.

## Entregas

- Script `backend/src/scripts/migrate.js`.
- Tabela de controle `schema_migrations`.
- Scripts npm:

```json
"db:migrate": "node src/scripts/migrate.js",
"db:migrate:baseline": "node src/scripts/migrate.js --baseline"
```

- `docker-compose.yml` passou a montar:

```txt
./database:/database:ro
```

- `database/init/001_schema.sql` passou a criar `schema_migrations`.

## Como funciona

O runner:

1. localiza `database/migrations`;
2. cria `schema_migrations`, se necessario;
3. calcula checksum SHA-256 de cada migration;
4. pula migrations ja aplicadas;
5. falha se uma migration aplicada tiver checksum diferente;
6. aplica migrations pendentes dentro de transacao;
7. registra `filename`, `checksum` e `applied_at`.

## Comandos

Aplicar migrations pendentes:

```powershell
docker compose exec -T backend npm run db:migrate
```

Registrar baseline em banco ja criado pelo `database/init`:

```powershell
docker compose exec -T backend npm run db:migrate:baseline
```

## Validacao executada

Baseline no banco atual:

```txt
baseline 001_create_users.sql
...
baseline 010_make_audit_user_nullable.sql
```

Execucao normal depois do baseline:

```txt
skip 001_create_users.sql
...
skip 010_make_audit_user_nullable.sql
```

Testes:

```txt
npm run test:integration
```

Resultado:

```txt
tests 4
pass 4
fail 0
```

## Proxima etapa sugerida

Etapa 26: Docker/producao, com Dockerfiles de producao, frontend buildado e separacao clara entre ambiente de desenvolvimento e producao.
