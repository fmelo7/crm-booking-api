# crm-booking

Monorepo operacional do CRM Booking, organizado para deploy por serviço.

## Estrutura

- `api-gateway`: gateway HTTP externo.
- `frontend`: frontend estático servido por Nginx.
- `appointments-api`: API de agendamentos.
- `customers-api`: API de clientes.
- `services-api`: API de serviços oferecidos.
- `professionals-api`: API de profissionais.
- `contracts`: contratos públicos OpenAPI e eventos.

## Deploy

No Railway, crie um service para cada diretório:

- `api-gateway`
- `frontend`
- `appointments-api`
- `customers-api`
- `services-api`
- `professionals-api`

Cada service usa seu próprio `Dockerfile` e pode ser deployado independentemente.

## Desenvolvimento local

```bash
docker compose up --build
```

Cada API também pode ser validada isoladamente:

```bash
npm test --prefix services-api
npm run build --prefix services-api
```
