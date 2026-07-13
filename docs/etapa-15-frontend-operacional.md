# Etapa 15 - Frontend operacional

Data: 10/07/2026

## Objetivo

Completar o primeiro ciclo operacional do frontend, indo alem de cadastro simples e incluindo edicao, exclusao logica, historico clinico e importacao.

## Entregas

- Edicao e exclusao logica de pacientes.
- Edicao, presenca, falta e exclusao logica de agendamentos.
- Edicao, exclusao logica e alternancia pago/pendente no financeiro.
- Tela de historico clinico com criar, editar, listar, filtrar por paciente e excluir.
- Tela de importacao para JSON exportado do HTML legado.
- Navegacao lateral ampliada com `Historico` e `Importacao`.

## Ajuste no backend

O backend agora tambem expoe `PUT /api/appointments/:id`, usado pela tela de edicao de agenda.

`DELETE /api/appointments/:id` passou a usar exclusao logica com `deleted_at`, mantendo o status `REMOVED` para auditoria e historico interno.

## Observacoes

- A tela de importacao aceita arquivo `.json` ou colagem manual do conteudo.
- O payload enviado para importacao segue o formato `{ sourceFilename, data }`.
- As vulnerabilidades reportadas pelo `npm audit` ficaram para uma etapa separada, conforme decisao do projeto.

## Proxima etapa sugerida

Etapa 16: validar o fluxo completo com API e MySQL rodando em Docker Compose, corrigindo ajustes de integracao real.
