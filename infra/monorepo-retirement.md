# Aposentadoria do monorepo

Este runbook define como decidir se o monorepo `crm-booking-api` pode deixar de ser a base operacional da migracao.

## Decisao atual

Status: nao aposentar ainda.

Motivo: os gates locais estao documentados e testados, mas ainda existem evidencias externas pendentes: URLs remotas, CI remoto, releases publicadas, deploy independente, rollback testado e observabilidade provisionada.

## Checklist de decisao

O monorepo so pode ser aposentado quando todos os itens abaixo estiverem `Sim`:

| Criterio | Como validar |
| --- | --- |
| Repositorios remotos existem | Cada repo tem URL remota registrada em `infra/completion-criteria.md` |
| CI remoto passa | Badge/status do provedor passa em cada repo |
| Build/test fora do monorepo passa | `npm ci`, `npm test`, `npm run build` executados em cada repo independente |
| Imagens publicadas | Apps Docker possuem imagem versionada em registry |
| Contratos publicados | Repo `contracts` possui release/tag remota consumivel |
| Bancos/schemas proprios em uso | Cada servico usa sua connection string propria em ambiente real |
| Gateway e frontend independentes | Gateway e frontend sobem sem ler arquivos deste repo |
| Deploy independente testado | Cada repo executou release/deploy em staging ou producao |
| Rollback independente testado | Cada repo executou rollback em staging |
| Observabilidade fim a fim | Uma chamada frontend -> gateway -> servico dono do dado aparece em logs, metricas e trace |

## Procedimento

1. Atualizar a matriz de `infra/completion-criteria.md` com evidencias reais.
2. Substituir todos os `Pendente`, `Parcial` e `Workflow local` por evidencias remotas verificaveis.
3. Rodar `npm test` neste repo para validar os gates documentais.
4. Executar smoke test em cada repo independente.
5. Arquivar este repo como historico ou read-only.

## Regra de bloqueio

Se qualquer item critico estiver pendente, este repo continua sendo a base de migracao e nao deve ser arquivado.
