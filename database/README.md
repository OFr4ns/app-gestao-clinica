# Database

Este diretorio vai concentrar migrations SQL, seeds e scripts de inicializacao do MySQL.

Estrutura planejada:

```txt
database/
  init/
  migrations/
  seeds/
```

As migrations reais foram criadas na Etapa 5 a partir de `docs/etapa-3-modelo-sql-mysql.md`.

`database/init/001_schema.sql` contem o schema consolidado executado automaticamente pelo MySQL na primeira criacao do volume Docker.
