# Etapa 28 - Revisao final e operacao

## Objetivo

Fechar o plano inicial da aplicacao com documentacao operacional para desenvolvimento, producao, backup, restauracao, testes e cuidados antes de usar dados reais de pacientes.

## Estado do sistema

A aplicacao ja possui:

- Frontend React/Vite com telas operacionais.
- Backend Node.js/Express.
- Banco MySQL via Docker Compose.
- Acesso por psicologo independente.
- Ambiente administrativo.
- Isolamento de dados por `psychologist_id`.
- Criptografia de campos sensiveis no backend.
- Exclusao logica.
- Auditoria.
- Importacao do HTML legado.
- Exportacao LGPD de dados do paciente.
- Testes de integracao do backend.
- Docker Compose para desenvolvimento e producao.

## Comandos principais

Subir ambiente de desenvolvimento:

```powershell
docker compose up --build
```

Aplicar migrations:

```powershell
docker compose exec -T backend npm run db:migrate
```

Criar administrador:

```powershell
docker compose exec -T `
  -e ADMIN_NAME="Admin Local" `
  -e ADMIN_EMAIL="admin.local@gestao.dev" `
  -e ADMIN_PASSWORD="AdminTeste123" `
  backend npm run admin:create
```

Rodar testes de integracao:

```powershell
cd C:\Projetos\app-gestao-clinica\backend
npm run test:integration
```

Gerar build do frontend:

```powershell
cd C:\Projetos\app-gestao-clinica\frontend
npm run build
```

## Producao

Criar `.env.production` a partir de `.env.production.example` e trocar todos os segredos antes de subir.

Subir producao:

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml up --build -d
```

Aplicar migrations em producao:

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T backend npm run db:migrate
```

Ver logs:

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f
```

Parar producao:

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml down
```

## Backup

Backup do banco em desenvolvimento:

```powershell
docker compose exec -T mysql mysqldump -u root -p gestao_clinica > backup-gestao-clinica.sql
```

Backup do banco em producao:

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T mysql mysqldump -u root -p gestao_clinica > backup-gestao-clinica-prod.sql
```

Observacao: o comando pedira a senha root do MySQL. O arquivo gerado contem dados sensiveis e deve ser armazenado com protecao adequada.

## Restore

Restaurar backup em desenvolvimento:

```powershell
docker compose exec -T mysql mysql -u root -p gestao_clinica < backup-gestao-clinica.sql
```

Depois do restore, aplicar migrations pendentes:

```powershell
docker compose exec -T backend npm run db:migrate
```

## Checklist antes de dados reais

- Trocar `SESSION_SECRET`, `APP_ENCRYPTION_KEY` e `APP_HASH_KEY`.
- Guardar a chave `APP_ENCRYPTION_KEY` fora do repositorio.
- Testar login, logout e expiracao de sessao.
- Criar pelo menos um usuario administrador.
- Validar cadastro, edicao e exclusao logica de pacientes.
- Validar agendamentos, financeiro e historico clinico.
- Validar importacao do backup do HTML legado.
- Validar exportacao LGPD de paciente.
- Rodar `npm run test:integration`.
- Confirmar rotina de backup e restore.
- Definir politica formal de retencao de prontuarios.
- Definir quem pode acessar o ambiente administrativo.

## Riscos e proximos cuidados

- Backups precisam de armazenamento seguro, pois podem conter dados pessoais e clinicos.
- A chave de criptografia nao pode ser perdida; sem ela, dados criptografados ficam irrecuperaveis.
- A exclusao logica preserva historico, mas nao substitui uma politica juridica de retencao.
- O ambiente administrativo deve ter acesso restrito e senhas fortes.
- Antes de exposicao publica, e recomendado colocar HTTPS, proxy reverso, monitoramento e rotinas de atualizacao de dependencias.

## Conclusao

O plano inicial foi concluido. A aplicacao esta pronta como base funcional conteinerizada para evoluir para homologacao, testes com dados controlados e preparacao de producao.
