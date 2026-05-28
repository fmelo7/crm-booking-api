# frontend

Repositorio independente do frontend do CRM Booking.

## Responsabilidade

- Servir a UI publica do produto.
- Chamar apenas o `api-gateway` para operacoes HTTP.
- Nao chamar microservicos internos diretamente.

## Origem da extracao

Base inicial: `crm-booking-api/apps/frontend`.

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
