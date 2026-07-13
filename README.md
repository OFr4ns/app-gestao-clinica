# Gestao Clinica

Sistema web para gestao de consultorio psicologico, criado a partir da evolucao de um arquivo HTML local para uma aplicacao dedicada com frontend, backend, banco de dados e containers Docker.

## O Que E Este Sistema

O Gestao Clinica e uma aplicacao para psicologos acompanharem pacientes, agenda, financeiro e historico clinico em um ambiente multiusuario.

Cada psicologo possui seu proprio acesso e visualiza apenas os seus dados. O sistema tambem possui um perfil administrador para gerir usuarios, acompanhar auditoria e controlar quem pode acessar a aplicacao.

## Problema Que Ele Resolve

A versao original em HTML funcionava como uma ferramenta local, mas tinha limitacoes importantes:

- dados ficavam presos ao navegador/localStorage;
- nao havia backend nem banco de dados dedicado;
- nao havia isolamento forte entre usuarios;
- nao havia controle administrativo de acessos;
- nao havia auditoria;
- nao havia estrutura adequada para backup, producao ou crescimento;
- dados sensiveis de pacientes e prontuarios precisavam de mais protecao.

Este projeto transforma essa ideia inicial em uma aplicacao mais robusta, com persistencia em MySQL, API backend, frontend separado, Docker Compose, controle de sessoes, criptografia de campos sensiveis e separacao de dados por psicologo.

## Principais Funcoes

### Autenticacao

- Login com e-mail e senha.
- Sessao via cookie HTTP.
- Protecao CSRF em operacoes sensiveis.
- Rate limit em tentativas de login.
- Cadastro publico desabilitado.

### Administracao

- Criar usuarios psicologos ou administradores.
- Editar nome, e-mail, perfil e senha.
- Ativar e desativar usuarios.
- Bloquear login de usuarios inativos.
- Revogar sessoes ao desativar usuario ou trocar senha.
- Excluir usuarios com dupla confirmacao.
- Impedir que o admin exclua ou desative a propria conta.
- Impedir que o ultimo administrador ativo seja removido.
- Visualizar eventos recentes de auditoria.

### Pacientes

- Cadastrar pacientes.
- Editar dados cadastrais.
- Ativar ou inativar pacientes.
- Buscar pacientes por dados descriptografados.
- Validar limites de campos.
- Normalizar telefone, WhatsApp e CPF para salvar apenas numeros.
- Exportar dados de um paciente em JSON.
- Excluir logicamente pacientes.
- Paginacao com seletor de itens por pagina.

### Agenda

- Criar agendamentos.
- Editar data, hora, paciente, status e observacoes.
- Filtrar por data opcionalmente.
- Marcar presenca.
- Marcar falta.
- Remover agendamentos.
- Paginacao.

### Financeiro

- Criar lancamentos financeiros por paciente.
- Controlar valor, vencimento, metodo, status, descricao e observacoes.
- Marcar como pago.
- Reabrir lancamento.
- Editar e excluir lancamentos.
- Manter valores em claro para relatorios.
- Criptografar descricoes e observacoes.
- Paginacao.

### Historico Clinico

- Registrar evolucoes ou anotacoes clinicas.
- Filtrar por paciente.
- Editar registros.
- Excluir logicamente registros.
- Criptografar titulo e anotacoes no banco.
- Auditar acessos ao historico.
- Paginacao.

### Dashboard

- Total de pacientes ativos.
- Agendamentos do dia.
- Recebido no mes.
- Pendencias financeiras.
- Proximos agendamentos.
- Distribuicao de status da agenda.

### Importacao Do HTML Legado

- Gera backup JSON a partir do navegador onde o HTML antigo tinha dados salvos.
- Importa pacientes, agendamentos, financeiro e historico para o novo sistema.
- Vincula dados importados ao psicologo logado.

### LGPD E Privacidade

- Exportacao de dados de paciente.
- Auditoria de exportacao.
- Auditoria de acesso ao historico clinico.
- Exclusao logica para preservar rastreabilidade.
- Base para politica formal de retencao.

## Seguranca E Isolamento

O sistema foi desenhado para evitar vazamento entre psicologos.

- Cada psicologo possui seu proprio `psychologistId`.
- Consultas operacionais filtram dados pelo psicologo autenticado.
- Outro psicologo nao deve conseguir acessar pacientes, agenda, financeiro ou historico de terceiros.
- Dados sensiveis de pacientes e prontuarios sao criptografados no backend antes de gravar no banco.
- Campos financeiros numericos ficam em claro para permitir somatorios e relatorios.
- Sessoes sao armazenadas com token hasheado.
- Operacoes sensiveis usam CSRF.
- Administradores gerenciam acessos, mas a auditoria registra eventos relevantes.
- Entradas possuem limites maximos de caracteres no frontend e no backend.
- Campos como telefone, WhatsApp e CPF sao normalizados para manter apenas digitos validos.

## Stack

- Frontend: React + Vite.
- Backend: Node.js + Express.
- Banco: MySQL.
- Driver MySQL: `mysql2/promise`.
- Containers: Docker Compose.
- Servidor frontend em producao: Nginx.

## Imagens No Docker Hub

O projeto possui imagens publicadas no Docker Hub para executar em containers sem precisar buildar localmente.

Backend:

```text
fransmorato/gestao-clinica-backend:v0.1.0
fransmorato/gestao-clinica-backend:latest
```

Frontend:

```text
fransmorato/gestao-clinica-frontend:v0.1.0
fransmorato/gestao-clinica-frontend:latest
```

Banco de dados:

```text
mysql:8.4
```

O MySQL usa a imagem oficial, portanto nao ha imagem customizada do banco no Docker Hub.

## Estrutura Do Projeto

```text
backend/       API Node.js, rotas, services, repositories, seguranca e testes
frontend/      Aplicacao React/Vite
database/      Schema inicial, migrations e seeds de exemplo
docs/          Planejamento, etapas e guias de validacao
tools/         Scripts auxiliares, incluindo exportacao do HTML legado
```

## Como Rodar Em Desenvolvimento

1. Copie o arquivo de ambiente:

```powershell
copy .env.example .env
```

2. Ajuste senhas e chaves no `.env`.

3. Suba os containers:

```powershell
docker compose up --build
```

URLs padrao:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Health check: `http://localhost:3000/api/health`

## Como Rodar Usando As Imagens Do Docker Hub

Para usar as imagens publicadas, crie um `docker-compose.hub.yml` semelhante a este:

```yaml
services:
  mysql:
    image: mysql:8.4
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: gestao_clinica
      MYSQL_USER: gestao_app
      MYSQL_PASSWORD: troque-esta-senha
      MYSQL_ROOT_PASSWORD: troque-esta-senha-root
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/init:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 10

  backend:
    image: fransmorato/gestao-clinica-backend:v0.1.0
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3000
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: gestao_clinica
      DB_USER: gestao_app
      DB_PASSWORD: troque-esta-senha
      FRONTEND_ORIGIN: http://localhost:8080
      SESSION_SECRET: troque-por-um-segredo-longo
      APP_ENCRYPTION_KEY: troque-por-chave-base64-32-bytes
      APP_HASH_KEY: troque-por-um-segredo-hmac-longo
      SESSION_TTL_HOURS: 8
    volumes:
      - ./database:/database:ro
    depends_on:
      mysql:
        condition: service_healthy

  frontend:
    image: fransmorato/gestao-clinica-frontend:v0.1.0
    restart: unless-stopped
    ports:
      - "8080:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

Depois execute:

```powershell
docker compose -f docker-compose.hub.yml up -d
```

Acesse:

```text
http://localhost:8080
```

Para aplicar migrations:

```powershell
docker compose -f docker-compose.hub.yml exec -T backend npm run db:migrate
```

Para criar o primeiro administrador:

```powershell
docker compose -f docker-compose.hub.yml exec -T `
  -e ADMIN_NAME="Admin Local" `
  -e ADMIN_EMAIL="admin.local@gestao.dev" `
  -e ADMIN_PASSWORD="AdminTeste123" `
  backend npm run admin:create
```

Observacao: se voce usar o compose acima em outra pasta, copie tambem a pasta `database/` do projeto para que o schema inicial e as migrations estejam disponiveis no container.

## Criar Administrador Local

Com os containers rodando:

```powershell
docker compose exec -T `
  -e ADMIN_NAME="Admin Local" `
  -e ADMIN_EMAIL="admin.local@gestao.dev" `
  -e ADMIN_PASSWORD="AdminTeste123" `
  backend npm run admin:create
```

Depois disso, acesse `http://localhost:5173` e entre com o usuario administrador.

## Criar Usuarios

Novos acessos devem ser criados pelo administrador na tela `Administracao`.

O cadastro publico pela tela de login fica desabilitado. Isso evita que pessoas criem usuarios sem autorizacao.

No painel administrativo, o admin pode:

- criar usuario;
- editar usuario;
- redefinir senha;
- ativar ou desativar acesso;
- excluir usuario com dupla confirmacao.

## Importar Dados Do HTML Legado

Os dados do HTML antigo ficam no `localStorage` do navegador, nao dentro do arquivo `.html`.

Para gerar o backup:

1. Abra o HTML antigo no navegador onde os dados foram salvos.
2. Pressione `F12` e abra o `Console`.
3. Cole e execute o script em `tools/exportar-backup-html-legado.js`.
4. O navegador baixara `backup-gestao-clinica-legado.json`.
5. No novo sistema, entre como psicologo.
6. Abra a tela `Importacao`.
7. Selecione ou cole o JSON gerado.
8. Clique em `Importar`.

## Exportar Dados De Paciente

Na tela `Pacientes`, use o botao de exportacao na linha do paciente.

O sistema gera um JSON com:

- dados cadastrais;
- agendamentos;
- lancamentos financeiros;
- historico clinico.

A exportacao respeita o psicologo logado e registra auditoria.

## Paginacao

As principais listagens usam `page` e `pageSize`.

Telas com paginacao:

- Pacientes.
- Agenda.
- Financeiro.
- Historico clinico.
- Usuarios.
- Auditoria.

Documentos relacionados:

- `docs/etapa-29-paginacao-pacientes.md`
- `docs/etapa-30-paginacao-demais-telas.md`

## Migrations

Para aplicar migrations pendentes:

```powershell
docker compose exec -T backend npm run db:migrate
```

Se o banco ja foi criado pelo `database/init` antes do runner existir, registre a linha de base uma unica vez:

```powershell
docker compose exec -T backend npm run db:migrate:baseline
```

## Testes

Com os containers rodando:

```powershell
cd C:\Projetos\app-gestao-clinica\backend
npm run test:integration
```

O que os testes cobrem:

- health check;
- isolamento entre psicologos;
- criptografia de campos sensiveis no banco;
- rejeicao de rotas protegidas sem autenticacao;
- paginacao de pacientes;
- paginacao das principais listagens;
- limites e normalizacao de telefone, WhatsApp e CPF;
- cadastro publico bloqueado;
- criacao e gestao de usuarios pelo admin;
- protecao CSRF.

Para validar o frontend:

```powershell
cd C:\Projetos\app-gestao-clinica\frontend
npm run build
```

## Guia De Validacao Manual

Use o documento abaixo para testar o sistema pela interface:

```text
docs/guia-testes-validacao-funcional.md
```

Ele descreve o que cada tela, fluxo e botao deve fazer.

## Docker De Producao

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

Se preferir usar as imagens ja publicadas no Docker Hub, substitua os blocos `build:` do `docker-compose.prod.yml` por:

```yaml
backend:
  image: fransmorato/gestao-clinica-backend:v0.1.0

frontend:
  image: fransmorato/gestao-clinica-frontend:v0.1.0
```

Em seguida rode:

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml pull
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

## Backup Rapido

Desenvolvimento:

```powershell
docker compose exec -T mysql mysqldump -u root -p gestao_clinica > backup-gestao-clinica.sql
```

Producao:

```powershell
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T mysql mysqldump -u root -p gestao_clinica > backup-gestao-clinica-prod.sql
```

Arquivos de backup contem dados sensiveis e devem ser protegidos.

## Checklist Antes De Usar Dados Reais

- Trocar todos os segredos dos arquivos `.env`.
- Gerar uma `APP_ENCRYPTION_KEY` segura.
- Guardar a chave de criptografia fora do repositorio.
- Criar pelo menos um administrador.
- Criar usuarios psicologos pelo painel admin.
- Rodar migrations.
- Rodar testes de integracao.
- Validar backup e restore.
- Validar importacao do HTML legado, se aplicavel.
- Definir politica formal de retencao de prontuarios.
- Definir quem pode acessar o painel administrativo.
- Usar HTTPS em producao.

## Documentacao

Os documentos de planejamento e evolucao ficam em `docs/`.

Principais documentos:

- `docs/guia-testes-validacao-funcional.md`
- `docs/etapa-28-revisao-final-operacao.md`
- `docs/etapa-29-paginacao-pacientes.md`
- `docs/etapa-30-paginacao-demais-telas.md`
