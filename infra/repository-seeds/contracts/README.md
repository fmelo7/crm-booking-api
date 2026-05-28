# contracts

Repositorio independente dos contratos publicos do CRM Booking.

## Responsabilidade

- Versionar OpenAPI specs, JSON Schemas, eventos e exemplos publicos.
- Servir como referencia entre gateway, frontend e microservicos.
- Nao conter regra de negocio, repositories, models de banco, modules Nest ou providers internos.

## Estrutura inicial

- `public/gateway.openapi.json`
- `public/appointments.openapi.json`
- `public/customers.openapi.json`
- `public/services.openapi.json`
- `public/professionals.openapi.json`
- `public/*-events.schema.json`
- `docs/breaking-changes.md`
- `CHANGELOG.md`

## Origem da extracao

Base inicial: `crm-booking-api/packages/contracts/public`.

## Comandos esperados

```bash
npm ci
npm test
npm run test:contracts
npm run build
```

`npm run test:contracts` valida a presenca e a estrutura minima dos contratos publicos.

## Evidencias do gate 1

- Repositorio local independente criado fora do monorepo.
- Primeiro commit criado com este README e `.gitignore`.
- URL remota: pendente ate criacao do repositorio no provedor Git.
