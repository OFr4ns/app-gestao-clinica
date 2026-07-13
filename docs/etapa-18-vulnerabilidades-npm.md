# Etapa 18 - Vulnerabilidades npm

Data: 12/07/2026

## Objetivo

Tratar as vulnerabilidades reportadas pelo `npm audit` sem aplicar atualizacoes cegas.

## Diagnostico inicial

### Frontend

`npm audit` reportava:

- `vite` com vulnerabilidades moderada/alta;
- `esbuild` vulneravel por dependencia do Vite.

O fix seguro disponivel exigia salto major do Vite.

### Backend

O backend ainda nao tinha `package-lock.json`, entao foi gerado com:

```powershell
npm install --package-lock-only
```

Depois disso, `npm audit` reportou:

- `uuid < 11.1.1`, vulnerabilidade moderada.

## Atualizacoes aplicadas

### Frontend

```powershell
npm install vite@8.1.4 @vitejs/plugin-react@6.0.3
```

### Backend

```powershell
npm install uuid@14.0.1
```

## Resultado do audit

Frontend:

```txt
found 0 vulnerabilities
```

Backend:

```txt
found 0 vulnerabilities
```

## Validacoes executadas

- `npm run build` no frontend passou com Vite 8.1.4.
- `node --check` em todos os arquivos `.js` do backend passou.
- `docker compose up --build -d` reconstruiu backend e frontend com sucesso.
- Backend respondeu `GET /api/health` com `database: ok`.
- Frontend respondeu `200` em `http://localhost:5173`.
- Login admin e `GET /api/admin/summary` passaram depois do rebuild.

## Observacoes

- A atualizacao do `uuid` manteve o uso atual de `import { v4 as uuid } from 'uuid'`.
- A atualizacao do Vite exigiu atualizar tambem `@vitejs/plugin-react`.
