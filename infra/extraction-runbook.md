# Runbook de extracao para repos independentes

Este runbook executa a ordem operacional do roadmap. Ele deve ser seguido repo por repo, sem criar dependencias diretas entre microservicos.

## Fase 1: contratos

Objetivo: criar uma fonte publicavel de contratos antes de mover codigo.

- [x] Congelar contrato HTTP inicial de appointments em `packages/contracts/public/appointments.openapi.json`.
- [x] Congelar eventos de appointments em `packages/contracts/public/appointment-events.schema.json`.
- [x] Criar repo `contracts` fora do monorepo atual.
- [x] Copiar `packages/contracts/public/*` para o novo repo.
- [ ] Adicionar CI do repo `contracts`.
- [ ] Definir versao inicial `v1.0.0`.

Gate de saida:

- contratos de appointments publicados em repo proprio;
- consumers conseguem consultar OpenAPI e schemas de eventos sem importar codigo do monorepo;
- breaking changes passam a exigir nova versao.

## Fase 2: template Nest independente

Objetivo: evitar recriar bootstrap, health, logs e CI do zero para cada servico.

- [x] Criar templates de CI/CD em `infra/templates`.
- [ ] Criar esqueleto de backend Nest independente.
- [ ] Padronizar health check.
- [ ] Padronizar logs JSON com `service`, `requestId` e `traceId`.
- [ ] Padronizar filtro de erros.
- [x] Padronizar Dockerfile.
- [x] Padronizar `.env.example`.
- [x] Adicionar scripts locais de `npm ci`, `npm test` e `npm run build`.

Gate de saida:

- um projeto novo sobe sem depender do monorepo;
- `npm test`, `npm run build` e `docker build .` passam no template.

## Fase 3: appointments-service

Objetivo: primeiro corte real de microservico.

- [x] Criar diretorio/repo `appointments-service` fora do monorepo atual.
- [ ] Inicializar projeto Node/Nest.
- [ ] Migrar controller/provider/regras de appointments.
- [ ] Copiar apenas contratos publicos necessarios.
- [ ] Remover imports de `src/nest/*`, `apps/*` e `packages/domains/*`.
- [ ] Criar banco/schema proprio.
- [ ] Criar migrations proprias.
- [ ] Publicar eventos de dominio.
- [ ] Adicionar CI/CD independente.
- [ ] Apontar gateway para o servico externo.
- [ ] Remover fallback local de appointments quando validado.

Gate de saida:

- appointments roda fora do monorepo;
- gateway chama appointments por URL interna;
- testes do repo appointments passam isolados;
- deploy de appointments nao exige deploy dos demais repos.

## Fase 4: api-gateway

Objetivo: separar a borda HTTP externa.

- [x] Criar diretorio/repo `api-gateway` fora do monorepo atual.
- [ ] Migrar auth, rate limit, proxy, erro e observabilidade.
- [ ] Remover regra de negocio de dominios.
- [ ] Configurar URLs internas dos servicos.
- [ ] Adicionar CI/CD independente.

Gate de saida:

- gateway nao importa modules Nest dos servicos;
- frontend chama apenas o gateway;
- gateway sobe e faz proxy para appointments externo.

## Fase 5: frontend

Objetivo: separar a UI da API.

- [x] Criar diretorio/repo `frontend` fora do monorepo atual.
- [ ] Migrar `apps/frontend/public` ou substituir por build dedicado.
- [ ] Configurar `API_BASE_URL` ou proxy equivalente.
- [ ] Adicionar CI/CD independente.

Gate de saida:

- frontend publica separado;
- chamadas externas passam apenas pelo gateway.

## Fase 6: servicos de suporte

Objetivo: repetir o corte com o molde ja validado.

- [x] Criar `customers-service`.
- [x] Criar `services-service`.
- [x] Criar `professionals-service`.
- [ ] Criar banco/schema proprio por servico.
- [ ] Publicar contratos HTTP/eventos por servico.
- [ ] Ajustar gateway.
- [ ] Remover fallbacks locais.

Gate de saida:

- cada servico tem repo, banco, pipeline e deploy proprios;
- nenhum servico acessa banco ou codigo interno de outro.

## Fase 7: infra e operacao

Objetivo: centralizar operacao sem centralizar regra de negocio.

- [x] Criar repo `infra`.
- [ ] Mover compose local/app-only e docs operacionais.
- [ ] Adicionar event bus.
- [ ] Adicionar OpenTelemetry.
- [ ] Adicionar metricas, dashboards e alertas.
- [ ] Documentar rollback por servico.

Gate de saida:

- cada deploy e observavel ponta a ponta;
- rollback de um servico nao exige rollback dos outros;
- o monorepo atual pode ser aposentado.
