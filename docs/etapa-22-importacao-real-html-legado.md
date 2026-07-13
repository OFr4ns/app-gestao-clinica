# Etapa 22 - Importacao real do HTML legado

Data: 12/07/2026

## Objetivo

Transformar a importacao do HTML legado em um fluxo mais realista e guiado, considerando que os dados antigos ficam no `localStorage` do navegador, e nao dentro do arquivo `.html`.

## Contexto tecnico

O HTML legado usa as seguintes chaves:

```txt
sensus_patients
sensus_appointments
sensus_financials
sensus_history
```

O arquivo `.html` contem o codigo da aplicacao, mas os dados ficam salvos no navegador onde o sistema antigo foi usado.

## Entregas

- Tela de importacao atualizada para explicar o fluxo real.
- Aceite de arquivos `.json` e `.html`.
- Ao selecionar `.html`, a tela informa que o HTML nao contem os dados salvos e orienta usar o script de exportacao.
- Preview automatico de contagem quando o JSON e reconhecido:
  - pacientes;
  - agendamentos;
  - financeiro;
  - historico.
- Suporte no frontend para dois formatos:
  - backup direto `{ patients, appointments, financials, history }`;
  - dump bruto `{ sensus_patients, sensus_appointments, sensus_financials, sensus_history }`.
- Suporte equivalente no backend para payloads `sensus_*`.
- Script versionado em `tools/exportar-backup-html-legado.js`.

## Como gerar o backup do HTML antigo

1. Abra o HTML antigo no navegador onde os dados estao salvos.
2. Pressione `F12`.
3. Abra a aba `Console`.
4. Cole o script exibido na tela de importacao nova ou use o arquivo:

```txt
tools/exportar-backup-html-legado.js
```

5. Execute o script.
6. O navegador baixara:

```txt
backup-gestao-clinica-legado.json
```

7. Importe esse JSON na aplicacao nova.

## Validacao

```txt
npm run build
node --check backend/src/services/importService.js
node --check tools/exportar-backup-html-legado.js
```

Resultado:

```txt
OK
```

## Proxima etapa sugerida

Etapa 23: testes automatizados do backend, priorizando autenticacao, isolamento por psicologo e criptografia.
