# Etapa 26 - Docker de producao

Data: 12/07/2026

## Objetivo

Separar o ambiente de desenvolvimento do ambiente de producao, evitando usar Vite dev server e `nodemon` em runtime final.

## Entregas

- `backend/Dockerfile.prod`
  - usa `npm ci --omit=dev`;
  - roda `npm start`;
  - define `NODE_ENV=production`.
- `frontend/Dockerfile.prod`
  - build multi-stage;
  - gera `dist` com Vite;
  - serve arquivos estaticos com Nginx.
- `frontend/nginx.conf`
  - serve SPA;
  - faz proxy de `/api/` para `backend:3000`.
- `docker-compose.prod.yml`
  - MySQL;
  - backend em modo producao;
  - frontend via Nginx;
  - volume de migrations em `/database:ro`.
- `.env.production.example`
  - variaveis esperadas para producao.

## Comandos

Build/validacao das imagens:

```powershell
docker build -f backend/Dockerfile.prod -t gestao-clinica-backend-prod-test ./backend
docker build -f frontend/Dockerfile.prod -t gestao-clinica-frontend-prod-test ./frontend
```

Subir producao local:

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml up --build -d
```

Aplicar migrations:

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T backend npm run db:migrate
```

## Validacao executada

- Build da imagem backend de producao: OK.
- Build da imagem frontend de producao: OK.
- `docker compose -f docker-compose.prod.yml config`: OK.

## Observacoes

- O compose de desenvolvimento continua em `docker-compose.yml`.
- O compose de producao deve ser usado com `.env.production`.
- O frontend de producao usa `/api` relativo, entao Nginx encaminha chamadas para o backend interno.
- HTTPS deve ser aplicado por proxy/reverse proxy externo ou por uma camada de infraestrutura.

## Proxima etapa sugerida

Etapa 27: LGPD/prontuario, com exportacao de dados do paciente, politica de retencao e registro de acesso clinico.
