# Etapa 6 - Seguranca base do backend

Data: 10/07/2026

## Objetivo

Implementar a base de seguranca do backend antes dos CRUDs principais.

## Entregas

### Criptografia

Arquivo:

```txt
backend/src/security/cryptoService.js
```

Funcoes:

- `encryptField(value)`;
- `decryptField(payload)`.

Estrategia:

- AES-256-GCM;
- formato `v1:iv:authTag:ciphertext`;
- chave em `APP_ENCRYPTION_KEY`;
- fallback em desenvolvimento para derivar chave por SHA-256 quando a chave ainda nao estiver em base64 de 32 bytes.

### HMAC e normalizacao

Arquivo:

```txt
backend/src/security/hashService.js
```

Funcoes:

- `normalizeText`;
- `normalizeDigits`;
- `hmacSearch`;
- `hmacDigits`;
- `sha256`.

Uso planejado:

- hashes de busca para CPF, telefone, e-mail e prontuario;
- hash de token de sessao.

### Senhas

Arquivo:

```txt
backend/src/security/passwordService.js
```

Estrategia:

- bcryptjs;
- 12 rounds;
- senha nunca fica em texto puro no banco.

### Sessoes

Arquivos:

```txt
database/migrations/009_create_sessions.sql
backend/src/repositories/sessionRepository.js
backend/src/security/sessionCookies.js
```

Estrategia:

- cookie assinado `gc_session`;
- `httpOnly`;
- `sameSite=Lax`;
- `secure=true` em producao;
- token real fica apenas no cookie;
- banco salva apenas `sha256(token)`;
- logout revoga sessao no banco.

### Autenticacao

Arquivos:

```txt
backend/src/routes/authRoutes.js
backend/src/services/authService.js
backend/src/repositories/userRepository.js
backend/src/middlewares/authenticate.js
backend/src/middlewares/loginRateLimit.js
```

Endpoints criados:

```txt
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

Observacao:

- `register` cria apenas usuarios `PSYCHOLOGIST`.
- Admin continua planejado, mas criacao/gestao de admin ficara para etapa propria.

## Variaveis adicionadas

```txt
SESSION_TTL_HOURS=8
```

Variaveis ja planejadas e utilizadas:

```txt
SESSION_SECRET
APP_ENCRYPTION_KEY
APP_HASH_KEY
```

## Limites desta etapa

Ainda nao foram implementados:

- CRUD de pacientes;
- auditoria de eventos;
- endpoints administrativos;
- recuperacao de senha;
- 2FA;
- testes automatizados;
- execucao real do Docker.

## Proxima etapa sugerida

Etapa 7: implementar o modulo de pacientes com:

- repository escopado por `psychologist_id`;
- criptografia dos campos pessoais;
- hashes auxiliares para busca;
- busca por nome em memoria;
- exclusao logica.
