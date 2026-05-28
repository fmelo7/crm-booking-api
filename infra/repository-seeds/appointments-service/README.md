# appointments-service

Repositorio independente do dominio de agendamentos do CRM Booking.

## Responsabilidade

- Criar, reagendar, cancelar, concluir e consultar agendamentos.
- Ser o dono dos dados e regras de appointments.
- Expor API interna versionada para o `api-gateway`.
- Publicar eventos de dominio versionados.

## Origem da extracao

Base inicial: `crm-booking-api/apps/appointments-service` e contratos publicos em `packages/contracts/public`.

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
