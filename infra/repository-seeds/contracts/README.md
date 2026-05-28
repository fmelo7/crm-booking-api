# contracts

Repositorio independente dos contratos publicos do CRM Booking.

## Responsabilidade

- Versionar OpenAPI specs, JSON Schemas, eventos e exemplos publicos.
- Servir como referencia entre gateway, frontend e microservicos.
- Nao conter regra de negocio, repositories, models de banco, modules Nest ou providers internos.

## Origem da extracao

Base inicial: `crm-booking-api/packages/contracts/public`.

## Comandos esperados

```bash
npm ci
npm test
npm run build
```

Esses comandos serao habilitados nos proximos gates de contratos e CI.

## Evidencias do gate 1

- Repositorio local independente criado fora do monorepo.
- Primeiro commit criado com este README e `.gitignore`.
- URL remota: pendente ate criacao do repositorio no provedor Git.
