# Etapa 1 - Levantamento do HTML atual

Arquivo analisado: `C:\Users\frans\Downloads\Gestão Clínica - Versão Oficial.html`

Data do levantamento: 09/07/2026

## Objetivo

Registrar o funcionamento atual do HTML para orientar a migração para uma aplicação dedicada com:

- frontend em React/Vite;
- backend em Node.js/Express;
- banco MySQL em Docker Compose;
- acesso ao banco via `mysql2/promise`;
- múltiplos psicólogos como usuários;
- isolamento de dados por psicólogo;
- criptografia de dados sensíveis.

## Visão geral do sistema atual

O sistema atual é uma aplicação HTML única, com CSS e JavaScript embutidos. Ele roda totalmente no navegador e persiste dados em `localStorage`.

Não existe backend, autenticação, banco relacional, controle por usuário ou isolamento entre psicólogos. Todos os dados ficam acessíveis no navegador em que foram salvos.

## Módulos de tela

### Dashboard

Mostra indicadores gerais:

- total de pacientes ativos;
- consultas do dia;
- faturamento recebido;
- valores pendentes;
- próximos atendimentos agendados;
- distribuição de presença, falta e sessões pendentes.

Dados usados:

- `patients`;
- `appointments`;
- `financials`.

### Pacientes

Funcionalidades:

- listar pacientes;
- buscar por nome, número de prontuário, CPF ou telefone;
- filtrar por status;
- cadastrar paciente;
- editar cadastro;
- excluir paciente.

Observação importante: ao excluir um paciente, o HTML remove apenas o paciente da lista. Dados históricos e financeiros vinculados podem permanecer, gerando referências órfãs.

### Agenda

Funcionalidades:

- criar agendamento;
- listar agendamentos;
- filtrar por data de forma opcional;
- alterar status da sessão;
- marcar presença;
- remover agendamento alterando status para `Removido`;
- gerar lançamento financeiro automaticamente no momento do agendamento.

Regra atual:

- ao criar agendamento com geração financeira marcada, o sistema cria um registro em `financials`;
- se o status inicial for `Presença`, o lançamento financeiro já nasce como `Pago`;
- ao clicar em marcar presença, o agendamento vira `Presença` e o lançamento financeiro vinculado vira `Pago`.

### Financeiro

Funcionalidades:

- listar lançamentos financeiros;
- criar lançamento manual;
- editar lançamento;
- excluir lançamento;
- alternar entre pago e pendente;
- calcular receita total;
- calcular pendências.

Dados financeiros são vinculados a paciente e, opcionalmente, a agendamento.

### Histórico Clínico

Funcionalidades:

- selecionar paciente;
- visualizar linha do tempo clínica;
- registrar evolução;
- salvar data, título e notas clínicas.

Este é o módulo mais sensível do ponto de vista de privacidade, pois armazena anotações clínicas em texto livre.

### Relatórios

Mostra métricas simples:

- total de atendimentos;
- presenças;
- faltas;
- total recebido;
- valores em aberto/atraso;
- percentual visual de adimplência e inadimplência.

Dados usados:

- `appointments`;
- `financials`.

### Configurações

Funcionalidades:

- exportar backup JSON;
- importar backup JSON;
- limpar todo o sistema local.

Formato atual do backup:

```json
{
  "patients": [],
  "appointments": [],
  "financials": [],
  "history": []
}
```

## Persistência atual

O HTML usa quatro chaves no `localStorage`:

- `sensus_patients`;
- `sensus_appointments`;
- `sensus_financials`;
- `sensus_history`.

Funções atuais:

- `DB.get(key)`: lê `localStorage`;
- `DB.set(key, data)`: grava `localStorage`;
- `DB.clear()`: remove as quatro chaves principais.

## Entidades identificadas

### Patient

Campos atuais:

- `id`;
- `recordNumber`;
- `name`;
- `dob`;
- `cpf`;
- `rg`;
- `phone`;
- `whatsapp`;
- `email`;
- `profession`;
- `civilStatus`;
- `address`;
- `city`;
- `state`;
- `insurance`;
- `status`;
- `notes`;
- `emergencyName`;
- `emergencyRelationship`;
- `emergencyPhone`;
- `createdAt`.

Status atuais:

- `Ativo`;
- `Inativo`.

Regras atuais:

- novo paciente recebe número de prontuário gerado a partir do maior número existente;
- filtro padrão da tela mostra pacientes ativos;
- busca considera nome, prontuário, CPF e telefone.

### Appointment

Campos atuais:

- `id`;
- `patientId`;
- `date`;
- `time`;
- `status`.

Status atuais:

- `Agendado`;
- `Confirmado`;
- `Presença`;
- `Falta`;
- `Reagendado`;
- `Removido`.

Regras atuais:

- só pacientes ativos aparecem para novo agendamento;
- agendamento pode gerar financeiro automaticamente;
- presença altera status do agendamento e marca financeiro vinculado como pago.

### FinancialRecord

Campos atuais:

- `id`;
- `patientId`;
- `appointmentId`;
- `value`;
- `method`;
- `dueDate`;
- `paymentDate`;
- `status`.

Formas de pagamento atuais:

- `Dinheiro`;
- `PIX`;
- `Cartão`;
- `Convênio`;

Status atuais:

- `Pendente`;
- `Pago`;
- `Atrasado`.

Regras atuais:

- lançamento gerado por agendamento recebe `appointmentId`;
- lançamento manual recebe `appointmentId` nulo;
- alternar status para pago define `paymentDate` como a data atual;
- alternar de pago para pendente limpa `paymentDate`.

### ClinicalHistory

Campos atuais:

- `id`;
- `patientId`;
- `date`;
- `title`;
- `notes`.

Regras atuais:

- histórico é exibido por paciente;
- registros são ordenados por data decrescente;
- `notes` é texto livre e deve ser tratado como dado clínico sensível.

## Dados sensíveis identificados

### Alta sensibilidade clínica

- `history.notes`;
- `history.title`;
- `patients.notes`;
- qualquer evolução ou observação clínica futura.

### Dados pessoais sensíveis ou identificadores

- nome do paciente;
- data de nascimento;
- CPF;
- RG;
- telefone;
- WhatsApp;
- e-mail;
- endereço;
- cidade;
- estado;
- profissão;
- estado civil;
- convênio;
- contato de emergência;
- vínculo do contato de emergência;
- telefone do contato de emergência.

### Dados financeiros

- valor da sessão;
- forma de pagamento;
- status financeiro;
- vencimento;
- data de pagamento;
- vínculo entre pagamento, paciente e atendimento.

## Impactos para a aplicação nova

### Multiusuário

Cada psicólogo será um usuário. As tabelas sensíveis precisarão ter `psychologist_id`.

Tabelas que devem ser escopadas por psicólogo:

- `patients`;
- `appointments`;
- `financial_records`;
- `clinical_history`;
- `settings`, se houver configurações por psicólogo;
- `audit_logs`, quando o evento pertencer a um psicólogo.

Regra obrigatória:

```sql
WHERE psychologist_id = ?
```

Essa regra deve existir em toda query que lê, altera ou remove dados sensíveis.

### Criptografia

Campos que devem ser criptografados em nível de aplicação:

- dados cadastrais pessoais;
- documentos;
- contatos;
- endereço;
- observações;
- histórico clínico;
- anotações livres;
- dados financeiros que revelem informação sensível do atendimento.

Campos que podem precisar de hash auxiliar para busca exata:

- CPF;
- RG;
- número de prontuário;
- telefone;
- e-mail.

Busca por nome precisa de decisão específica na próxima etapa, pois criptografia forte dificulta busca textual direta no MySQL.

### Autenticação e autorização

O HTML atual não tem login. A nova aplicação precisa:

- cadastrar psicólogos;
- autenticar com senha hasheada;
- proteger rotas;
- impedir acesso cruzado por ID;
- nunca aceitar `psychologist_id` vindo do frontend como autoridade;
- derivar o psicólogo logado a partir da sessão/token.

### Importação

O importador deverá receber o JSON no formato atual e importar tudo para o psicólogo logado.

Durante a importação:

- gerar IDs novos ou mapear IDs antigos;
- manter vínculos entre paciente, agendamento, financeiro e histórico;
- criptografar dados antes de inserir no MySQL;
- registrar resumo da importação;
- evitar sobrescrever dados existentes sem confirmação.

## Regras de negócio a preservar

- paciente possui status ativo/inativo;
- novo agendamento só deve selecionar pacientes ativos;
- agenda lista todos por padrão e filtra por data apenas quando data for escolhida;
- agendamento pode gerar financeiro automaticamente;
- presença marca financeiro vinculado como pago;
- financeiro manual pode existir sem agendamento;
- histórico clínico pertence a um paciente;
- dashboard e relatórios devem considerar apenas os dados do psicólogo logado;
- exportação/importação precisa respeitar o isolamento por psicólogo.

## Pontos de atenção

- O sistema atual permite exclusão de paciente sem remover vínculos, o que pode gerar dados órfãos. Na nova aplicação, é melhor usar inativação ou exclusão lógica.
- `Removido` hoje é apenas um status de agendamento, não uma exclusão real.
- Receita do mês atual no HTML parece usar o mesmo total histórico em alguns pontos; na nova aplicação, deve ser calculada por período real.
- Não existe controle de atraso automático para financeiro; status `Atrasado` é manual no HTML.
- Histórico clínico não possui edição/exclusão no HTML atual.
- Não existe trilha de auditoria.
- Não existe consentimento, termo, perfil profissional ou configurações da clínica.

## Proposta para a próxima etapa

A próxima etapa deve transformar este levantamento em um modelo inicial de banco MySQL com:

- tabelas;
- campos;
- relacionamentos;
- `psychologist_id`;
- campos criptografados;
- campos hash para busca;
- enums/status;
- estratégia de exclusão lógica;
- estratégia de importação do JSON antigo.
