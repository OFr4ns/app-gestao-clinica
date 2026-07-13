# Etapa 5 - Migrations SQL

Data: 10/07/2026

## Objetivo

Criar os scripts SQL reais do banco MySQL com base em `docs/etapa-3-modelo-sql-mysql.md`.

## Arquivos criados

```txt
database/
  migrations/
    001_create_users.sql
    002_create_patients.sql
    003_create_appointments.sql
    004_create_financial_records.sql
    005_create_clinical_history.sql
    006_create_settings.sql
    007_create_audit_logs.sql
    008_create_import_batches.sql
    009_create_sessions.sql
    010_make_audit_user_nullable.sql
  init/
    001_schema.sql
  seeds/
    001_admin_user.example.sql
```

## Estrategia adotada

- `database/migrations` guarda as migrations separadas e versionadas.
- `database/init/001_schema.sql` contem o schema consolidado para o container MySQL executar automaticamente na primeira criacao do volume.
- `database/seeds/001_admin_user.example.sql` e apenas exemplo. Nao deve ser executado sem substituir o hash de senha.

## Decisoes tecnicas

- IDs usam `CHAR(36)` para UUID.
- Todas as tabelas sensiveis usam `psychologist_id`.
- Dados pessoais e clinicos ficam em colunas `*_encrypted`.
- Busca exata usa colunas `*_hash`.
- Exclusao logica usa `deleted_at`.
- Relacionamentos sensiveis usam chaves estrangeiras compostas quando isso ajuda a garantir que o registro pertence ao mesmo psicologo.
- Financeiro mantem valores, datas, metodo e status em claro para somatorios e relatorios.
- Sessoes persistidas no banco permitem logout, expiracao e revogacao.
- Auditoria permite `user_id` nulo para eventos antes da identificacao do usuario, como falhas de login.

## Observacoes

O Docker executa scripts em `database/init` apenas quando o volume do MySQL e criado pela primeira vez. Se o volume ja existir, alteracoes nesses arquivos nao serao reaplicadas automaticamente.

Durante desenvolvimento, se for necessario recriar o banco do zero, sera preciso remover o volume do MySQL antes de subir novamente. Essa acao e destrutiva e deve ser feita com cuidado.

## Proxima etapa sugerida

Etapa 6: implementar a seguranca base do backend:

- servico de criptografia AES-256-GCM;
- servico de HMAC para busca;
- estrutura de autenticacao;
- repositories com obrigatoriedade de `psychologist_id`;
- endpoints iniciais de auth.
