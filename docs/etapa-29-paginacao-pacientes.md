# Etapa 29 - Paginacao em pacientes

## Objetivo

Implementar o primeiro corte de paginacao no sistema, validando o contrato padrao no backend e a experiencia visual na tela de pacientes antes de replicar para agenda, financeiro, historico e administracao.

## Contrato definido

Parametros aceitos:

```text
page=1
pageSize=20
```

Limites:

- `page`: minimo logico `1`.
- `pageSize`: minimo `10`.
- `pageSize`: padrao `20`.
- `pageSize`: maximo `100`.

Resposta padrao:

```json
{
  "items": [],
  "patients": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

`patients` foi mantido por compatibilidade com o frontend existente. `items` e o contrato que deve ser replicado nas proximas telas.

## Backend

Foi criado o utilitario:

```text
backend/src/utils/pagination.js
```

Ele centraliza:

- leitura de `page` e `pageSize`;
- aplicacao de limites;
- calculo de `offset`;
- montagem do objeto `pagination`;
- recorte de itens em memoria.

## Pacientes

A rota abaixo passou a retornar pacientes paginados:

```http
GET /api/patients?page=1&pageSize=20&search=texto
```

Regras:

- Continua exigindo usuario autenticado.
- Continua isolando por `psychologistId`.
- Busca por nome, prontuario, CPF, telefone, WhatsApp e e-mail continua respeitando dados descriptografados no service.
- Busca e paginacao funcionam juntas.

## Frontend

Foi criado o componente reutilizavel:

```text
PaginationControls
```

Na tela `Pacientes`, ele permite:

- voltar pagina;
- avancar pagina;
- ver pagina atual e total de paginas;
- selecionar `10`, `20`, `50` ou `100` itens por pagina.

Ao alterar a busca ou o tamanho da pagina, a tela volta para a pagina `1`.

## Observacao tecnica

Como dados sensiveis de pacientes ficam criptografados no banco, a busca textual ainda ocorre apos descriptografia no backend. Isso preserva a seguranca e o comportamento atual. Em uma versao futura com volume muito alto, pode ser criado um indice de busca controlado por hashes/campos normalizados conforme a necessidade.

## Validacoes executadas

```powershell
node --check backend/src/utils/pagination.js
node --check backend/src/services/patientService.js
node --check backend/src/routes/patientRoutes.js
node --check backend/test/integration.test.js
npm run build
npm run test:integration
```

Resultado:

- Build do frontend concluido com sucesso.
- Testes de integracao do backend: 6 passaram, 0 falharam.
