# appointments-service

Repositorio independente do dominio de agendamentos do CRM Booking.

## Responsabilidade

- Criar, reagendar, cancelar, concluir e consultar agendamentos.
- Ser o dono dos dados e regras de appointments.
- Expor API interna versionada para o `api-gateway`.
- Publicar eventos de dominio versionados.

## Origem da extracao

Base inicial: `crm-booking-api/apps/appointments-service` e contratos publicos em `packages/contracts/public`.

## Runtime atual

- `server.js` inicializa o NestJS app standalone em `APPOINTMENTS_SERVICE_PORT` ou `PORT`.
- `createAppointmentsServiceApp.js` cria e configura o Nest app com headers, CORS, auth interna, metrics, health e filtros de erro.
- `/api-docs` expõe Swagger UI usando `src/contracts/public/appointments.openapi.json`.
- `src/nest/appointment` contem controller, provider e repository provider do dominio de appointments.
- `src/domain/appointment` contem as regras, validacoes e repositories mongo/postgres do proprio dominio.

## Comandos esperados

```bash
npm ci
npm test
npm run build
docker build .
```

Esses comandos validam o servico de appointments sem depender do monorepo.

## Evidencias do gate 1

- Repositorio local independente criado fora do monorepo.
- Primeiro commit criado com este README, `.env.example` e `.gitignore`.
- URL remota: pendente ate criacao do repositorio no provedor Git.
