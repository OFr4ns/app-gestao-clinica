# Etapa 3 - Modelo SQL inicial do MySQL

Data: 10/07/2026

Base:

- `docs/etapa-1-levantamento-html.md`
- `docs/etapa-2-modelo-multiusuario-seguranca.md`

## Objetivo

Desenhar o modelo inicial do banco MySQL para a nova aplicacao, considerando:

- Node.js + Express;
- `mysql2/promise`;
- MySQL em Docker Compose;
- psicologos independentes;
- ambiente administrativo;
- isolamento por `psychologist_id`;
- criptografia em nivel de aplicacao para dados pessoais e clinicos;
- HMAC para busca exata;
- financeiro em claro para permitir somatorios;
- exclusao logica como padrao.

Esta etapa ainda nao cria os arquivos `.sql`. Ela define o desenho que sera usado nas migrations.

## Convencoes gerais

### Nomes

- Tabelas em plural: `users`, `patients`, `appointments`.
- Colunas em `snake_case`.
- IDs como `CHAR(36)`, preparados para UUID.
- Datas de auditoria com `DATETIME(3)`.
- Valores monetarios com `DECIMAL(10,2)`.
- Campos criptografados como `TEXT`.
- Hashes como `CHAR(64)`, assumindo HMAC-SHA-256 em hexadecimal.

### Campos padrao

Tabelas principais devem ter:

```sql
id CHAR(36) PRIMARY KEY
created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
deleted_at DATETIME(3) NULL
```

Tabelas sensiveis tambem devem ter:

```sql
psychologist_id CHAR(36) NOT NULL
```

### Charset

Usar:

```sql
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci
```

## Tabela users

Representa psicologos e administradores.

```sql
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('PSYCHOLOGIST', 'ADMIN') NOT NULL DEFAULT 'PSYCHOLOGIST',
  status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  last_login_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role_status (role, status)
);
```

Observacoes:

- `email` fica em claro para login.
- Senha nunca fica em claro; apenas `password_hash`.
- Admin existe, mas acesso a dados clinicos deve ser controlado no backend e auditado.

## Tabela patients

Guarda pacientes de um psicologo.

Campos pessoais ficam criptografados. Campos auxiliares de busca usam HMAC.

```sql
CREATE TABLE patients (
  id CHAR(36) PRIMARY KEY,
  psychologist_id CHAR(36) NOT NULL,

  record_number_encrypted TEXT NULL,
  name_encrypted TEXT NOT NULL,
  dob_encrypted TEXT NULL,
  cpf_encrypted TEXT NULL,
  rg_encrypted TEXT NULL,
  phone_encrypted TEXT NULL,
  whatsapp_encrypted TEXT NULL,
  email_encrypted TEXT NULL,
  profession_encrypted TEXT NULL,
  civil_status_encrypted TEXT NULL,
  address_encrypted TEXT NULL,
  city_encrypted TEXT NULL,
  state_encrypted TEXT NULL,
  insurance_encrypted TEXT NULL,
  notes_encrypted TEXT NULL,
  emergency_name_encrypted TEXT NULL,
  emergency_relationship_encrypted TEXT NULL,
  emergency_phone_encrypted TEXT NULL,

  record_number_hash CHAR(64) NULL,
  cpf_hash CHAR(64) NULL,
  rg_hash CHAR(64) NULL,
  phone_hash CHAR(64) NULL,
  whatsapp_hash CHAR(64) NULL,
  email_hash CHAR(64) NULL,

  status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,

  CONSTRAINT fk_patients_psychologist
    FOREIGN KEY (psychologist_id) REFERENCES users(id),

  KEY idx_patients_psychologist_status_deleted (psychologist_id, status, deleted_at),
  KEY idx_patients_record_number_hash (psychologist_id, record_number_hash),
  KEY idx_patients_cpf_hash (psychologist_id, cpf_hash),
  KEY idx_patients_rg_hash (psychologist_id, rg_hash),
  KEY idx_patients_phone_hash (psychologist_id, phone_hash),
  KEY idx_patients_whatsapp_hash (psychologist_id, whatsapp_hash),
  KEY idx_patients_email_hash (psychologist_id, email_hash)
);
```

Observacoes:

- `name_encrypted` e obrigatorio.
- Busca por nome sera feita no backend na primeira versao: lista pacientes do psicologo, descriptografa e filtra em memoria.
- `status` fica em claro para filtros rapidos.
- `deleted_at` permite exclusao logica.

## Tabela appointments

Guarda agendamentos e sessoes.

```sql
CREATE TABLE appointments (
  id CHAR(36) PRIMARY KEY,
  psychologist_id CHAR(36) NOT NULL,
  patient_id CHAR(36) NOT NULL,

  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status ENUM('SCHEDULED', 'CONFIRMED', 'ATTENDED', 'MISSED', 'RESCHEDULED', 'REMOVED') NOT NULL DEFAULT 'SCHEDULED',
  notes_encrypted TEXT NULL,

  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,

  CONSTRAINT fk_appointments_psychologist
    FOREIGN KEY (psychologist_id) REFERENCES users(id),
  CONSTRAINT fk_appointments_patient
    FOREIGN KEY (patient_id) REFERENCES patients(id),

  KEY idx_appointments_psychologist_date (psychologist_id, appointment_date, appointment_time),
  KEY idx_appointments_psychologist_status (psychologist_id, status),
  KEY idx_appointments_patient (patient_id)
);
```

Mapa de status do HTML:

- `Agendado` -> `SCHEDULED`;
- `Confirmado` -> `CONFIRMED`;
- `Presença` -> `ATTENDED`;
- `Falta` -> `MISSED`;
- `Reagendado` -> `RESCHEDULED`;
- `Removido` -> `REMOVED`.

Observacoes:

- Data, hora e status ficam em claro para agenda, dashboard e relatorios.
- `notes_encrypted` ja fica reservado para observacoes futuras.
- O backend deve validar que `patient_id` pertence ao mesmo `psychologist_id`.

## Tabela financial_records

Guarda lancamentos financeiros.

```sql
CREATE TABLE financial_records (
  id CHAR(36) PRIMARY KEY,
  psychologist_id CHAR(36) NOT NULL,
  patient_id CHAR(36) NOT NULL,
  appointment_id CHAR(36) NULL,

  amount DECIMAL(10,2) NOT NULL,
  method ENUM('CASH', 'PIX', 'CARD', 'INSURANCE') NOT NULL,
  due_date DATE NOT NULL,
  payment_date DATE NULL,
  status ENUM('PENDING', 'PAID', 'OVERDUE') NOT NULL DEFAULT 'PENDING',
  description_encrypted TEXT NULL,
  notes_encrypted TEXT NULL,

  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,

  CONSTRAINT fk_financial_records_psychologist
    FOREIGN KEY (psychologist_id) REFERENCES users(id),
  CONSTRAINT fk_financial_records_patient
    FOREIGN KEY (patient_id) REFERENCES patients(id),
  CONSTRAINT fk_financial_records_appointment
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),

  KEY idx_financial_psychologist_due_date (psychologist_id, due_date),
  KEY idx_financial_psychologist_status (psychologist_id, status),
  KEY idx_financial_patient (patient_id),
  KEY idx_financial_appointment (appointment_id)
);
```

Mapa de formas de pagamento:

- `Dinheiro` -> `CASH`;
- `PIX` -> `PIX`;
- `Cartão` -> `CARD`;
- `Convênio` -> `INSURANCE`.

Mapa de status:

- `Pendente` -> `PENDING`;
- `Pago` -> `PAID`;
- `Atrasado` -> `OVERDUE`.

Observacoes:

- `amount`, `method`, `due_date`, `payment_date` e `status` ficam em claro para somatorios e relatorios.
- Textos livres de descricao ou observacao ficam criptografados.
- Lancamento manual tem `appointment_id = NULL`.

## Tabela clinical_history

Guarda evolucoes e prontuario clinico.

```sql
CREATE TABLE clinical_history (
  id CHAR(36) PRIMARY KEY,
  psychologist_id CHAR(36) NOT NULL,
  patient_id CHAR(36) NOT NULL,

  service_date DATE NOT NULL,
  title_encrypted TEXT NOT NULL,
  notes_encrypted TEXT NOT NULL,

  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,

  CONSTRAINT fk_clinical_history_psychologist
    FOREIGN KEY (psychologist_id) REFERENCES users(id),
  CONSTRAINT fk_clinical_history_patient
    FOREIGN KEY (patient_id) REFERENCES patients(id),

  KEY idx_clinical_history_patient_date (patient_id, service_date),
  KEY idx_clinical_history_psychologist_date (psychologist_id, service_date)
);
```

Observacoes:

- `title` e `notes` sempre criptografados.
- O backend deve validar que paciente e historico pertencem ao mesmo psicologo.

## Tabela settings

Guarda configuracoes por psicologo.

```sql
CREATE TABLE settings (
  id CHAR(36) PRIMARY KEY,
  psychologist_id CHAR(36) NOT NULL,
  setting_key VARCHAR(120) NOT NULL,
  value_encrypted TEXT NULL,
  value_plain VARCHAR(255) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  CONSTRAINT fk_settings_psychologist
    FOREIGN KEY (psychologist_id) REFERENCES users(id),

  UNIQUE KEY uq_settings_psychologist_key (psychologist_id, setting_key)
);
```

Observacoes:

- Usar `value_plain` apenas para configuracoes nao sensiveis.
- Preferir `value_encrypted` quando houver qualquer dado privado.

## Tabela audit_logs

Guarda eventos importantes.

```sql
CREATE TABLE audit_logs (
  id CHAR(36) PRIMARY KEY,
  psychologist_id CHAR(36) NULL,
  user_id CHAR(36) NOT NULL,
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(80) NULL,
  entity_id CHAR(36) NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(512) NULL,
  metadata_encrypted TEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  CONSTRAINT fk_audit_logs_user
    FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_audit_logs_psychologist
    FOREIGN KEY (psychologist_id) REFERENCES users(id),

  KEY idx_audit_logs_user_created (user_id, created_at),
  KEY idx_audit_logs_psychologist_created (psychologist_id, created_at),
  KEY idx_audit_logs_entity (entity_type, entity_id)
);
```

Eventos iniciais:

- `LOGIN_SUCCESS`;
- `LOGIN_FAILED`;
- `LOGOUT`;
- `PATIENT_CREATED`;
- `PATIENT_UPDATED`;
- `PATIENT_DELETED`;
- `APPOINTMENT_CREATED`;
- `APPOINTMENT_STATUS_CHANGED`;
- `FINANCIAL_CREATED`;
- `FINANCIAL_STATUS_CHANGED`;
- `CLINICAL_HISTORY_CREATED`;
- `IMPORT_STARTED`;
- `IMPORT_COMPLETED`;
- `EXPORT_CREATED`;
- `ADMIN_USER_CREATED`;
- `ADMIN_USER_STATUS_CHANGED`.

Regra:

- nao gravar dados clinicos, CPF, telefone, nome completo ou notas em claro no log.

## Tabela import_batches

Guarda resumo de importacoes do JSON antigo.

```sql
CREATE TABLE import_batches (
  id CHAR(36) PRIMARY KEY,
  psychologist_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  status ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
  source_filename VARCHAR(255) NULL,
  patients_count INT NOT NULL DEFAULT 0,
  appointments_count INT NOT NULL DEFAULT 0,
  financial_records_count INT NOT NULL DEFAULT 0,
  clinical_history_count INT NOT NULL DEFAULT 0,
  error_message_encrypted TEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  completed_at DATETIME(3) NULL,

  CONSTRAINT fk_import_batches_psychologist
    FOREIGN KEY (psychologist_id) REFERENCES users(id),
  CONSTRAINT fk_import_batches_user
    FOREIGN KEY (user_id) REFERENCES users(id),

  KEY idx_import_batches_psychologist_created (psychologist_id, created_at)
);
```

Observacoes:

- Nao armazena o JSON original por padrao.
- Se no futuro for necessario armazenar arquivo original, ele deve ser criptografado.

## Admin e acesso clinico

Foi aprovado que existira ambiente admin.

Decisao para o modelo:

- admin fica na mesma tabela `users`, com `role = 'ADMIN'`;
- admin nao possui automaticamente pacientes proprios;
- acesso administrativo a dados clinicos, se existir, deve passar por rotas especificas, justificativa e auditoria;
- queries comuns do produto continuam usando `psychologist_id` do psicologo dono.

Recomendacao de seguranca:

- primeira versao do admin deve focar em gestao de usuarios e saude do sistema;
- qualquer visualizacao de prontuario por admin deve ser explicitamente projetada e auditada.

## Indices importantes

### Autenticacao

- `users.email` unico.

### Pacientes

- `(psychologist_id, status, deleted_at)`;
- `(psychologist_id, record_number_hash)`;
- `(psychologist_id, cpf_hash)`;
- `(psychologist_id, phone_hash)`;
- `(psychologist_id, email_hash)`.

### Agenda

- `(psychologist_id, appointment_date, appointment_time)`;
- `(psychologist_id, status)`;
- `patient_id`.

### Financeiro

- `(psychologist_id, due_date)`;
- `(psychologist_id, status)`;
- `patient_id`;
- `appointment_id`.

### Historico clinico

- `(patient_id, service_date)`;
- `(psychologist_id, service_date)`.

### Auditoria

- `(user_id, created_at)`;
- `(psychologist_id, created_at)`;
- `(entity_type, entity_id)`.

## Estrategia de migrations SQL

Estrutura sugerida:

```txt
database/
  migrations/
    001_create_users.sql
    002_create_patients.sql
    003_create_appointments.sql
    004_create_financial_records.sql
    005_create_clinical_history.sql
    006_create_settings.sql
    007_create_audit_logs.sql
    008_create_import_batches.sql
  seeds/
    001_admin_user.sql
```

Ordem importante:

1. `users`;
2. tabelas que dependem de `users`;
3. tabelas que dependem de `patients`;
4. tabelas que dependem de `appointments`;
5. logs e importacoes.

## Regras para SQL nos repositories

Toda query sensivel deve incluir `psychologist_id`.

Exemplos:

```sql
SELECT *
FROM patients
WHERE psychologist_id = ?
  AND deleted_at IS NULL;
```

```sql
SELECT *
FROM appointments
WHERE id = ?
  AND psychologist_id = ?
  AND deleted_at IS NULL;
```

```sql
UPDATE financial_records
SET status = ?, payment_date = ?
WHERE id = ?
  AND psychologist_id = ?
  AND deleted_at IS NULL;
```

Para criar agendamento:

```sql
SELECT id
FROM patients
WHERE id = ?
  AND psychologist_id = ?
  AND status = 'ACTIVE'
  AND deleted_at IS NULL;
```

## Decisoes desta etapa

- Modelo SQL inicial usara UUID em `CHAR(36)`.
- Cada psicologo sera um usuario independente em `users`.
- Admin tambem sera usuario em `users`, diferenciado por `role`.
- Todas as tabelas sensiveis terao `psychologist_id`.
- Pacientes terao dados pessoais criptografados.
- Historico clinico tera titulo e notas criptografados.
- Financeiro tera valores e datas em claro para relatorios.
- Busca exata sera feita com HMAC em colunas hash.
- Busca por nome sera feita em memoria no backend na primeira versao.
- Exclusao logica sera feita por `deleted_at`.

## Pontos para Etapa 4

A Etapa 4 deve criar a arquitetura base do projeto:

- estrutura de pastas;
- Docker Compose;
- backend Express;
- frontend React/Vite;
- MySQL;
- variaveis de ambiente;
- scripts iniciais de banco;
- convencao para rodar migrations SQL.

Antes de iniciar codigo, uma decisao pratica:

- criar primeiro apenas o esqueleto Docker/backend/frontend;
- ou ja criar tambem os arquivos SQL de migrations com base neste modelo.
