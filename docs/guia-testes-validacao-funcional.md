# Guia de testes e validacao funcional

## Objetivo

Este documento descreve como testar manualmente o sistema Gestao Clinica e validar se cada tela, funcao, botao e fluxo principal esta funcionando corretamente.

Use este roteiro antes de homologar uma versao, depois de alteracoes importantes ou antes de colocar dados reais no sistema.

## Preparacao do ambiente

1. Suba a aplicacao:

```powershell
cd C:\Projetos\app-gestao-clinica
docker compose up --build
```

2. Acesse:

```text
http://localhost:5173
```

3. Confirme que a API responde:

```text
http://localhost:3000/api/health
```

4. Crie um administrador, se ainda nao existir:

```powershell
docker compose exec -T `
  -e ADMIN_NAME="Admin Local" `
  -e ADMIN_EMAIL="admin.local@gestao.dev" `
  -e ADMIN_PASSWORD="AdminTeste123" `
  backend npm run admin:create
```

5. Tenha pelo menos dois acessos de psicologo para testar isolamento. Eles devem ser criados pelo usuario administrador no painel `Administracao`:

- `psicologo1@teste.com`
- `psicologo2@teste.com`

## Resultado esperado global

Em todas as telas:

- Acoes concluidas devem exibir mensagem de sucesso.
- Erros devem aparecer em mensagem visivel.
- Operacoes de criacao, edicao e exclusao devem atualizar a lista sem precisar recarregar a pagina manualmente.
- Dados de um psicologo nao devem aparecer para outro psicologo.
- Botoes de exclusao devem pedir confirmacao antes de excluir.
- A exclusao remove o item das listagens, mas mantem registro interno quando aplicavel.
- Campos de texto devem respeitar limite maximo de caracteres.
- Campos numericos, como telefone, WhatsApp e CPF, devem aceitar apenas numeros quando digitados na interface.

## Tela de login

### Campo E-mail

Acao:

- Informar o e-mail do usuario.

Resultado esperado:

- O sistema deve exigir formato de e-mail valido.

### Campo Senha

Acao:

- Informar a senha.

Resultado esperado:

- A senha deve ter no minimo 8 caracteres.
- Senha incorreta deve impedir login e mostrar erro.

### Botao Entrar

Acao:

- Preencher e-mail e senha validos e clicar em `Entrar`.

Resultado esperado:

- Usuario psicologo deve entrar no Dashboard.
- Usuario admin deve entrar na tela Administracao.
- Dados do usuario logado devem aparecer na barra lateral.

Fluxo:

1. Informar credenciais.
2. Sistema autentica.
3. Sistema carrega dados do perfil.
4. Sistema exibe a tela inicial correspondente ao tipo de usuario.

### Cadastro publico

Acao:

- Conferir a tela inicial sem estar logado.

Resultado esperado:

- Nao deve existir botao para criar novo acesso.
- Cadastro de usuarios deve estar disponivel somente no painel administrativo.

## Barra lateral

### Botoes Dashboard, Pacientes, Agenda, Financeiro, Historico e Importacao

Acao:

- Clicar em cada item da barra lateral.

Resultado esperado:

- A tela correspondente deve abrir.
- O item ativo deve ficar destacado.
- A navegacao nao deve deslogar o usuario nem perder a sessao.

### Caixa do usuario

Acao:

- Conferir o bloco com nome/e-mail e perfil.

Resultado esperado:

- Deve exibir o nome ou e-mail do usuario logado.
- Psicologo deve aparecer como `Psicologo`.
- Admin deve aparecer como `Admin`.

### Botao Sair

Acao:

- Clicar em `Sair`.

Resultado esperado:

- A sessao deve ser encerrada.
- O sistema deve voltar para a tela de login.
- Ao tentar acessar dados novamente, o usuario deve precisar fazer login.

## Dashboard

### Indicadores

Validar os cards:

- `Pacientes ativos`
- `Agendamentos hoje`
- `Recebido no mes`
- `Pendente total`

Resultado esperado:

- Os numeros devem refletir apenas dados do psicologo logado.
- Valores financeiros devem aparecer em formato de moeda brasileira.

### Lista Proximos agendamentos

Acao:

- Criar agendamentos futuros na tela Agenda e voltar ao Dashboard.

Resultado esperado:

- Os proximos agendamentos devem aparecer com paciente, data, hora e status.
- Se nao houver agendamentos futuros, deve aparecer mensagem de lista vazia.

### Distribuicao da agenda

Acao:

- Marcar agendamentos como presenca, falta e manter outros agendados.

Resultado esperado:

- Os percentuais de realizadas, faltas e agendadas devem atualizar.

### Botao Atualizar

Acao:

- Clicar no icone de atualizar.

Resultado esperado:

- O Dashboard deve recarregar os dados atuais.
- Nao deve criar, editar ou apagar registros.

## Pacientes

### Campo Buscar

Acao:

- Digitar nome, telefone, WhatsApp, e-mail ou CPF de um paciente.

Resultado esperado:

- A lista deve filtrar localmente os pacientes exibidos.
- Ao limpar o campo, todos os pacientes do psicologo logado devem reaparecer.
- Se nenhum paciente corresponder, deve aparecer `Nenhum paciente encontrado`.
- Ao buscar, a paginacao deve voltar para a pagina `1`.

### Paginacao de pacientes

Acao:

- Criar mais de 10 pacientes.
- Abrir a tela `Pacientes`.
- Usar os botoes `Anterior` e `Proxima`.
- Alterar o seletor de quantidade por pagina para `10`, `20`, `50` e `100`.

Resultado esperado:

- A lista deve respeitar a pagina atual.
- `Anterior` deve ficar desabilitado na primeira pagina.
- `Proxima` deve ficar desabilitado na ultima pagina.
- O total de registros e paginas deve ser exibido corretamente.
- Ao alterar a quantidade por pagina, a listagem deve voltar para a pagina `1`.
- A paginacao deve respeitar a busca aplicada.

### Formulario Novo paciente

Campos:

- Nome: obrigatorio.
- Telefone: opcional, somente numeros, 10 ou 11 digitos.
- WhatsApp: opcional, somente numeros, 10 ou 11 digitos.
- E-mail: opcional.
- CPF: opcional, somente numeros, 11 digitos.
- Nascimento: opcional.
- Profissao: opcional.
- Status: `Ativo` ou `Inativo`.
- Observacoes: opcional.

### Botao Adicionar

Acao:

- Preencher pelo menos o nome e clicar em `Adicionar`.

Resultado esperado:

- Paciente deve ser criado.
- Mensagem `Paciente cadastrado com sucesso.` deve aparecer.
- Paciente deve aparecer na lista.
- Formulario deve voltar ao estado de novo cadastro.

Fluxo:

1. Usuario preenche dados.
2. Sistema salva paciente vinculado ao psicologo logado.
3. Sistema recarrega a lista.
4. Paciente aparece somente para esse psicologo.

### Badge Ativo/Inativo

Acao:

- Criar ou editar paciente com status `Ativo` ou `Inativo`.

Resultado esperado:

- A lista deve mostrar o status correto.

### Botao Exportar dados do paciente

Acao:

- Clicar no icone de exportacao na linha do paciente.

Resultado esperado:

- O navegador deve baixar um arquivo `.json`.
- O arquivo deve conter dados do paciente, agendamentos, financeiros e historico clinico vinculados.
- Deve aparecer mensagem `Exportacao do paciente gerada com sucesso.`
- A exportacao deve respeitar o psicologo logado.

Fluxo:

1. Usuario clica em exportar.
2. Sistema consulta dados do paciente.
3. Sistema gera arquivo JSON.
4. Sistema registra auditoria de exportacao.

### Botao Editar paciente

Acao:

- Clicar no icone de editar.

Resultado esperado:

- O formulario deve mudar para `Editar paciente`.
- Os campos devem ser preenchidos com os dados atuais.
- Deve aparecer o botao de cancelar edicao.

### Botao Salvar

Acao:

- Alterar algum dado do paciente em edicao e clicar em `Salvar`.

Resultado esperado:

- Paciente deve ser atualizado.
- Mensagem `Paciente atualizado com sucesso.` deve aparecer.
- Lista deve refletir os novos dados.
- Formulario deve voltar para `Novo paciente`.

### Botao Cancelar edicao

Acao:

- Durante uma edicao, clicar no icone `X`.

Resultado esperado:

- Edicao deve ser cancelada.
- Formulario deve limpar e voltar para `Novo paciente`.
- Nenhuma alteracao deve ser salva.

### Botao Excluir paciente

Acao:

- Clicar no icone de lixeira.

Resultado esperado:

- Sistema deve pedir confirmacao.
- Ao cancelar, nada deve mudar.
- Ao confirmar, paciente deve sair da lista.
- Mensagem de sucesso deve aparecer.

## Agenda

### Filtro Filtrar data

Acao:

- Selecionar uma data.

Resultado esperado:

- A lista deve mostrar somente agendamentos daquela data.
- O botao `Limpar` deve aparecer.

### Botao Limpar

Acao:

- Clicar em `Limpar`.

Resultado esperado:

- O filtro de data deve ser removido.
- Todos os agendamentos do psicologo logado devem aparecer.
- A paginacao deve voltar para a pagina `1`.

### Paginacao da agenda

Acao:

- Usar `Anterior`, `Proxima` e o seletor de quantidade por pagina.
- Aplicar e limpar o filtro de data.

Resultado esperado:

- A lista deve respeitar a pagina atual.
- A paginacao deve considerar o filtro de data quando ele estiver preenchido.
- Alterar filtro ou quantidade por pagina deve voltar para pagina `1`.

### Formulario Novo agendamento

Campos:

- Paciente: obrigatorio.
- Data: obrigatorio.
- Hora: obrigatorio.
- Status: `Agendado`, `Confirmado`, `Presenca`, `Falta` ou `Reagendado`.
- Observacoes: opcional.

### Botao Agendar

Acao:

- Selecionar paciente, data e hora e clicar em `Agendar`.

Resultado esperado:

- Agendamento deve ser criado.
- Mensagem `Agendamento criado com sucesso.` deve aparecer.
- Agendamento deve aparecer na lista.
- Dashboard deve refletir o novo agendamento quando recarregado.

### Botao Marcar presenca

Acao:

- Clicar no icone de presenca em um agendamento.

Resultado esperado:

- Status deve mudar para `Presenca`.
- Mensagem `Presenca registrada com sucesso.` deve aparecer.
- Distribuicao do Dashboard deve considerar como realizada.

### Botao Marcar falta

Acao:

- Clicar no icone de falta em um agendamento.

Resultado esperado:

- Status deve mudar para `Falta`.
- Mensagem `Status do agendamento atualizado.` deve aparecer.
- Distribuicao do Dashboard deve considerar como falta.

### Botao Editar agendamento

Acao:

- Clicar no icone de editar.

Resultado esperado:

- Formulario deve mudar para `Editar agendamento`.
- Campos devem carregar os dados do agendamento.

### Botao Salvar

Acao:

- Alterar data, hora, status ou observacoes e clicar em `Salvar`.

Resultado esperado:

- Agendamento deve ser atualizado.
- Mensagem `Agendamento atualizado com sucesso.` deve aparecer.
- Lista deve refletir a alteracao.

### Botao Cancelar edicao

Acao:

- Clicar no icone `X` enquanto edita.

Resultado esperado:

- Edicao deve ser abandonada.
- Formulario volta para `Novo agendamento`.

### Botao Remover agendamento

Acao:

- Clicar no icone de lixeira.

Resultado esperado:

- Sistema deve pedir confirmacao.
- Ao confirmar, agendamento deve sair da lista.
- Mensagem de sucesso deve aparecer.

## Financeiro

### Formulario Novo lancamento

Campos:

- Paciente: obrigatorio.
- Valor: obrigatorio, minimo 0.
- Vencimento: obrigatorio.
- Metodo: `Pix`, `Dinheiro`, `Cartao` ou `Convenio`.
- Status: `Pendente`, `Pago` ou `Atrasado`.
- Descricao: opcional.
- Observacoes: opcional.

### Botao Lancar

Acao:

- Preencher os campos obrigatorios e clicar em `Lancar`.

Resultado esperado:

- Lancamento financeiro deve ser criado.
- Mensagem `Lancamento financeiro criado com sucesso.` deve aparecer.
- Lancamento deve aparecer na lista de recebimentos.
- Dashboard deve atualizar totais financeiros quando recarregado.

### Badge Pendente/Pago/Atrasado

Acao:

- Criar lancamentos com status diferentes.

Resultado esperado:

- Cada lancamento deve mostrar o status correto.
- `Pago` deve aparecer com destaque positivo.
- Pendencias devem aparecer como alerta.

### Botao Pagar

Acao:

- Em um lancamento pendente ou atrasado, clicar em `Pagar`.

Resultado esperado:

- Status deve mudar para `Pago`.
- Mensagem `Status financeiro atualizado com sucesso.` deve aparecer.
- Valor deve passar a contar em recebido.

### Botao Reabrir

Acao:

- Em um lancamento pago, clicar em `Reabrir`.

Resultado esperado:

- Status deve deixar de ser `Pago`, conforme regra do backend.
- Mensagem `Status financeiro atualizado com sucesso.` deve aparecer.
- Valor deve voltar para pendente/nao recebido conforme regra aplicada.

### Botao Editar lancamento

Acao:

- Clicar no icone de editar.

Resultado esperado:

- Formulario deve mudar para `Editar lancamento`.
- Campos devem carregar dados do lancamento.

### Botao Salvar

Acao:

- Alterar valor, vencimento, metodo, status, descricao ou observacoes e clicar em `Salvar`.

Resultado esperado:

- Lancamento deve ser atualizado.
- Mensagem `Lancamento financeiro atualizado com sucesso.` deve aparecer.

### Botao Cancelar edicao

Acao:

- Clicar no icone `X` durante a edicao.

Resultado esperado:

- Edicao deve ser cancelada.
- Formulario volta para `Novo lancamento`.

### Botao Excluir lancamento

Acao:

- Clicar no icone de lixeira.

Resultado esperado:

- Sistema deve pedir confirmacao.
- Ao confirmar, lancamento deve sair da lista.
- Mensagem de sucesso deve aparecer.

### Paginacao do financeiro

Acao:

- Usar `Anterior`, `Proxima` e o seletor de quantidade por pagina.

Resultado esperado:

- A lista de recebimentos deve respeitar a pagina atual.
- Totais do Dashboard nao devem depender da pagina atual.
- Alterar quantidade por pagina deve voltar para pagina `1`.

## Historico clinico

### Filtro Paciente

Acao:

- Selecionar um paciente no filtro superior.

Resultado esperado:

- A lista deve mostrar somente registros daquele paciente.
- Ao selecionar `Todos`, todos os registros do psicologo logado devem aparecer.
- A paginacao deve voltar para a pagina `1`.

### Paginacao do historico clinico

Acao:

- Usar `Anterior`, `Proxima` e o seletor de quantidade por pagina.
- Selecionar um paciente no filtro.

Resultado esperado:

- A lista deve respeitar a pagina atual.
- A paginacao deve considerar o paciente filtrado.
- Alterar filtro ou quantidade por pagina deve voltar para pagina `1`.

### Formulario Novo registro

Campos:

- Paciente: obrigatorio.
- Data do atendimento: obrigatorio.
- Titulo: obrigatorio.
- Anotacoes: obrigatorio.

### Botao Registrar

Acao:

- Preencher todos os campos e clicar em `Registrar`.

Resultado esperado:

- Registro clinico deve ser criado.
- Mensagem `Registro clinico criado com sucesso.` deve aparecer.
- Registro deve aparecer na lista.
- Paciente selecionado deve permanecer no formulario para facilitar novos registros.

### Botao Editar registro

Acao:

- Clicar no icone de editar em um registro.

Resultado esperado:

- Formulario deve mudar para `Editar registro`.
- Campos devem carregar dados do registro.

### Botao Salvar

Acao:

- Alterar titulo, anotacoes, data ou paciente e clicar em `Salvar`.

Resultado esperado:

- Registro deve ser atualizado.
- Mensagem `Registro clinico atualizado com sucesso.` deve aparecer.
- Lista deve refletir a alteracao.

### Botao Cancelar edicao

Acao:

- Clicar no icone `X` durante a edicao.

Resultado esperado:

- Edicao deve ser cancelada.
- Formulario volta para `Novo registro`.

### Botao Excluir registro

Acao:

- Clicar no icone de lixeira.

Resultado esperado:

- Sistema deve pedir confirmacao.
- Ao confirmar, registro deve sair da lista.
- Mensagem de sucesso deve aparecer.

## Importacao

### Campo Arquivo

Acao:

- Selecionar um arquivo `.json` de backup legado.

Resultado esperado:

- Conteudo deve preencher o campo `Conteudo JSON`.
- Se o formato for reconhecido, deve aparecer `Backup reconhecido`.
- Deve exibir contadores de pacientes, agendamentos, financeiro e historico.

Acao alternativa:

- Selecionar um arquivo `.html`.

Resultado esperado:

- Sistema deve avisar que o HTML nao contem os dados salvos.
- Deve orientar uso do script para gerar JSON.

### Campo Nome de origem

Acao:

- Alterar o nome do arquivo de origem.

Resultado esperado:

- Esse nome deve ser enviado junto com a importacao e aparecer em `Ultima importacao`.

### Campo Conteudo JSON

Acao:

- Colar ou editar manualmente o JSON.

Resultado esperado:

- JSON valido e reconhecido deve mostrar pre-visualizacao.
- JSON invalido deve impedir importacao e mostrar `JSON invalido.`

### Botao Importar

Acao:

- Com JSON valido, clicar em `Importar`.

Resultado esperado:

- Dados devem ser importados para o psicologo logado.
- Mensagem `Importacao concluida com sucesso.` deve aparecer.
- Listas de pacientes, agenda, financeiro e historico devem ser atualizadas.
- Secao `Ultima importacao` deve mostrar status e contadores.

Fluxo:

1. Usuario gera JSON no sistema antigo.
2. Usuario seleciona ou cola JSON no sistema novo.
3. Sistema valida formato.
4. Sistema importa dados vinculando ao psicologo logado.
5. Sistema mostra resumo da importacao.

### Botao Copiar script

Acao:

- Clicar em `Copiar script`.

Resultado esperado:

- Script deve ser copiado para a area de transferencia.
- Mensagem `Script copiado.` deve aparecer.
- Se o navegador bloquear a copia, deve aparecer orientacao para copiar manualmente.

## Administracao

Esta tela aparece somente para usuarios admin.

### Formulario Novo usuario

Campos:

- Nome: obrigatorio.
- E-mail: obrigatorio.
- Senha temporaria: obrigatoria, minimo 8 caracteres.
- Perfil: `Psicologo` ou `Admin`.

### Botao Criar usuario

Acao:

- Preencher nome, e-mail, perfil e senha temporaria e clicar em `Criar usuario`.

Resultado esperado:

- Usuario deve ser criado.
- Mensagem `Usuario criado com sucesso.` deve aparecer.
- Novo usuario deve aparecer em `Gerenciar usuarios`.
- O novo usuario deve conseguir fazer login com a senha temporaria se estiver ativo.
- Usuario psicologo comum nao deve conseguir criar outros usuarios.

### Botao Editar usuario

Acao:

- Clicar no icone de editar em um usuario.

Resultado esperado:

- O formulario deve mudar para `Editar usuario`.
- Nome, e-mail e perfil devem ser preenchidos com os dados atuais.
- O campo `Nova senha` deve ficar vazio.

### Botao Salvar usuario

Acao:

- Alterar nome, e-mail, perfil ou preencher `Nova senha` e clicar em `Salvar usuario`.

Resultado esperado:

- Usuario deve ser atualizado.
- Se `Nova senha` for preenchida, a senha antiga deixa de funcionar.
- Sessoes ativas do usuario editado devem ser revogadas quando a senha for alterada.

### Botao Ativar usuario

Acao:

- Em um usuario inativo, clicar no icone de ativar.

Resultado esperado:

- Usuario deve voltar para status `Ativo`.
- Login deve ser permitido novamente.

### Botao Desativar usuario

Acao:

- Em um usuario ativo, clicar no icone de desativar.

Resultado esperado:

- Usuario deve mudar para status `Inativo`.
- Login deve ser bloqueado.
- Sessoes ativas desse usuario devem ser encerradas.
- O administrador logado nao deve conseguir desativar a propria conta.

### Botao Excluir usuario

Acao:

- Clicar no icone de lixeira.

Resultado esperado:

- O sistema deve pedir uma primeira confirmacao.
- O sistema deve pedir uma segunda confirmacao digitando o e-mail completo do usuario.
- Se o e-mail digitado estiver incorreto, a exclusao deve ser recusada.
- Se confirmado corretamente, o usuario deve sair da lista e nao deve mais conseguir acessar o sistema.
- O administrador logado nao deve conseguir excluir a propria conta.

### Paginacao de usuarios

Acao:

- Usar `Anterior`, `Proxima` e o seletor de quantidade por pagina em `Gerenciar usuarios`.

Resultado esperado:

- A lista de usuarios deve respeitar a pagina atual.
- Alterar quantidade por pagina deve voltar para pagina `1`.

### Indicadores

Validar os cards:

- `Usuarios`
- `Psicologos`
- `Admins`
- `Eventos auditados`

Resultado esperado:

- Numeros devem refletir o estado geral do sistema.

### Lista Gerenciar usuarios

Acao:

- Criar psicologos e administrador.

Resultado esperado:

- Usuarios devem aparecer com nome, e-mail, perfil e status.
- Perfil deve aparecer como `Psicologo` ou `Admin`.

### Lista Auditoria recente

Acao:

- Fazer login, criar paciente, exportar paciente, acessar historico, excluir registro.

Resultado esperado:

- Eventos devem aparecer na auditoria.
- Cada evento deve mostrar acao, entidade ou sistema, data e se esta vinculado a usuario.

### Paginacao de auditoria

Acao:

- Usar `Anterior`, `Proxima` e o seletor de quantidade por pagina em `Auditoria recente`.

Resultado esperado:

- A lista de auditoria deve respeitar a pagina atual.
- A paginacao de auditoria deve ser independente da paginacao de usuarios.

### Botao Atualizar

Acao:

- Clicar no icone de atualizar.

Resultado esperado:

- Resumo, usuarios e auditoria devem recarregar.

## Testes de isolamento entre psicologos

### Pacientes

Fluxo:

1. Entrar como `psicologo1`.
2. Criar paciente `Paciente Psicologo 1`.
3. Sair.
4. Entrar como `psicologo2`.
5. Abrir Pacientes.

Resultado esperado:

- `Paciente Psicologo 1` nao deve aparecer para `psicologo2`.

### Agenda, financeiro e historico

Fluxo:

1. Como `psicologo1`, criar agendamento, lancamento financeiro e registro clinico para um paciente.
2. Sair.
3. Entrar como `psicologo2`.
4. Abrir Agenda, Financeiro e Historico.

Resultado esperado:

- Nenhum dado criado pelo `psicologo1` deve aparecer para `psicologo2`.

### Exportacao

Fluxo:

1. Como `psicologo1`, exportar dados de um paciente.
2. Confirmar que o arquivo foi gerado.
3. Como `psicologo2`, confirmar que esse paciente nao aparece na lista.

Resultado esperado:

- O segundo psicologo nao deve ter acesso visual nem operacional aos dados do primeiro.

## Testes de validacao e erros

### Campos obrigatorios

Acao:

- Tentar salvar formularios sem preencher campos obrigatorios.

Resultado esperado:

- O navegador deve bloquear o envio ou o sistema deve mostrar erro.

### Limites e formatos dos campos

Acao:

- Tentar digitar letras em telefone, WhatsApp ou CPF.
- Tentar salvar telefone com menos de 10 digitos.
- Tentar salvar CPF com menos de 11 digitos.
- Tentar salvar textos maiores que o limite do campo.

Resultado esperado:

- Telefone, WhatsApp e CPF devem manter apenas numeros na interface.
- Backend deve rejeitar telefone com quantidade invalida de digitos.
- Backend deve rejeitar CPF com quantidade invalida de digitos.
- Backend deve rejeitar textos acima do limite permitido.
- Telefone mascarado vindo por API, como `(16)99420-3492`, deve ser normalizado para `16994203492`.

### Datas e valores

Acao:

- Criar registros com datas diferentes e valores financeiros variados.

Resultado esperado:

- Filtros, listas e Dashboard devem respeitar datas e totais.
- Valores financeiros devem manter duas casas decimais quando exibidos.

### Exclusao com cancelamento

Acao:

- Clicar em excluir e cancelar a confirmacao.

Resultado esperado:

- Registro deve continuar na lista.

### Sessao expirada ou usuario nao autenticado

Acao:

- Sair do sistema e tentar acessar novamente uma rota protegida pela interface.

Resultado esperado:

- Sistema deve exigir novo login.

## Testes automatizados recomendados

Rodar no backend:

```powershell
cd C:\Projetos\app-gestao-clinica\backend
npm run test:integration
```

Resultado esperado:

- Todos os testes devem passar.
- O teste de isolamento deve confirmar que dados de um psicologo nao vazam para outro.

Rodar build do frontend:

```powershell
cd C:\Projetos\app-gestao-clinica\frontend
npm run build
```

Resultado esperado:

- Build deve concluir sem erro.

## Criterio de aceite final

Considere o sistema validado quando:

- Login e logout funcionam.
- Cadastro publico nao aparece na tela inicial.
- Admin consegue criar usuarios psicologos.
- Todas as abas carregam sem erro.
- Pacientes podem ser criados, editados, buscados, exportados e excluidos.
- Paginacao de pacientes funciona com busca e isolamento por psicologo.
- Paginacao funciona em Agenda, Financeiro, Historico, Usuarios e Auditoria.
- Agendamentos podem ser criados, filtrados, editados, marcados como presenca/falta e removidos.
- Lancamentos financeiros podem ser criados, pagos/reabertos, editados e removidos.
- Historico clinico pode ser criado, filtrado, editado e removido.
- Importacao reconhece JSON valido e rejeita JSON invalido.
- Admin visualiza usuarios e auditoria.
- Um psicologo nao visualiza dados de outro.
- Build do frontend passa.
- Testes de integracao do backend passam.
