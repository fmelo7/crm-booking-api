# Roadmap para mover `src` para os seeds

Este roadmap transforma os seeds em repositorios com codigo real, sem dependencias fantasma do monorepo.

## Status

Status atual: fase 8 concluida.

| Fase | Status | Saida esperada |
| --- | --- | --- |
| 1. Manifesto de extracao | Concluida | `infra/source-extraction-manifest.json` validado em teste |
| 2. Runtime comum minimo | Concluida | Cada seed backend possui `src/common`, `src/config`, `src/observability` e health local |
| 3. Contratos como pacote independente | Concluida | Seeds consomem contratos via copia versionada local, sem `../../packages` |
| 4. Api gateway real | Concluida | `api-gateway` roda com gateway/proxy/auth/metrics sem importar `src` do monorepo |
| 5. Primeiro dominio real: appointments | Concluida | `appointments-service` roda controller/provider/repository do proprio dominio |
| 6. Servicos de suporte reais | Concluida | `customers`, `services`, `professionals` rodam isolados |
| 7. Frontend real | Concluida | `frontend` serve assets reais e chama somente gateway |
| 8. Limpeza de imports e smoke externo | Concluida | `npm ci`, `npm test`, `npm run build` e `docker build .` passam dentro de cada seed |

## Principios

- Copiar para cada seed somente o codigo que ele pode possuir.
- Reescrever imports para caminhos locais no seed.
- Nao carregar `packages/domains/*` inteiro para todos os servicos.
- Manter `contracts` sem runtime, banco, Nest ou regra de negocio.
- Validar cada corte com teste local antes de copiar o proximo dominio.

## Fase 1: manifesto de extracao

Arquivo: `infra/source-extraction-manifest.json`.

Objetivo:

- declarar quais arquivos/pastas saem do monorepo para cada seed;
- registrar dominios permitidos por repo;
- bloquear paths inexistentes, targets inseguros e dependencias cruzadas obvias.

Gate:

```bash
npm test -- --test-name-pattern "source extraction"
```

## Fase 2: runtime comum minimo

Mover para os seeds backend:

- `src/nest/common/*`
- `src/nest/health/*`
- `src/middlewares/*`
- `src/observability/*`
- configs necessarias de banco/env/debug
- `apps/common/internalServiceAuth.js`

Saida esperada:

- cada backend tem health e metrics locais;
- nenhum backend importa `../../src/*`.

Status: concluida.

Evidencias:

- runtime copiado para `api-gateway`, `appointments-service`, `customers-service`, `services-service` e `professionals-service`;
- imports de `src/health.js` e `src/config/database.js` foram reescritos para `src/shared/common`;
- `test/nest/source-extraction-roadmap.test.js` valida presenca do runtime nos seeds e bloqueia imports para `../../src` ou `../../packages`.

## Fase 3: contratos

Mover para `contracts`:

- `packages/contracts/*`

Depois, cada app deve consumir contratos por uma destas opcoes:

- pacote publicado/versionado;
- copia local versionada em `src/contracts`;
- submodule/subtree explicitamente versionado.

Gate:

- nenhum seed backend importa `../../packages/contracts`.

Status: concluida.

Evidencias:

- `infra/repository-seeds/contracts` recebeu os JS e `public/*.json` reais de `packages/contracts`;
- seeds backend receberam copia versionada em `src/contracts`;
- `zod` foi declarado nos seeds que carregam schemas de contrato;
- `test/nest/source-extraction-roadmap.test.js` valida o pacote de contratos real e bloqueia imports `../../packages/contracts`.

## Fase 4: api-gateway

Mover para `api-gateway`:

- `apps/api/*`
- bootstrap HTTP necessario;
- runtime comum da fase 2.

Gate:

- gateway nao importa modules Nest dos dominios;
- proxy para `appointments`, `customers`, `services`, `professionals` funciona por URL interna.

Status: concluida.

Evidencias:

- `infra/repository-seeds/api-gateway/src/app` contem app Express real com health, metrics, auth e proxies;
- `npm test` e `npm run build` passam no seed `api-gateway`;
- Dockerfile sobe `node src/app/server.js`;
- testes bloqueiam imports para `../../src`, `../../packages` e codigo de dominio.

## Fase 5: appointments-service

Mover para `appointments-service`:

- `apps/appointments-service/*`
- `src/nest/appointment/*standalone*`, controller, provider e repository provider;
- `packages/domains/appointment/*` necessario;
- `packages/shared/common/*` usado pelo dominio.

Gate:

- nenhum import de repositories/models/modules de customers/services/professionals;
- cria/lista/reagenda/cancela/conclui appointments no repo isolado.

Status: concluida.

Evidencias:

- `infra/repository-seeds/appointments-service` recebeu `app.js`, `createAppointmentsServiceApp.js`, `server.js` e `src/app.module.js` reais;
- `src/nest/appointment` usa somente o `appointment.standalone.module.js`, controller, provider e repository provider locais;
- `src/domain/appointment` contem o dominio real com repositories mongo/postgres apontando para runtime local;
- `npm test` e `npm run build` passam no seed `appointments-service`;
- testes bloqueiam imports para `../../src`, `../../packages` e repositories/modules de customers/services/professionals.

## Fase 6: servicos de suporte

Repetir o corte para:

- `customers-service`;
- `services-service`;
- `professionals-service`.

Gate:

- cada repo possui somente o proprio dominio;
- delecoes nao acessam banco de appointments diretamente;
- chamadas externas passam pelo gateway.

Status: concluida.

Evidencias:

- `customers-service`, `services-service` e `professionals-service` receberam app/server reais, modulo Nest standalone e runtime HTTP local;
- cada seed contem somente `src/nest/<dominio>` e `src/domain/<dominio>` do proprio dominio;
- os providers de delecao aceitam referencias injetadas, sem importar repository/model/module de appointments;
- `npm test` e `npm run build` passam nos tres seeds;
- testes bloqueiam imports para `../../src`, `../../packages`, dominio cruzado e repository/model/module de appointments.

## Fase 7: frontend

Mover para `frontend`:

- `apps/frontend/public/*`
- `apps/frontend/nginx.conf`

Gate:

- assets servem isolados;
- fetches usam somente `/api/*`.

Status: concluida.

Evidencias:

- `infra/repository-seeds/frontend/public` recebeu `index.html`, `app.js` e `styles.css` reais;
- `nginx.conf` serve assets estaticos e encaminha apenas `/api/*` para `api-gateway`;
- Dockerfile usa nginx e copia os assets locais para `/usr/share/nginx/html`;
- `npm test` e `npm run build` passam no seed `frontend`;
- testes bloqueiam chamadas HTTP fora do helper `api()` e chamadas `api()` fora de `/api/*`.

## Fase 8: validacao final

Em cada seed:

```bash
npm ci
npm test
npm run build
docker build .
```

Atualizar `infra/completion-criteria.md` somente depois que cada repo passar isolado.

Status: concluida.

Evidencias em 2026-05-28:

- `npm ci` passou em `contracts`, `api-gateway`, `appointments-service`, `customers-service`, `services-service`, `professionals-service`, `frontend` e `infra`;
- `npm test` passou em todos os seeds com `package.json`;
- `npm run build` passou em todos os seeds com `package.json`;
- `docker build .` passou em `frontend`, `api-gateway`, `appointments-service`, `customers-service`, `services-service` e `professionals-service`;
- imagens locais geradas com tag `crm-booking-<repo>:phase-8`;
- `contracts` e `infra` permanecem sem imagem Docker por desenho, pois nao possuem runtime de app/container.
