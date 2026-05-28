# api-gateway

Repositorio independente do gateway HTTP externo do CRM Booking.

## Responsabilidade

- Autenticar e autorizar chamadas externas.
- Aplicar politicas de borda, como CORS, rate limit e auditoria.
- Propagar `x-request-id`, `x-trace-id` e `traceparent`.
- Rotear chamadas para microservicos internos por API.
- Nao conter regra de negocio dos dominios.

## Origem da extracao

Base inicial: `crm-booking-api/apps/api`.

## Comandos esperados

```bash
npm ci
npm test
npm run build
docker build .
```

Esses comandos serao habilitados nos proximos gates de build, teste e Docker.

## Evidencias do gate 1

- Repositorio local independente criado fora do monorepo.
- Primeiro commit criado com este README, `.env.example` e `.gitignore`.
- URL remota: pendente ate criacao do repositorio no provedor Git.
