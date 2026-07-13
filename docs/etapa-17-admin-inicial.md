# Etapa 17 - Ambiente admin inicial

Data: 12/07/2026

## Objetivo

Criar a fundacao do ambiente administrativo separado do fluxo dos psicologos.

## Entregas

- Middleware `requireAdmin`.
- Rotas protegidas por perfil `ADMIN`:
  - `GET /api/admin/summary`;
  - `GET /api/admin/users`;
  - `GET /api/admin/audit-logs`.
- Service admin para mapear usuarios, resumo e logs de auditoria.
- Repositorios ampliados para listar usuarios e eventos auditados.
- Script `npm run admin:create` para criar o primeiro admin via variaveis de ambiente.
- Frontend ajustado para mostrar uma tela administrativa quando o usuario logado tem role `ADMIN`.

## Validacao executada

Admin local criado:

```txt
admin.local@gestao.dev
```

Rotas validadas com login admin:

```txt
role: ADMIN
totalUsers: 4
totalEvents: 16
usersReturned: 4
logsReturned: 5
```

## Proxima etapa sugerida

Etapa 18: tratar vulnerabilidades npm e atualizar dependencias com cuidado.
