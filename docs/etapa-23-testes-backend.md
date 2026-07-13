# Etapa 23 - Testes automatizados do backend

Data: 12/07/2026

## Objetivo

Adicionar uma primeira suite de testes automatizados para os pontos de maior risco do backend:

- saude da API e banco;
- autenticacao obrigatoria;
- isolamento entre psicologos;
- criptografia de dados sensiveis em repouso.
- protecao CSRF em rotas autenticadas de escrita.

## Entregas

- Criado `backend/test/integration.test.js`.
- Criado script:

```json
"test:integration": "node --test test/integration.test.js"
```

## Cobertura inicial

### Health check

Valida:

- `GET /api/health`;
- status `ok`;
- banco `ok`.

### Rotas protegidas

Valida que `GET /api/patients` sem sessao retorna:

```txt
401 UNAUTHENTICATED
```

### Isolamento por psicologo

O teste:

1. cria psicologo A;
2. cria psicologo B;
3. cria um paciente com o psicologo A;
4. confirma que A consegue ler o paciente;
5. confirma que B recebe `404` ao tentar ler o paciente de A;
6. confirma que B nao ve o paciente de A na listagem.

### Criptografia em repouso

O teste consulta diretamente o MySQL e valida que:

- `patients.name_encrypted` comeca com `v1:`;
- `patients.notes_encrypted` comeca com `v1:`;
- o nome em claro nao aparece na coluna criptografada;
- a anotacao em claro nao aparece na coluna criptografada.

## Bug encontrado pelos testes

O router admin estava usando:

```js
adminRoutes.use(authenticate);
adminRoutes.use(requireAdmin);
```

Como `adminRoutes` era montado antes dos modulos clinicos, o middleware `requireAdmin` tambem bloqueava rotas seguintes como `/patients` para usuarios psicologos.

## Correcao aplicada

O middleware admin foi restringido para o prefixo `/admin`:

```js
adminRoutes.use('/admin', authenticate);
adminRoutes.use('/admin', requireAdmin);
```

Arquivo alterado:

```txt
backend/src/routes/adminRoutes.js
```

## Validacao

Com os containers rodando:

```powershell
cd C:\Projetos\app-gestao-clinica\backend
npm run test:integration
```

Resultado:

```txt
tests 4
pass 4
fail 0
```

## Proxima etapa sugerida

Etapa 24: seguranca de producao, incluindo CSRF, cookies seguros por ambiente, recuperacao de senha e politica de senha.
