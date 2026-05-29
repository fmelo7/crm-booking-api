# services-api

Repositorio independente do dominio de servicos oferecidos do CRM Booking.

## Responsabilidade

- Ser o dono dos dados e regras de services.
- Expor API interna versionada para o `api-gateway`.
- Publicar eventos de dominio versionados quando aplicavel.
- Nao importar codigo interno de outros dominios.

## Origem da extracao

Base inicial: seed extraido do dominio de servicos.

## Runtime atual

- `server.js` inicializa o NestJS app standalone em `SERVICES_API_PORT` ou `PORT`.
- `createServicesServiceApp.js` cria e configura o Nest app com headers, CORS, auth interna, metrics, health e filtros de erro.
- `/api-docs` expõe Swagger UI usando `src/contracts/public/services.openapi.json`.
- `src/nest/service` contem controller, provider e repository provider do dominio de services.
- `src/domain/service` contem validacoes e repositories mongo/postgres do proprio dominio.

## Comandos esperados

```bash
npm ci
npm test
npm run build
docker build .
```

Esses comandos validam o servico de services sem depender do monorepo.

## Evidencias do gate 1

- Repositorio local independente criado fora do monorepo.
- Primeiro commit criado com este README, `.env.example` e `.gitignore`.
- URL remota: pendente ate criacao do repositorio no provedor Git.
