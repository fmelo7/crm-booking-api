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

- [ ] OpenAPI do gateway externo;
- [ ] OpenAPI interna de `appointments-service`;
- [ ] OpenAPI interna de `customers-service`;
- [ ] OpenAPI interna de `services-service`;
- [ ] OpenAPI interna de `professionals-service`;
- [ ] schemas de eventos por dominio;
- [ ] politica de breaking changes.

Evidencias:

- tags/releases do repo `contracts`;
- validacao de contratos no CI;
- changelog de contratos.

### 4. Separacao de dados

Cada servico deve ter banco/schema proprio:

- [ ] appointments;
- [ ] customers;
- [ ] services;
- [ ] professionals.

Evidencias:

- string de conexao propria por servico;
- migrations proprias;
- health/readiness por dependencia;
- nenhum acesso direto ao banco de outro servico.

### 5. Limites de codigo

Nenhum servico pode importar codigo interno de outro:

- [ ] sem imports de repositories de outro dominio;
- [ ] sem imports de models/entities de outro dominio;
- [ ] sem imports de modules Nest de outro app;
- [ ] sem dependencia de `packages/domains/*` no destino final;
- [ ] contratos compartilhados sem regra de negocio.

Evidencias:

- teste de arquitetura por repo;
- revisao de dependencias;
- CI bloqueando imports proibidos.

### 6. Comunicacao correta

Fluxo esperado:

```text
frontend -> api-gateway -> microservicos -> bancos proprios
```

Regras:

- [ ] frontend chama apenas o gateway;
- [ ] gateway nao contem regra de negocio dos dominios;
- [ ] servicos comunicam por API interna ou eventos;
- [ ] eventos sao versionados;
- [ ] nao existe chamada circular obrigatoria.

Evidencias:

- configuracao de URLs internas;
- testes de integracao;
- documentacao de eventos.

### 7. Observabilidade

Cada app deve expor:

- [ ] logs JSON com `service`, `environment`, `requestId`, `traceId`;
- [ ] propagacao de `traceparent`;
- [ ] health check;
- [ ] metricas;
- [ ] traces;
- [ ] dashboards;
- [ ] alertas.

Evidencias:

- dashboard por servico;
- exemplo de trace fim a fim;
- alerta testado.

### 8. CI/CD e rollback

Cada repo deve ter:

- [ ] CI em pull request;
- [ ] release por tag ou fluxo equivalente;
- [ ] imagem Docker versionada;
- [ ] deploy independente;
- [ ] rollback documentado;
- [ ] secrets fora do codigo.

Evidencias:

- workflow `.github/workflows/ci.yml`;
- workflow de release/deploy;
- checklist de release preenchido;
- procedimento de rollback testado.

## Matriz de acompanhamento

| App | Repo | CI | Docker | Banco proprio | Contratos | Observabilidade | Deploy independente |
| --- | --- | --- | --- | --- | --- | --- | --- |
| frontend | Local criado, remoto pendente | Workflow local, logs remotos pendentes | Local passou | N/A | Pendente | Pendente | Pendente |
| api-gateway | Local criado, remoto pendente | Workflow local, logs remotos pendentes | Local passou | N/A | Pendente | Pendente | Pendente |
| appointments-service | Local criado, remoto pendente | Workflow local, logs remotos pendentes | Local passou | Pendente | Parcial | Parcial | Pendente |
| customers-service | Local criado, remoto pendente | Workflow local, logs remotos pendentes | Local passou | Pendente | Pendente | Parcial | Pendente |
| services-service | Local criado, remoto pendente | Workflow local, logs remotos pendentes | Local passou | Pendente | Pendente | Parcial | Pendente |
| professionals-service | Local criado, remoto pendente | Workflow local, logs remotos pendentes | Local passou | Pendente | Pendente | Parcial | Pendente |
| contracts | Local criado, remoto pendente | Workflow local, logs remotos pendentes | N/A | N/A | Parcial | N/A | Pendente |
| infra | Local criado, remoto pendente | Workflow local, logs remotos pendentes | N/A | N/A | N/A | Pendente | Pendente |

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
