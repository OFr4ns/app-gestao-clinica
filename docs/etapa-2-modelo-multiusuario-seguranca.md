# Etapa 2 - Modelo multiusuario, isolamento e dados sensiveis

Data: 09/07/2026

Base: `docs/etapa-1-levantamento-html.md`

## Objetivo

Definir como a nova aplicacao vai suportar varios psicologos sem vazamento de dados entre usuarios, e como os dados de pacientes serao protegidos no banco MySQL.

Esta etapa ainda nao cria codigo. Ela define as decisoes que devem orientar a Etapa 3, onde o modelo SQL sera desenhado.

## Principio central

Cada psicologo e um usuario do sistema.

Todo dado de paciente, agenda, financeiro, historico clinico, relatorio e configuracao operacional pertence a um psicologo especifico.

O backend nunca deve confiar em um `psychologist_id` enviado pelo frontend. O `psychologist_id` sempre deve vir da sessao/token autenticado.

## Modelo de propriedade dos dados

### Tabela users

Representa o psicologo ou usuario administrativo.

Campos conceituais:

- `id`;
- `name`;
- `email`;
- `password_hash`;
- `role`;
- `status`;
- `created_at`;
- `updated_at`;
- `last_login_at`.

Papeis iniciais:

- `PSYCHOLOGIST`: usuario comum, acessa apenas os proprios dados;
- `ADMIN`: usuario tecnico/administrativo, nao deve acessar prontuarios por padrao;
- `OWNER`: opcional futuro, caso exista uma clinica com varios psicologos.

Recomendacao inicial: comecar com `PSYCHOLOGIST` e reservar `ADMIN` apenas para gestao de usuarios, sem acesso direto a dados clinicos.

### Tabelas escopadas por psicologo

Estas tabelas devem ter `psychologist_id` obrigatorio:

- `patients`;
- `appointments`;
- `financial_records`;
- `clinical_history`;
- `settings`;
- `audit_logs`, quando o evento pertencer a dados de um psicologo.

Regra obrigatoria em toda query:

```sql
WHERE psychologist_id = ?
```

Exemplos:

```sql
SELECT *
FROM patients
WHERE id = ? AND psychologist_id = ?;
```

```sql
UPDATE appointments
SET status = ?
WHERE id = ? AND psychologist_id = ?;
```

```sql
SELECT *
FROM clinical_history
WHERE patient_id = ? AND psychologist_id = ?
ORDER BY service_date DESC;
```

## Padrao de autorizacao

### Rotas autenticadas

Todas as rotas da aplicacao, exceto login, recuperacao de senha e health check publico, devem exigir autenticacao.

O middleware de autenticacao deve anexar ao request:

```js
req.auth = {
  userId,
  role,
  psychologistId
}
```

Na primeira versao, `userId` e `psychologistId` podem ser o mesmo valor para usuarios psicologos.

### Rotas por ID

Qualquer rota que recebe um ID precisa validar ownership no banco.

Exemplo:

```txt
GET /api/patients/:id
```

Nao basta buscar por `id`. Deve buscar por `id` e `psychologist_id`.

Se nao encontrar:

- retornar `404 Not Found`;
- nao informar se o registro existe para outro psicologo.

Isso evita vazamento por tentativa de troca de IDs.

## Estrategia de criptografia

### Criptografia em nivel de aplicacao

Os dados sensiveis serao criptografados no backend antes de ir para o MySQL.

Fluxo:

```txt
frontend -> backend -> criptografa -> MySQL
MySQL -> backend -> descriptografa -> frontend autorizado
```

O banco nao deve armazenar prontuarios e dados pessoais em texto puro.

### Algoritmo recomendado

Usar `AES-256-GCM`.

Motivos:

- criptografia autenticada;
- detecta alteracao indevida do texto cifrado;
- suportado pelo modulo nativo `crypto` do Node.js;
- adequado para campos sensiveis salvos em banco.

Formato conceitual do valor criptografado:

```txt
v1:iv:authTag:ciphertext
```

Ou, de forma estruturada no banco:

- campo criptografado em `TEXT`;
- valor contendo versao, IV, tag e conteudo cifrado.

Recomendacao inicial: usar formato unico em string para simplificar migrations.

### Chave de criptografia

A chave deve ficar fora do codigo, em variavel de ambiente:

```txt
APP_ENCRYPTION_KEY
```

Requisitos:

- 32 bytes reais, preferencialmente em base64;
- nunca commitar em Git;
- nunca salvar dentro do banco;
- documentar como gerar uma chave local de desenvolvimento.

### Rotacao futura de chave

O prefixo `v1` permite trocar estrategia no futuro.

Na primeira versao, nao precisamos implementar rotacao completa, mas o formato ja deve permitir:

- saber qual versao criptografou o campo;
- recriptografar registros em uma rotina futura.

## Estrategia de hash para busca

Dados criptografados nao podem ser pesquisados diretamente com `LIKE` ou igualdade normal.

Para campos de busca exata, salvar um hash auxiliar com HMAC.

Usar uma chave separada:

```txt
APP_HASH_KEY
```

Campos com hash recomendado:

- CPF;
- RG;
- CNS, se entrar no cadastro;
- numero de prontuario;
- telefone;
- WhatsApp;
- e-mail.

Exemplo conceitual:

```txt
cpf_encrypted = encrypt("123.456.789-00")
cpf_hash = hmac(normalizeCpf("123.456.789-00"))
```

Busca:

```sql
SELECT *
FROM patients
WHERE psychologist_id = ?
  AND cpf_hash = ?;
```

### Busca por nome

Busca textual por nome e mais delicada.

Opcoes:

1. Descriptografar a lista do psicologo no backend e filtrar em memoria.
2. Salvar um indice auxiliar normalizado com menor sensibilidade.
3. Criar tokens de busca com HMAC por palavra.

Recomendacao inicial: para menor esforco e mais seguranca, usar a opcao 1 na primeira versao.

Impacto: funciona bem para bases pequenas e medias. Se houver muitos pacientes por psicologo, evoluimos depois para tokens de busca.

## Classificacao de campos por entidade

### patients

Campos em claro:

- `id`;
- `psychologist_id`;
- `status`;
- `created_at`;
- `updated_at`;
- `deleted_at`;

Campos criptografados:

- `record_number`;
- `name`;
- `dob`;
- `cpf`;
- `rg`;
- `phone`;
- `whatsapp`;
- `email`;
- `profession`;
- `civil_status`;
- `address`;
- `city`;
- `state`;
- `insurance`;
- `notes`;
- `emergency_name`;
- `emergency_relationship`;
- `emergency_phone`.

Campos hash para busca exata:

- `record_number_hash`;
- `cpf_hash`;
- `rg_hash`;
- `phone_hash`;
- `whatsapp_hash`;
- `email_hash`.

Observacao: `status` fica em claro porque e necessario para filtro e nao identifica diretamente o paciente sem os outros campos.

### appointments

Campos em claro:

- `id`;
- `psychologist_id`;
- `patient_id`;
- `appointment_date`;
- `appointment_time`;
- `status`;
- `created_at`;
- `updated_at`;
- `deleted_at`.

Campos criptografados futuros/opcionais:

- `notes`, caso a agenda passe a ter observacoes.

Justificativa: data, horario e status sao necessarios para filtros e dashboard. O vazamento desses campos ainda e sensivel, mas sem dados pessoais diretos e com acesso ao banco ja protegido. O dado do paciente fica protegido em `patients`.

### financial_records

Campos em claro:

- `id`;
- `psychologist_id`;
- `patient_id`;
- `appointment_id`;
- `amount`;
- `method`;
- `due_date`;
- `payment_date`;
- `status`;
- `created_at`;
- `updated_at`;
- `deleted_at`.

Campos criptografados opcionais:

- `notes`;
- `description`, se for criado.

Justificativa: valores e datas precisam de agregacoes, somatorios e filtros. Se forem criptografados, relatorios financeiros ficam muito mais dificeis. A protecao principal aqui sera isolamento por psicologo, controle de acesso e backups protegidos.

### clinical_history

Campos em claro:

- `id`;
- `psychologist_id`;
- `patient_id`;
- `service_date`;
- `created_at`;
- `updated_at`;
- `deleted_at`.

Campos criptografados:

- `title`;
- `notes`.

Justificativa: prontuario e evolucao clinica devem ficar criptografados.

### settings

Campos em claro:

- `id`;
- `psychologist_id`;
- `key`;
- `created_at`;
- `updated_at`.

Campos criptografados:

- `value`, quando a configuracao tiver dado sensivel.

### audit_logs

Campos em claro:

- `id`;
- `psychologist_id`;
- `user_id`;
- `action`;
- `entity_type`;
- `entity_id`;
- `ip_address`;
- `user_agent`;
- `created_at`.

Campos criptografados:

- `metadata`, se houver detalhes sensiveis.

Regra: logs nao devem gravar conteudo clinico, CPF, telefone, nome completo ou notas em texto puro.

## Exclusao logica

Para reduzir risco de perda acidental e preservar consistencia, usar exclusao logica.

Campos:

```txt
deleted_at
```

Regras:

- paciente excluido recebe `deleted_at`;
- agendamento removido pode manter status `Removido` e tambem receber `deleted_at`, se for exclusao real;
- financeiro excluido recebe `deleted_at`;
- historico clinico excluido, se essa funcao existir, recebe `deleted_at`;
- queries comuns sempre filtram `deleted_at IS NULL`.

## IDs e relacionamentos

Recomendacao: usar UUID ou ULID em vez de IDs numericos sequenciais.

Motivos:

- reduz previsibilidade de IDs em URLs;
- facilita importacao do JSON antigo;
- funciona bem em ambiente distribuido.

Mesmo com UUID, a protecao real continua sendo:

```sql
WHERE id = ? AND psychologist_id = ?
```

Relacionamentos principais:

- `users.id` -> `patients.psychologist_id`;
- `users.id` -> `appointments.psychologist_id`;
- `patients.id` -> `appointments.patient_id`;
- `patients.id` -> `financial_records.patient_id`;
- `appointments.id` -> `financial_records.appointment_id`;
- `patients.id` -> `clinical_history.patient_id`;
- `users.id` -> `clinical_history.psychologist_id`.

## Regras de consistencia entre psicologo e paciente

Quando criar agendamento, financeiro ou historico, o backend deve validar:

```sql
SELECT id
FROM patients
WHERE id = ?
  AND psychologist_id = ?
  AND deleted_at IS NULL;
```

Nao pode criar registro vinculado a paciente de outro psicologo.

Ao buscar financeiro por `appointment_id`, tambem validar `psychologist_id`.

## Modelo de importacao do JSON antigo

Importacao sempre acontece dentro da conta logada.

Fluxo recomendado:

1. Usuario envia JSON.
2. Backend valida estrutura.
3. Backend cria um mapa de IDs antigos para IDs novos.
4. Pacientes sao inseridos primeiro.
5. Agendamentos sao inseridos usando o mapa de pacientes.
6. Financeiro e inserido usando mapa de pacientes e agendamentos.
7. Historico e inserido usando mapa de pacientes.
8. Campos sensiveis sao criptografados antes do insert.
9. Hashes auxiliares sao calculados antes do insert.
10. Auditoria registra a importacao sem gravar dados sensiveis.

Regras:

- nao aceitar `psychologist_id` vindo do arquivo;
- nao sobrescrever dados existentes automaticamente;
- gerar relatorio com quantidades importadas e erros.

## Politica inicial de sessoes

Recomendacao inicial:

- login com e-mail e senha;
- senha com hash `bcrypt` ou `argon2`;
- cookie `httpOnly`, `sameSite=Lax`;
- `secure=true` em producao;
- expiracao da sessao;
- refresh simples ou novo login apos expirar.

JWT em localStorage nao e recomendado para este caso, porque aumenta risco em caso de XSS.

## Regras para repositories

Todo repository deve receber `psychologistId` como parametro obrigatorio em operacoes sensiveis.

Exemplo de assinatura:

```js
findPatientById({ id, psychologistId })
listPatients({ psychologistId, status, search })
updatePatient({ id, psychologistId, data })
```

Regra de implementacao:

- controller pega `psychologistId` de `req.auth`;
- service aplica regras de negocio;
- repository executa SQL com `psychologist_id`;
- nenhum repository sensivel deve ter metodo que busca apenas por `id`.

## Decisoes tomadas nesta etapa

- Usar multiusuario por `users`.
- Tratar cada psicologo como dono isolado dos proprios dados.
- Usar `psychologist_id` em todas as tabelas sensiveis.
- Usar criptografia em nivel de aplicacao para dados pessoais e clinicos.
- Usar AES-256-GCM como estrategia inicial.
- Usar HMAC para busca exata de identificadores.
- Manter busca textual por nome inicialmente no backend apos descriptografia.
- Usar exclusao logica com `deleted_at`.
- Usar cookie `httpOnly` para sessao em vez de token em `localStorage`.
- Nao salvar senha criptografada; salvar senha com hash forte.

## Pontos para aprovar antes da Etapa 3

1. Confirmar se a aplicacao tera apenas psicologos independentes ou se existira uma clinica/organizacao com varios psicologos sob a mesma conta.
2. Confirmar se administradores tecnicos poderao ou nao acessar dados clinicos.
3. Confirmar se busca por nome filtrada em memoria e aceitavel na primeira versao.
4. Confirmar se financeiro ficara em claro para permitir somatorios e relatorios, mantendo isolamento e controle de acesso.
5. Confirmar se exclusao logica sera o comportamento padrao no lugar de exclusao definitiva.

## Respostas aprovadas em 10/07/2026

1. Cada acesso pertencera a um psicologo independente.
2. Existira ambiente para admin.
3. Busca por nome filtrada em memoria foi aprovada para a primeira versao.
4. Dados financeiros ficarao em claro para permitir somatorios e relatorios, com isolamento por psicologo e controle de acesso.
5. Exclusao logica sera o comportamento padrao.

## Proxima etapa sugerida

Etapa 3: desenhar o modelo SQL inicial do MySQL.

Entregas esperadas:

- lista de tabelas;
- campos e tipos MySQL;
- chaves estrangeiras;
- indices;
- campos criptografados;
- campos hash;
- enums/status;
- estrategia de migrations SQL.
