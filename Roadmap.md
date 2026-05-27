# Roadmap para projetos Nest independentes

Objetivo: transformar o projeto atual em um conjunto de aplicações Node/Nest separadas, cada uma com seu proprio repositorio, pipeline, deploy, banco, contratos e observabilidade. O repositorio atual deixa de ser o destino final e passa a ser a base de extracao.

Desenho alvo:

```text
[frontend-app]
  -> HTTPS GET/POST/PUT/DELETE
[api-gateway]
  -> OAuth/OIDC, autorizacao, rate limit, auditoria, roteamento
[appointments-service] <-> [customers-service] <-> [services-service] <-> [professionals-service]
  -> APIs internas e eventos de dominio
[infra/platform]
  -> bancos por servico, event bus, observabilidade, segredos, deploy, alertas
```

Regra principal: nenhum microservico deve depender do codigo interno, banco, repository, model, provider ou module Nest de outro microservico. A integracao deve acontecer por API, eventos e contratos publicos versionados.

**1. Estado atual**

Status: base de migracao preparada.

- Runtime principal em NestJS.
- Camada Express legada removida do caminho principal.
- `apps/api` funciona como gateway inicial.
- `apps/frontend/public` e a fronteira atual do frontend.
- `apps/appointments-service`, `apps/customers-service`, `apps/services-service` e `apps/professionals-service` ja possuem boot HTTP separado.
- `docker-compose.yml` sobe gateway, servicos e MongoDB local.
- Gateway ja consegue encaminhar `/api/appointments/*` para `appointments-service`.
- Seguranca interna inicial existe via `x-internal-token`.
- Observabilidade inicial existe com `SERVICE_NAME`, `x-request-id`, `x-trace-id` e logs JSON.
- `packages/contracts` e `packages/domains/*` ajudam a organizar a extracao, mas nao devem virar uma dependencia obrigatoria entre repositorios.

Esse estado ainda e um monorepo modular. O proximo passo nao e aumentar a lib compartilhada, e sim copiar, isolar e estabilizar cada aplicacao em seu proprio projeto.

**2. Repositorios alvo**

Criar repositorios separados:

- `frontend`
- `api-gateway`
- `appointments-service`
- `customers-service`
- `services-service`
- `professionals-service`
- `contracts`
- `infra`

O repositorio `contracts` deve ser pequeno e estavel. Ele pode conter OpenAPI specs, JSON Schemas, nomes de eventos, exemplos de payload e clientes gerados, mas nao deve conter regra de negocio, repositories, models de banco, modules Nest ou providers internos.

O repositorio `infra` deve concentrar compose local, manifests, IaC, observabilidade, secrets templates, pipelines compartilhados e documentacao operacional. Ele nao deve conter regra de negocio dos servicos.

**3. Como separar fisicamente cada app**

Status: proximo passo pratico.

Nao criar `git init` dentro de `apps/*` no monorepo atual. Isso criaria repositorios aninhados e deixaria o versionamento confuso. Criar cada projeto novo como diretorio irmao do repositorio atual.

Estrutura local recomendada:

```text
/Users/francisco/
  crm-booking-api/          # repo atual, base de extracao
  appointments-service/     # novo repo independente
  api-gateway/              # novo repo independente
  frontend/                 # novo repo independente
  customers-service/        # novo repo independente
  services-service/         # novo repo independente
  professionals-service/    # novo repo independente
  contracts/                # contratos versionados
  infra/                    # infraestrutura operacional
```

Passo a passo para cada backend Nest:

1. Criar o diretorio fora do monorepo atual.
2. Entrar no diretorio novo.
3. Inicializar o projeto Node/Nest.
4. Instalar dependencias necessarias.
5. Copiar do monorepo apenas o codigo do dominio daquele servico.
6. Copiar ou recriar health, config, observabilidade, filtros de erro e testes.
7. Remover qualquer import para `../crm-booking-api`, `src/nest/*`, `apps/*` ou `packages/domains/*`.
8. Criar `.env.example`, `Dockerfile`, `README.md` e workflow de CI.
9. Rodar `npm test` e `npm run build`.
10. Inicializar o Git no diretorio novo.
11. Fazer o primeiro commit.
12. Criar o repositorio remoto e enviar o codigo.

Comandos base, ajustando o nome do app:

```bash
cd /Users/francisco
mkdir appointments-service
cd appointments-service
npm init -y
git init
```

Se for usar o Nest CLI para gerar a base, criar o projeto diretamente fora do monorepo:

```bash
cd /Users/francisco
npx @nestjs/cli new appointments-service
cd appointments-service
git init
```

Observacao: `git init` deve acontecer no novo diretorio independente, nao dentro de `crm-booking-api/apps/appointments-service`.

**4. Padrao minimo de cada projeto Nest**

Cada backend deve ser um projeto Node/Nest proprio:

```text
appointments-service/
  src/
    main.ts
    app.module.ts
    health/
    appointments/
    infrastructure/
    observability/
  test/
  Dockerfile
  package.json
  README.md
  .env.example
  .github/workflows/ci.yml
```

Cada projeto deve ter:

- `npm test` local e no CI;
- `npm run build`;
- Dockerfile proprio;
- health check em `/api/health`;
- logs JSON com `service`, `requestId` e `traceId`;
- validacao de entrada;
- tratamento padronizado de erro;
- configuracao propria de banco;
- migrations ou estrategia explicita de schema;
- README com variaveis, portas, endpoints e eventos;
- pipeline independente de build, test e deploy.

**5. Contratos antes da separacao fisica**

Status: proximo passo recomendado.

Antes de cortar repositorios, congelar contratos publicos:

- OpenAPI do gateway externo;
- OpenAPI interna de cada servico;
- schemas de eventos por dominio;
- codigos de erro publicos;
- estrategia de versionamento;
- exemplos de request/response;
- compatibilidade minima esperada entre versoes.

Saida esperada:

- criar ou consolidar `contracts`;
- publicar contratos por versao;
- CI validando breaking changes;
- gateway e servicos usando contratos como referencia, nao como acesso a codigo interno.

**6. Extrair primeiro o appointments-service**

Status: primeiro corte real.

Appointments deve ser o primeiro repositorio separado porque concentra o fluxo mais sensivel:

- disponibilidade;
- conflito de horarios;
- criacao;
- reagendamento;
- cancelamento;
- conclusao;
- historico.

Passos:

1. Criar repo `appointments-service`.
2. Copiar somente codigo necessario de appointments, health, configuracao, observabilidade e infraestrutura propria.
3. Remover imports de `src/nest/*`, `apps/*` e `packages/domains/*` do monorepo.
4. Manter apenas contratos publicos ou copiar regra de dominio para dentro do servico.
5. Criar banco/schema proprio.
6. Criar migrations proprias.
7. Publicar eventos de dominio.
8. Apontar o gateway para a URL real do servico separado.
9. Remover fallback local de appointments no gateway quando o corte estiver validado.

Critério de pronto:

- repo sobe sozinho;
- testes rodam sem o monorepo;
- imagem Docker e gerada no proprio repo;
- CI proprio passa;
- banco/schema e proprio;
- gateway chama somente via API interna;
- nenhuma dependencia de repository/model/provider do monorepo.

**7. Extrair api-gateway**

Status: depois do primeiro servico separado estar estavel.

Criar repo `api-gateway`.

Responsabilidades:

- autenticar usuario via OAuth2/OIDC/JWT;
- autorizar por escopo/permissao;
- aplicar rate limit;
- propagar identidade para servicos internos;
- rotear para microservicos;
- padronizar erro externo;
- emitir auditoria;
- manter CORS e seguranca HTTP;
- propagar `x-request-id`, `x-trace-id` e `traceparent`.

O gateway nao deve conter regra de negocio de appointments, customers, services ou professionals. Ele conhece rotas, politicas e contratos, nao repositories.

Critério de pronto:

- repo sobe sozinho;
- nao importa modules Nest dos servicos;
- tem testes de auth, rate limit, proxy e erros;
- deploy independente;
- configuracao por URL interna de cada servico.

**8. Extrair frontend**

Status: pode acontecer em paralelo apos contratos externos estabilizarem.

Criar repo `frontend`.

Responsabilidades:

- UI e estado do cliente;
- chamadas HTTP somente para o gateway;
- configuracao por `API_BASE_URL`;
- build e deploy independentes;
- testes de UI ou fluxos essenciais;
- observabilidade frontend quando fizer sentido.

O frontend nao chama microservicos diretamente. Toda chamada externa passa pelo gateway.

**9. Extrair customers, services e professionals**

Status: depois de appointments e gateway definirem o molde.

Ordem sugerida:

1. `customers-service`
2. `services-service`
3. `professionals-service`

Para cada servico:

- criar repo Nest proprio;
- copiar somente o dominio necessario;
- remover dependencias do monorepo;
- criar banco/schema proprio;
- publicar contratos HTTP;
- publicar eventos de alteracao;
- ajustar gateway para rotear para o servico;
- adicionar testes de contrato e integracao interna;
- remover fallback local no gateway.

Critério de pronto:

- repo independente;
- banco independente;
- pipeline independente;
- deploy independente;
- observabilidade propria;
- integracao apenas por API/evento.

**10. Dados e bancos por servico**

Status: obrigatorio antes de considerar microservico maduro.

Destino:

- appointments possui seu banco/schema;
- customers possui seu banco/schema;
- services possui seu banco/schema;
- professionals possui seu banco/schema;
- nenhum servico faz query direta no banco de outro;
- dados duplicados existem apenas como projecoes de leitura ou cache, alimentados por eventos.

Passos:

1. Definir provider por servico.
2. Criar migrations por repo.
3. Planejar migracao dos dados atuais.
4. Criar scripts idempotentes de backfill.
5. Adicionar health/readiness por dependencia.
6. Remover dependencias de banco compartilhado.

**11. Comunicacao entre servicos**

Status: evoluir gradualmente.

Padrao inicial:

- comunicacao externa: frontend -> gateway;
- comunicacao interna sincrona: gateway -> servicos via REST;
- comunicacao entre servicos: REST interno apenas quando necessario;
- comunicacao assíncrona: eventos de dominio para sincronizacao e efeitos colaterais.

Evitar:

- transacao distribuida;
- chamada circular obrigatoria;
- import direto de codigo interno;
- acesso direto ao banco de outro servico;
- pacote compartilhado com regra de negocio.

Destino:

- cada servico publica eventos como `appointment.created`, `customer.updated`, `service.updated`, `professional.updated`;
- consumidores mantem projecoes locais quando precisarem consultar rapido;
- contratos de eventos sao versionados.

**12. Seguranca**

Status: primeira camada existe; precisa amadurecer por repo.

Destino:

- gateway valida OAuth2/OIDC/JWT real;
- servicos internos validam token interno, mTLS ou identidade de workload;
- escopos/permissoes sao propagados;
- segredos ficam fora do codigo;
- auditoria de acoes sensiveis e persistida;
- rotacao de segredos e suportada.

Cada repo deve ter `.env.example` proprio sem segredos reais.

**13. Observabilidade**

Status: primeira camada existe no monorepo.

Destino por repo:

- logs JSON com `service`, `environment`, `requestId`, `traceId`;
- propagacao de `traceparent`;
- OpenTelemetry para traces;
- metricas Prometheus ou exporter equivalente;
- dashboards por servico;
- alertas por erro, latencia, saturacao e indisponibilidade.

O `infra` deve conter a stack local ou manifests para collector, logs, metricas e tracing.

**14. CI/CD e release independente**

Status: concluido na primeira versao como kit de templates para os repositorios independentes.

Cada repo deve ter:

- lint/test/build;
- validacao de contratos;
- build de imagem Docker;
- versionamento;
- changelog ou release notes;
- deploy independente;
- rollback documentado.

O deploy de um servico nao deve exigir deploy dos outros, exceto quando houver breaking change planejada e versionada.

Implementado:

- `infra/independent-releases.md` com o processo minimo de CI/CD por repositorio;
- template de CI para backends Nest em `infra/templates/github-actions/node-nest-service-ci.yml`;
- template de release de imagem Docker em `infra/templates/github-actions/node-nest-service-release.yml`;
- template de CI para frontend em `infra/templates/github-actions/frontend-ci.yml`;
- checklist de release e rollback em `infra/templates/release-checklist.md`;
- `infra/README.md` aponta para os templates copiaveis.

Ainda pendente para quando os repositorios forem criados:

- copiar os templates para cada repo novo;
- configurar secrets e provedor de deploy de cada app;
- publicar imagens em registry real;
- ativar deploy independente por ambiente;
- testar rollback real por servico.

**15. Ordem operacional recomendada**

1. Congelar contratos atuais em formato publicavel.
2. Criar `contracts` fora do monorepo atual.
3. Publicar os contratos iniciais de appointments.
4. Criar template de projeto Nest independente.
5. Criar `appointments-service` fora do monorepo atual.
6. Rodar `npm init` ou Nest CLI no novo diretorio.
7. Migrar appointments para o novo repo.
8. Criar banco/schema proprio de appointments.
9. Criar CI, Dockerfile e README do `appointments-service`.
10. Fazer gateway do monorepo chamar o appointments externo.
11. Remover fallback local de appointments quando validado.
12. Criar `api-gateway` fora do monorepo atual.
13. Migrar gateway para repo proprio.
14. Criar `frontend` fora do monorepo atual.
15. Migrar frontend para repo proprio.
16. Extrair `customers-service`.
17. Extrair `services-service`.
18. Extrair `professionals-service`.
19. Criar `infra` como fonte operacional.
20. Adicionar event bus e eventos versionados.
21. Adicionar OpenTelemetry, metricas, dashboards e alertas.
22. Remover do monorepo qualquer codigo que ja tenha dono em repo separado.

**16. Criterio de conclusao**

O plano esta concluido quando:

- cada app esta em seu proprio repositorio;
- cada backend e um projeto Nest independente;
- frontend chama apenas o gateway;
- gateway nao contem regra de negocio dos dominios;
- microservicos nao importam codigo interno uns dos outros;
- cada servico possui banco/schema proprio;
- contratos sao publicos, versionados e testados;
- cada repo tem CI/CD e Dockerfile proprio;
- logs, metricas e traces permitem investigar uma chamada fim a fim;
- o monorepo atual nao e mais necessario para buildar, testar ou publicar os servicos.
