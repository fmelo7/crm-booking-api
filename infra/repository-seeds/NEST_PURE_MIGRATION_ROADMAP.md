# Roadmap: migracao dos services para Nest puro

Este roadmap guia a migracao dos quatro microservices de um runtime hibrido Nest + Express manual para um runtime mais idiomatico de NestJS.

Services no escopo:

- `appointments-service`
- `customers-service`
- `services-service`
- `professionals-service`

Fora do escopo inicial:

- `api-gateway`, porque ele e um gateway Express/proxy e tem natureza diferente dos services de dominio.
- Conversao para TypeScript. A migracao pode continuar em CommonJS/JavaScript primeiro.

## Estado atual

Os services ja usam Nest para modules, controllers, providers e filtros:

- `src/app.module.js`
- `src/nest/*/*.controller.js`
- `src/nest/*/*.module.js`
- `src/nest/common/http-exception.filter.js`

Mas o bootstrap ainda usa o Express interno diretamente:

- `nestApp.getHttpAdapter().getInstance()`
- middlewares Express manuais
- rotas Express para metrics e Swagger
- handlers Express `notFound` e `errorHandler`
- estado de saude via `expressApp.set('dbConnected', ...)`

## Objetivo

Chegar a services onde o fluxo principal seja Nest:

- `NestFactory.create(AppModule)`
- configuracao via `nestApp.use(...)`, `enableCors`, filtros, pipes e modules Nest
- health, metrics e docs expostos por controllers/modules Nest ou por integracoes registradas no bootstrap sem manipular diretamente o Express instance
- bootstrap com responsabilidade clara de criar, configurar e iniciar o Nest app

## Principios

- Migrar um service piloto primeiro: `services-service`.
- Preservar contratos HTTP existentes.
- Preservar `/api/health`, `/api/metrics`, `/api-docs` e `/api-docs/openapi.json`.
- Manter testes smoke passando a cada fase.
- Replicar para os outros services somente depois do piloto estabilizar.
- Evitar renomeacoes grandes antes de reduzir o hibridismo Express.

## Fase 1: piloto com bootstrap Nest-first

Status: concluida para `services-service`.

Service piloto: `services-service`.

Tarefas:

- [x] Fazer `createServicesServiceApp.js` configurar o app via `nestApp.use(...)` em vez de receber `expressApp` como superficie principal.
- [x] Manter retorno `{ nestApp, expressApp }` temporariamente para compatibilidade com testes e `server.js`.
- [x] Isolar estado de database health em um provider simples ou helper compartilhado, reduzindo uso direto de `expressApp.set`.
- [x] Garantir que `/api/health`, `/api/metrics`, `/api-docs` e rotas de dominio continuem iguais.

Criterios de aceite:

- [x] `npm test --prefix infra/repository-seeds/services-service`
- [x] `npm run build --prefix infra/repository-seeds/services-service`
- [x] Nenhum consumidor importa `app.js`.
- [x] Nenhuma regressao em status code ou payload de health/metrics/docs.

Notas:

- `createServicesServiceApp.js` ainda usa `getHttpAdapter().getInstance()` apenas para retorno temporario e rotas legadas de metrics/docs.
- `src/healthState.js` centraliza o estado transitorio de conexao ate a Fase 2 migrar isso para um provider Nest.

## Fase 2: health Nest-native

Status: concluida para `services-service`.

Tarefas:

- [x] Substituir dependencia de `expressApp.set('dbConnected')` por um provider Nest, por exemplo `HealthState`.
- [x] Ajustar `server.js` para marcar conexao de banco pelo provider.
- [x] Garantir que `HealthController` leia esse estado via DI.
- [x] Remover leituras diretas de estado Express no health.

Criterios de aceite:

- [x] Health retorna o mesmo formato atual.
- [x] Testes conseguem alternar estado conectado/desconectado sem acessar internals do Express.
- [x] Smoke tests do piloto passam.

Notas:

- `src/nest/health/health.state.js` e um provider Nest registrado e exportado pelo `HealthModule`.
- `server.js` e testes usam `nestApp.get(HealthState)` para alterar o estado de conexao.

## Fase 3: metrics como controller/module Nest

Status: concluida para `services-service`.

Tarefas:

- [x] Criar `MetricsModule` e `MetricsController`.
- [x] Reaproveitar a logica atual de `src/observability/metrics.js`.
- [x] Remover `app.get('/api/metrics', metricsHandler)` do bootstrap.
- [x] Aplicar rate limit e auth mantendo `/api/metrics` publico, se esse continuar sendo o contrato.

Criterios de aceite:

- [x] `/api/metrics` continua retornando formato Prometheus atual.
- [x] Smoke test valida `http_requests_total`.
- [x] Bootstrap fica sem rota Express manual de metrics.

Notas:

- `src/nest/metrics/metrics.controller.js` renderiza `renderMetrics()` e preserva o content type Prometheus.
- `src/nest/metrics/metrics.module.js` foi importado em `src/app.module.js`.

## Fase 4: docs como module Nest

Status: concluida para `services-service`.

Tarefas:

- [x] Criar `DocsModule` e `DocsController`.
- [x] Servir `/api-docs` e `/api-docs/openapi.json` via Nest controller.
- [x] Avaliar melhor forma para assets do Swagger UI:
  - manter `swagger-ui-dist` com assets estaticos;
  - ou migrar para `@nestjs/swagger` se passarmos a gerar docs por decorators.
- [x] Remover `registerSwaggerDocs(app)` do bootstrap.

Criterios de aceite:

- [x] `/api-docs` abre a Swagger UI.
- [x] `/api-docs/openapi.json` retorna o contrato correto.
- [x] Smoke test cobre HTML e JSON.

Notas:

- `src/nest/docs/docs.controller.js` serve o HTML, o contrato OpenAPI e os assets de `swagger-ui-dist`.
- `src/docs/swagger.js` foi removido do `services-service`.

## Fase 5: middlewares e filtros idiomaticos

Status: concluida para `services-service`.

Tarefas:

- [x] Revisar `securityHeaders`, `cors`, `requestLogger`, `internalServiceAuth` e `rateLimiter`.
- [x] Manter middlewares simples com `nestApp.use(...)` quando fizer sentido.
- [x] Converter para Nest middleware/guard quando houver ganho real:
  - `internalServiceAuth` e candidato a guard/middleware Nest.
  - `rateLimiter` pode continuar middleware ou virar guard/interceptor depois.
- [x] Remover `notFound` e `errorHandler` Express quando o `HttpExceptionFilter` cobrir os casos.

Criterios de aceite:

- [x] Erros de validacao e dominio mantem formato atual.
- [x] 404 mantem formato esperado.
- [x] Auth interna continua bloqueando rotas privadas e liberando public paths.

Notas:

- `HttpExceptionFilter` agora normaliza 404 para `NOT_FOUND`/`Rota não encontrada` e faz fallback seguro para 500.
- `notFound` e `errorHandler` Express nao sao mais registrados no bootstrap do `services-service`.
- `internalServiceAuth`, headers, CORS, logger e rate limit continuam como middlewares simples via `nestApp.use(...)`.

## Fase 6: padrao final de bootstrap

Status: concluida para `services-service`.

Tarefas:

- [x] Decidir nome final:
  - manter `createServicesServiceApp.js`; ou
  - migrar para `src/main.js`/`main.js` mais idiomatico do Nest.
- [x] Remover retorno de `expressApp` quando testes e server nao precisarem mais dele.
- [x] Atualizar READMEs com o novo modelo.

Criterios de aceite:

- [x] Bootstrap nao usa `getHttpAdapter().getInstance()` para configurar comportamento de produto.
- [x] Testes usam `nestApp.getHttpServer()` ou helpers Nest-friendly.
- [x] Service continua rodando com `npm start`.

Notas:

- O piloto manteve o nome `createServicesServiceApp.js` para reduzir churn enquanto os demais services ainda seguem o padrao antigo.
- O factory retorna apenas `{ nestApp }`.
- A remocao de `X-Powered-By` passou para o middleware `securityHeaders`, evitando acesso direto ao Express instance.

## Fase 7: replicacao para os outros services

Depois do piloto aprovado:

- Aplicar o mesmo padrao em `customers-service`.
- Aplicar o mesmo padrao em `professionals-service`.
- Aplicar o mesmo padrao em `appointments-service`.

Ordem sugerida:

1. `customers-service`
2. `professionals-service`
3. `appointments-service`

Motivo: appointments tende a ter mais regras e dependencias de dominio, entao deve ser o ultimo.

Criterios de aceite por service:

- `npm test --prefix infra/repository-seeds/<service>`
- `npm run build --prefix infra/repository-seeds/<service>`
- Swagger, health, metrics e CRUD smoke continuam passando.

## Fase 8: limpeza final

Tarefas:

- Remover helpers Express que nao forem mais usados.
- Remover exports temporarios das factories.
- Remover docs antigas se ficarem redundantes.
- Verificar Dockerfiles e docker-compose.
- Rodar suite de seeds completa.

Criterios de aceite:

- `rg "getHttpAdapter\\(\\)\\.getInstance" infra/repository-seeds/*-service` nao retorna uso de configuracao de produto.
- `rg "app\\.get\\('/api/metrics'|registerSwaggerDocs|expressApp\\.set" infra/repository-seeds/*-service` nao retorna uso nos services migrados.
- Testes e builds dos quatro services passam.

## Comandos de verificacao

```bash
npm test --prefix infra/repository-seeds/services-service
npm run build --prefix infra/repository-seeds/services-service

npm test --prefix infra/repository-seeds/customers-service
npm run build --prefix infra/repository-seeds/customers-service

npm test --prefix infra/repository-seeds/professionals-service
npm run build --prefix infra/repository-seeds/professionals-service

npm test --prefix infra/repository-seeds/appointments-service
npm run build --prefix infra/repository-seeds/appointments-service
```

## Primeiro passo recomendado

Comecar pela Fase 1 no `services-service`, mantendo a API publica exatamente igual e reduzindo apenas a superficie Express do bootstrap.
