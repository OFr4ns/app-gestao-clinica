# Etapa 4 - Arquitetura base

Data: 10/07/2026

## Objetivo

Criar o esqueleto inicial da aplicacao dedicada em `C:\Projetos\app-gestao-clinica`.

## Estrutura criada

```txt
app-gestao-clinica/
  backend/
  frontend/
  database/
  docs/
  docker-compose.yml
  .env.example
  .gitignore
  README.md
```

## Backend

Stack inicial:

- Node.js;
- Express;
- `mysql2/promise`;
- Helmet;
- CORS;
- Cookie parser;
- Morgan;
- dotenv.

Arquivos principais:

- `backend/src/app.js`;
- `backend/src/server.js`;
- `backend/src/config/env.js`;
- `backend/src/db/pool.js`;
- `backend/src/routes/healthRoutes.js`;
- `backend/src/middlewares/errorHandler.js`.

Endpoint inicial:

```txt
GET /api/health
```

## Frontend

Stack inicial:

- React;
- Vite;
- lucide-react.

Arquivos principais:

- `frontend/index.html`;
- `frontend/vite.config.js`;
- `frontend/src/main.jsx`;
- `frontend/src/styles.css`.

## Banco

Banco planejado:

- MySQL 8.4;
- volume Docker persistente;
- scripts iniciais em `database/init`;
- migrations futuras em `database/migrations`;
- seeds futuras em `database/seeds`.

## Docker Compose

Servicos criados:

- `mysql`;
- `backend`;
- `frontend`.

Comandos planejados:

```bash
docker compose up --build
```

## Observacoes

Esta etapa nao implementa ainda:

- autenticacao;
- migrations SQL reais;
- criptografia;
- CRUDs;
- telas finais;
- importacao de backup.

Esses itens entram nas proximas etapas.

## Proxima etapa sugerida

Etapa 5: criar migrations SQL reais e o mecanismo inicial para preparar o banco.

Alternativa: antes das migrations, implementar a camada de seguranca base no backend. Minha recomendacao e criar primeiro as migrations, porque o restante depende do banco.
