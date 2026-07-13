# Etapa 14 - Frontend inicial

Data: 10/07/2026

## Objetivo

Substituir a tela placeholder do React por uma primeira interface operacional consumindo a API ja implementada.

## Entregas

- Tela de login e cadastro usando `POST /api/auth/login` e `POST /api/auth/register`.
- Validacao da sessao ativa com `GET /api/auth/me`.
- Logout com `POST /api/auth/logout`.
- Layout principal com navegacao lateral.
- Dashboard consumindo `GET /api/dashboard`.
- Tela de pacientes com listagem, busca local e cadastro.
- Tela de agenda com listagem geral por padrao e filtro de data opcional.
- Tela financeira com listagem, cadastro e alternancia pago/pendente.

## Observacoes

- O frontend usa cookie HTTP-only da API com `credentials: 'include'`.
- A agenda nao envia filtro de data na carga inicial; todos os agendamentos retornados pela API sao exibidos.
- Esta etapa ainda nao cobre edicao/exclusao visual completa nem historico clinico no frontend.
- `npm install` foi executado e gerou `package-lock.json`.
- `npm run build` foi executado com sucesso.
- O Vite foi iniciado e validado em `http://127.0.0.1:5173`.

## Proxima etapa sugerida

Etapa 15: completar as telas de edicao/exclusao, historico clinico e importacao do HTML legado.
