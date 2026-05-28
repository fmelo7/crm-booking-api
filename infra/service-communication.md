# Comunicacao entre apps

Este documento registra o fluxo permitido entre frontend, gateway e microservicos.

## Fluxo externo

```text
frontend -> api-gateway -> microservicos
```

O frontend deve chamar somente rotas relativas `/api/*`. No ambiente Docker local, o Nginx do frontend encaminha `/api/*` para `api-gateway`.

## Rotas internas do gateway

O gateway encaminha chamadas HTTP sincronas para os servicos internos quando a URL correspondente estiver configurada:

| Rota externa | Variavel de URL interna | Servico interno |
| --- | --- | --- |
| `/api/appointments/*` | `APPOINTMENTS_SERVICE_URL` | `appointments-service` |
| `/api/customers/*` | `CUSTOMERS_SERVICE_URL` | `customers-service` |
| `/api/services/*` | `SERVICES_SERVICE_URL` | `services-service` |
| `/api/professionals/*` | `PROFESSIONALS_SERVICE_URL` | `professionals-service` |

O gateway propaga `x-request-id`, `x-trace-id`, `traceparent` e `x-authenticated-subject` quando presentes. Para auth interna, usa o token especifico do servico (`*_SERVICE_INTERNAL_TOKEN`) ou `INTERNAL_SERVICE_TOKEN` como fallback.

## Eventos

Eventos de dominio sao contratos versionados no repo `contracts`, em `public/*-events.schema.json`. Todo evento deve carregar `version` no metadado base.

Schemas atuais:

- `appointment-events.schema.json`
- `customer-events.schema.json`
- `service-events.schema.json`
- `professional-events.schema.json`

Mudancas incompatíveis seguem `docs/breaking-changes.md` no repo de contratos.

## Nao circularidade

Microservicos nao configuram URLs obrigatorias uns dos outros. Comunicacao sincrona externa passa pelo gateway; comunicacao assíncrona entre dominios deve ser feita por eventos versionados.
