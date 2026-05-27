# Roadmap para microserviços independentes

Objetivo: evoluir o projeto de um monólito modular em NestJS para uma arquitetura de microserviços com vida própria, sem criar uma biblioteca compartilhada gigante que acople todos os serviços.

Desenho alvo:

```
[frontend]
  -> HTTPS GET/POST/PUT/DELETE
[api-gateway / camada de segurança]
  -> autenticação, autorização, rate limit, auditoria, roteamento
[appointments-service] <-> [customers-service] <-> [services-service] <-> [professionals-service]
  -> comunicação por APIs internas e eventos de domínio
[infra]
  -> bancos por serviço, filas/event bus, logs, métricas, tracing, ELK/OpenSearch, alertas
```

Regra principal: cada microserviço deve conseguir evoluir, testar, publicar e trocar sua infraestrutura sem depender diretamente do código interno dos outros.

**1. Estado atual**

- Runtime principal em NestJS.
- Camada Express antiga removida.
- `apps/api` é o entrypoint HTTP principal.
- `apps/frontend/public` é a fronteira atual do frontend.
- `apps/appointments-service` existe como placeholder da primeira extração.
- `packages/domains/*` concentra domínio, validações, repositories e adapters por domínio.
- `packages/shared/common` concentra utilitários neutros.
- `packages/contracts` existe para contratos compartilháveis.

Esse estado ainda é monólito modular. Os pacotes ajudam a organizar a extração, mas não devem virar dependência obrigatória entre microserviços no longo prazo.

**2. Princípios de arquitetura**

- Microserviços não compartilham banco de dados no destino final.
- Microserviços não importam repositories, models Mongoose, queries SQL ou providers internos de outros serviços.
- O compartilhamento permitido deve ser pequeno e estável: contratos, nomes de eventos, schemas públicos e tipos simples.
- Regras de negócio pertencem ao serviço dono do domínio.
- Comunicação síncrona deve passar por APIs internas bem definidas.
- Comunicação assíncrona deve usar eventos de domínio.
- O gateway cuida de segurança, identidade, rate limit e roteamento externo.
- Observabilidade deve ser transversal: logs estruturados, métricas, tracing e correlação por request id.

**3. Contratos públicos de appointments**

Status: concluído na primeira versão.

Antes de extrair qualquer serviço, formalizar em `packages/contracts`:

- DTOs públicos de `appointments`;
- status permitidos de appointment;
- formatos de IDs e datas;
- eventos:
  - `appointment.created`;
  - `appointment.rescheduled`;
  - `appointment.cancelled`;
  - `appointment.completed`;
- payloads versionados para cada evento;
- erros públicos esperados, como conflito de agenda e entidade não encontrada.

Importante: `packages/contracts` não deve importar NestJS, Mongoose, `pg`, repositories ou código de infraestrutura.

Implementado:

- `appointment.constants.js` com versão de contrato e status.
- `appointment.schemas.js` com DTOs públicos, queries, recurso e eventos versionados.
- `appointment.errors.js` com códigos de erro públicos.
- `appointment.events.js` usando a mesma versão do contrato.
- `packages/domains/appointment/validation` passou a consumir os schemas públicos.
- testes garantem validação de DTO/evento e ausência de imports de infraestrutura no pacote de contratos.

**4. Separar domínio puro de infraestrutura**

Status: concluído para `appointments` na primeira versão.

Estrutura aplicada:

```text
packages/domains/appointment/
  appointment.repository.js
  rules/
  validation/
  docs/
  infrastructure/
    mongo/
    postgres/
```

Meta:

- regras puras podem ser testadas sem banco;
- adapters Mongo/Postgres ficam isolados;
- controllers Nest continuam em `apps/api` ou `src/nest`;
- `appointments-service` poderá copiar ou assumir seu domínio sem carregar outros serviços junto.

Implementado:

- regras movidas para `packages/domains/appointment/rules`;
- validação movida para `packages/domains/appointment/validation`;
- Swagger movido para `packages/domains/appointment/docs`;
- model/repository Mongo movidos para `packages/domains/appointment/infrastructure/mongo`;
- repository Postgres movido para `packages/domains/appointment/infrastructure/postgres`;
- `appointment.repository.js` ficou como seletor estável de adapter por provider;
- imports do Nest e testes atualizados para as novas fronteiras.

**5. Criar o api-gateway**

Status: concluído na primeira versão.

Evoluir `apps/api` para papel de gateway:

- validar token OAuth/JWT;
- resolver usuário/tenant/permissões;
- aplicar rate limit;
- emitir `x-request-id` e contexto de auditoria;
- rotear chamadas para módulos locais ou serviços extraídos;
- padronizar respostas de erro.

No início, `apps/api` ainda pode chamar providers locais. Após extrações, passa a chamar HTTP interno, gRPC ou mensageria.

Implementado:

- `apps/api/gateway.js` criado como camada explícita de gateway.
- contexto `req.gateway` com auth, rota pública e alvo lógico.
- header `x-gateway-runtime` emitido nas respostas.
- `GATEWAY_AUTH_MODE=disabled` preserva comportamento local/dev.
- `GATEWAY_AUTH_MODE=bearer` exige `Authorization: Bearer <token>` em rotas `/api`, exceto rotas públicas.
- `GATEWAY_BEARER_TOKENS` configura tokens aceitos para a primeira versão.
- `GATEWAY_PUBLIC_PATHS` permite liberar prefixos extras.
- health, docs e frontend permanecem públicos por padrão.
- testes cobrem bloqueio de rota protegida e health público com auth ligada.

**6. Extrair primeiro: appointments-service**

Status: concluído na primeira versão de boot separado.

Começar por appointments porque concentra as regras mais sensíveis:

- disponibilidade;
- conflito de horários;
- criação de appointment;
- reagendamento;
- cancelamento;
- conclusão;
- histórico.

Primeira versão sugerida:

```text
apps/appointments-service/
  server.js
  src/
    appointment.controller.js
    appointment.provider.js
    appointment.repository.js
    appointment.events.js
```

Esse serviço deve ter testes próprios e boot próprio.

Critério de pronto:

- sobe separado da API;
- possui health check próprio;
- tem banco ou schema próprio;
- publica eventos de domínio;
- não importa provider/controller/repository de `apps/api`;
- usa apenas `packages/contracts` e utilitários realmente neutros.

Implementado:

- `apps/appointments-service/server.js` criado como processo HTTP próprio.
- `apps/appointments-service/createAppointmentsServiceApp.js` criado como factory NestJS própria.
- `apps/appointments-service/src/app.module.js` importa apenas appointments e health.
- scripts `start:appointments` e `dev:appointments` adicionados.
- `APPOINTMENTS_SERVICE_PORT` documentado, com padrão `3001`.
- serviço expõe `/api/health` e `/api/appointments`.
- serviço não expõe rotas de customers, services ou professionals.
- testes próprios garantem health, rota de appointments e ausência de customers.

Ainda pendente para os próximos itens:

- mover o tráfego real do gateway para esse serviço;
- publicar eventos de domínio;
- separar banco/schema de appointments;
- reduzir reutilização transitória de providers internos do monólito.

**7. Comunicação entre serviços**

Status: concluído na primeira versão para gateway -> appointments-service.

Começar simples:

- Gateway -> appointments-service via REST interno.
- appointments-service consulta dados mínimos de customers/services/professionals por APIs internas quando necessário.

Implementado:

- `apps/api/serviceProxy.js` criado para proxy HTTP interno.
- `APPOINTMENTS_SERVICE_URL` configura o alvo do `appointments-service`.
- quando `APPOINTMENTS_SERVICE_URL` está definido, `/api/appointments/*` é encaminhado pelo gateway.
- quando `APPOINTMENTS_SERVICE_URL` não está definido, o fluxo local do monólito continua funcionando.
- gateway propaga `x-request-id`, headers de forwarding e sujeito autenticado quando existir.
- respostas encaminhadas recebem `x-gateway-target: appointments-service`.
- falhas de upstream retornam `502 UPSTREAM_UNAVAILABLE`.
- testes cobrem resolução da URL interna e proxy de `/api/appointments`.

Depois evoluir:

- cache local de dados de leitura;
- eventos para sincronizar projeções;
- mensageria para fluxos assíncronos.

Evitar no início:

- transação distribuída;
- banco compartilhado;
- importar model/repository de outro serviço;
- chamada circular obrigatória entre serviços.

**8. Extrair services de suporte**

Status: concluído na primeira versão de boot separado.

Depois que appointments-service estiver estável:

1. `customers-service`
2. `services-service`
3. `professionals-service`

Cada serviço deve possuir:

- API própria;
- banco/tabelas próprias;
- health check;
- testes próprios;
- logs e métricas;
- contratos públicos;
- eventos de alteração relevantes.

Implementado:

- `apps/customers-service` criado com boot HTTP próprio, health e rotas de customers.
- `apps/services-service` criado com boot HTTP próprio, health e rotas de services.
- `apps/professionals-service` criado com boot HTTP próprio, health e rotas de professionals.
- scripts `start:*` e `dev:*` adicionados para os três serviços.
- portas dedicadas documentadas:
  - `CUSTOMERS_SERVICE_PORT=3002`;
  - `SERVICES_SERVICE_PORT=3003`;
  - `PROFESSIONALS_SERVICE_PORT=3004`.
- testes garantem que cada serviço expõe health, expõe seu domínio e não expõe rotas de outros domínios.

Ainda pendente para uma extração madura:

- banco/schema próprio por serviço;
- contratos públicos específicos de customers/services/professionals;
- eventos de alteração por serviço;
- gateway/proxy para esses serviços;
- redução da reutilização transitória de providers internos do monólito.

**9. Infraestrutura**

Status: concluído na primeira versão local.

Preparar gradualmente:

- Dockerfile por app;
- docker-compose local com gateway, serviços, bancos e fila;
- migrations por serviço;
- CI rodando testes por app/pacote;
- deploy independente por serviço;
- logs estruturados centralizados;
- métricas com Prometheus/OpenTelemetry;
- tracing distribuído;
- ELK/OpenSearch para consulta de logs;
- alertas por erro, latência e indisponibilidade.

Implementado:

- Dockerfile por app HTTP:
  - `apps/api/Dockerfile`;
  - `apps/appointments-service/Dockerfile`;
  - `apps/customers-service/Dockerfile`;
  - `apps/services-service/Dockerfile`;
  - `apps/professionals-service/Dockerfile`.
- `docker-compose.yml` com gateway, quatro serviços e MongoDB.
- healthchecks por container HTTP.
- volume persistente para MongoDB local.
- gateway configurado no compose para chamar `appointments-service`.
- `.dockerignore` criado para reduzir contexto de build e evitar `.env`/`node_modules`.
- scripts:
  - `npm run infra:up`;
  - `npm run infra:down`.
- `infra/README.md` documentando portas e limitações atuais.

Ainda pendente para uma infraestrutura madura:

- banco/schema próprio por serviço;
- fila/event bus;
- migrations por serviço;
- pipelines de deploy independentes;
- OpenTelemetry/tracing distribuído;
- stack ELK/OpenSearch pronta em compose;
- alertas.

**10. Segurança**

Status: concluído na primeira versão.

Camada de segurança no gateway:

- OAuth2/OIDC ou JWT validado no gateway;
- propagação de identidade para serviços internos;
- autorização por escopo/permissão;
- rate limit por usuário/IP/tenant;
- CORS no gateway;
- auditoria de ações sensíveis.

Serviços internos também devem validar chamadas internas:

- token interno ou mTLS no futuro;
- checagem de escopos internos;
- rejeitar chamadas sem contexto de identidade quando necessário.

Implementado:

- gateway mantém autenticação externa configurável por `GATEWAY_AUTH_MODE`.
- serviços internos passam a ter autenticação opcional por `x-internal-token`.
- `INTERNAL_SERVICE_TOKEN` ativa a proteção de rotas `/api` nos serviços.
- `/api/health` permanece público por padrão nos serviços internos.
- `INTERNAL_SERVICE_PUBLIC_PATHS` permite liberar prefixos extras.
- proxy do gateway propaga `x-internal-token` para `appointments-service`.
- `APPOINTMENTS_SERVICE_INTERNAL_TOKEN` permite token específico para appointments, com fallback para `INTERNAL_SERVICE_TOKEN`.
- docker-compose local configura `INTERNAL_SERVICE_TOKEN` entre gateway e serviços.
- testes cobrem rejeição sem token e propagação do token pelo gateway.

Ainda pendente para segurança madura:

- OAuth2/OIDC real no gateway;
- autorização por escopos/permissões;
- mTLS entre serviços;
- rotação/gestão segura de segredos;
- auditoria persistente de ações sensíveis.

**11. O que evitar**

Status: guardrails automatizados criados.

- Criar uma lib compartilhada com toda regra de negócio.
- Compartilhar model Mongoose ou entity SQL entre serviços.
- Fazer um serviço acessar diretamente o banco do outro.
- Fazer todos os serviços dependerem de `packages/domains/*`.
- Extrair todos os serviços ao mesmo tempo.
- Começar com mensageria complexa antes de estabilizar os contratos.

Implementado:

- `test/nest/architecture-boundaries.test.js` criado como suíte de proteção arquitetural.
- contratos não podem importar runtime, banco ou implementação de domínio.
- camadas puras de appointments não podem importar infraestrutura ou NestJS.
- apps de serviço não podem importar outros apps de serviço diretamente.
- app module de cada serviço só pode expor o próprio domínio e health.

Esses testes não eliminam todo acoplamento transitório ainda existente, mas impedem os acoplamentos mais perigosos de crescerem enquanto a extração amadurece.

**12. Ordem recomendada**

1. Formalizar contratos em `packages/contracts`. Concluído na primeira versão.
2. Separar domínio puro de infraestrutura em `packages/domains/appointment`. Concluído para appointments na primeira versão.
3. Transformar `apps/api` em gateway de segurança/roteamento. Concluído na primeira versão.
4. Criar boot real para `apps/appointments-service`. Concluído na primeira versão.
5. Mover fluxo de appointments para o serviço novo.
6. Fazer gateway chamar appointments-service. Concluído na primeira versão via REST configurável.
7. Adicionar eventos de domínio.
8. Separar banco/schema de appointments.
9. Adicionar observabilidade distribuída.
10. Só então extrair customers, services e professionals.

**13. Meta final**

Cada microserviço deve ter vida livre:

- deploy independente;
- banco próprio;
- testes próprios;
- contratos explícitos;
- observabilidade própria;
- regra de negócio local;
- dependência mínima de libs compartilhadas;
- integração com outros serviços por API/eventos, não por import interno.
