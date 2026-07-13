# App Gestao Clinica

Aplicacao dedicada baseada no HTML original de gestao clinica.

Stack planejada:

- Frontend: React + Vite
- Backend: Node.js + Express
- Banco: MySQL
- Driver: `mysql2/promise`
- Containers: Docker Compose

## Desenvolvimento

1. Copie `.env.example` para `.env`.
2. Ajuste as chaves e senhas locais.
3. Suba os containers:

```bash
docker compose up --build
```

URLs padrao:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Health check: `http://localhost:3000/api/health`

## Criar admin local

Com os containers rodando:

```powershell
docker compose exec -T `
  -e ADMIN_NAME="Admin Local" `
  -e ADMIN_EMAIL="admin.local@gestao.dev" `
  -e ADMIN_PASSWORD="AdminTeste123" `
  backend npm run admin:create
```

## Gerenciar usuarios

Novos acessos devem ser criados pelo usuario administrador na tela `Administracao`.

O cadastro publico pela tela de login fica desabilitado.

No painel administrativo, o admin pode criar usuarios, editar dados, redefinir senha, ativar/desativar acesso e excluir usuarios com dupla confirmacao.

## Importar dados do HTML legado

Os dados do HTML antigo ficam no `localStorage` do navegador, nao dentro do arquivo `.html`.

Para gerar o backup:

1. Abra o HTML antigo no navegador onde os dados foram salvos.
2. Pressione `F12` e abra o `Console`.
3. Cole e execute o script em `tools/exportar-backup-html-legado.js`.
4. Importe o arquivo `backup-gestao-clinica-legado.json` pela tela `Importacao`.

## Exportar dados de paciente

Na tela `Pacientes`, use o botao de exportacao na linha do paciente para gerar um arquivo JSON com dados cadastrais, agendamentos, financeiro e historico clinico daquele paciente.

A exportacao respeita o psicologo logado e registra auditoria.

## Paginacao

As principais listagens usam paginacao com `page` e `pageSize`.

- Pacientes: `docs/etapa-29-paginacao-pacientes.md`.
- Agenda, Financeiro, Historico, Usuarios e Auditoria: `docs/etapa-30-paginacao-demais-telas.md`.

## Testes de integracao do backend

Com os containers rodando:

```powershell
cd C:\Projetos\app-gestao-clinica\backend
npm run test:integration
```

## Migrations

Para aplicar migrations pendentes:

```powershell
docker compose exec -T backend npm run db:migrate
```

Se o banco ja foi criado pelo `database/init` antes do runner existir, registre a linha de base uma unica vez:

```powershell
docker compose exec -T backend npm run db:migrate:baseline
```

## Docker de producao

1. Copie `.env.production.example` para `.env.production`.
2. Ajuste senhas, chaves e `FRONTEND_ORIGIN`.
3. Suba:

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml up --build -d
```

4. Aplique migrations pendentes:

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T backend npm run db:migrate
```

O frontend de producao e servido por Nginx e acessa a API via `/api`.

## Backup rapido

Desenvolvimento:

```powershell
docker compose exec -T mysql mysqldump -u root -p gestao_clinica > backup-gestao-clinica.sql
```

Producao:

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T mysql mysqldump -u root -p gestao_clinica > backup-gestao-clinica-prod.sql
```

Os arquivos de backup contem dados sensiveis e devem ser protegidos.

## Checklist final

Antes de usar dados reais:

- Troque todos os segredos dos arquivos `.env`.
- Guarde `APP_ENCRYPTION_KEY` fora do repositorio.
- Crie um administrador.
- Rode migrations.
- Rode testes de integracao.
- Valide backup e restore.
- Defina politica de retencao de prontuarios.

## Documentacao

Os documentos de planejamento ficam em `docs/`. O fechamento operacional esta em `docs/etapa-28-revisao-final-operacao.md`.

Para validar manualmente o sistema, use `docs/guia-testes-validacao-funcional.md`.
