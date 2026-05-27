# Checklist de release independente

Use este checklist antes de publicar uma nova versao de qualquer app.

## Antes do merge

- CI passou no pull request.
- Testes de contrato passaram ou breaking change foi versionada.
- Variaveis novas foram adicionadas ao `.env.example`.
- Migrations foram testadas localmente.
- Health check continua respondendo.
- Logs incluem `service`, `requestId` e `traceId`.
- README foi atualizado quando endpoints, eventos ou variaveis mudaram.

## Antes do deploy

- Tag de release criada no formato `vX.Y.Z`.
- Imagem Docker publicada.
- Release notes descrevem mudancas e riscos.
- Plano de rollback definido.
- Dependencias externas estao saudaveis.
- Janela de deploy comunicada quando necessario.

## Depois do deploy

- `/api/health` validado.
- Logs verificados.
- Metricas e alertas observados.
- Fluxo principal do servico testado.
- Versao anterior mantida disponivel para rollback.

## Rollback

- Reimplantar a imagem anterior.
- Reverter variaveis quando necessario.
- Executar migracao reversa ou plano de mitigacao, se existir.
- Confirmar health check e logs depois do rollback.
