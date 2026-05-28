# professionals-service

Repositorio independente do dominio de profissionais do CRM Booking.

## Responsabilidade

- Ser o dono dos dados e regras de professionals.
- Expor API interna versionada para o `api-gateway`.
- Publicar eventos de dominio versionados quando aplicavel.
- Nao importar codigo interno de outros dominios.

## Origem da extracao

Base inicial: `crm-booking-api/apps/professionals-service`.

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
