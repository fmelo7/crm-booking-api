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
- Logs continuam em JSON no stdout/stderr, prontos para coleta por Docker, ELK/OpenSearch ou outro agente.
