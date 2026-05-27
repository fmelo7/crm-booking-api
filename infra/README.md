# Infraestrutura local

Primeira camada de infraestrutura para rodar o gateway, os serviços e o banco localmente.

```bash
npm run infra:up
npm run infra:down
```

Os scripts usam `.env.example` como `--env-file` para evitar conflito com `.env` locais de deploy.

Serviços expostos:

- API gateway: `http://localhost:3000`
- Appointments service: `http://localhost:3001`
- Customers service: `http://localhost:3002`
- Services service: `http://localhost:3003`
- Professionals service: `http://localhost:3004`
- MongoDB: `mongodb://localhost:27017/crm-booking-api`

Observações:

- O compose ainda usa um MongoDB compartilhado enquanto o roadmap não chega na separação de banco/schema por serviço.
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
