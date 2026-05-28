# Infraestrutura local

Primeira camada para rodar o gateway e os serviços localmente.

```bash
npm run infra:up
npm run infra:down
```

Os scripts usam `.env.local` como `--env-file`. O arquivo `.env` pode conter variáveis de deploy, como referências do Railway, e não deve ser usado pelo Docker Compose local.

Serviços expostos:

- Frontend: `http://localhost:8080`
- API gateway: `http://localhost:3000`
- Appointments service: `http://localhost:3001`
- Customers service: `http://localhost:3002`
- Services service: `http://localhost:3003`
- Professionals service: `http://localhost:3004`

Observações:

- Este compose não sobe MongoDB, PostgreSQL ou outra infraestrutura de banco.
- A conexão de banco deve vir de `.env.local`, apontando para a sua infra local/provisionada separadamente.
- Se o banco estiver exposto na máquina host ou em outro compose local, use `host.docker.internal` no `.env.local`, por exemplo `postgres://postgres:postgres@host.docker.internal:5432/crm_booking_api`.
- O frontend roda em Nginx e encaminha `/api/*` para o gateway.
- O gateway encaminha `/api/appointments/*` para `appointments-service` via `APPOINTMENTS_SERVICE_URL`.
- Serviços internos exigem `x-internal-token` quando `INTERNAL_SERVICE_TOKEN` está configurado.
- Logs continuam em JSON no stdout/stderr, prontos para coleta por Docker, ELK/OpenSearch ou outro agente.
- Cada processo define `SERVICE_NAME` e expõe esse nome em logs e `/api/health`.
- Toda requisição recebe `x-request-id` e `x-trace-id`; o gateway propaga esses headers para serviços internos.
- Quando um cliente envia `traceparent`, o trace id W3C é reaproveitado como `x-trace-id`.

## CI/CD independente

O guia para release independente esta em `infra/independent-releases.md`.

Templates copiaveis para os futuros repos:

- `infra/templates/github-actions/node-nest-service-ci.yml`
- `infra/templates/github-actions/node-nest-service-release.yml`
- `infra/templates/github-actions/frontend-ci.yml`
- `infra/templates/release-checklist.md`

Esses arquivos devem ser copiados para cada repositorio novo quando `appointments-service`, `api-gateway`, `frontend` e os demais servicos forem extraidos fisicamente.

## Extração para repos

O runbook da migração para repos independentes está em `infra/extraction-runbook.md`.

Ele acompanha a ordem operacional do roadmap e registra gates de saída para contratos, template Nest, `appointments-service`, `api-gateway`, frontend, serviços de suporte e infra.

O critério de conclusão da migração está em `infra/completion-criteria.md`.

Ele define a matriz de acompanhamento e as evidências necessárias para aposentar o monorepo atual.
