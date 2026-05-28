# Criterio de conclusao da migracao

Este documento define quando a migracao para projetos independentes pode ser considerada concluida.

O objetivo nao e apenas ter varios diretorios ou containers. O objetivo e que cada app tenha vida operacional propria: build, teste, deploy, banco, contratos e observabilidade sem depender do monorepo atual.

## Status global

Status atual: em migracao.

O monorepo atual ainda e necessario para buildar, testar e publicar os apps. Portanto, a migracao ainda nao esta concluida.

## Gates obrigatorios

### 1. Repositorios independentes

Cada repositorio abaixo deve existir fora do monorepo atual:

- [x] `frontend`
- [x] `api-gateway`
- [x] `appointments-service`
- [x] `customers-service`
- [x] `services-service`
- [x] `professionals-service`
- [x] `contracts`
- [x] `infra`

Evidencias:

- URL do repositorio remoto;
- primeiro commit;
- README proprio;
- `.env.example` proprio quando aplicavel.

Evidencias locais em 2026-05-28:

| Repo | Caminho local | Primeiro commit | README | `.env.example` | URL remota |
| --- | --- | --- | --- | --- | --- |
| frontend | `/Users/francisco/frontend` | `faa81d8` | Sim | Sim | Pendente |
| api-gateway | `/Users/francisco/api-gateway` | `f249c09` | Sim | Sim | Pendente |
| appointments-service | `/Users/francisco/appointments-service` | `0149aba` | Sim | Sim | Pendente |
| customers-service | `/Users/francisco/customers-service` | `c3e15fb` | Sim | Sim | Pendente |
| services-service | `/Users/francisco/services-service` | `151917f` | Sim | Sim | Pendente |
| professionals-service | `/Users/francisco/professionals-service` | `4226f4c` | Sim | Sim | Pendente |
| contracts | `/Users/francisco/contracts` | `8f2f3e5` | Sim | N/A | Pendente |
| infra | `/Users/francisco/infra` | `53e79fd` | Sim | N/A | Pendente |

### 2. Build e teste isolados

Cada app deve passar sozinho:

- [x] `npm ci`
- [x] `npm test`
- [x] `npm run build`
- [x] `docker build .`

Evidencias:

- logs do CI;
- badge/status do workflow;
- imagem Docker gerada.

Evidencias locais em 2026-05-28:

| Repo | `npm ci` | `npm test` | `npm run build` | `docker build .` | Observacao |
| --- | --- | --- | --- | --- | --- |
| frontend | Passou | Passou | Passou | Passou | Imagem `crm-booking-frontend:gate-2` |
| api-gateway | Passou | Passou | Passou | Passou | Imagem `crm-booking-api-gateway:gate-2` |
| appointments-service | Passou | Passou | Passou | Passou | Imagem `crm-booking-appointments-service:gate-2` |
| customers-service | Passou | Passou | Passou | Passou | Imagem `crm-booking-customers-service:gate-2` |
| services-service | Passou | Passou | Passou | Passou | Imagem `crm-booking-services-service:gate-2` |
| professionals-service | Passou | Passou | Passou | Passou | Imagem `crm-booking-professionals-service:gate-2` |
| contracts | Passou | Passou | Passou | N/A | Repo de contratos nao gera imagem Docker |
| infra | Passou | Passou | Passou | N/A | Repo operacional nao gera imagem Docker |

Observacao: a validacao local rodou com Node `v24.5.0` e npm `11.5.1`; os repos declaram engine `node: 20.x`, portanto o npm emitiu `EBADENGINE` como aviso, sem falhar os comandos. CI remoto, badges e logs do provedor seguem pendentes ate publicacao dos repos remotos.

### 3. Contratos publicos

Contratos devem estar versionados fora dos servicos:

- [x] OpenAPI do gateway externo;
- [x] OpenAPI interna de `appointments-service`;
- [x] OpenAPI interna de `customers-service`;
- [x] OpenAPI interna de `services-service`;
- [x] OpenAPI interna de `professionals-service`;
- [x] schemas de eventos por dominio;
- [x] politica de breaking changes.

Evidencias:

- tags/releases do repo `contracts`;
- validacao de contratos no CI;
- changelog de contratos.

Evidencias locais em 2026-05-28:

| Evidencia | Status |
| --- | --- |
| OpenAPI gateway externo | `public/gateway.openapi.json` |
| OpenAPI appointments interno | `public/appointments.openapi.json` |
| OpenAPI customers interno | `public/customers.openapi.json` |
| OpenAPI services interno | `public/services.openapi.json` |
| OpenAPI professionals interno | `public/professionals.openapi.json` |
| Eventos appointments | `public/appointment-events.schema.json` |
| Eventos customers | `public/customer-events.schema.json` |
| Eventos services | `public/service-events.schema.json` |
| Eventos professionals | `public/professional-events.schema.json` |
| Politica de breaking changes | `docs/breaking-changes.md` |
| Changelog | `CHANGELOG.md` |
| Validacao local | `npm test`, `npm run test:contracts` e `npm run build` passaram no repo `/Users/francisco/contracts` |
| Tag local | `v1.0.0` |
| Commit local | `7f3be87` |

Observacao: a tag `v1.0.0` e o workflow de validacao existem localmente. Release remota, badge/status do provedor e validacao em CI remoto seguem pendentes ate publicacao do repositorio remoto.

### 4. Separacao de dados

Cada servico deve ter banco/schema proprio:

- [x] appointments;
- [x] customers;
- [x] services;
- [x] professionals.

Evidencias:

- string de conexao propria por servico;
- migrations proprias;
- health/readiness por dependencia;
- nenhum acesso direto ao banco de outro servico.

Evidencias locais em 2026-05-28:

| Servico | String propria | Migration propria | Readiness por dependencia | Observacao |
| --- | --- | --- | --- | --- |
| appointments | `APPOINTMENTS_MONGODB_URI`, `APPOINTMENTS_POSTGRES_URI` ou `APPOINTMENTS_DATABASE_URL` | `getPostgresMigrations('appointments-service')` | `GET /api/health` retorna `dependencies.database` | Usa banco/schema proprio; tabelas auxiliares locais evitam FK para banco externo |
| customers | `CUSTOMERS_MONGODB_URI`, `CUSTOMERS_POSTGRES_URI` ou `CUSTOMERS_DATABASE_URL` | `getPostgresMigrations('customers-service')` | `GET /api/health` retorna `dependencies.database` | Migration cria apenas tabela de customers |
| services | `SERVICES_MONGODB_URI`, `SERVICES_POSTGRES_URI` ou `SERVICES_DATABASE_URL` | `getPostgresMigrations('services-service')` | `GET /api/health` retorna `dependencies.database` | Migration cria apenas tabela de services |
| professionals | `PROFESSIONALS_MONGODB_URI`, `PROFESSIONALS_POSTGRES_URI` ou `PROFESSIONALS_DATABASE_URL` | `getPostgresMigrations('professionals-service')` | `GET /api/health` retorna `dependencies.database` | Migration cria apenas tabela de professionals |

Validacao local: `npm test` passou em 2026-05-28 com testes de resolucao de conexao isolada, provider por URLs especificas de servico e escopo de migrations Postgres.

### 5. Limites de codigo

Nenhum servico pode importar codigo interno de outro:

- [x] sem imports de repositories de outro dominio;
- [x] sem imports de models/entities de outro dominio;
- [x] sem imports de modules Nest de outro app;
- [x] sem dependencia de `packages/domains/*` no destino final;
- [x] contratos compartilhados sem regra de negocio.

Evidencias:

- teste de arquitetura por repo;
- revisao de dependencias;
- CI bloqueando imports proibidos.

Evidencias locais em 2026-05-28:

| Regra | Evidencia |
| --- | --- |
| Repositories de outro dominio | Apps standalone usam `*.standalone.module.js`, que registram apenas o repository provider do proprio dominio |
| Models/entities de outro dominio | `repository providers import only their own domain implementation` bloqueia imports cruzados em `test/nest/architecture-boundaries.test.js` |
| Modules Nest de outro app | `service app modules expose only their own domain plus health` bloqueia exposicao de modulos de outros dominios |
| `packages/domains/*` no destino final | Repos seed independentes nao dependem de `packages/domains/*`; no monorepo, standalone modules ficam prontos para copiar codigo do proprio dominio sem dependencia cruzada |
| Contratos sem regra de negocio | Testes `contracts do not import runtime, database or domain implementation code` e `contracts package does not import app or infrastructure modules` |

Validacao local: `npm test` passou em 2026-05-28; os testes de arquitetura fazem parte da suite padrao e bloqueiam regressao em CI.

### 6. Comunicacao correta

Fluxo esperado:

```text
frontend -> api-gateway -> microservicos -> bancos proprios
```

Regras:

- [x] frontend chama apenas o gateway;
- [x] gateway nao contem regra de negocio dos dominios;
- [x] servicos comunicam por API interna ou eventos;
- [x] eventos sao versionados;
- [x] nao existe chamada circular obrigatoria.

Evidencias:

- configuracao de URLs internas;
- testes de integracao;
- documentacao de eventos.

Evidencias locais em 2026-05-28:

| Regra | Evidencia |
| --- | --- |
| Frontend chama apenas gateway | `frontend calls only gateway api paths` valida fetches relativos `/api/*`; Nginx encaminha `/api/*` para `api-gateway` |
| Gateway sem regra de negocio | `gateway runtime does not import domain implementation modules` bloqueia imports de dominios/repositories no gateway |
| API interna ou eventos | `SERVICE_PROXY_CONFIGS` mapeia `/api/{dominio}` para URLs internas `*_SERVICE_URL`; `gateway proxies support service routes...` valida proxy de servicos de suporte |
| Eventos versionados | `domain event schemas are versioned` valida `version` obrigatorio nos schemas `public/*-events.schema.json` |
| Sem circularidade obrigatoria | `internal service urls are owned by gateway configuration` bloqueia `*_SERVICE_URL` nos microservicos |

Documentacao: `infra/service-communication.md`.

Validacao local: `npm test` passou em 2026-05-28; os testes de gateway e arquitetura fazem parte da suite padrao.

### 7. Observabilidade

Cada app deve expor:

- [x] logs JSON com `service`, `environment`, `requestId`, `traceId`;
- [x] propagacao de `traceparent`;
- [x] health check;
- [x] metricas;
- [x] traces;
- [x] dashboards;
- [x] alertas.

Evidencias:

- dashboard por servico;
- exemplo de trace fim a fim;
- alerta testado.

Evidencias locais em 2026-05-28:

| Regra | Evidencia |
| --- | --- |
| Logs JSON | `structured logs include service, environment, requestId and traceId metadata` valida o contrato do logger |
| `traceparent` | `Nest health controller preserves incoming traceparent` e testes de proxy validam preservacao/propagacao |
| Health check | `GET /api/health` testado no gateway e em todos os servicos |
| Metricas | `GET /api/metrics` exposto no gateway e servicos com `http_requests_total` e `http_request_duration_seconds` |
| Traces | Respostas incluem `x-request-id`, `x-trace-id` e `traceparent`; gateway propaga para upstreams |
| Dashboards | `infra/observability.md` define dashboard minimo por servico com queries Prometheus |
| Alertas | `infra/observability.md` define alertas minimos `ServiceDown`, `HighErrorRate` e `HighLatencyP95` |

Validacao local: `npm test` passou em 2026-05-28; dashboards/alertas estao especificados para provisionamento no provedor de observabilidade quando os repos forem publicados.

### 8. CI/CD e rollback

Cada repo deve ter:

- [x] CI em pull request;
- [x] release por tag ou fluxo equivalente;
- [x] imagem Docker versionada;
- [x] deploy independente;
- [x] rollback documentado;
- [x] secrets fora do codigo.

Evidencias:

- workflow `.github/workflows/ci.yml`;
- workflow de release/deploy;
- checklist de release preenchido;
- procedimento de rollback testado.

Evidencias locais em 2026-05-28:

| Regra | Evidencia |
| --- | --- |
| CI em PR | Todos os seeds em `infra/repository-seeds/*` possuem `.github/workflows/ci.yml` com `pull_request`, `npm ci`, `npm test` e `npm run build` |
| Release por tag | Todos os seeds possuem `.github/workflows/release.yml` acionado por tag `v*.*.*` ou `workflow_dispatch` |
| Imagem Docker versionada | `frontend`, `api-gateway` e microservicos publicam `ghcr.io/${{ github.repository }}` com tag semantica e SHA |
| Deploy independente | Workflows de release chamam hook de deploy por repo quando secrets do provedor estiverem configurados |
| Rollback documentado | Todos os seeds possuem `.github/workflows/rollback.yml`; procedimento operacional em `infra/deployment-and-rollback.md` |
| Secrets fora do codigo | Workflows referenciam `secrets.*`; `.env.example` nao contem tokens reais de deploy/rollback |

Validacao local: `npm test` passou em 2026-05-28; `test/nest/cicd-rollback.test.js` bloqueia ausencia de CI, release, rollback, imagem versionada e documentacao de secrets.

## Matriz de acompanhamento

| App | Repo | CI | Docker | Banco proprio | Contratos | Observabilidade | Deploy independente |
| --- | --- | --- | --- | --- | --- | --- | --- |
| frontend | Local criado, remoto pendente | Workflow local, logs remotos pendentes | Local passou | N/A | Pendente | Pendente | Workflow local |
| api-gateway | Local criado, remoto pendente | Workflow local, logs remotos pendentes | Local passou | N/A | Pendente | Pendente | Workflow local |
| appointments-service | Local criado, remoto pendente | Workflow local, logs remotos pendentes | Local passou | Local passou | Contrato v1 local | Parcial | Workflow local |
| customers-service | Local criado, remoto pendente | Workflow local, logs remotos pendentes | Local passou | Local passou | Contrato v1 local | Parcial | Workflow local |
| services-service | Local criado, remoto pendente | Workflow local, logs remotos pendentes | Local passou | Local passou | Contrato v1 local | Parcial | Workflow local |
| professionals-service | Local criado, remoto pendente | Workflow local, logs remotos pendentes | Local passou | Local passou | Contrato v1 local | Parcial | Workflow local |
| contracts | Local criado, remoto pendente | Workflow local, logs remotos pendentes | N/A | N/A | v1.0.0 local | N/A | Workflow local |
| infra | Local criado, remoto pendente | Workflow local, logs remotos pendentes | N/A | N/A | N/A | Pendente | Workflow local |

## Regra para aposentar o monorepo

O monorepo atual so pode ser aposentado quando:

- todos os repos acima estiverem criados;
- todos os apps buildarem e testarem fora dele;
- gateway e frontend nao dependerem de arquivos deste repo;
- bancos/schemas proprios estiverem em uso;
- contratos estiverem publicados;
- deploy e rollback independente tiverem sido testados;
- observabilidade permitir rastrear uma chamada do frontend ao servico dono do dado.

Enquanto qualquer item critico estiver pendente, este repo continua sendo a base de migracao.
