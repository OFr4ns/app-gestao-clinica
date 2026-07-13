# Etapa 27 - LGPD e prontuario

## Objetivo

Reforcar controles de privacidade sobre dados de pacientes e prontuarios, mantendo o isolamento por psicologo e criando uma base inicial para atendimento a solicitacoes de acesso/exportacao de dados.

## Entregas

- Endpoint autenticado para exportar os dados de um paciente do psicologo logado.
- Exportacao em JSON contendo paciente, agendamentos, financeiros e historico clinico vinculados.
- Botao de exportacao na tela de pacientes.
- Auditoria de exportacao de dados do paciente.
- Auditoria de acesso ao historico clinico por paciente e por entrada individual.
- Teste de integracao garantindo que outro psicologo nao consiga exportar dados de paciente alheio.

## Endpoint criado

```http
GET /api/patients/:id/export
```

Regras:

- Exige sessao autenticada.
- Usa `psychologistId` da sessao, nao parametro vindo do cliente.
- Retorna `404` se o paciente nao pertence ao psicologo logado.
- Registra evento `PATIENT_DATA_EXPORTED` em auditoria.

## Auditoria clinica

Foram adicionados registros para:

- `CLINICAL_HISTORY_ACCESSED` ao listar historico de um paciente.
- `CLINICAL_HISTORY_ACCESSED` ao abrir uma entrada individual de historico.
- `PATIENT_DATA_EXPORTED` ao gerar exportacao LGPD do paciente.

## Retencao e exclusao

A aplicacao segue usando exclusao logica como comportamento padrao. Isso preserva rastreabilidade operacional e reduz o risco de perda acidental de informacoes clinicas.

Para uma versao de producao real, ainda deve ser definida uma politica formal de retencao, incluindo:

- Prazo minimo de guarda por tipo de dado.
- Procedimento de anonimimizacao ou eliminacao quando juridicamente permitido.
- Responsavel por aprovar remocoes definitivas.
- Registro auditavel de solicitacoes LGPD.

## Validacoes executadas

```powershell
node --check backend/src/services/patientService.js
node --check backend/src/routes/patientRoutes.js
node --check backend/src/routes/clinicalHistoryRoutes.js
npm run build
npm run test:integration
```

Resultado:

- Build do frontend concluido com sucesso.
- Testes de integracao do backend: 4 passaram, 0 falharam.
