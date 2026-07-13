# Etapa 24 - Seguranca de producao

Data: 12/07/2026

## Objetivo

Endurecer a aplicacao para uso com cookies de sessao, reduzindo risco de requisicoes indevidas por CSRF e mantendo configuracoes seguras por ambiente.

## Entregas

- Helper CSRF em `backend/src/security/csrf.js`.
- Middleware `backend/src/middlewares/csrfProtection.js`.
- Endpoint:

```txt
GET /api/auth/csrf
```

- Protecao CSRF para metodos:
  - `POST`;
  - `PUT`;
  - `PATCH`;
  - `DELETE`.
- Excecoes controladas:
  - `POST /api/auth/login`;
  - `POST /api/auth/register`.
- Frontend atualizado para obter token CSRF automaticamente em requisicoes de escrita.
- Teste de integracao cobrindo bloqueio de escrita autenticada sem CSRF.

## Como funciona

1. O frontend chama `GET /api/auth/csrf`.
2. O backend gera um token aleatorio.
3. O token e enviado:
   - em cookie assinado `gc_csrf`;
   - no JSON da resposta.
4. Para metodos de escrita, o frontend envia o header:

```txt
x-csrf-token
```

5. O backend compara o header com o cookie assinado usando comparacao segura.

## Cookies

O cookie de sessao `gc_session` ja estava configurado com:

```txt
httpOnly: true
sameSite: lax
secure: true em producao
signed: true
```

O cookie CSRF usa:

```txt
httpOnly: false
sameSite: lax
secure: true em producao
signed: true
```

## Validacao

```txt
npm run build
npm run test:integration
```

Resultado:

```txt
tests 4
pass 4
fail 0
```

Tambem validado:

```txt
GET /api/auth/csrf -> 200
GET /api/health -> 200 database ok
```

## Proxima etapa sugerida

Etapa 25: migrations reais, com runner para aplicar scripts SQL em ordem e registrar historico de execucao.
