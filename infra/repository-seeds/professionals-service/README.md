# professionals-service

Repositorio independente do dominio de profissionais do CRM Booking.

## Responsabilidade

- Ser o dono dos dados e regras de professionals.
- Expor API interna versionada para o `api-gateway`.
- Publicar eventos de dominio versionados quando aplicavel.
- Nao importar codigo interno de outros dominios.

## Origem da extracao

Base inicial: `crm-booking-api/apps/professionals-service`.

## Runtime atual

- `server.js` inicializa o NestJS app standalone em `PROFESSIONALS_SERVICE_PORT` ou `PORT`.
- `createProfessionalsServiceApp.js` aplica headers, CORS, auth interna, metrics, health e handlers de erro locais.
- `/api-docs` expõe Swagger UI usando `src/contracts/public/professionals.openapi.json`.
- `src/nest/professional` contem controller, provider e repository provider do dominio de professionals.
- `src/domain/professional` contem validacoes e repositories mongo/postgres do proprio dominio.

## Comandos esperados

```bash
npm ci
npm test
npm run build
docker build .
```

Esses comandos validam o servico de professionals sem depender do monorepo.

## Evidencias do gate 1

- Repositorio local independente criado fora do monorepo.
- Primeiro commit criado com este README, `.env.example` e `.gitignore`.
- URL remota: pendente ate criacao do repositorio no provedor Git.
