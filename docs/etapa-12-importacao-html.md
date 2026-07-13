# Etapa 12 - Importacao do HTML antigo

Data: 10/07/2026

## Objetivo

Implementar importacao do backup JSON gerado pelo HTML antigo, salvando os dados no novo banco com isolamento por psicologo e criptografia dos campos sensiveis.

## Arquivos criados/alterados

```txt
backend/src/repositories/importBatchRepository.js
backend/src/mappers/importBatchMapper.js
backend/src/services/importService.js
backend/src/routes/importRoutes.js
backend/src/routes/index.js
backend/src/app.js
```

Tambem foi ajustada a normalizacao de status/metodos em:

```txt
backend/src/mappers/appointmentMapper.js
backend/src/mappers/financialMapper.js
```

## Endpoints

Todos exigem autenticacao.

```txt
POST /api/imports/html-json
GET  /api/imports/:id
```

## Formato aceito

Formato direto do HTML antigo:

```json
{
  "patients": [],
  "appointments": [],
  "financials": [],
  "history": []
}
```

Tambem aceita wrapper:

```json
{
  "sourceFilename": "Sensus_Backup_2026-07-10.json",
  "data": {
    "patients": [],
    "appointments": [],
    "financials": [],
    "history": []
  }
}
```

## Regras de importacao

- O `psychologist_id` vem sempre da sessao autenticada.
- IDs antigos nao sao reutilizados.
- O importador cria novos UUIDs.
- Um mapa interno preserva vinculos entre pacientes, agenda, financeiro e historico.
- Dados pessoais e clinicos sao criptografados pelos mappers existentes.
- Campos de busca recebem hashes HMAC pelos mappers existentes.
- Registros orfaos sao ignorados quando o paciente original nao existe no backup.
- O JSON original nao e armazenado no banco.

## Ordem de importacao

1. Pacientes.
2. Agendamentos.
3. Financeiro.
4. Historico clinico.

## Resumo da importacao

Cada importacao cria um registro em `import_batches`.

Resposta:

```json
{
  "importBatch": {
    "id": "...",
    "status": "COMPLETED",
    "counts": {
      "patients": 0,
      "appointments": 0,
      "financials": 0,
      "history": 0
    }
  }
}
```

## Observacoes

- O limite de JSON no Express foi aumentado para `10mb`.
- Ainda nao ha upload multipart; a primeira versao recebe JSON no corpo da requisicao.
- Falhas sao registradas no batch com mensagem criptografada.
- Auditoria detalhada ainda fica para uma etapa propria.

## Proxima etapa sugerida

Etapa 13: implementar auditoria:

- registrar login;
- registrar criacao/alteracao/exclusao;
- registrar importacao;
- evitar gravar dados sensiveis em logs.
